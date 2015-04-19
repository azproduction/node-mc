import keypress from 'keypress';
import EventEmitter from 'eventemitter3';
import Mouse from 'term-mouse';

var BUTTON_MAP = {
    left: 0,
    middle: 1,
    right: 2
};

export default class TuiEvents extends EventEmitter {
    constructor(stdio) {
        super();

        this.writableStream = stdio.stdout || null;
        this.readableStream = stdio.stdin || null;

        this.mouse = new Mouse(stdio);
    }

    _translateKeyboardEvent(eventName, key) {
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
        keypress(this.readableStream);

        this.readableStream.on('keypress', (character, key) => {
            this.emit('event', this._translateKeyboardEvent('keypress', key));
        });

        this.readableStream.setRawMode(true);
        this.readableStream.resume();
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
    }

    componentDidMount() {
        this._activateKeyboardEvents();
        this._activateMouseEvents();
    }

    componentWillUnmount() {
        this.readableStream.pause();
        this.readableStream.setRawMode(false);
        this.mouse.stop();
    }
}
