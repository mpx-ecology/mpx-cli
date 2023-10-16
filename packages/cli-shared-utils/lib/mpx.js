
/**
 * 获取@mpxjs/webpack-plugin选项
 * @param {*} options 选项
 */
function getMpxPluginOptions (options = {}) {
  return options.pluginOptions ? options.pluginOptions.mpx || {} : {}
}

module.exports.getMpxPluginOptions = getMpxPluginOptions
