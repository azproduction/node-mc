export default function replayEvents(eventStore, document) {
    eventStore.on('change', function () {
        var target;
        var {eventName, payload} = eventStore.getEvent();

        if (eventName === 'keypress') {
            // TODO fill inputs with emitted key values
            target = document.activeElement;
            React.addons.TestUtils.Simulate.keyPress(target, payload);
            return;
        }

        if (eventName === 'click') {
            target = document.elementFromPoint(payload.pageX, payload.pageY);
            target.focus();
            target.click();
            return;
        }
    });
}
