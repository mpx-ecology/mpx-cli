const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const {
  modifyMpxPluginConfig,
  getMpxPluginOptions,
  MODE_CONFIG_FILES_MAP,
  SUPPORT_MODE,
  updateWebpackName
} = require('@mpxjs/cli-shared-utils')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const resolveClientEnv = require('@vue/cli-service/lib/util/resolveClientEnv')
const { getReporter } = require('../utils/reporter')

/**
 * 强制改chain-webpack的vue style loader use的名字
 * @param { import('webpack-chain') } config
 * @param { string } name
 */
function changeStyleVueRuleToMpx (config, name) {
  const store = config.module.rule(name).oneOfs.store
  const value = store.get('vue')
  value.name = 'mpx'
  value.names = [name, 'mpx']
  store.delete('vue')
  store.set('mpx', value)
}

/**
 * 编译依赖
 * @param { (string|RegExp) [] } transpileDependencies
 * @returns
 */
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

/**
 * 获取 mpx webpack plugin 配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @returns { import('webpack').Configuration } webpackConfig
 */
function resolveMpxWebpackPluginConf (api, options = {}) {
  const mpxOptions = getMpxPluginOptions(options)
  const mpxPluginConf = mpxOptions.plugin || {}
  const defaultConf = {
    // resolve的模式
    resolveMode: 'webpack', // 可选值 webpack / native，默认是webpack，原生迁移建议使用native
    // 可选值 full / changed，不传默认为change，当设置为changed时在watch模式下将只会对内容发生变化的文件进行写入，以提升小程序开发者工具编译性能
    writeMode: 'changed',
    // 批量指定文件mode，用法如下，指定平台，提供include/exclude指定文件，即include的文件会默认被认为是该平台的，include/exclude的规则和webpack的rules的相同
    modeRules: {},
    // 定义一些全局环境变量，可在JS/模板/样式/JSON中使用
    defs: {},
    // 是否转换px到rpx
    transRpxRules: [
      {
        mode: 'only',
        comment: 'use rpx',
        include: api.resolve('src')
      }
    ],
    // 是否生成用于测试的源文件/dist的映射表
    generateBuildMap: api.hasPlugin('mpx-unit-test')
  }

  if (typeof mpxPluginConf === 'function') {
    mpxPluginConf(defaultConf)
    return defaultConf
  } else {
    return Object.assign({}, defaultConf, mpxPluginConf)
  }
}

/**
 * 获取 mpx webpack loader 配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @returns { import('webpack').Configuration } webpackConfig
 */
function resolveMpxLoaderConfig (api, options = {}) {
  const mpxOptions = getMpxPluginOptions(options)
  const mpxLoaderOptions = mpxOptions.loader || {}
  const mpxLoaderConfig = Object.assign({
    ...mpxLoaderOptions,
    __foo__: 'bar' // options 如果仅传入一个 {}，在 webpack-chain 处理过程中忽略掉这个值，这里传入一个占位字段
  })
  return mpxLoaderConfig
}

/**
 * 获取mpx webpack loader 配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @param { import('webpack-chain') } config
 * @param { import('@mpxjs/cli-shared-utils').Target } target
 * @returns { import('webpack').Configuration } webpackConfig
 */
function transformEntry (api, options, webpackConfig, target) {
  // 通过 cli 生成的默认的入口文件
  let basePath = 'src/app.mpx'

  if (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode')) {
    try {
      const projectConfigJson = require(api.resolve(
        'static/wx/project.config.json'
      ))
      basePath = `src/${projectConfigJson.miniprogramRoot}/app.mpx`
    } catch (e) {}
  }
  const defaultMpxEntry = api.resolve(basePath)
  // 优先取 vue.config.js 当中配置的 entry 入口文件
  const entry =
    (options.pluginOptions &&
      options.pluginOptions.mpx &&
      options.pluginOptions.mpx.entry) ||
    defaultMpxEntry

  if (target.mode === 'web') {
    webpackConfig.entry('app').clear()
  }
  // web 需要重置 @vue/cli-service 内置的 app 入口为 mpx 的文件
  webpackConfig.entry('app').add(entry)
}

/**
 * cli注入的基础小程序配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @param { import('webpack-chain') } config
 * @param { import('@mpxjs/cli-shared-utils').Target } target
 */
