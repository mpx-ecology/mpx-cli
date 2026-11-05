const extendMpxConfig = require('./utils/extendMpxConfig')

module.exports = function (api, options, rootOptions, invoking) {
  const existingConfig = api.generator.files['mpx.config.js']
  const srcMode = options.srcMode || 'wx'
  const needWeb = srcMode === 'wx' && !!options.needWeb
  const needRn = srcMode === 'wx' && !!options.needRn
  options = { ...options, srcMode, needWeb, needRn, needSSR: needWeb && !!options.needSSR }

  if (!invoking) {
    require('./base')(api, options)
    require('./vscode')(api, options)

    // 删除 @vue/cli-service 默认生成的文件内容
    api.render(function (files) {
      Object.keys(files).forEach((key) => {
        if (key.includes('src')) {
          delete files[key]
        }
        if (key.includes('public')) {
          delete files[key]
        }
      })
      return files
    })

    // cloud-func、plugin-mode 有独立的入口模板；普通项目入口统一在这里按 TS、SSR 选项生成
    if (!options.cloudFunc && !options.isPlugin) {
      require('./src')(api, options)
    }

    // 删除 @vue/cli-service 内置的 npm script
    api.extendPackage((pkg) => {
      delete pkg.scripts.serve
      delete pkg.scripts.build
      delete pkg.browserslist
      if (pkg.dependencies) delete pkg.dependencies.vue
      if (pkg.devDependencies) delete pkg.devDependencies['vue-template-compiler']
      return pkg
    })
  }

  require('./static')(api, options, invoking)
  require('./babel')(api, options)
  require('./web')(api, options)
  require('./rn')(api, options)
  require('./readme')(api, options)
  require('./agents')(api, options)

  if (!existingConfig) {
    // 拓展 mpx.config.js 的配置
    extendMpxConfig(api, {
      // eslint-disable-next-line no-template-curly-in-string
      outputDir: '{outputDir}',
      pluginOptions: {
        mpx: {
          plugin: {
            srcMode: options.srcMode,
            hackResolveBuildDependencies: ({ files, resolveDependencies }) => {
              const path = require('path')
              const packageJSONPath = path.resolve('package.json')
              if (files.has(packageJSONPath)) files.delete(packageJSONPath)
              if (resolveDependencies.files.has(packageJSONPath)) {
                resolveDependencies.files.delete(packageJSONPath)
              }
            }
          },
          loader: {}
        }
      },
      configureWebpack (config) {}
    })
    api.postProcessFiles((files) => {
      let mpxConfigJs = files['mpx.config.js']
      // eslint-disable-next-line no-template-curly-in-string
      mpxConfigJs = mpxConfigJs.replace('\'{outputDir}\'', '`dist/${process.env.MPX_CURRENT_TARGET_MODE}`')
      const lines = mpxConfigJs.split(/\r?\n/g)
      const configureWebpackIndex = lines.findIndex((v) =>
        /configureWebpack/.test(v)
      )
      if (configureWebpackIndex > -1) {
        lines.splice(
          configureWebpackIndex,
          0,
          `  /**
   * 如果希望node_modules下的文件时对应的缓存可以失效，
   * 可以将configureWebpack.snap.managedPaths修改为 []
   */`
        )
      }
      files['mpx.config.js'] = lines.join('\n')
    })
  }

  api.extendPackage({
    scripts: {
      serve: 'mpx-cli-service serve',
      build: 'mpx-cli-service build',
      'serve:ali': 'mpx-cli-service serve --targets=ali',
      'build:ali': 'mpx-cli-service build --targets=ali'
    },
    dependencies: {
      '@mpxjs/api-proxy': '^2.10.0',
      '@mpxjs/core': '^2.10.0',
      '@mpxjs/store': '^2.10.0',
      '@mpxjs/pinia': '^2.10.0',
      '@mpxjs/utils': '^2.10.0',
      '@mpxjs/fetch': '^2.10.0'
    },
    devDependencies: {
      '@mpxjs/webpack-plugin': '^2.10.0',
      '@mpxjs/size-report': '^2.10.0',
      '@mpxjs/babel-plugin-inject-page-events': '^2.9.0',
      autoprefixer: '^10.2.4',
      postcss: '^8.2.6',
      webpack: '5.109.2',
      process: '^0.11.10'
    },
    browserslist: ['ios >= 8', 'chrome >= 47']
  })
}
