import {Store} from 'flummox';
import immutable from 'immutable';

export default class TabsStore extends Store {
    constructor(flux) {
        super();

        let tabsActionIds = flux.getActionIds('tabs');

        this.register(tabsActionIds.changeDir, this.handleDirChange);

        this.state = {
            tabs: immutable.Map()
        };
    }

    handleDirChange({tabName, dirName, content: {list}}) {
        this.setState({
            tabs: this.state.tabs.mergeIn([tabName], {
                dirName,
                fileList: list
            })
        });
    }

    getTab(tabName) {
        return this.state.tabs.get(tabName) || null;
    }
}
