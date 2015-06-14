import koa from 'koa.io';
import router from 'koa-router';
import json from 'koa-json';
import {readdirSync, statSync} from 'fs';
import {join} from 'path';

function ls(dirName) {
    var parentDir = ['..'];
    if (dirName === '/') {
        parentDir = [];
    }
    return {
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
}

export default function createApi(args) {
    var app = koa();

    app.use(json());
    app.use(router(app));

    app.get('/ls', function *() {
        var dirName = this.query.dir_name;
        if (dirName === '~') {
            dirName = args.home;
        }
        this.body = ls(dirName);
    });

    app.get('/ls_cwd', function *() {
        this.body = ls(process.cwd());
    });

    return app;
};
