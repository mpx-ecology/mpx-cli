const rm = require('rimraf')
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
    ? intersection(supportedModes, args.targets.split(','))
    : intersection(supportedModes, Object.keys(args))
  return inputTargets.length ? inputTargets : defaultTargets
}

/**
 * 清除文件
 * @param {string} distPath
 */
function clearDist (distPath) {
  try {
    rm.sync(distPath)
  } catch (e) {
    console.error(e)
    console.log(
      '\n\n删除dist文件夹遇到了一些问题，如果遇到问题请手工删除dist重来\n\n'
    )
  }
}

module.exports.getTargets = getTargets
module.exports.clearDist = clearDist
module.exports.intersection = intersection
module.exports.getMpxPluginOptions = getMpxPluginOptions
