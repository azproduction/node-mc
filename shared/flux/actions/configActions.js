import {Actions} from 'flummox';

export default class ConfigActions extends Actions {
    configureClient(config) {
        return {config};
    }
}
