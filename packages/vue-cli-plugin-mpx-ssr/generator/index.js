module.exports = function (api, options) {
  api.render('./template', options)
  api.extendPackage({
    scripts: {
      'serve:ssr': 'mpx-cli-service serve:ssr',
      'build:ssr': 'mpx-cli-service build:ssr'
    },
    dependencies: {
      'axios': '^1.6.0',
      'express': '^4.18.2',
      'serve-favicon': '^2.5.0',
      'vue-server-renderer': '^2.7.14'
    }
  })
}
