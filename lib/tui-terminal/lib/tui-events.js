import keypress from 'keypress';
import EventEmitter from 'eventemitter3';
import Mouse from 'term-mouse';
import exitHook from 'exit-hook';

var BUTTON_MAP = {
    left: 0,
    middle: 1,
    right: 2
};

export default class TuiEvents extends EventEmitter {
    constructor(stdio) {
        super();

        this._stdin = stdio.stdin;
        this._stdout = stdio.stdout;

        this.mouse = new Mouse(stdio);

        this._activateKeyboardEvents();
        this._activateMouseEvents();
        this._activateResizeEvents();
    }

    destroy() {
        this._stdin.pause();
        this._stdin.setRawMode(false);
        this.mouse.stop();
        this.emit('event', {eventName: 'unload'});
        this.removeAllListeners();
    }

    connect(socket) {
        this.on('event', this._sendEvent, socket);
        this._sendWindowSize();
    }

    disconnect(socket) {
        this.off('event', this._sendEvent, socket);
    }

    _sendEvent(event) {
        this.emit('tui-event-stream', event);
    }

    _translateKeyboardEvent(eventName, character, key) {
        return {
            eventName,
            payload: {
                altKey: key && key.alt || false,
                ctrlKey: key && key.ctrl || false,
                metaKey: key && key.meta || false,
                shiftKey: key && key.shift || false,
                key: key && key.name || character,
                charCode: typeof character !== 'undefined' ? character.charCodeAt(0) : null,
                char: typeof character !== 'undefined' ? character : null
            }
        };
    }

    _activateKeyboardEvents() {
        keypress(this._stdin);

        this._stdin.on('keypress', (character, key) => {
            this.emit('event', this._translateKeyboardEvent('keypress', character, key));
        });

        this._stdin.setRawMode(true);
        this._stdin.resume();
    }

    _translateMouseEvent(eventName, event) {
        return {
            eventName,
            payload: {
                altKey: event && event.alt || false,
                ctrlKey: event && event.ctrl || false,
                metaKey: event && event.meta || false,
                shiftKey: event && event.shift || false,
                clientX: null,
                clientY: null,
                screenX: null,
                screenY: null,
                pageX: event.x - 1,
                pageY: event.y - 1,
                button: BUTTON_MAP[event.button] || null,
                buttons: null
            }
        };
    }

    _translateScrollEvent(event) {
        return {
            eventName: 'wheel',
            payload: {
                deltaMode: 0,
                deltaX: 0,
                deltaY: event.button === 'up' ? -1 : 1,
                deltaZ: 0,
                pageX: event.x - 1,
                pageY: event.y - 1
            }
        };
    }

    _activateMouseEvents() {
        this.mouse.start();

        this.mouse.on('click', (event) => {
            this.emit('event', this._translateMouseEvent('click', event));
        });

        this.mouse.on('up', (event) => {
            this.emit('event', this._translateMouseEvent('mouseup', event));
        });

        this.mouse.on('down', (event) => {
            this.emit('event', this._translateMouseEvent('mousedown', event));
        });

        this.mouse.on('scroll', (event) => {
            this.emit('event', this._translateScrollEvent(event));
        });
    }

    _translateWindowSize() {
        return {
            eventName: 'resize',
            payload: {
                width: this._stdout.columns,
                height: this._stdout.rows
            }
        };
    }

    _sendWindowSize() {
        this.emit('event', this._translateWindowSize());
    }

    _activateResizeEvents() {
        this._stdout.on('resize', this._sendWindowSize.bind(this));
    }
}
