import EventEmitter from 'eventemitter3';
import ReactUpdates from 'react/lib/ReactUpdates';
import ReactReconcileTransaction from 'react/lib/ReactReconcileTransaction';
import CallbackQueue from 'react/lib/CallbackQueue';
import PooledClass from 'react/lib/PooledClass';

let afterComponentDidUpdate = new EventEmitter();

class CallbackQueueWithNotifier extends CallbackQueue {
    notifyAll() {
        super.notifyAll();
        afterComponentDidUpdate.emit('update');
    }
}
PooledClass.addPoolingTo(CallbackQueueWithNotifier);

class ReactReconcileTransactionWithNotifier extends ReactReconcileTransaction {
    constructor() {
        super();
        this.reactMountReady = CallbackQueueWithNotifier.getPooled(null);
    }
}
PooledClass.addPoolingTo(ReactReconcileTransactionWithNotifier);

/**
 * Accumulates react dom changes using request animation frame
 */
export default class ReactUpdateListener extends EventEmitter {
    constructor() {
        super();

        this._hasDomChanges = false;
        this._isLoopAlive = true;
        this._forceUpdate = this.forceUpdate.bind(this);

        // Inject dependency
        ReactUpdates.injection.injectBatchingStrategy({
            isBatchingUpdates: true,
            batchedUpdates: (callback, a, b, c, d, e, f) => {
                callback(a, b, c, d, e, f);
            }
        });

        ReactUpdates.ReactReconcileTransaction = ReactReconcileTransactionWithNotifier;

        // Listen to global changes
        afterComponentDidUpdate.on('update', this._forceUpdate);

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
