const { supportedModes } = require('@mpxjs/vue-cli-plugin-mpx')

/**
 * 取数组交集
 * @param {array} a
 * @param {array} b
 */
function intersection (a, b) {
  return a.filter((v) => b.includes(v))
}

/**
 * 获取@mpxjs/webpack-plugin选项
 * @param {*} options 选项
 */
function getMpxPluginOptions (options) {
  return options.pluginOptions ? options.pluginOptions.mpx || {} : {}
}

/**
 * 获取最终的targets
 * @param {*} args
 * @param {*} options
 * @returns
 */
function getTargets (args, options) {
  const mpxOptions = getMpxPluginOptions(options)
  const defaultTargets = [mpxOptions.srcMode || supportedModes[0]]
  const inputTargets = args.targets
    ? args.targets.split(',')
    : Object.keys(args)
  const targets = intersection(supportedModes, inputTargets)
  return targets.length ? targets : defaultTargets
}

module.exports.getTargets = getTargets
module.exports.intersection = intersection
module.exports.getMpxPluginOptions = getMpxPluginOptions
