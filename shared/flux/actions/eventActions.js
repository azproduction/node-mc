import {Actions} from 'flummox';

export default class EventActions extends Actions {
    emit(eventName, payload) {
        return {eventName, payload};
    }
}
