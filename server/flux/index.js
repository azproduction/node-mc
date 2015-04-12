import SharedFlux from '../../shared/flux';
import ScreenStore from './stores/screenStore';

export default class ServerFlux extends SharedFlux {
    constructor() {
        super();

        this.createStore('screen', ScreenStore, this);
    }
}
