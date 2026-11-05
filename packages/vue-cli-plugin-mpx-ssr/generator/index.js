const path = require('path')
const extendDocs = require('@mpxjs/vue-cli-plugin-mpx/generator/utils/extendDocs')
const extendMpxConfig = require('@mpxjs/vue-cli-plugin-mpx/generator/utils/extendMpxConfig')

module.exports = function (api, options = {}) {
  if (!options.needWeb || !options.needSSR) {
    throw new Error('SSR 插件需要同时启用 needWeb 和 needSSR。请通过 mpx create 同时选择 Web 和 SSR，确保生成 Web 配置与 SSR 应用入口。')
  }
  api.render('./template', options)
  extendDocs(api, path.join(__dirname, 'docs'))
  extendMpxConfig(api, { pluginOptions: { SSR: { devClientPort: 8000 } } })
  api.extendPackage({
    scripts: {
      'serve:ssr': 'mpx-cli-service serve:ssr',
      'build:ssr': 'mpx-cli-service build:ssr'
    },
    devDependencies: {
      axios: '^1.6.0',
      express: '^4.18.2',
      'serve-favicon': '^2.5.0',
      'vue-server-renderer': '^2.7.14'
    }
  })
}

module.exports.after = ['@mpxjs/vue-cli-plugin-mpx']
