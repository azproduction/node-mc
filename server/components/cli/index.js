import TuiReact from '../../lib/tui-react';

export default class Cli extends TuiReact.Component {
    constructor() {
        super();
        this.state = {
            isBeforeStart: true,
            isBeforeClose: false,
            screen: ''
        };
    }

    componentDidMount() {
        var screenStore = this.props.flux.getStore('screen');
        screenStore.on('change', this._updateScreen.bind(this));

        this.setState({
            isBeforeStart: false
        });
    }

    _updateScreen(screen) {
        var screenStore = this.props.flux.getStore('screen');

        this.setState({
            screen: screenStore.state.screen
        });
    }

    componentWillUnmount() {
        this.setState({
            isBeforeClose: true
        });
    }

    _renderCleanScreen() {
        return '\u001b[2J\u001b[0;0H';
    }

    _renderHideCursor() {
        return '\u001b[?25l';
    }

    _renderShowCursor() {
        return '\u001b[?25h';
    }

    render() {
        if (this.state.isBeforeStart) {
            return this._renderHideCursor() + this._renderCleanScreen();
        }

        if (this.state.isBeforeClose) {
            return this._renderShowCursor();
        }

        return this._renderCleanScreen() + this.state.screen;
    }
}
