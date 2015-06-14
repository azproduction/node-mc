import koa from 'koa.io';
import router from 'koa-router';
import views from 'koa-views';

export default function views(args) {
    var app = koa();

    // Add jade rendering
    app.use(views(__dirname, {
        cache: true,
        default: 'jade'
    }));

    app.use(router(app));

    app.get('/', function *() {
        yield this.render('index', {
            title: 'mc',
            env: {
                NODE_ENV: args.nodeEnv
            }
        });
    });

    return app;
};
