import {Actions} from 'flummox';

export default class KeyboardActions extends Actions {
    emit(eventName, payload) {
        return {eventName, payload};
    }
}
