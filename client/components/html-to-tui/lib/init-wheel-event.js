let eventType = 'DOMMouseScroll';

if ('onwheel' in window) {
    eventType = 'wheel';
} else if ('onmousewheel' in window) {
    eventType = 'mousewheel';
}

export default function initMouseEvent() {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
        eventType,
        true,
        true,
        null,
        120,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        null
    );

    return evt;
}
