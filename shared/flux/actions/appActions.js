import {Actions} from 'flummox';

export default class AppActions extends Actions {
    configureClient(config) {
        return {config};
    }

    exit() {
        return {};
    }
}
