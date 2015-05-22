import commander from 'commander';
import pkg from '../../package.json';

export default function getCliOptions(process) {
    return commander
        .version(pkg.version)
        .option('-p, --port [port]', 'Rendered port', parseInt, 8080)
        .option('-h, --host [host]', 'Render host', 'localhost')
        .option('-c, --client [browser]', 'Client', 'default')
        .option('-e, --node-env [environment]', 'Environment', process.env.NODE_ENV || 'development')
        .option('--home [home-dir]', 'Current user home dir', process.env.HOME || '/')
        .parse(process.argv);
}
