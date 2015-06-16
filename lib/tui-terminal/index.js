import TuiEvents from './lib/tui-events';
import exitHook from 'exit-hook';

export default class TuiTerminal {
    constructor(stdio) {
        exitHook(this.destroy.bind(this));
        this._stdout = stdio.stdout;
        this._exit = stdio.exit;
        this._events = new TuiEvents(stdio);
        this._screenHandler = (ansi) => this._write(ansi);

        this._hideCursor();
        this._cleanScreen();
        this._watchCtrlC();
        this._write('\r');
    }

    destroy() {
        this._restoreCursor();
        this._cleanScreen();
        this._resetCursor();
        this._events.destroy();
    }

    connect(socket) {
        socket.on('tui-screen-stream', this._screenHandler);
        this._events.connect(socket);
    }

    disconnect(socket) {
        socket.off('tui-screen-stream', this._screenHandler);
        this._events.disconnect(socket);
    }

    _write(ansi) {
        this._resetCursor();
        this._stdout.write(ansi);
    }

    _watchCtrlC() {
        this._events.on('event', ({eventName, payload}) => {
            if (eventName === 'keypress' && payload && payload.ctrlKey && payload.key === 'c') {
                this._exit(0);
            }
        });
    }

    _restoreCursor() {
        this._stdout.write('\u001b[?25h');
    }

    _resetCursor() {
        this._stdout.write('\u001b[0;0H');
    }

    _hideCursor() {
        this._stdout.write('\u001b[?25l');
    }

    _cleanScreen() {
        this._stdout.write('\u001b[2J');
    }
}
