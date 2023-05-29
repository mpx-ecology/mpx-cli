const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const path = require('path')
const fs = require('fs')

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

  const dependenciesConfig = []
  const res = api.resolve('vue.config.js')
  if (fs.existsSync(res)) dependenciesConfig.push(res)

  const addDepConfig = (names = []) => {
    names.forEach((name) => {
      try {
        const pkgDir = path.resolve(require.resolve(name), '../') + '/'
        dependenciesConfig.push(pkgDir)
      } catch (error) {}
    })
  }

  addDepConfig([
    '@mpxjs/vue-cli-plugin-mpx',
    '@mpxjs/vue-cli-plugin-mpx-plugin-mode',
    '@mpxjs/vue-cli-plugin-mpx-typescript',
    '@mpxjs/vue-cli-plugin-mpx-eslint',
    '@mpxjs/vue-cli-plugin-mpx-cloud-func'
  ])

  webpackConfig.cache({
    type: 'filesystem',
    buildDependencies: {
      config: dependenciesConfig
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
