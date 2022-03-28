const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')

module.exports = function (api, options, webpackConfig) {
  webpackConfig.module
    .rule('json')
    .test(/\.json$/)
    .resourceQuery(/asScript/)
    .type('javascript/auto')

  webpackConfig.module
    .rule('wxs-pre-loader')
    .test(/\.(wxs|qs|sjs|filter\.js)$/)
    .pre()
    .use('mpx-wxs-pre-loader')
    .loader(MpxWebpackPlugin.wxsPreLoader().loader)

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
    .add('.mpx')
    .add('.wxml')
    .add('.ts')
    .add('.js')

  webpackConfig.resolve.modules.add('node_modules')

  webpackConfig.cache({
    type: 'filesystem',
    buildDependencies: {
      config: [api.resolve('vue.config.js')]
    }
  })
}

function genTranspileDepRegex (transpileDependencies) {
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
    return ''
  })
  return deps.length ? new RegExp(deps.join('|')) : null
}
