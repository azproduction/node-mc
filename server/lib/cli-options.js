import commander from 'commander';
import pkg from '../../package.json';

function arrayOfNumbers(string) {
    return String(string).split(',').map(Number);
}

export default function getCliOptions(process) {
    return commander
        .version(pkg.version)
        .option('-p, --port [port]', 'Rendered port', parseInt, 8181)
        .option('-h, --host [host]', 'Render host', 'localhost')
        .option('-c, --client [browser]', 'Client', 'default')
        .option('-e, --node-env [environment]', 'Environment', process.env.NODE_ENV || 'development')
        .option('--home [home-dir]', 'Current user home dir', process.env.HOME || '/')
        .option('--wait-on-disconnect', 'It should wait for clients if all clients are disconnected', false)
        .option('--client-show-stats', 'Should be perf stats shown on client or not', true)
        .option('--client-wait-for-dom-changes', 'Should client wait for changes or repaint or every frame', true)
        .option('--client-scale [scale]', 'Debug scale', arrayOfNumbers, [1, 1])
        .parse(process.argv);
}
