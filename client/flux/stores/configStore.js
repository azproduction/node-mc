import {Store} from 'flummox';
import immutable from 'immutable';

export default class ConfigStore extends Store {
    constructor(flux) {
        super();

        let configActionIds = flux.getActionIds('config');

        this.register(configActionIds.configureClient, this.configureEvent.bind(this));

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
