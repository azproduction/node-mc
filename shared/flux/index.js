import SocketFlux from '../../lib/socket-flux';
import AppActions from './actions/appActions';

export default class SharedFlux extends SocketFlux {
    constructor() {
        super();

        this.createActions('app', AppActions);
        this.broadcastActions('app');
    }
}
