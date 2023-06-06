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
      pluginOptions: {
        mpx: {
          srcMode: options.srcMode,
          plugin: {
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

  api.postProcessFiles((files) => {
    // 处理 vue.config.js 中 crossorigin 和 productionSourceMap
    const vueConfigJs = files['vue.config.js']
    if (vueConfigJs) {
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
      serve: 'mpx-cli-service serve:mp',
      build: 'mpx-cli-service build:mp'
    },
    dependencies: {
      '@mpxjs/api-proxy': '^2.8.0',
      '@mpxjs/core': '^2.8.0',
      '@mpxjs/store': '^2.8.0',
      '@mpxjs/pinia': '^2.8.0',
      '@mpxjs/utils': '^2.8.0',
      '@mpxjs/fetch': '^2.8.0',
      pinia: '^2.0.14'
    },
    devDependencies: {
      '@mpxjs/webpack-plugin': '^2.8.28-beta.8',
      '@mpxjs/size-report': '^2.8.0',
      '@mpxjs/babel-plugin-inject-page-events': '^2.8.0',
      autoprefixer: '^10.2.4',
      postcss: '^8.2.6',
      webpack: '^5.43.0'
    },
    browserslist: 'ios >= 8, chrome >= 47'
  })

  if (options.transWeb) {
    api.extendPackage({
      dependencies: {
        'vue-demi': '^0.13.11',
        'vue-i18n': '^8.27.2',
        'vue-i18n-bridge': '^9.2.2',
        'vue-router': '^3.1.3'
      }
    })
  }
}
