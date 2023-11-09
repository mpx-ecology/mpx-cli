module.exports = function (api, options) {
  api.render('./template', options)
  api.extendPackage({
    scripts: {
      'serve:ssr': 'mpx-cli-service serve:ssr --ssrMode=client --targets=web',
      'serve:ssrserver': 'mpx-cli-service serve:ssr --ssrMode=server --targets=web',
      'build:ssr': 'mpx-cli-service build:ssr --ssrMode=client --targets=web && mpx-cli-service build:ssr --ssrMode=server --targets=web',
      'build:service': 'cd server && node server.js'
    },
    dependencies: {
      'vue-server-renderer': '^2.7.14',
      '@mpxjs/api-proxy': '^2.9.0',
      '@mpxjs/core': '^2.9.0',
      '@mpxjs/pinia': '^2.9.0'
    },
    devDependencies: {
      '@mpxjs/webpack-plugin': '^2.9.0'
    }
  })
}
