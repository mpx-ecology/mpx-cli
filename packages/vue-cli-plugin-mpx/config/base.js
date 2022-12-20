const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const path = require('path')

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
    .loader(require.resolve(MpxWebpackPlugin.wxsPreLoader().loader))

  const transpileDepRegex = genTranspileDepRegex(
    options.transpileDependencies || []
  )
  webpackConfig.module
    .rule('js')
    .test(/\.js$/)
    .include.add(
      (filepath) => transpileDepRegex && transpileDepRegex.test(filepath)
    )
    .add((filepath) => /\.mpx\.js/.test(filepath)) // 处理 mpx 转 web 的情况，vue-loader 会将 script block fake 出一个 .mpx.js 路径，用以 loader 的匹配
    .add(api.resolve('src'))
    .add(/@mpxjs/)
    .add(api.resolve('test'))
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))

  webpackConfig.resolve.extensions
    .add('.mpx')
    .add('.js')
    .add('.wxml')
    .add('.ts')

  webpackConfig.resolve.modules.add('node_modules')

  const mpxPluginMainPath = require.resolve('@mpxjs/vue-cli-plugin-mpx')
  const mpxPluginConfigPath = path.resolve(mpxPluginMainPath, '../config')
  const mpxMpPluginMainPath = require.resolve('@mpxjs/vue-cli-plugin-mpx-mp')
  const mpxMpPluginConfigPath = path.resolve(mpxPluginMainPath, '../config')
  const mpxMpPluginUtilPath = path.resolve(mpxPluginMainPath, '../utils')
  const mpxWebPluginMainPath = require.resolve('@mpxjs/vue-cli-plugin-mpx-web')
  const mpxWebPluginConfigPath = path.resolve(mpxWebPluginMainPath, '../config')

  webpackConfig.cache({
    type: 'filesystem',
    buildDependencies: {
      config: [
        api.resolve('vue.config.js'),
        mpxPluginMainPath,
        path.resolve(mpxPluginConfigPath, 'base.js'),
        mpxMpPluginMainPath,
        path.resolve(mpxMpPluginConfigPath, 'base'),
        path.resolve(mpxMpPluginConfigPath, 'plugin'),
        path.resolve(mpxMpPluginConfigPath, 'target'),
        path.resolve(mpxMpPluginUtilPath, 'webpack.js'),
        mpxWebPluginMainPath,
        path.resolve(mpxWebPluginConfigPath, 'index.js'),
        require.resolve('@mpxjs/vue-cli-plugin-mpx-plugin-mode'),
        require.resolve('@mpxjs/vue-cli-plugin-mpx-typescript'),
        require.resolve('@mpxjs/vue-cli-plugin-mpx-eslint'),
        require.resolve('@mpxjs/vue-cli-plugin-mpx-cloud-func')
      ]
    },
    cacheDirectory: api.resolve('.cache/')
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
