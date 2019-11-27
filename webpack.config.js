const fs = require('fs');
const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: [ './main.ts' ]
    },
    cache: false,
    devServer: {
        contentBase: path.join(__dirname, ''),
        compress: true,
        headers: {
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        lazy: true,
        port: 9000
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            },
            {
                test: /.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
            {
                test: /\.css$/,
                include: path.join(__dirname, ''),
                loader: 'style-loader!css-loader'
                // loader: 'typings-for-css-modules-loader?modules&namedExport'
            },
            {
                test: /\.scss$/,
                // Query parameters are passed to node-sass
                loader: 'style!css!compass?outputStyle=expanded&' +
                'includePaths[]=' +
                (path.resolve(__dirname, './node_modules'))
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, ''),
        filename: '[name].js'
    },
    plugins: [
        new BrowserSyncPlugin(
            {
                browser: [
                    (fs.existsSync('/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox')) ?
                        '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox' :
                        (fs.existsSync('C:\\Program Files\\Firefox Developer Edition\\firefox.exe')) ?
                            'C:\\Program Files\\Firefox Developer Edition\\firefox.exe' :
                            'firefox',
                ],
                files: [{
                    match: [ '**/*.js' ],
                    fn: function(event, file) {
                        if (event === "change") {
                            setTimeout(function () {
                                const bs = require('browser-sync').get('bs-webpack-plugin');
                                bs.reload();
                            }, 3333);
                        }
                    }
                }],
                injectChanges: true,
                notify: true,
                open: false,
                host: 'localhost',
                port: 3000,
                server: {
                    baseDir: [ path.resolve(__dirname, '') ]
                },
                startPath: 'index.html'
            },
            // plugin options
            {
                // prevent BrowserSync from reloading the page
                // and let Webpack Dev Server take care of this
                reload: false
            }

        ),
        new ExtractTextPlugin('styles/index.css'),
        new HtmlWebpackPlugin('WebVR Preview')
    ],
    resolve: {
        extensions: [ '.ts', '.js', '.scss' ]
    }
};
