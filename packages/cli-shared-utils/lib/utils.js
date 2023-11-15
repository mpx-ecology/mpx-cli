
/**
 * makeMap
 * @param {*} arr
 * @returns
 */
function makeMap (arr) {
  const map = {}
  arr.forEach((v) => (map[v] = true))
  return map
}

function removeArgv (rawArgv, removeName) {
  return rawArgv.filter((argv) => argv.indexOf(removeName) === -1)
}

function runServiceCommand (rawArgv, options = {}) {
  const execa = require('execa')
  const mpxCliServiceBinPath = require.resolve(
    '@mpxjs/mpx-cli-service/bin/mpx-cli-service.js'
  )
  return execa.node(mpxCliServiceBinPath, [...rawArgv], options)
}

function normalizeCommandArgs (o1, o2) {
  for (const key in o2) {
    if (o1[key] == null) {
      o1[key] = o2[key]
    }
  }
}

module.exports.runServiceCommand = runServiceCommand
module.exports.normalizeCommandArgs = normalizeCommandArgs
module.exports.removeArgv = removeArgv
module.exports.makeMap = makeMap
