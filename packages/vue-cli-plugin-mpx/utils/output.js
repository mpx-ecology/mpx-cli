const output = require('@soda/friendly-errors-webpack-plugin/src/output')
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin')

const friendlyErrorsWebpackPlugin = new FriendlyErrorsWebpackPlugin()

function uniqueBy (arr, fun) {
  const seen = {}
  return arr.filter((el) => {
    const e = fun(el)
    return !(e in seen) && (seen[e] = 1)
  })
}

function isMultiStats (stats) {
  return stats.stats
}

/**
 * 从stats里提取错误信息
 * @param {*} stats
 * @param {*} type
 * @returns
 */
function extractErrorsFromStats (stats, type = 'errors') {
  if (isMultiStats(stats)) {
    const errors = stats.stats.reduce(
      (errors, stats) => errors.concat(extractErrorsFromStats(stats, type)),
      []
    )
    // Dedupe to avoid showing the same error many times when multiple
    // compilers depend on the same module.
    return uniqueBy(errors, (error) => error.message)
  }

  const findErrorsRecursive = (compilation) => {
    const errors = compilation[type]
    if (errors.length === 0 && compilation.children) {
      for (const child of compilation.children) {
        errors.push(...findErrorsRecursive(child))
      }
    }
    return uniqueBy(errors, (error) => error.message)
  }

  return findErrorsRecursive(stats.compilation)
}

output.getErrors = (stats, severity) => {
  output.capture()
  friendlyErrorsWebpackPlugin.displayErrors(extractErrorsFromStats(stats), severity)
  const messages = output.capturedMessages
  output.endCapture()
  return messages.join('\n')
}

/**
 * 从stats里提取结果信息
 * @param {*} stats
 * @returns
 */
function extractResultFromStats (stats) {
  const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats]
  return statsArr.map((item) => {
    return item
      .toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false
      })
      .split('\n')
      .map((v) => `  ${v}`)
      .join('\n')
  })
}

module.exports.extractErrorsFromStats = extractErrorsFromStats
module.exports.extractResultFromStats = extractResultFromStats
module.exports.output = output
