const webpack = require('webpack')
const path = require('path')

const env = process.env.NODE_ENV || 'debug';
const resolve = dir => {
    return path.join(__dirname, dir)
}
const devServer = {
    open: true,
    host: "0.0.0.0", 
};
if (env === 'debug') {
    devServer.proxy = {
        '/api': {
            target: 'http://10.72.2.108:30000',
            pathRewrite: {
                '^/api': ''
            }
        },
    };
}

module.exports = {
    productionSourceMap: false,
    devServer,
    chainWebpack: config => {
        config.resolve.symlinks(true);
        config.resolve.alias
            .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
            .set('@apis', resolve('src/apis'))
    },
    configureWebpack: {
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.esm.js' //解决全局注册组件
            }
        },
        performance: {//打包文件大小配置
            "maxEntrypointSize": 10000000,
            "maxAssetSize": 30000000
        }
    },
}