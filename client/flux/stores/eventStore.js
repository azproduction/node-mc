import {Store} from 'flummox';
import immutable from 'immutable';

export default class EventStore extends Store {
    constructor(flux) {
        super();

        let tabsActionIds = flux.getActionIds('event');

        this.register(tabsActionIds.emit, this.storeEvent.bind(this));

        this.state = {
            event: new immutable.Map()
        };
    }

    storeEvent({eventName, payload}) {
        this.setState({
            event: new immutable.Map({eventName, payload})
        });
    }

    getEvent() {
        return this.state.event.toJS();
    }
}
