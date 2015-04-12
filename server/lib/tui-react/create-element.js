export default function createElement(Component, props) {
    var component = new Component();
    component.props = props || null;

    return component;
}
