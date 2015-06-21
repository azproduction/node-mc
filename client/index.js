import React from 'react';
import FluxComponent from 'flummox/component';
import ClientFlux from './flux';
import App from './app';
import TuiDom from '../lib/tui-dom';
import io from 'socket.io-client';

window.React = React;

let socket = io({
    transports: ['websocket', 'polling']
});

let flux = new ClientFlux();
flux.connect(socket);

let appStores = {
    tabs: (store) => ({
        panels: {
            leftPanel: store.getTab('leftPanel'),
            rightPanel: store.getTab('rightPanel')
        },
        activePanelName: store.getActiveTabName()
    }),
    file: (store) => ({
        isFileOpened: store.getFileName() !== null,
        openedFileName: store.getFileName(),
        openedFileContent: store.getFileContent()
    })
};

let tuiDomStores = {
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

let content = (
    <FluxComponent flux={flux} connectToStores={tuiDomStores}>
        <TuiDom socket={socket}>
            <FluxComponent flux={flux} connectToStores={appStores}>
                <App />
            </FluxComponent>
        </TuiDom>
    </FluxComponent>
);

React.render(content, document.querySelector('#app'));
