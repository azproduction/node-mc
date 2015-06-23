import './index.styl';
import React from 'react';
import ReactUpdateListener from './lib/react-update-listener';
import ReplayEvent from './lib/replay-event';
import {TuiElement, render} from 'html-tui';
import EventEmitter from 'eventemitter3';
import Stats from 'stats.js';

let updates = new ReactUpdateListener();

export default class TuiDom extends React.Component {
    constructor () {
        super();
        this.stats = new Stats();
        this.replayEvent = new ReplayEvent();
        this.replayEventHandler = ({eventName, payload}) => {
            this._event(eventName, payload);
            this.replayEvent.event(eventName, payload);
        };

        this.repaintHandler = () => {
            this.stats.begin();
            var htmlElement = React.findDOMNode(this);
            var element = new TuiElement(htmlElement, {
                scale: this.props.scale
            });

            var serializedElement = element.toCompressedArray();

            // console.log.apply(console, render.chrome(serializedElement));
            var ansi = render.ansi(serializedElement);

            this.props.socket.emit('tui-screen-stream', ansi);
            this.stats.end();
        };

        this.state = {
            terminalWidth: 80,
            terminalHeight: 24
        };

        this.repaintFrameId = 0;
        this.repaintOnEveryFrame = () => {
            this.repaintHandler();
            this.repaintFrameId = requestAnimationFrame(this.repaintOnEveryFrame);
        };
        this.mutationObserver = null;
    }

    _event(eventName, payload) {
        if (eventName === 'resize') {
            this.setState({
                terminalWidth: payload.width,
                terminalHeight: payload.height
            });
        }
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

    _setupSocket(oldSocket, newSocket) {
        if (oldSocket === newSocket) {
            return;
        }

        if (oldSocket) {
            oldSocket.off('tui-event-stream', this.replayEventHandler);
        }

        if (!newSocket) {
            return;
        }

        newSocket.on('tui-event-stream', this.replayEventHandler);
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

    _setupMutationObserver(oldFlag, newFlag) {
        if (oldFlag === newFlag) {
            return;
        }

        if (typeof MutationObserver === 'undefined') {
            return;
        }

        // Create
        if (oldFlag === null) {
            this.mutationObserver = new MutationObserver(() => {
                this._forceRepaint();
            });
        }

        // Add
        if (newFlag === true) {
            this.mutationObserver.observe(React.findDOMNode(this), {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });
        }

        // Remove
        if (newFlag === false) {
            this.mutationObserver.disconnect();
        }

        // Destroy
        if (newFlag === null) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
    }

    _forceRepaint() {
        updates.forceUpdate();
    }

    componentDidMount() {
        this._forceRepaint();
        this._setupStats(null, this.props.showStats);
        this._setupRepaint(null, this.props.waitForDOMChanges);
        this._setupMutationObserver(null, this.props.useMutationObserver);
        this._setupReplayEvent(null, this.props.scale);
        this._setupSocket(null, this.props.socket);
    }

    componentWillReceiveProps(newProps) {
        this._setupStats(this.props.showStats, newProps.showStats);
        this._setupRepaint(this.props.waitForDOMChanges, newProps.waitForDOMChanges);
        this._setupMutationObserver(this.props.useMutationObserver, newProps.useMutationObserver);
        this._setupReplayEvent(this.props.scale, newProps.scale);
        this._setupSocket(this.props.socket, newProps.socket);
    }

    componentWillUnmount() {
        this._setupStats(this.props.showStats, null);
        this._setupRepaint(this.props.waitForDOMChanges, null);
        this._setupMutationObserver(this.props.useMutationObserver, null);
        this._setupReplayEvent(this.props.scale, null);
        this._setupSocket(this.props.socket, null);
    }

    componentDidUpdate() {
        this._forceRepaint();
    }

    render() {
        let style = {
            width: this.state.terminalWidth,
            height: this.state.terminalHeight,
            transformOrigin: '0 0',
            transform: `scaleX(${this.props.scale[0]}) scaleY(${this.props.scale[1]})`
        };

        let className = 'tui-dom';
        if (this.props.isHeadlessBrowser) {
            className += ' tui-dom_block-font';
        }

        return (
            <div className={className} onWheel={updates.forceUpdate.bind(updates)} style={style}>
                {this.props.children}
            </div>
        );
    }
}

TuiDom.defaultProps = {
    showStats: true,
    waitForDOMChanges: true,
    useMutationObserver: false,
    isHeadlessBrowser: false,
    scale: [5, 5],
    // /dev/null by default
    socket: new EventEmitter()
};
