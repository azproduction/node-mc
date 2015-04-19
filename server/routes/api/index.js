import koa from 'koa.io';
import router from 'koa-router';
import json from 'koa-json';
import env from '../../../shared/env';

var app = koa();

app.use(json());
app.use(router(app));

app.get('/ls', function *() {
    this.body = {
        list: ['.', '..']
    };
});

export default app;
