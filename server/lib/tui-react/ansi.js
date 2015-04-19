import Component from './component';

export default class Ansi extends Component {
    render() {
        return this.props && this.props.children || '';
    }
}
