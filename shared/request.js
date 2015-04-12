import request from 'superagent';
import {Request} from 'superagent';

Request.prototype.exec = function () {
    return new Promise((resolve, reject) => {
        this.end((error, res) => {
            if (error) {
                return reject(error);
            }
            resolve(res);
        });
    });
};

export default request;
