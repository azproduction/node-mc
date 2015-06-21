import request from '../../../shared/request';
import {Actions} from 'flummox';

export default class FileActions extends Actions {
    /**
     * @param {String} tabName
     * @param {String} [fileName]
     * @returns {Promise}
     */
    openFile(fileName) {
        return request
            .get('/api/cat')
            .query({
                file_name: fileName
            })
            .exec()
            .then(({body}) => {
                return {
                    fileName: body.fileName,
                    fileContent: body.content
                };
            });
    }

    closeFile() {
        return {};
    }
}
