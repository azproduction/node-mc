import initKeyboardEvent from './init-keyboard-event';
import initWheelEvent from './init-wheel-event';

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

export default class ReplayEvent {
    /**
     *
     * @param {Document} document
     * @param {Object} [options]
     * @param {Number[]} [options.scale=[1, 1]]
     */
    constructor(document, options) {
        this.setDocument(document);
        this.setOptions(options);
    }

    setDocument(document) {
        this._document = document;
    }

    setOptions(options) {
        this._options = this._options || {};
        this._options.scale = this._options.scale || [1, 1];

        if (options && options.scale) {
            this._options.scale[0] = options.scale[0] || 1;
            this._options.scale[1] = options.scale[1] || 1;
        }
    }

    event(eventName, payload) {
        if (eventName === 'keypress') {
            this._sendKeyToActiveElement(payload);
            return;
        }

        if (eventName === 'click') {
            this._clickElement(payload);
            return;
        }

        if (eventName === 'wheel') {
            this._wheelElement(payload);
            return;
        }

        if (eventName === 'unload') {
            this._document.defaultView.close();
        }
    }

    /**
     * @param {object} payload
     */
    _sendKeyToActiveElement(payload) {
        payload = Object.assign({bubbles: true, cancelable: true}, payload);

        var target = this._document.activeElement;
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
     * @param {Number} pageX
     * @param {Number} pageY
     */
    _clickElement({pageX, pageY}) {
        var [scaleX, scaleY] = this._options.scale;
        var target = this._document.elementFromPoint(pageX * scaleX, pageY * scaleY);
        target.focus();
        target.click();
    }

    _wheelElement({pageX, pageY, deltaY}) {
        var [scaleX, scaleY] = this._options.scale;
        var target = this._document.elementFromPoint(pageX * scaleX, pageY * scaleY);
        while (target && target !== this._document) {
            // Scroll possible
            if (target.scrollHeight > target.clientHeight) {
                target.scrollTop += deltaY;
                target.dispatchEvent(initWheelEvent());
                return;
            }

            // No scroll, take parent
            target = target.parentElement;
        }
    }
}
