import './index.styl';
import React from 'react';
import ReactUpdateListener from './lib/react-update-listener';
import ReplayEvent from './lib/replay-event';
import {TuiElement, render, compressBox} from 'html-tui';
import Stats from 'stats.js';

let updates = new ReactUpdateListener();

export default class HtmlToTui extends React.Component {
    constructor () {
        super();
        this.stats = new Stats();
        this.replayEvent = new ReplayEvent();
        this.replayEventHandler = ({eventName, payload}) => {
            this.replayEvent.event(eventName, payload);
        };

        this.repaintHandler = () => {
            this.stats.begin();
            var htmlElement = React.findDOMNode(this);
            var element = new TuiElement(htmlElement, {
                downScale: this.props.scale
            });

            var serializedElement = element.toArray();
            serializedElement = compressBox(serializedElement);

            var ansi = render.ansi(serializedElement);

            this.props.onRender(ansi);
            this.stats.end();
        };

        this.repaintFrameId = 0;
        this.repaintOnEveryFrame = () => {
            this.repaintHandler();
            this.repaintFrameId = requestAnimationFrame(this.repaintOnEveryFrame);
        };
    }

    _setupRepaint(oldWaitForChanges, newWaitForChanges) {
        if (oldWaitForChanges === newWaitForChanges) {
            return;
        }

        // If old mode was always repaint
        if (oldWaitForChanges === false) {
            cancelRequestAnimationFrame(this.repaintFrameId);
        }

        // Old mode was watch react tree changes
        if (oldWaitForChanges === true) {
            updates.removeUpdateListener(this.repaintHandler);
        }

        if (newWaitForChanges === true) {
            updates.addUpdateListener(this.repaintHandler);
        }

        if (newWaitForChanges === false) {
            this.repaintOnEveryFrame();
        }
    }

    _setupEventStream(oldEventStream, newEventStream) {
        if (oldEventStream === newEventStream) {
            return;
        }

        if (oldEventStream) {
            oldEventStream.off('change', this.replayEventHandler);
        }

        if (!newEventStream) {
            return;
        }

        newEventStream.on('change', this.replayEventHandler);
    }

    _setupReplayEvent(oldScale, newScale) {
        if (oldScale === newScale) {
            return;
        }
        this.replayEvent.setDocument(React.findDOMNode(this).ownerDocument);
        this.replayEvent.setOptions({
            scale: newScale
        });
    }

    _setupStats(oldShowStats, newShowStats) {
        if (oldShowStats === newShowStats) {
            return;
        }
        // 0: fps, 1: ms
        this.stats.setMode(1);
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.right = '0px';
        this.stats.domElement.style.top = '0px';
        let ownerDocumentBody = React.findDOMNode(this).ownerDocument.body;

        // Stats Element was not in DOM, and should be shown
        if (newShowStats === true && !oldShowStats) {
            ownerDocumentBody.appendChild(this.stats.domElement);
        }

        // States Element was in DOM and should be removed
        if (!newShowStats && oldShowStats === true) {
            ownerDocumentBody.removeChild(this.stats.domElement);
        }
    }

    componentDidMount() {
        updates.forceUpdate();
        this._setupStats(null, this.props.showStats);
        this._setupRepaint(null, this.props.waitForDOMChanges);
        this._setupReplayEvent(null, this.props.scale);
        this._setupEventStream(null, this.props.eventStream);
    }

    componentWillReceiveProps(newProps) {
        this._setupStats(this.props.showStats, newProps.showStats);
        this._setupRepaint(this.props.waitForDOMChanges, newProps.waitForDOMChanges);
        this._setupReplayEvent(this.props.scale, newProps.scale);
        this._setupEventStream(this.props.eventStream, newProps.eventStream);
    }

    componentWillUnmount() {
        this._setupStats(this.props.showStats, null);
        this._setupRepaint(this.props.waitForDOMChanges, null);
        this._setupReplayEvent(this.props.scale, null);
        this._setupEventStream(this.props.eventStream, null);
    }

    componentDidUpdate() {
        updates.forceUpdate();
    }

    render() {
        let style = {
            width: this.props.terminalWidth,
            height: this.props.terminalHeight,
            transformOrigin: '0 0',
            transform: `scaleX(${this.props.scale[0]}) scaleY(${this.props.scale[1]})`
        };

        let className = 'html-to-tui';
        if (this.props.isHeadlessBrowser) {
            className += ' html-to-tui_block-font';
        }

        return (
            <div className={className} onWheel={updates.forceUpdate.bind(updates)} style={style}>
                {this.props.children}
            </div>
        );
    }
}

HtmlToTui.defaultProps = {
    showStats: true,
    waitForDOMChanges: true,
    isHeadlessBrowser: false,
    terminalWidth: 80,
    terminalHeight: 24,
    scale: [5, 5],
    onRender: () => {return void 0;}
};
