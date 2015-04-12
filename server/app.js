import koa from 'koa.io';
import http from 'http';
import routes from './routes';
import Cli from './components/cli';
import TuiReact from './lib/tui-react';
import env from '../shared/env';
import ServerFlux from './flux';

var app = koa();

routes(app);

app.listen(env.PORT);

// Connect flux to socket.io channel
var flux = new ServerFlux();
app.io.use(function *(next) {
    // on connect
    flux.connect(this.socket);
    yield* next;
    // on disconnect
    flux.disconnect(this.socket);
});

TuiReact.render(TuiReact.createElement(Cli, {flux}), process.stdout);
