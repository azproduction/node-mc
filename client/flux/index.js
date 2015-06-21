import SharedFlux from '../../shared/flux';
import TabsActions from './actions/tabsActions';
import FileActions from './actions/fileActions';

import TabsStore from './stores/tabsStore';
import FileStore from './stores/fileStore';
import ConfigStore from './stores/configStore';

export default class ClientFlux extends SharedFlux {
    constructor() {
        super();

        // Actions
        this.createActions('tabs', TabsActions);
        this.createActions('file', FileActions);

        // Stores
        this.createStore('tabs', TabsStore, this);
        this.createStore('file', FileStore, this);
        this.createStore('config', ConfigStore, this);
    }
}
