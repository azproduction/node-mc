import mount from 'koa-mount';
import middleware from './middleware';
import views from './views';
import api from './api';

export default function (app) {
    middleware(app);
    app.use(mount('/', views));
    app.use(mount('/api', api));
}
