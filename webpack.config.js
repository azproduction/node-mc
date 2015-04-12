var path = require('path');

module.exports = {
    target: 'web',
    entry: {
        index: path.join(__dirname, 'client', 'index.js')
    },
    output: {
        path: path.join(__dirname, 'assets'),
        filename: '[name].js',
        pathinfo: true,
        publicPath: '/assets/'
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.js', '.jsx']
    },
    devtool: 'inline-source-map',
    module: {
        loaders: [{
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.styl/,
            loader: 'style-loader!css-loader!stylus-loader'
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader?optional=runtime'
        }]
    },
    resolveLoader: {
        root: path.join(__dirname, '/node_modules')
    }
};
