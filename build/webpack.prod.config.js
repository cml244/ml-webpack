const baseConfig = require('./webpack.base.config');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const merge = require('webpack-merge')
module.exports = () => {
    return merge(baseConfig,{
        mode:'production',
        optimization: {
            minimizer: [new OptimizeCSSAssetsPlugin({})],
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    require('autoprefixer')({
                                        browsers: ['last 30 versions', "> 2%", "Firefox >= 10", "ie 6-11"]
                                    })
                                ]
                            }
                        }
                    ],
                },
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css',
                chunkFilename: './css/[id].[hash].css',
            }),
            new UglifyJsPlugin(),
            new CopyWebpackPlugin([
                {
                    from: __dirname +'/static',
                    to:__dirname + '/dist/static'
                }
            ]),
            new HtmlWebpackExternalsPlugin({
                externals: [
                    {
                        module: 'jquery',
                        entry: 'https://unpkg.com/jquery@3.2.1/dist/jquery.min.js',
                        global: 'jQuery',
                    },
                ],
            })
        ]
    });
}
