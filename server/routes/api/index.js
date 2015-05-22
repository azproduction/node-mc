import koa from 'koa.io';
import router from 'koa-router';
import json from 'koa-json';
import {readdirSync, statSync} from 'fs';
import {join} from 'path';

export default function createApi(args) {
    var app = koa();

    app.use(json());
    app.use(router(app));

    app.get('/ls', function *() {
        var dir = args.home;
        this.body = {
            list: readdirSync(dir).map((name) => {
                return {
                    name,
                    stat: statSync(join(dir, name))
                };
            })
        };
    });

    return app;
};
