import {Store} from 'flummox';

export default class ScreenStore extends Store {
    constructor(flux) {
        super();

        const renderActions = flux.getActions('render');
        this.register(renderActions.renderAnsi, this.storeScreen);

        this.state = {
            screen: ''
        };
    }

    storeScreen(data) {
        this.setState({
            screen: data.string
        });
    }
}
