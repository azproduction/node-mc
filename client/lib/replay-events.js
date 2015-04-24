import initKeyboardEvent from './init-keyboard-event';

/**
 * @param {Document} document
 * @param {object} payload
 */
function sendKeyToActiveElement(document, payload) {
    payload = Object.assign({bubbles: true, cancelable: true}, payload);

    var target = document.activeElement;
    var isNotCanceled = target.dispatchEvent(initKeyboardEvent('keydown', payload));

    if (isNotCanceled) {
        isNotCanceled = target.dispatchEvent(initKeyboardEvent('keypress', payload));
        if (isNotCanceled) {
            // TODO paste into input selection
            // TODO delete, enter, backspace
            // TODO cursor support
            // TODO arrow navigation
            console.log('payload.char=', payload.char);
        }
    }

    target.dispatchEvent(initKeyboardEvent('keydown', payload));
}

/**
 * @param {Document} document
 * @param {Number} pageX
 * @param {Number} pageY
 */
function clickElement(document, {pageX, pageY}) {
    var target = document.elementFromPoint(pageX, pageY);
    target.focus();
    target.click();
}

export default function replayEvents(eventStore, document) {
    eventStore.on('change', function () {
        var {eventName, payload} = eventStore.getEvent();

        if (eventName === 'keypress') {
            sendKeyToActiveElement(document, payload);
            return;
        }

        if (eventName === 'click') {
            clickElement(document, payload);
            return;
        }
    });
}
