为了方便以后前端项目的开发，决定从0开始搭建一个webpack环境的工程项目，也算是对[webpack插件指南](http://gzcopyright.cn/2020/01/11/webpack/webpack%E6%8F%92%E4%BB%B6%E6%8C%87%E5%8D%97/)和[webpack配置指南](http://gzcopyright.cn/2020/01/11/webpack/webpack%E9%85%8D%E7%BD%AE%E6%8C%87%E5%8D%97/)进行一个总结。该项目所使用的loaders和插件如下所示：
#loaders
>`webpack-dev-server`，`style-loader`，`css-loader`，`file-loader`，`raw-loader`，`babel-loader`，`ts-loader`，`postcss-loader`，`eslint-loader`
#插件
>`html-webpack-plugin `，`clean-webpack-plugin`，`mini-css-extract-plugin`，`autoprefixer `，`postcss `，`uglifyjs-webpack-plugin`，`copy-webpack-plugin`，`html-webpack-externals-plugin`，`webpack-merge`
# 1.环境搭建
## 1.1 初始化
创建一个空项目后，首先执行`npm init`进行初始化。创建完`package.json`文件后，再执行如下命令先安装`webpack`。
```
npm install --save-dev webpack  webpack-cli
```
## 1.2创建配置文件
在实际开发中，一般都会有两个环境，包括`开发环境`和`生产环境`，所以在这里同样创建两个配置文件和一个基础配置文件。分别为`webpack.base.config.js`，`webpack.dev.config`，`webpack.prod.config`。然后通过`webpack-merge`将配置文件进行合并。
**基础配置文件**
基础文件主要用于配置`入口(entry)`，`输出(output)`，一些开发环境和测试环境公用的`loader `和`插件`，在这里先进行单页面的配置，多页面的等以后用到的时候再进行完善。其基础配置信息主要如下所示：
```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: {
        app: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, './../dist'),
        filename: '[name].[hash].js',
    },
    resolve: {
        extensions: [".ts", ".js",'.json'],
        alias: {
            '@': resolve('src'),
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: "pre",
                include: [path.resolve(__dirname, 'src')], // 指定检查的目录
                options: { // 这里的配置项参数将会被传递到 eslint 的 CLIEngine
                    formatter: require('eslint-friendly-formatter') // 指定错误报告的格式规范
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('test')]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: './img/[name].[hash].[ext]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: './media/[name].[hash].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: './font/[name].[hash].[ext]'
                }
            },
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            minify:{
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
        }),
        new CleanWebpackPlugin()
    ],
}

```
**开发环境配置文件**
开发环境主要是设置`devtool`和创建服务器，如下所示：
```
const baseConfig = require('./webpack.base.config')
const path = require('path');
const merge = require('webpack-merge')
module.exports = () => {
    return merge(baseConfig,{
        devServer: {
            contentBase: './../dist',
            host:'localhost',
            port:8089
        },
        devtool:'source-map',
        module: {
            rules: [
                {
                    test:/\.css$/,
                    use:[
                        'style-loader',
                        'css-loader'
                    ]
                }
            ]
        },
    });
}

```
**生产环境配置文件**
生产环境主要是用于压缩代码，提取公共文件等信息，如下所示：
```
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

```

配置完成后，需要在`package.json`文件中添加两个命令，如下所示：
```

    "dev": "webpack-dev-server --config build/webpack.dev.config.js --open",
    "build": "webpack --config build/webpack.prod.config.js --mode production"
```
[源码下载](https://github.com/cml244/ml-webpack.git)
[个人博客](http://gzcopyright.cn/)
