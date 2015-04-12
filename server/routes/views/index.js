import koa from 'koa';
import router from 'koa-router';
import views from 'koa-views';
import env from '../../../shared/env';

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
        env: env
    });
});

export default app;
