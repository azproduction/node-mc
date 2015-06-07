import SocketFlux from '../../lib/socket-flux';
import RenderActions from './actions/renderActions';
import EventActions from './actions/eventActions';
import ConfigActions from './actions/configActions';

export default class SharedFlux extends SocketFlux {
    constructor() {
        super();

        this.createActions('render', RenderActions);
        this.broadcastActions('render');

        this.createActions('event', EventActions);
        this.broadcastActions('event');

        this.createActions('config', ConfigActions);
        this.broadcastActions('config');
    }
}
