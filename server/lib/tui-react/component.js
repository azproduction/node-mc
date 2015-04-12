import EventEmitter from 'eventemitter3';

export default class Component extends EventEmitter {
    constructor() {
        this.state = null;
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
        this.emit('change');
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return '';
    }
}
