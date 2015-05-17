import TuiReact from '../../lib/tui-react';

var React = TuiReact;

export default class Cli extends TuiReact.Component {
    constructor() {
        super();
        this.state = {
            screen: ''
        };
    }

    componentDidMount() {
        var screenStore = this.props.flux.getStore('screen');
        screenStore.on('change', this._updateScreen.bind(this));
    }

    _updateScreen(screen) {
        var screenStore = this.props.flux.getStore('screen');

        this.setState({
            screen: screenStore.state.screen
        });
    }

    _onKeyPress(event) {
        this._forwardEvent('keypress', event);
        // Handle: Ctrl + C
        if (event && event.ctrlKey && event.key === 'c') {
            process.exit(0);
        }
    }

    _forwardEvent(eventName, event) {
        this.props.flux.getActions('event').emit(eventName, event);
    }

    render() {
        // TODO try to reuse node-mc/client/components/app/index.js (find there event listeners)
        return (
            <ansi
                onKeyPress={this._onKeyPress.bind(this)}
                onClick={this._forwardEvent.bind(this, 'click')}
                onWheel={this._forwardEvent.bind(this, 'wheel')}>
                {this.state.screen}
            </ansi>
        );
    }
}
