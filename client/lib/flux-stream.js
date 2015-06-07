import EventEmitter from 'eventemitter3';

export default class FluxStream extends EventEmitter {
    constructor (store, storeProcessor) {
        super();
        this._store = store;
        this._storeChangeHandler = () => {
            this.emit('change', storeProcessor(store));
        };

        this._store.on('change', this._storeChangeHandler);
    }

    destroy() {
        this._store.off('change', this._storeChangeHandler);
    }
}
