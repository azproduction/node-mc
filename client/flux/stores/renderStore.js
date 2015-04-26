import {Store} from 'flummox';

export default class RenderStore extends Store {
    constructor(flux) {
        super();

        let renderActionIds = flux.getActionIds('render');

        this.register(renderActionIds.resize, this.updateSize.bind(this));

        this.state = {
            width: 80,
            height: 24
        };
    }

    updateSize({width, height}) {
        this.setState({width, height});
    }

    getSize() {
        return this.state;
    }
}
