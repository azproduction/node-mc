import SharedFlux from '../../shared/flux';

export default class ServerFlux extends SharedFlux {
    constructor() {
        super();

        var exitApplicationActionId = this.getActionIds('app').exit;

        this.dispatcher.register(({actionId}) => {
            if (actionId === exitApplicationActionId) {
                process.exit(0);
            }
        });
    }
};
