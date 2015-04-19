import SocketFlux from '../../lib/socket-flux';
import RenderActions from './actions/renderActions';
import EventActions from './actions/eventActions';

export default class SharedFlux extends SocketFlux {
    constructor() {
        super();

        this.createActions('render', RenderActions);
        this.broadcastActions('render');

        this.createActions('event', EventActions);
        this.broadcastActions('event');
    }
}
