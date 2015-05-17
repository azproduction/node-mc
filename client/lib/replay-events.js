import initKeyboardEvent from './init-keyboard-event';

/**
 *
 * @param {HTMLInputElement} input
 */
function clearSelection(input) {
    let cursorPosition = input.selectionStart;
    input.value = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd);
    input.selectionStart = cursorPosition;
    input.selectionEnd = cursorPosition;
}

/**
 *
 * @param {HTMLInputElement} input
 * @param {object} payload
 */
function sendKeyToInput(input, payload) {
    if (payload.key === 'home') {
        let cursorPosition = 0;

        input.selectionStart = cursorPosition;
        input.selectionEnd = cursorPosition;
        return;
    }

    if (payload.key === 'end') {
        let cursorPosition = input.value.length;

        input.selectionStart = cursorPosition;
        input.selectionEnd = cursorPosition;
        return;
    }

    if (payload.key === 'left') {
        let cursorPosition = input.selectionStart - 1;
        if (cursorPosition < 0) {
            cursorPosition = 0;
        }

        input.selectionStart = cursorPosition;
        input.selectionEnd = cursorPosition;
        return;
    }

    if (payload.key === 'right') {
        let cursorPosition = input.selectionEnd + 1;
        if (cursorPosition > input.value.length) {
            cursorPosition = input.value.length;
        }

        input.selectionStart = cursorPosition;
        input.selectionEnd = cursorPosition;
        return;
    }

    if (payload.key === 'backspace') {
        if (input.selectionStart === input.selectionEnd) {
            let cursorPosition = input.selectionStart - 1;
            if (cursorPosition < 0) {
                cursorPosition = 0;
            }
            input.value = input.value.slice(0, cursorPosition) + input.value.slice(cursorPosition + 1);
            input.selectionStart = cursorPosition;
            input.selectionEnd = cursorPosition;
            return;
        }

        clearSelection(input);
        return;
    }

    if (payload.key === 'delete') {
        if (input.selectionStart === input.selectionEnd) {
            let cursorPosition = input.selectionEnd;

            input.value = input.value.slice(0, cursorPosition) + input.value.slice(cursorPosition + 1);
            input.selectionStart = cursorPosition;
            input.selectionEnd = cursorPosition;
            return;
        }

        clearSelection(input);
        return;
    }

    if (payload.char) {
        let cursorPosition = input.selectionStart;
        input.value = input.value.slice(0, input.selectionStart) + payload.char + input.value.slice(input.selectionEnd);
        cursorPosition += 1;
        input.selectionStart = cursorPosition;
        input.selectionEnd = cursorPosition;
    }
}

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
        if (isNotCanceled && target.tagName === 'INPUT') {
            sendKeyToInput(target, payload);
            target.dispatchEvent(initKeyboardEvent('input', payload));
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

function scrollElement(document, {pageX, pageY, deltaY}) {
    var target = document.elementFromPoint(pageX, pageY);
    while (target && target !== document) {
        // Scroll possible
        if (target.scrollHeight > target.clientHeight) {
            target.scrollTop += deltaY;
            return;
        }

        // No scroll, take parent
        target = target.parentElement;
    }
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

        if (eventName === 'wheel') {
            scrollElement(document, payload);
            return;
        }
    });
}
