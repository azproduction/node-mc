import koa from 'koa.io';
import router from 'koa-router';
import json from 'koa-json';
import env from '../../../shared/env';
import {readdirSync, statSync} from 'fs';
import {join} from 'path';

var app = koa();

app.use(json());
app.use(router(app));

app.get('/ls', function *() {
    var dir = process.env.HOME;
    this.body = {
        list: readdirSync(dir).map((name) => {
            return {
                name,
                stat: statSync(join(dir, name))
            };
        })
    };
});

export default app;
