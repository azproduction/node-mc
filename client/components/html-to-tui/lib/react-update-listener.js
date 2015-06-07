import EventEmitter from 'eventemitter3';
import ReactUpdates from 'react/lib/ReactUpdates';

export default class ReactUpdateListener extends EventEmitter {
    constructor() {
        super();

        this._hasDomChanges = false;
        this._isLoopAlive = true;
        ReactUpdates.injection.injectBatchingStrategy({
            isBatchingUpdates: true,
            batchedUpdates: (callback, a, b, c, d, e, f) => {
                this._hasDomChanges = true;
                callback(a, b, c, d, e, f);
            }
        });

        this._repaintLoop = () => {
            ReactUpdates.flushBatchedUpdates();
            if (this._hasDomChanges) {
                this._hasDomChanges = false;
                this.emit('update');
            }

            if (this._isLoopAlive) {
                requestAnimationFrame(this._repaintLoop);
            }
        };

        this._repaintLoop();
    }

    forceUpdate() {
        this._hasDomChanges = true;
    }

    addUpdateListener(callback) {
        this.on('update', callback);
    }

    removeUpdateListener(callback) {
        this.off('update', callback);
    }

    destroy() {
        this._isLoopAlive = false;
    }
}
