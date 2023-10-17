const { getReporter } = require('./reporter')
const { extractResultFromStats, extractErrorsFromStats } = require('./output')

function handleWebpackDone (err, stats) {
  return new Promise((resolve, reject) => {
    if (err) return reject(err)
    const hasErrors = stats.hasErrors()
    const hasWarnings = stats.hasWarnings()
    const status = hasErrors
      ? 'with some errors'
      : hasWarnings
        ? 'with some warnings'
        : 'successfully'
    const result = []
    if (hasErrors) result.push(extractErrorsFromStats(stats))
    if (!hasErrors) result.push(extractResultFromStats(stats))
    getReporter()._renderStates(
      stats.stats.map((v) => {
        return {
          ...v,
          message: `Compiled ${status}`,
          color: hasErrors ? 'red' : 'green',
          progress: 100,
          hasErrors: hasErrors,
          result: result.join('\n')
        }
      }),
      () => (hasErrors ? reject(new Error('Build error')) : resolve(stats))
    )
  })
}

module.exports.handleWebpackDone = handleWebpackDone
