module.exports = function (api, options) {
  require('./base')(api, options)
  require('./static')(api, options)
  require('./babel')(api, options)
  require('./readme')(api, options)

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

  require('./web')(api, options)

  // 删除 @vue/cli-service 内置的 npm script
  api.extendPackage((pkg) => {
    delete pkg.scripts.serve
    delete pkg.scripts.build
    delete pkg.browserslist
    return pkg
  })

  // ts、cloud-func、plugin-mode 3个插件都有各自独立的模板 generator，所以不需要在这里单独生成
  if (!options.needTs && !options.cloudFunc && !options.isPlugin) {
    require('./src')(api)
  }

  // 拓展 vue.config.js 当中有关 mpx.config.js 的配置
  api.extendPackage({
    vue: {
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
    }
  })

  if (options.needSSR) {
    api.extendPackage({
      vue: {
        pluginOptions: {
          SSR: {
            devClientPort: 8000
          }
        }
      }
    })
  }

  if (options.vueVersion !== '3') {
    api.extendPackage({
      dependencies: {
        vue: '^2.7.0'
      }
    })
    delete api.generator.pkg.devDependencies['vue-template-compiler']
  }

  api.postProcessFiles((files) => {
    // 处理 vue.config.js 中 crossorigin 和 productionSourceMap
    let vueConfigJs = files['vue.config.js']
    if (vueConfigJs) {
      // eslint-disable-next-line no-template-curly-in-string
      vueConfigJs = vueConfigJs.replace('\'{outputDir}\'', '`dist/${process.env.MPX_CURRENT_TARGET_MODE}`')
      const lines = vueConfigJs.split(/\r?\n/g)
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
      files['vue.config.js'] = lines.join('\n')
    }
  })

  api.extendPackage({
    scripts: {
      serve: 'mpx-cli-service serve',
      build: 'mpx-cli-service build'
    },
    dependencies: {
      '@mpxjs/api-proxy': '^2.9.0',
      '@mpxjs/core': '^2.9.0',
      '@mpxjs/store': '^2.9.0',
      '@mpxjs/pinia': '^2.9.0',
      '@mpxjs/utils': '^2.9.0',
      '@mpxjs/fetch': '^2.9.0',
      // web的相关
      pinia: '^2.0.14',
      'vue-demi': '^0.14.6',
      'vue-i18n': '^8.27.2',
      'vue-i18n-bridge': '^9.2.2',
      'vue-router': '^3.1.3'
    },
    devDependencies: {
      '@mpxjs/webpack-plugin': '^2.9.0',
      '@mpxjs/size-report': '^2.9.0',
      '@mpxjs/babel-plugin-inject-page-events': '^2.9.0',
      autoprefixer: '^10.2.4',
      postcss: '^8.2.6',
      webpack: '^5.43.0'
    },
    browserslist: ['ios >= 8', 'chrome >= 47']
  })
}