function addMpWebpackConfig (api, options, config, target) {
  const mpxLoader = MpxWebpackPlugin.loader(
    resolveMpxLoaderConfig(api, options)
  )
  const wxmlLoader = MpxWebpackPlugin.wxmlLoader()
  const wxssLoader = MpxWebpackPlugin.wxssLoader()
  const mpxPluginOptions = getMpxPluginOptions(options)
  const mpxUrlLoader = MpxWebpackPlugin.urlLoader(
    mpxPluginOptions.urlLoader || {
      name: 'img/[name][hash].[ext]'
    }
  )

  let subDir = ''

  config
    .mode(process.env.NODE_ENV === 'production' ? 'production' : 'none')
    .context(api.service.context)
  config.performance.hints(false)
  config.output.clear() // 清除 cli-service 内部的 output 配置，避免 @mpxjs/webpack-plugin 出现 warning

  // alias config
  config.resolve.alias.set('@', api.resolve('src'))

  // defind config
  config.plugin('mpx-provide-plugin').use(webpack.ProvidePlugin, [
    {
      process: 'process/browser'
    }
  ])
  // 和vue-cli保持同名，方便一次性修改mp和web版本的define参数
  config.plugin('define').use(webpack.DefinePlugin, [resolveClientEnv(options)])

  // assets rules
  config.module.rules.delete('svg')
  config.module.rules.delete('images')
  config.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|svg)$/)
    .use('mpx-url-loader')
    .loader(require.resolve(mpxUrlLoader.loader))
    .options(mpxUrlLoader.options)

  // mpx rules

  config.module
    .rule('mpx')
    .test(/\.mpx$/)
    .use('mpx-loader')
    .loader(require.resolve(mpxLoader.loader))
    .options(mpxLoader.options)

  // css rules
  config.module
    .rule('wxml')
    .test(/\.(wxml|axml|swan|qml|ttml|qxml|jxml|ddml)$/)
    .use('mpx-wxml-loader')
    .loader(require.resolve(wxmlLoader.loader))
    .options(wxmlLoader.options)

  function createCSSRule (rule, test, loader, loaderOptions) {
    let chain = config.module
      .rule(rule)
      .test(test)
      .oneOf('mpx')
      .use('mpx-wxss-loader')
      .loader(require.resolve(wxssLoader.loader))
      .options(wxssLoader.options)
      .end()

    if (loader) {
      chain = chain.use(loader).loader(loader)
      if (loaderOptions) {
        chain.options(loaderOptions)
      }
    }
    return chain
  }

  createCSSRule('wxss', /\.(wxss|acss|css|qss|ttss|jxss|ddss)$/)
  createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', {
    stylusOptions: {
      compress: false
    }
  })
  createCSSRule('less', /\.less$/, 'less-loader')
  createCSSRule('sass', /\.sass$/, 'sass-loader')
  createCSSRule('scss', /\.scss$/, 'sass-loader')

  // forked from vue-cli base config
  // Other common pre-processors ---------------------------------------------
  const maybeResolve = (name) => {
    try {
      return require.resolve(name)
    } catch (error) {
      return name
    }
  }

  config.module
    .rule('pug')
    .test(/\.pug$/)
    .use('wxml-loader')
    .loader(require.resolve(wxmlLoader.loader))
    .options(wxmlLoader.options)
    .end()
    .use('pug-plain-loader')
    .loader(maybeResolve('pug-plain-loader'))
    .end()

  if (
    target.mode === 'wx' &&
    (api.hasPlugin('mpx-cloud-func') || api.hasPlugin('mpx-plugin-mode'))
  ) {
    try {
      const projectConfigJson = require(api.resolve(
        'static/wx/project.config.json'
      ))
      subDir =
        projectConfigJson.cloudfunctionRoot || projectConfigJson.pluginRoot
    } catch (e) {}
  }

  config.output.path(api.resolve(options.outputDir))

  config.plugin('mpx-mp-copy-webpack-plugin').use(CopyWebpackPlugin, [
    {
      patterns: [
        {
          context: api.resolve(`static/${target.mode}`),
          from: '**/*',
          to: subDir ? '..' : '',
          globOptions: {
            ignore: MODE_CONFIG_FILES_MAP[target.mode] || []
          },
          noErrorOnMissing: true
        },
        {
          context: api.resolve('static'),
          from: '**/*',
          to: subDir ? '..' : '',
          globOptions: {
            ignore: SUPPORT_MODE.map((v) => `**/${v}/**`)
          },
          noErrorOnMissing: true
        }
      ]
    }
  ])

  // 和vue-cli保持相同的命名
  config.optimization.minimizer('terser').use(TerserPlugin, [
    {
      // terserOptions参考 https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
      terserOptions: {
        // terser的默认行为会把某些对象方法转为箭头函数，导致ios9等不支持箭头函数的环境白屏，详情见 https://github.com/terser/terser#compress-options
        compress: {
          arrows: false
        }
      }
    }
  ])

  return config
}

/**
 * cli注入的基础Web配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @param { import('webpack-chain') } config
 * @param { import('@mpxjs/cli-shared-utils').Target } target
 */
function addWebWebpackConfig (api, options, config, target) {
  try {
    changeStyleVueRuleToMpx(config, 'css')
    changeStyleVueRuleToMpx(config, 'stylus')
    changeStyleVueRuleToMpx(config, 'sass')
    changeStyleVueRuleToMpx(config, 'less')
    changeStyleVueRuleToMpx(config, 'scss')
    changeStyleVueRuleToMpx(config, 'postcss')
  } catch (error) {}
  const mpxLoader = MpxWebpackPlugin.loader(
    resolveMpxLoaderConfig(api, options)
  )
  config.plugins.delete('friendly-errors')
  config.module
    .rule('mpx')
    .test(/\.mpx$/)
    .use('vue-loader')
    .loader(require.resolve('@vue/vue-loader-v15'))
    .end()
    .use('mpx-loader')
    .loader(require.resolve(mpxLoader.loader))
    .options(mpxLoader.options)

  // 直接更新 vue-cli-service 内部的 vue-loader options 配置
  config.module
    .rule('vue')
    .use('vue-loader')
    .tap((options) =>
      Object.assign(options, {
        transformAssetUrls: {
          'mpx-image': 'src',
          'mpx-audio': 'src',
          'mpx-video': 'src'
        }
      })
    )

  // 对于 svg 交给 mpx-url-loader 处理，去掉 vue-cli 配置的 svg 规则
  config.module.rules.delete('svg')
}

