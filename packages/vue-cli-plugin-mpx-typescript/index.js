module.exports = function(api, options) {
  api.chainWebpack(webpackConfig => {
    webpackConfig.module
    .rule('ts')
    .test(/\.ts$/)
    .use('babel-loader')
    .loader('babel-loader')
    .end()
    .use('ts-loader')
    .loader('ts-loader')
  })
}
