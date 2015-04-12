import path from 'path';
import gzip from 'koa-gzip';
import fresh from 'koa-fresh';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import serve from 'koa-static';
import json from 'koa-json';

export default function (app) {
    // Error handling
    app.use(function *(next) {
        try {
            yield next;
        } catch (error) {
            this.status = error.status || 500;
            this.body = error.message;
            this.app.emit('error', error, this);
        }
    });

    app.use(gzip());
    app.use(conditional());
    app.use(fresh());
    app.use(etag());
    app.use(json());
}
