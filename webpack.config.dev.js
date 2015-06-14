var objectAssign = require('object-assign');
var config = require('./webpack.config');

module.exports = objectAssign({}, config, {
    output: objectAssign({}, config.output, {
        publicPath: 'http://localhost:2992/assets/',
        pathinfo: true
    }),
    devtool: 'inline-source-map',
    plugins: []
});
