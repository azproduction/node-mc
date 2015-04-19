import exitHook from 'exit-hook';
import Ansi from './ansi';
import TuiEvents from './tui-events';

class TuiRootMount {
    constructor(rootComponent, stdio) {
        this.rootComponent = rootComponent || null;
        this.writableStream = stdio.stdout || null;
        this.readableStream = stdio.stdin || null;

        this.render = this.render.bind(this);

        this.onClick = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
        this.onWheel = null;
        this.onResize = null;
        this.onKeyPress = null;
    }

    _restoreCursor() {
        this.writableStream.write('\u001b[?25h');
    }

    _resetCursor() {
        this.writableStream.write('\u001b[0;0H');
    }

    _hideCursor() {
        this.writableStream.write('\u001b[?25l');
    }

    _cleanScreen() {
        this.writableStream.write('\u001b[2J');
    }

    _addEventListeners(props) {
        props = props || {};
        this.onClick = props.onClick || null;
        this.onMouseDown = props.onMouseDown || null;
        this.onMouseUp = props.onMouseUp || null;
        this.onMouseMove = props.onMouseMove || null;
        this.onKeyPress = props.onKeyPress || null;
        this.onWheel = props.onWheel || null;
        this.onResize = props.onResize || null;
    }

    componentDidMount() {
        this._hideCursor();
        this._cleanScreen();

        this.rootComponent.on('change', this.render);
        this.render();
        this.rootComponent.componentDidMount();
    }

    componentWillUnmount() {
        this._restoreCursor();
        this._cleanScreen();
        this._resetCursor();

        this.rootComponent.componentWillUnmount();
        this.rootComponent.off('change', this.render);
    }

    handleEvent({eventName, payload}) {
        if (eventName === 'keypress' && this.onKeyPress) {
            this.onKeyPress(payload);
        }

        if (eventName === 'click' && this.onClick) {
            this.onClick(payload);
        }

        if (eventName === 'mousedown' && this.onMouseDown) {
            this.onMouseDown(payload);
        }

        if (eventName === 'mouseup' && this.onMouseUp) {
            this.onMouseUp(payload);
        }

        if (eventName === 'wheel' && this.onWheel) {
            this.onWheel(payload);
        }
    }

    render() {
        var ansi = this.rootComponent;

        if (!(ansi instanceof Ansi)) {
            ansi = this.rootComponent.render();
        }

        if (!(ansi instanceof Ansi)) {
            throw new TypeError(`Component#render() should return an <ansi/> element.`);
        }

        this._addEventListeners(ansi.props);
        this._resetCursor();
        this.writableStream.write(ansi.render());
    }
}

export default function render(rootComponent, stdio) {
    var mount = new TuiRootMount(rootComponent, stdio);
    exitHook(mount.componentWillUnmount.bind(mount));
    mount.componentDidMount();

    var events = new TuiEvents(stdio);
    exitHook(events.componentWillUnmount.bind(events));
    events.componentDidMount();

    // Pipe events to mount
    events.on('event', mount.handleEvent.bind(mount));
}
