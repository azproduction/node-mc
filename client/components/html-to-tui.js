import React from 'react';
import ReactUpdates from 'react/lib/ReactUpdates';
import {TuiElement, render, compressBox} from 'html-tui';
import Stats from 'stats.js';

let hasDomChanges = false;

let batchingStrategy = {
    isBatchingUpdates: true,
    batchedUpdates: function (callback, a, b, c, d, e, f) {
        hasDomChanges = true;
        ReactUpdates.flushBatchedUpdates();
        callback(a, b, c, d, e, f);
    }
};

let forceRepaint = () => {
    hasDomChanges = true;
};

ReactUpdates.injection.injectBatchingStrategy(batchingStrategy);

export default class HtmlToTui extends React.Component {
    constructor () {
        super();
        this.stats = new Stats();
        this.props = {
            showStats: true,
            waitForDOMChanges: true,
            onRender: () => {return void 0;}
        };
    }

    _setupRepaint() {
        let waitForDOMChanges = this.props.waitForDOMChanges || false;

        var repaint = () => {
            this.stats.begin();
            var htmlElement = React.findDOMNode(this);
            var element = new TuiElement(htmlElement);

            var serializedElement = element.toArray();
            serializedElement = compressBox(serializedElement);

            var ansi = render.ansi(serializedElement);

            this.props.onRender(ansi);
            this.stats.end();
        };

        (function tryToRepaint() {
            if (!waitForDOMChanges) {
                repaint();
            } else if (hasDomChanges) {
                hasDomChanges = false;
                repaint();
            }
            requestAnimationFrame(tryToRepaint);
        }());
    }

    componentDidMount() {
        if (this.props.showStats) {
            // 0: fps, 1: ms
            this.stats.setMode(1);
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.right = '0px';
            this.stats.domElement.style.top = '0px';
            React.findDOMNode(this).ownerDocument.body.appendChild(this.stats.domElement);
        }
        this._setupRepaint();
    }

    render() {
        return (
            <div onWheel={forceRepaint}>{this.props.children}</div>
        );
    }
}
