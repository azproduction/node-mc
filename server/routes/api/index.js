import koa from 'koa.io';
import router from 'koa-router';
import json from 'koa-json';
import {readdirSync, readFileSync, statSync} from 'fs';
import {join} from 'path';
import homedir from 'os-homedir';

function ls(dirName) {
    dirName = join('/', dirName);

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

function cat(fileName) {
    fileName = join('/', fileName);

    return {
        fileName: fileName,
        content: readFileSync(fileName, 'utf8')
    };
}

export default function api() {
    var app = koa();

    app.use(json());
    app.use(router(app));

    app.get('/ls', function *() {
        var dirName = this.query.dir_name || process.cwd();
        if (dirName === '~') {
            dirName = homedir();
        }
        this.body = ls(dirName);
    });

    app.get('/cat', function *() {
        this.body = cat(this.query.file_name);
    });

    return app;
};
