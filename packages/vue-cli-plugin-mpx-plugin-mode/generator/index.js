module.exports = function (api, options) {
  options = Object.assign({
    appid: ''
  }, options)

  api.render(options.needTs ? './template-typescript' : './template', options)
}
