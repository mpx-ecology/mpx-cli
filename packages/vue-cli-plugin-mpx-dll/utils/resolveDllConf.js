module.exports = function (api, options) {
  let dllConf = null
  try {
    dllConf = require(api.resolve('config/dll.conf.js'))
  } catch (e) {
    // console.warn('[@mpxjs/vue-cli-plugin-mpx-dll]:there is no dll config for mpx-cli')
  }
  return dllConf
}
