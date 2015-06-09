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
        var dirName = this.query.dir_name;
        if (dirName === '~') {
            dirName = args.home;
        }
        var parentDir = ['..'];
        if (dirName === '/') {
            parentDir = [];
        }
        this.body = {
            dirName: dirName,
            list: parentDir.concat(readdirSync(dirName)).map((name) => {
                var fullName = join(dirName, name);
                var stats = statSync(fullName);
                return {
                    name,
                    fullName: fullName,
                    stat: stats,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    isBlockDevice: stats.isBlockDevice(),
                    isCharacterDevice: stats.isCharacterDevice(),
                    isSymbolicLink: stats.isSymbolicLink(),
                    isFIFO: stats.isFIFO(),
                    isSocket: stats.isSocket()
                };
            })
        };
    });

    return app;
};
