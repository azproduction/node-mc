import koa from 'koa.io';
import http from 'http';
import routes from './routes';
import ServerFlux from './flux';
import open from 'open';
import getCliOptions from './cli-options';
import {spawn} from 'child_process';
import path from 'path';
import phantom from 'phantom';
import exitHook from 'exit-hook';
import TuiTerminal from '../lib/tui-terminal';

export default class NodeMc {
    constructor(process) {
        this.process = process;
        this.args = getCliOptions(this.process);
        this.tuiTerminal = new TuiTerminal(this.process);
        this.flux = new ServerFlux();
        this.connectedClients = 0;

        this._startServer();

        if (this.args.nodeEnv === 'development') {
            this._startHotReloadServer()
                .then(this._openRenderClient.bind(this));
        } else {
            this._openRenderClient();
        }
    }

    _startServer() {
        var args = this.args;
        var {port, host} = this.args;
        var app = koa();
        routes({app, args});

        app.listen(Number(port), host);

        var clientConnect = this._clientConnect.bind(this);
        var clientDisconnect = this._clientDisconnect.bind(this);
        // Connect flux to socket.io channel
        app.io.use(function *(next) {
            clientConnect(this.socket);
            yield* next;
            clientDisconnect(this.socket);
        });
    }

    _clientDisconnect(socket) {
        this.connectedClients--;

        if (this.connectedClients === 0 && !this.args.waitOnDisconnect) {
            this.process.stderr.write('All render clients are disconnected.\n');
            this.process.exit(1);
        }
        // on disconnect
        this.flux.disconnect(socket);
        this.tuiTerminal.disconnect(socket);
    }

    _clientConnect(socket) {
        this.connectedClients++;
        this.flux.connect(socket);
        this.tuiTerminal.connect(socket);

        var config = Object.keys(this.args).reduce((config, argName) => {
            if (/^client/.test(argName)) {
                config[argName] = this.args[argName];
            }
            return config;
        }, {});

        this.flux.getActions('config').configureClient(config);
    }

    _openRenderClient() {
        var appUrl = `http://${this.args.host}:${this.args.port}`;
        var client = String(this.args.client).toLowerCase();
        var message = `Waiting connection on ${appUrl}\nUsing client '${this.args.client}'.\n`;

        this.process.stdout.write(message);

        if (client === 'default') {
            open(appUrl);
            return;
        }

        if (client === 'phantomjs') {
            phantom.create((ph) => {
                this.process.stdout.write('PhantomJS launched. Opening page...\n');
                ph.createPage((page) => {
                    page.open(appUrl, (status) => {
                        this.process.stdout.write('PhantomJS status ' + status + '\n');
                    });
                    page.set('onLoadStarted', (success) => {
                        this.process.stdout.write('Page load started ' + success + '\n');
                    });
                    page.set('onLoadFinished', (success) => {
                        this.process.stdout.write('Page load finished ' + success + '\n');
                    });
                    page.set('onResourceRequested', ({url}) => {
                        this.process.stdout.write('Loading resource ' + url + '\n');
                    });
                    page.set('onResourceReceived', ({status, url}) => {
                        if (Number(status) === 200) {
                            return;
                        }
                        this.process.stdout.write('Error loading resource ' + url + '\n');
                    });
                    page.set('onResourceTimeout', ({url}) => {
                        this.process.stdout.write('Timeout resource ' + url + '\n');
                    });
                });
                exitHook(ph.exit.bind(ph));
            }, {
                dnodeOpts: {weak: false}
            });
            return;
        }

        open(appUrl, this.args.client);
    }

    _startHotReloadServer() {
        return new Promise((resolve) => {
            var webpackDevServer = require.resolve('.bin/webpack-dev-server');
            var args = '--config webpack.config.dev.js --hot --progress --colors --port 2992 --inline';
            var hotReload = spawn(webpackDevServer, args.split(' '), {
                cwd: path.join(__dirname, '..'),
                env: this.process.env
            });
            hotReload.stdout.once('data', resolve);
        });
    }
}
