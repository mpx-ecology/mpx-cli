module.exports = function(api, options) {
  require('./base')(api, options)

  // 删除 @vue/cli-service 默认生成的文件内容
  api.render(function(files) {
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

  // 删除 @vue/cli-service 默认生成的文件后再重新生成 mpx 初始化文件
  if (!options.needTs) {
    require('./src')(api)
  }

  if (options.cross) {
    api.extendPackage({
      scripts: {
        'watch:cross': 'vue-cli-service serve:mp --watch --wx --ali',
        'build:cross:dev': 'vue-cli-service build:mp --wx --ali',
        'build:cross': 'vue-cli-service build:mp --wx --ali --production'
      }
    })
  }

  // 拓展 vue.config.js 当中有关 mpx.config.js 的配置
  api.extendPackage({
    vue: {
      pluginOptions: {
        mpx: {
          srcMode: options.srcMode,
          plugin: {},
          loader: {},
        }
      }
    }
  })

  api.extendPackage({
    scripts: {
      'watch:mp': 'vue-cli-service serve:mp --watch',
      'build:mp': 'vue-cli-service build:mp --production',
      'build:mp:dev': 'vue-cli-service build:mp'
    },
    dependencies: {
      '@mpxjs/api-proxy': '^2.5.10',
      '@mpxjs/core': '^2.6.22'
    },
    devDependencies: {
      '@mpxjs/webpack-plugin': '^2.6.22',
      'extract-text-webpack-plugin': '^3.0.2',
      'vue-router': '^3.1.3',
      'vue-template-compiler': '^2.6.10',
      'style-loader': '^1.0.1',
      '@babel/core': '^7.10.4',
      '@babel/plugin-transform-runtime': '^7.10.4',
      '@babel/preset-env': '^7.10.4',
      '@babel/runtime-corejs3': '^7.10.4',
      'babel-loader': '^8.1.0',
      'css-loader': '^0.28.11',
      'file-loader': '^1.1.11',
      path: '^0.12.7',
      'url-loader': '^1.0.1',
      'webpack-bundle-analyzer': '^3.3.2'
    }
  })

  // 删除 @vue/cli-service 内置的 npm script
  api.extendPackage((pkg) => {
    delete pkg.scripts.serve
    delete pkg.scripts.build
    delete pkg.browserslist
    return pkg
  })
}
