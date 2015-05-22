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

export default class NodeMc {
    constructor(process) {
        this.process = process;
        this.args = getCliOptions(this.process);
        this.flux = new ServerFlux();

        if (this.args.nodeEnv === 'development') {
            this._startHotReloadServer();
        }
        this._startServer();
        this._watchResize();
        this._render();
        this._openRenderClient();
    }

    _startServer() {
        var args = this.args;
        var {port, host} = this.args;
        var app = koa();
        var flux = this.flux;
        var sendWindowSize = this._sendWindowSize.bind(this);
        var connectedClients = 0;
        var process = this.process;

        routes({app, args});

        app.listen(Number(port), host);

        // Connect flux to socket.io channel
        app.io.use(function *(next) {
            // on connect
            connectedClients++;
            flux.connect(this.socket);
            sendWindowSize();
            yield* next;
            connectedClients--;
            if (connectedClients === 0) {
                process.stderr.write('All render clients are disconnected.\n');
                process.exit(1);
            }
            // on disconnect
            flux.disconnect(this.socket);
        });
    }

    _render() {
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
                });
            });
            return;
        }

        open(appUrl, this.args.client);
    }

    _startHotReloadServer() {
        var webpackDevServer = require.resolve('.bin/webpack-dev-server');
        var args = '--config webpack.config.dev.js --hot --progress --colors --port 2992 --inline';
        spawn(webpackDevServer, args.split(' '), {
            cwd: path.join(__dirname, '..'),
            env: this.process.env
        });
    }
}
