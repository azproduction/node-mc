import SharedFlux from '../../shared/flux';
import TabsActions from './actions/tabsActions';
import TabsStore from './stores/tabsStore';
import ConfigStore from './stores/configStore';

export default class ClientFlux extends SharedFlux {
    constructor() {
        super();

        // Actions
        this.createActions('tabs', TabsActions);

        // Stores
        this.createStore('tabs', TabsStore, this);
        this.createStore('config', ConfigStore, this);
    }
}
