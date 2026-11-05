const { readConfigString } = require('./mergeConfigSource')

module.exports = function resolveRnProjectName (api, options) {
  const existingProjectName = readConfigString(api.generator.files['mpx.config.js'], [
    'pluginOptions', 'mpx', 'plugin', 'rnConfig', 'projectName'
  ])
  return existingProjectName === undefined
    ? options.rnProjectName || 'ReactNativeProject'
    : existingProjectName
}
