const extendMpxConfig = require('@mpxjs/vue-cli-plugin-mpx/generator/utils/extendMpxConfig')

module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      '@mpxjs/unocss-base': '^2.9.0',
      '@mpxjs/unocss-plugin': '^2.9.0'
    }
  })
  extendMpxConfig(api, { pluginOptions: { mpx: { unocss: {} } } })

  api.render('./template', options)
}
