module.exports = function(api, options) {
  options = Object.assign({
    appid: 'touristappid'
  }, options)

  api.render(options.needTs ? './template-typescript' : './template', options)
}
