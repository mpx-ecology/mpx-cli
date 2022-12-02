module.exports = function (api, options) {
  api.chainWebpack(webpackConfig => {
    webpackConfig.module
      .rule('ts')
      .test(/\.ts$/)
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .end()
      .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .options({
        appendTsSuffixTo: [/\.(mpx|vue)$/]
      })
  })
}
