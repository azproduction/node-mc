import {Flummox} from 'flummox';

const FLUX_CHANNEL_ID = 'flux-action';

export default class SocketFlux extends Flummox {
    constructor() {
        super();

        this._socketHandlers = new Map();
        this._handledMessages = new WeakSet();
        this._broadcastableActions = new Set();
    }

    broadcastActions(key) {
        Object.values(this.getActionIds(key)).forEach((actionId) => {
            this._broadcastableActions.add(actionId);
        });
    }

    connect(socketIo) {
        let receive = ({actionId, body}) => {
            this._handledMessages.add(body);
            this.dispatch(actionId, body);
        };

        let emit = (payload) => {
            // Filter actions
            if (!this._broadcastableActions.has(payload.actionId)) {
                return;
            }

            // Filter already handled actions
            if (this._handledMessages.has(payload.body)) {
                return;
            }

            // Broadcast actions
            socketIo.emit(FLUX_CHANNEL_ID, payload);
        };

        this._socketHandlers.set(socketIo.id, {emit, receive});

        socketIo.on(FLUX_CHANNEL_ID, receive);
        this.on('dispatch', emit);
        return this;
    }

    disconnect(socketIo) {
        var handlers = this._socketHandlers.get(socketIo.id);
        this._socketHandlers.delete(socketIo.id);

        this.off('dispatch', handlers.emit);
        socketIo.off(FLUX_CHANNEL_ID, handlers.receive);
    }
}
