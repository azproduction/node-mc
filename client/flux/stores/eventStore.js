import {Store} from 'flummox';
import immutable from 'immutable';

export default class EventStore extends Store {
    constructor(flux) {
        super();

        let eventActionIds = flux.getActionIds('event');

        this.register(eventActionIds.emit, this.storeEvent.bind(this));

        this.state = {
            event: new immutable.Map()
        };
    }

    storeEvent({eventName, payload}) {
        setTimeout(() => {
            this.setState({
                event: new immutable.Map({eventName, payload})
            });
        }, 0);
    }

    getEvent() {
        return this.state.event.toJS();
    }
}
