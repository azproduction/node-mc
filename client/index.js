import React from 'react';
import FluxComponent from 'flummox/component';
import ClientFlux from './flux';
import socket from './socket';
import App from './components/app';
import replayEvents from './lib/replay-events';
import stats from './lib/stats';
document.body.appendChild(stats.domElement);

window.React = React;

let flux = new ClientFlux();
flux.connect(socket());

replayEvents(flux.getStore('event'), document);

var connectToStores = {
    tabs: (store) => ({
        leftPanel: store.getTab('leftPanel'),
        rightPanel: store.getTab('rightPanel')
    }),
    render: (store) => ({
        size: store.getSize()
    })
};

var content = (
    <FluxComponent flux={flux} connectToStores={connectToStores}>
        <App />
    </FluxComponent>
);

React.render(content, document.querySelector('#app'));
