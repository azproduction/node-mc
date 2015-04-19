import Ansi from './ansi';

export default function createElement(Component, props, children) {
    props = props || null;

    if (children) {
        props = props || {};
        props.children = children;
    }

    if (Component === 'ansi') {
        Component = Ansi;
    }

    var component = new Component();
    component.props = props;

    return component;
}
