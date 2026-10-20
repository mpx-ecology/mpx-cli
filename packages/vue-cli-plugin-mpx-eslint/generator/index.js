const path = require('path')
const extendDocs = require('@mpxjs/vue-cli-plugin-mpx/generator/utils/extendDocs')

module.exports = function (api, options = {}) {
  extendDocs(api, path.join(__dirname, 'docs'))
  const deps = {
    scripts: {
      lint: 'eslint --ext .js,.ts,.mpx src/'
    },
    devDependencies: {
      eslint: '^9.0.0',
      '@mpxjs/eslint-config': '^2.0.3'
    }
  }
  api.extendPackage(deps)
  api.render('./template', {
    needTs: !!options.needTs
  })
}

module.exports.after = ['@mpxjs/vue-cli-plugin-mpx']
