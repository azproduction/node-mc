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
        this._renderAnsi();
        this.props.flux.getActions('tabs').changeDir('leftPanel', '~');
        this.props.flux.getActions('tabs').changeDir('rightPanel', '~');
    }

    componentDidUpdate() {
        setTimeout(() => {
            this._renderAnsi();
        }, 0);
    }

    _applicationChange() {
        this.setState({
            frame: this.state.frame + 1
        });
    }

    _renderAnsi() {
        var htmlElement = this.refs.dom.getDOMNode();
        var element = new TuiElement(htmlElement);
        var serializedElement = compressBox(element.toArray());

        console.log.apply(console, render.chrome(serializedElement));
        this.props.flux.getActions('render').renderAnsi(render.ansi(serializedElement));
    }

    render() {
        var windowSizes = {
            width: this.props.size.width,
            height: this.props.size.height
        };

        return (
            <div className="b-app">
                <div className="b-app__dom" ref="dom" style={windowSizes}>
                    <div className="b-app__content">
                        <div onClick={this._applicationChange.bind(this)}
                             className="b-app__block">
                            {this.state.frame || 'Click Me'}
                        </div>
                        <input type="text"
                               defaultValue={this.state.frame}
                               onBlur={this._applicationChange.bind(this)}
                               onFocus={this._applicationChange.bind(this)}
                               onChange={this._applicationChange.bind(this)}
                               autoFocus={true}
                               className="b-app__input"/>
                    </div>
                </div>
                <pre className="b-app__cli" ref="cli"></pre>
            </div>
        );
    }
}
