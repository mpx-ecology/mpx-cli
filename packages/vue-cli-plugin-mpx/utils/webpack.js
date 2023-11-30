const { getReporter, getLogUpdate } = require('./reporter')
const { extractResultFromStats, extractErrorsFromStats } = require('./output')

function handleWebpackDone (err, stats, watch) {
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
      () => {
        // 有错误，暂停监听log，让错误正常输出
        getLogUpdate().stopListen()
        if (hasErrors) {
          !watch && reject(new Error('Build failed with errors.'))
        } else {
          resolve(stats)
        }
      }
    )
  })
}

module.exports.handleWebpackDone = handleWebpackDone
