import React from 'react';
import FluxComponent from 'flummox/component';
import ClientFlux from './flux';
import socket from './socket';
import App from './components/app';
import replayEvents from './lib/replay-events';

window.React = React;

let flux = new ClientFlux();
flux.connect(socket());

replayEvents(flux.getStore('event'), document);

var connectToStores = {
    tabs: (store) => ({
        leftPanel: store.getTab('leftPanel'),
        rightPanel: store.getTab('rightPanel')
    })
};

var content = (
    <FluxComponent flux={flux} connectToStores={connectToStores}>
        <App />
    </FluxComponent>
);

React.render(content, document.querySelector('#app'));
