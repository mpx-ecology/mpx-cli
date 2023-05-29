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

module.exports.output = output
