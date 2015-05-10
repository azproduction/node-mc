import './index.styl';
import React from 'react';
import FluxComponent from 'flummox/component';
import {TuiElement, render, compressBox} from 'html-tui';

export default class App extends React.Component {
    constructor() {
        super();

        this.state = {
            frame: 0
        };
    }

    componentDidMount() {
        this._setupRepaint();
        this.props.flux.getActions('tabs').changeDir('leftPanel', '~');
        this.props.flux.getActions('tabs').changeDir('rightPanel', '~');
    }

    _applicationChange() {
        this.setState({
            frame: this.state.frame + 1
        });
    }

    _setupRepaint() {
        var repaint = () => {
            var htmlElement = React.findDOMNode(this.refs.dom);
            var element = new TuiElement(htmlElement);

            var serializedElement = element.toArray();
            serializedElement = compressBox(serializedElement);

            var ansi = render.ansi(serializedElement);

            // console.log.apply(console, render.chrome(serializedElement));
            this.props.flux.getActions('render').renderAnsi(ansi);
            requestAnimationFrame(repaint);
        };
        repaint();
    }

    _renderFileList(fileList) {
        return fileList.slice(0, 10).map((file, key) => {
            var mtime = new Date(file.stat.mtime).toLocaleDateString();
            return (
                <li className="file" key={key}>
                    <div className="file__name">{file.name}</div>
                    <div className="file__size">{file.stat.size}</div>
                    <div className="file__time">{mtime}</div>
                </li>
            );
        });
    }

    _renderPanel(panel) {
        return (
            <div className="panel">
                <div className="panel__caption">{panel.dirName}</div>
                <ul className="file-list">
                    <li className="header">
                        <div className="header__name">Name</div>
                        <div className="header__size">Size</div>
                        <div className="header__time">MTime</div>
                    </li>
                    {this._renderFileList(panel.fileList)}
                </ul>
            </div>
        );
    }

    render() {
        var windowSizes = {
            width: this.props.size.width,
            height: this.props.size.height
        };

        return (
            <div className="b-app">
                <div className="b-app__dom" ref="dom" style={windowSizes}>
                    <div className="mc">
                        <ul className="menu">
                            <li className="menu__item"><span className="menu__item-shortcut">L</span>eft</li>
                            <li className="menu__item"><span className="menu__item-shortcut">F</span>ile</li>
                            <li className="menu__item"><span className="menu__item-shortcut">C</span>ommand</li>
                            <li className="menu__item"><span className="menu__item-shortcut">O</span>ptions</li>
                            <li className="menu__item"><span className="menu__item-shortcut">R</span>ight</li>
                        </ul>
                        <div className="content">
                            {this.props.leftPanel ? this._renderPanel(this.props.leftPanel.toJS()) : null}
                            {this.props.rightPanel ? this._renderPanel(this.props.rightPanel.toJS()) : null}
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
                </div>
                <pre className="b-app__cli" ref="cli"></pre>
            </div>
        );
    }
}
