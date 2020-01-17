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
