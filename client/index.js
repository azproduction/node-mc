import React from 'react';
import FluxComponent from 'flummox/component';
import ClientFlux from './flux';
import socket from './socket';
import App from './components/app';
import HtmlToTui from './components/html-to-tui';
import replayEvents from './lib/replay-events';

window.React = React;

let flux = new ClientFlux();
flux.connect(socket());

replayEvents(flux.getStore('event'), document);

let connectToStores = {
    tabs: (store) => ({
        leftPanel: store.getTab('leftPanel'),
        rightPanel: store.getTab('rightPanel')
    }),
    render: (store) => ({
        size: store.getSize()
    })
};

/**
 * @param {String} ansi
 */
function onRender(ansi) {
    flux.getActions('render').renderAnsi(ansi);
}

let content = (
    <HtmlToTui showStats={true} waitForDOMChanges={true} onRender={onRender}>
        <FluxComponent flux={flux} connectToStores={connectToStores}>
            <App />
        </FluxComponent>
    </HtmlToTui>
);

React.render(content, document.querySelector('#app'));
