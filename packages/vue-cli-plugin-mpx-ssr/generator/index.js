module.exports = function (api, options) {
  api.render('./template', options)
  api.extendPackage({
    scripts: {
      'serve:ssr': 'mpx-cli-service serve:ssr --ssrMode=client --targets=web & mpx-cli-service serve:ssr --ssrMode=server --targets=web',
      'build:ssr': 'mpx-cli-service build:ssr --ssrMode=client --targets=web && mpx-cli-service build:ssr --ssrMode=server --targets=web'
    },
    dependencies: {
      'vue-server-renderer': '^2.7.14'
    }
  })
}
