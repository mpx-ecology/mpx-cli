const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

module.exports = function (api, options, webpackConfig) {
  webpackConfig.module
    .rule('json')
    .test(/\.json$/)
    .resourceQuery(/__component|asScript/)
    .type('javascript/auto')

  webpackConfig.module
    .rule('wxs-pre-loader')
    .test(/\.(wxs|qs|sjs|filter\.js)$/)
    .pre()
    .use('mpx-wxs-pre-loader')
    .loader(MpxWebpackPlugin.wxsPreLoader().loader)

  webpackConfig.module.rules.delete('images')
  let imgLoaderConfig = {
    name: 'img/[name][hash].[ext]'
  }
  if (options && options.pluginOptions && options.pluginOptions.mpx && options.pluginOptions.mpx.urlLoader) {
    imgLoaderConfig = options.pluginOptions.mpx.urlLoader
  }
  const mpxUrlLoader = MpxWebpackPlugin.urlLoader(imgLoaderConfig)
  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|svg)$/)
    .use('mpx-url-loader')
    .loader(mpxUrlLoader.loader)
    .options(mpxUrlLoader.options)

  const transpileDepRegex = genTranspileDepRegex(options.transpileDependencies || [])
  webpackConfig.module
    .rule('js')
    .test(/\.js$/)
    .include
      .add(filepath => transpileDepRegex && transpileDepRegex.test(filepath))
      .add(filepath => /\.mpx\.js/.test(filepath)) // 处理 mpx 转 web 的情况，vue-loader 会将 script block fake 出一个 .mpx.js 路径，用以 loader 的匹配
      .add(api.resolve('src'))
      .add(api.resolve('node_modules/@mpxjs'))
      .add(api.resolve('test'))
        .end()
    .use('babel-loader')
      .loader('babel-loader')

  webpackConfig.resolve.extensions
    .add('.wxml')
    .add('.ts')
    .add('.js')

  webpackConfig.resolve.extensions.prepend('.mpx')

  webpackConfig.resolve.modules.add('node_modules')

  webpackConfig.cache({
    type: 'filesystem',
    // TODO: 调整
    buildDependencies: {
      build: [api.resolve('build/')],
      config: [api.resolve('config/')]
    },
    cacheDirectory: api.resolve('.cache/')
  })
}

function genTranspileDepRegex(transpileDependencies) {
  const path = require('path')
  const { isWindows } = require('@vue/cli-shared-utils')
  const deps = transpileDependencies.map((dep) => {
    if (typeof dep === 'string') {
      const depPath = path.join('node_modules', dep, '/')
      return isWindows
        ? depPath.replace(/\\/g, '\\\\') // double escape for windows style path
        : depPath
    } else if (dep instanceof RegExp) {
      return dep.source
    }
  })
  return deps.length ? new RegExp(deps.join('|')) : null
}
