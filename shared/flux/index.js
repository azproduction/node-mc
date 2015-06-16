import SocketFlux from '../../lib/socket-flux';
import ConfigActions from './actions/configActions';

export default class SharedFlux extends SocketFlux {
    constructor() {
        super();

        this.createActions('config', ConfigActions);
        this.broadcastActions('config');
    }
}
