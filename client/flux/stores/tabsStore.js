import {Store} from 'flummox';
import immutable from 'immutable';

export default class TabsStore extends Store {
    constructor(flux) {
        super();

        let tabsActionIds = flux.getActionIds('tabs');

        this.register(tabsActionIds.changeDir, this._dirChange);
        this.register(tabsActionIds.selectFile, this._selectFile);
        this.register(tabsActionIds.focusTab, this._focusTab);

        this.state = {
            tabs: immutable.Map(),
            activeTab: null
        };
    }

    _dirChange({tabName, dirName, fileList}) {
        fileList.sort((fileA, fileB) => {
            if (fileA.isDirectory && !fileB.isDirectory) {
                return -1;
            }

            if (!fileA.isDirectory && fileB.isDirectory) {
                return 1;
            }

            return fileA.name.localeCompare(fileB.name);
        });

        this.setState({
            tabs: this.state.tabs.mergeIn([tabName], {
                dirName: dirName,
                fileList: fileList,
                selectedFile: fileList[0] && fileList[0].fullName || null
            })
        });
    }

    _selectFile({tabName, fileName}) {
        if (!this.state.tabs.has(tabName)) {
            return;
        }

        this.setState({
            activeTab: tabName,
            tabs: this.state.tabs.mergeIn([tabName], {
                selectedFile: fileName
            })
        });
    }

    _focusTab({tabName}) {
        this.setState({
            activeTab: tabName
        });
    }

    getTab(tabName) {
        return this.state.tabs.get(tabName) || null;
    }

    getActiveTabName() {
        return this.state.activeTab;
    }
}
