import request from '../../../shared/request';
import {Actions} from 'flummox';

export default class TabsActions extends Actions {
    changeDir(tabName, dirName) {
        return request
            .get('/api/ls')
            .query({
                dir_name: dirName
            })
            .exec()
            .then(({body}) => {
                return {
                    tabName: tabName,
                    dirName: dirName,
                    content: body
                };
            });
    }
}