/**
 * cli注入的基础配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @param { import('webpack-chain') } config
 * @param { import('@mpxjs/cli-shared-utils').Target } target
 */
module.exports.addBaseConfig = function (api, options, config, target) {
  const isWeb = target.mode === 'web'
  config.module
    .rule('json')
    .test(/\.json$/)
    .resourceQuery(/asScript/)
    .type('javascript/auto')

  config.module
    .rule('wxs-pre-loader')
    .test(/\.(wxs|qs|sjs|filter\.js)$/)
    .pre()
    .use('mpx-wxs-pre-loader')
    .loader(require.resolve(MpxWebpackPlugin.wxsPreLoader().loader))

  const transpileDepRegex = genTranspileDepRegex(
    options.transpileDependencies || []
  )

  config.module
    .rule('js')
    .test(/\.m?jsx?$/)
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

  config.resolve.extensions
    .add('.mpx')
    .add('.ts')
    .add('.js')
    .add('.wxml')
    .add('.vue')

  config.resolve.modules.add('node_modules')

  const dependenciesConfig = [api.resolve('vue.config.js')]

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

  config.cache({
    type: 'filesystem',
    buildDependencies: {
      config: dependenciesConfig
    },
    cacheDirectory: api.resolve('.cache/')
  })

  const mpxOptions = getMpxPluginOptions(options)

  const pluginConfig = {
    mode: target.mode,
    srcMode: mpxOptions.srcMode,
    forceDisableBuiltInLoader: isWeb,
    ...resolveMpxWebpackPluginConf(api, options)
  }

  config.plugin('mpx-webpack-plugin').use(MpxWebpackPlugin, [pluginConfig])

  // fancy reporter
  config.plugin('webpackbar').use(WebpackBar, [
    {
      color: 'orange',
      basic: false,
      reporter: getReporter()
    }
  ])

  config.devtool(process.env.NODE_ENV === 'production' ? false : 'source-map')

  if (isWeb) {
    // web版本在vue-cli内置的配置基础上进行调整
    addWebWebpackConfig(api, options, config)
  } else {
    addMpWebpackConfig(api, options, config, target)
  }

  transformEntry(api, options, config, target)

  updateWebpackName(api, config)
}

/**
 * cli注入的基础配置以config方式
 * @param { import('@vue/cli-service').PluginAPI } api
 */
module.exports.resolveBaseRawWebpackConfig = function (api) {
  return () => ({
    snapshot: {
      managedPaths: [api.resolve('node_modules/')]
    },
    optimization: {
      emitOnErrors: true
    },
    infrastructureLogging: {
      level: 'none'
    }
  })
}

/**
 * 生产模式下动态注入的配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @param { import('webpack-chain') } config
 * @param { import('@mpxjs/cli-shared-utils').Target } target
 * @param {*} args
 */
module.exports.addBuildWebpackConfig = function (
  api,
  options,
  config,
  target,
  args
) {
  if (args.report) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    config.plugin('bundle-analyzer-plugin').use(BundleAnalyzerPlugin, [{}])
  }
  if (args.env) {
    modifyMpxPluginConfig(api, config, {
      env: args.env
    })
  }
  if (args.watch) {
    // 仅在watch模式下生产sourcemap
    // 百度小程序不开启sourcemap，开启会有模板渲染问题
    target.mode !== 'swan' && config.devtool('source-map')
    config.watch(true)
  }
}

/**
 * 开发模式下动态注入的配置
 * @param { import('@vue/cli-service').PluginAPI } api
 * @param { import('@vue/cli-service').ProjectOptions } options
 * @param { import('webpack-chain') } config
 * @param { import('@mpxjs/cli-shared-utils').Target } target
 * @param {*} args
 */
module.exports.addServeWebpackConfig = function (
  api,
  options,
  config,
  target,
  args
) {
  if (args.env) {
    modifyMpxPluginConfig(api, config, {
      env: args.env
    })
  }
  // load user devServer options with higher priority than devServer
  // in webpack config
  config.stats('none')
  config.devServer.merge(options.devServer || {})
  // fixme: temporary fix to suppress dev server logging
  // should be more robust to show necessary info but not duplicate errors
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test'
  ) {
    if (!config.get('devtool')) {
      config.devtool('eval-cheap-module-source-map')
    }
    // https://github.com/webpack/webpack/issues/6642
    // https://github.com/vuejs/vue-cli/issues/3539
    config.output.globalObject("(typeof self !== 'undefined' ? self : this)")
  }
}
