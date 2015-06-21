import {Store} from 'flummox';
import immutable from 'immutable';

export default class FileStore extends Store {
    constructor(flux) {
        super();

        let fileActionIds = flux.getActionIds('file');

        this.register(fileActionIds.openFile, this._openFile);
        this.register(fileActionIds.closeFile, this._closeFile);

        this.state = {
            fileName: null,
            fileContent: null
        };
    }

    _openFile({fileName, fileContent}) {
        this.setState({fileName, fileContent});
    }

    _closeFile() {
        this.setState({
            fileName: null,
            fileContent: null
        });
    }

    getFileName() {
        return this.state.fileName;
    }

    getFileContent() {
        return this.state.fileContent;
    }
}
