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
        .option('--wait-on-disconnect', 'It should wait for clients if all clients are disconnected', false)
        .option('--client-show-stats', 'Should be perf stats shown on client or not', false)
        .option('--client-mutation-observer', 'Should client use Mutation Observer or not', false)
        .option('--client-raf', 'Should rerender on every frame', false)
        .option('--client-scale [scale]', 'Debug scale', arrayOfNumbers, [1, 1])
        .parse(process.argv);
}
