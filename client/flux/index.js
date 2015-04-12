import SharedFlux from '../../shared/flux';
import TabsActions from './actions/tabsActions';
import TabsStore from './stores/tabsStore';

export default class ClientFlux extends SharedFlux {
    constructor() {
        super();

        // Actions
        this.createActions('tabs', TabsActions);

        // Stores
        this.createStore('tabs', TabsStore, this);
    }
}
