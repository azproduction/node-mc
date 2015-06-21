import {Store} from 'flummox';
import immutable from 'immutable';

export default class ConfigStore extends Store {
    constructor(flux) {
        super();

        let appActionIds = flux.getActionIds('app');

        this.register(appActionIds.configureClient, this.configureEvent.bind(this));

        this.state = {
            config: {}
        };
    }

    configureEvent({config}) {
        this.setState({config});
    }

    getConfig() {
        return this.state.config;
    }
}
