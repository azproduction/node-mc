import './index.styl';
import React from 'react';
import FluxComponent from 'flummox/component';
import {TuiElement, render, compressBox} from 'html-tui';

export default class App extends React.Component {
    constructor() {
        super();

        this.state = {
            counter: 0
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

    _changeContent() {
        this.setState({
            counter: this.state.counter + 1
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
        return (
            <div className="b-app">
                <div className="b-app__dom" ref="dom" style={{width: 20}}>
                    <div tabIndex="-1"
                         onClick={this._changeContent.bind(this)}
                         onKeyPress={this._changeContent.bind(this)}
                         style={{border: 'solid 1px #fff', background: 'blue', color: '#fff', textAlign: 'center'}}
                        >
                        {this.state.counter || 'Click Me'}
                    </div>
                </div>
                <pre className="b-app__cli" ref="cli"></pre>
            </div>
        );
    }
}
