const path = require('path');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const ExtractPlugin = require('extract-text-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';

const config = {
    target: 'web',
    entry: path.join(__dirname, './src/index.js'),
    output: {
        filename: 'bundle.[hash:8].js',
        path: path.join(__dirname, './dist')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },

            {
                test:/\.css/,
                use: [
                    'style-loader',
                    'css-loader'

                ]
            },
            {
                test: /\.jsx$/,
                loader: 'babel-loader'
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg)$/,
                use: [
                    {
                        //url-loader用于将我们的图片直接生成base-64代码，
                        //写到js文件中，而不用向服务器请求
                        loader: 'url-loader',
                        options: {
                            limit: 10240, //限制了文件大小
                            name: '[name].[ext]'
                            //name是图片的原名，这样省城的图片名字就是不一样的
                        }
                    }
                ]
            }

        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        new HTMLPlugin()
    ]
};

module.exports = config;

if(isDev) {
    config.module.rules.push({
        test: /\.styl$/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true
                }
            },
            'stylus-loader'
        ]
    });
    config.devServer = {
        port: 8000,
        host: '0.0.0.0',
        overlay: {
            errors: true
        },
        hot: true
    };
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    );
    config.devtool = '#cheap-module-eval-source-map';
} else {
    config.output.filename = '[name].[chunkhash:8].js';

    config.module.rules.push(
        {
            test: /\.styl$/,
            use: ExtractPlugin.extract({
                fallback: 'style-loader',
                use: [
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    'stylus-loader'
                ]
            })
        },
    );

    config.plugins.push(
        new ExtractPlugin('styles.css')
    );

}