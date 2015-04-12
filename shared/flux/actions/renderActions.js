import {Actions} from 'flummox';

export default class RenderActions extends Actions {
    renderAnsi(string) {
        return {string};
    }
}
