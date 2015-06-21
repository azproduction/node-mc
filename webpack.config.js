var path = require('path');
var webpack = require('webpack');

module.exports = {
    target: 'web',
    entry: {
        index: path.join(__dirname, 'client', 'index.js')
    },
    output: {
        path: path.join(__dirname, 'assets'),
        filename: '[name].js',
        pathinfo: false,
        publicPath: '/assets/'
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.js', '.jsx']
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.woff$/,
            loader: 'url-loader?mimetype=application/x-font-woff'
        }, {
            test: /\.css$/,
            loader: 'style-loader!css-loader!autoprefixer-loader?browsers=last 2 versions'
        }, {
            test: /\.styl/,
            loader: 'style-loader!css-loader!autoprefixer-loader?browsers=last 2 versions!stylus-loader'
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader?optional=runtime'
        }, {
            test: /\.jsx$/,
            loader: 'babel-loader?optional=runtime'
        }]
    },
    resolveLoader: {
        root: path.join(__dirname, '/node_modules')
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.NoErrorsPlugin()
    ]
};
