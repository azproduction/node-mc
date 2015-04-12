import SocketFlux from '../../lib/socket-flux';
import RenderActions from './actions/renderActions';

export default class SharedFlux extends SocketFlux {
    constructor() {
        super();

        this.createActions('render', RenderActions);
        this.broadcastActions('render');
    }
}
