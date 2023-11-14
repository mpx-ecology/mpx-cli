module.exports = function (api, options) {
  api.render('./template', options)
  api.extendPackage({
    scripts: {
      'serve:ssr': 'mpx-cli-service serve:ssr --targets=web',
      'build:ssr': 'mpx-cli-service build:ssr --targets=web'
    },
    dependencies: {
      'vue-server-renderer': '^2.7.14'
    }
  })
}
