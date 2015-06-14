import React from 'react';
import FluxComponent from 'flummox/component';
import ClientFlux from './flux';
import socket from './socket';
import App from './components/app';
import HtmlToTui from './components/html-to-tui';
import FluxStream from './lib/flux-stream';

window.React = React;

let flux = new ClientFlux();
flux.connect(socket());

let appStores = {
    tabs: (store) => ({
        leftPanel: store.getTab('leftPanel'),
        rightPanel: store.getTab('rightPanel'),
        activePanelName: store.getActiveTabName()
    })
};

let htmlToTuiStores = {
    render: (store) => {
        let dimensions = store.getSize();

        return {
            terminalWidth: dimensions.width,
            terminalHeight: dimensions.height
        };
    },
    config: (store) => {
        var config = store.getConfig();

        return {
            showStats: config.clientShowStats,
            waitForDOMChanges: !config.clientRaf,
            scale: config.clientScale,
            isHeadlessBrowser: config.client === 'phantomjs',
            useMutationObserver: config.clientMutationObserver
        };
    }
};

/**
 * @param {String} ansi
 */
function onRender(ansi) {
    flux.getActions('render').renderAnsi(ansi);
}

let eventStream = new FluxStream(flux.getStore('event'), (eventStore) => {
    return eventStore.getEvent();
});

let content = (
    <FluxComponent flux={flux} connectToStores={htmlToTuiStores}>
        <HtmlToTui onRender={onRender} eventStream={eventStream}>
            <FluxComponent flux={flux} connectToStores={appStores}>
                <App />
            </FluxComponent>
        </HtmlToTui>
    </FluxComponent>
);

React.render(content, document.querySelector('#app'));
