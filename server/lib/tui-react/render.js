import exitHook from 'exit-hook';
import restoreCursor from 'restore-cursor';

restoreCursor();

export default function render(component, writableStream) {
    function renderComponent() {
        writableStream.write(component.render());
    }

    function cleanComponent() {
        component.componentWillUnmount();
        component.off('change', renderComponent);
    }

    exitHook(cleanComponent);

    component.on('change', renderComponent);
    renderComponent();
    component.componentDidMount();
}
