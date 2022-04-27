module.exports = function (api, options) {
  require('./base')(api, options)
  require('./static')(api, options)
  require('./babel')(api, options)
  require('./readme')(api, options)

  // 删除 @vue/cli-service 默认生成的文件内容
  api.render(function (files) {
    Object.keys(files).forEach(key => {
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
          plugin: {},
          loader: {}
        }
      }
    }
  })

  api.extendPackage({
    scripts: {
      serve: 'mpx-cli-service serve:mp',
      build: 'mpx-cli-service build:mp'
    },
    dependencies: {
      '@mpxjs/api-proxy': '^2.7.0',
      '@mpxjs/core': '^2.7.0'
    },
    devDependencies: {
      '@mpxjs/webpack-plugin': '^2.7.0',
      'vue-router': '^3.1.3',
      'vue-template-compiler': '^2.6.10',
      'style-loader': '^1.0.1',
      'css-loader': '^0.28.11',
      'file-loader': '^1.1.11',
      path: '^0.12.7',
      'url-loader': '^1.0.1'
    },
    browserslist: 'ios >= 8, chrome >= 47'
  })
}
