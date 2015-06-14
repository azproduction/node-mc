import './index.styl';
import React from 'react';
import moment from 'moment';

export default class App extends React.Component {
    componentDidMount() {
        let tabsActions = this.props.flux.getActions('tabs');

        tabsActions.changeDirToCwd('leftPanel').then(() => {
            tabsActions.focusTab('leftPanel');
        });
        tabsActions.changeDirToCwd('rightPanel');
    }

    _selectFile(panelName, fileName) {
        this.props.flux.getActions('tabs').selectFile(panelName, fileName);
    }

    _changeDir(panelName, fileName) {
        return this.props.flux.getActions('tabs').changeDir(panelName, fileName);
    }

    _renderFileList(fileList, panelName, selectedFile) {
        // hidden files
        fileList = fileList.filter((file) => {
            if (file.name === '..') {
                return true;
            }
            return file.name[0] !== '.';
        });

        return fileList.map((file, key) => {
            var className = 'file';
            var clickHandler;

            if (file.fullName === selectedFile) {
                className += ' file_state_selected';
                // If file is focused – second click on it will be change dir.
                if (file.isDirectory) {
                    clickHandler = this._changeDir.bind(this, panelName, file.fullName);
                }
            } else {
                clickHandler = this._selectFile.bind(this, panelName, file.fullName);
            }

            if (file.isFile) {
                className += ' file_type_file';
            }

            if (file.isDirectory) {
                className += ' file_type_directory';
            }

            return (
                <li className={className} key={key} onClick={clickHandler}>
                    <div className="file__name">{file.name}</div>
                    <div className="file__size">{file.stat.size}</div>
                    <div className="file__time">{moment(file.stat.mtime).format('L')}</div>
                </li>
            );
        });
    }

    _renderPanel(panel, panelName) {
        // activePanelName
        var className = 'panel';
        var selectedFile = null;

        if (panelName === this.props.activePanelName) {
            className += ' panel_selected';
            selectedFile = panel.selectedFile;
        }

        return (
            <div className={className} key={panelName}>
                <div className="panel__caption">{panel.dirName}</div>
                <ul className="file-list">
                    <li className="header">
                        <div className="header__name">Name</div>
                        <div className="header__size">Size</div>
                        <div className="header__time">MTime</div>
                    </li>
                    {this._renderFileList(panel.fileList, panelName, selectedFile)}
                </ul>
            </div>
        );
    }

    _renderPanels() {
        var panels = [];

        if (this.props.leftPanel) {
            panels.push(this._renderPanel(this.props.leftPanel.toJS(), 'leftPanel'))
        }

        if (this.props.rightPanel) {
            panels.push(this._renderPanel(this.props.rightPanel.toJS(), 'rightPanel'))
        }

        return panels;
    }

    render() {
        return (
            <div className="mc">
                <ul className="menu">
                    <li className="menu__item"><span className="menu__item-shortcut">L</span>eft</li>
                    <li className="menu__item"><span className="menu__item-shortcut">F</span>ile</li>
                    <li className="menu__item"><span className="menu__item-shortcut">C</span>ommand</li>
                    <li className="menu__item"><span className="menu__item-shortcut">O</span>ptions</li>
                    <li className="menu__item"><span className="menu__item-shortcut">R</span>ight</li>
                </ul>
                <div className="content">
                    {this._renderPanels()}
                </div>
                <div className="console">
                    <input className="console__input"
                           type="text"
                           defaultValue="~/Documents/html-cli$ node index.js"
                           autofocus />
                </div>
                <ul className="controls">
                    <li className="control">
                        <div className="control__number">1</div>
                        <div className="control__name">Help</div>
                    </li>
                    <li className="control">
                        <div className="control__number">2</div>
                        <div className="control__name">Menu</div>
                    </li>
                    <li className="control">
                        <div className="control__number">3</div>
                        <div className="control__name">View</div>
                    </li>
                    <li className="control">
                        <div className="control__number">4</div>
                        <div className="control__name">Edit</div>
                    </li>
                    <li className="control">
                        <div className="control__number">5</div>
                        <div className="control__name">Copy</div>
                    </li>
                    <li className="control">
                        <div className="control__number">6</div>
                        <div className="control__name">RenMov</div>
                    </li>
                    <li className="control">
                        <div className="control__number">7</div>
                        <div className="control__name">Mkdir</div>
                    </li>
                    <li className="control">
                        <div className="control__number">8</div>
                        <div className="control__name">Delete</div>
                    </li>
                    <li className="control">
                        <div className="control__number">9</div>
                        <div className="control__name">PullDn</div>
                    </li>
                    <li className="control">
                        <div className="control__number">10</div>
                        <div className="control__name">Quit</div>
                    </li>
                </ul>
            </div>
        );
    }
}
