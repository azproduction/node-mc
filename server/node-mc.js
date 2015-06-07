import koa from 'koa.io';
import http from 'http';
import routes from './routes';
import Cli from './components/cli';
import TuiReact from './lib/tui-react';
import ServerFlux from './flux';
import open from 'open';
import getCliOptions from './lib/cli-options';
import {spawn} from 'child_process';
import path from 'path';
import phantom from 'phantom';
import exitHook from 'exit-hook';

export default class NodeMc {
    constructor(process) {
        this.process = process;
        this.args = getCliOptions(this.process);
        this.flux = new ServerFlux();

        this._startServer();
        this._watchResize();
        this._startRenderer();

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
        var flux = this.flux;
        var clientConnect = this._clientConnect.bind(this);
        var connectedClients = 0;
        var process = this.process;

        routes({app, args});

        app.listen(Number(port), host);

        // Connect flux to socket.io channel
        app.io.use(function *(next) {
            // on connect
            connectedClients++;
            flux.connect(this.socket);
            clientConnect();
            yield* next;
            connectedClients--;
            if (connectedClients === 0 && !args.waitOnDisconnect) {
                process.stderr.write('All render clients are disconnected.\n');
                process.exit(1);
            }
            // on disconnect
            flux.disconnect(this.socket);
        });
    }

    _startRenderer() {
        var flux = this.flux;
        TuiReact.render(TuiReact.createElement(Cli, {flux}), {
            stdout: this.process.stdout,
            stdin: this.process.stdin
        });
    }

    _sendWindowSize() {
        this.flux.getActions('render').resize({
            width: this.process.stdout.columns,
            height: this.process.stdout.rows
        });
    }

    _clientConnect() {
        this._sendWindowSize();

        var config = Object.keys(this.args).reduce((config, argName) => {
            if (/^client/.test(argName)) {
                config[argName] = this.args[argName];
            }
            return config;
        }, {});

        this.flux.getActions('config').configureClient(config);
    }

    _watchResize() {
        this.process.stdout.on('resize', this._sendWindowSize.bind(this));
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
