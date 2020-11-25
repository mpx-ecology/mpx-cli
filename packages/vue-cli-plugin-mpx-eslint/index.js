module.exports = function(api, options, webpackConfig) {
  // TODO: 插件项目的 webpack eslint 配置
  api.chainWebpack(webpackConfig => {
    webpackConfig.module
      .rule('eslint')
        .pre()
        .include
          .add(api.resolve('src'))
          .end()
        .test(/\.(js|ts|mpx)$/)
        .use('eslint-loader')
          .loader(require.resolve('eslint-loader'))
          .options({
            formatter: require('eslint-friendly-formatter')
          })
  })
}
