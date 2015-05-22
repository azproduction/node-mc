import mount from 'koa-mount';
import middleware from './middleware';
import views from './views';
import api from './api';

export default function ({args, app}) {
    middleware({args, app});
    app.use(mount('/', views(args)));
    app.use(mount('/api', api(args)));
}
