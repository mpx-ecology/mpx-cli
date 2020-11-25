const getDllManifests = require('./getDllManifests')
const resolveDllConf = require('./resolveDllConf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = function addDllConf(
  api,
  options,
  webpackConfig,
  mode = 'web'
) {
  const dllConf = resolveDllConf(api, options)
  if (!dllConf) {
    return
  }
  const dllManifests = getDllManifests(api)

  dllManifests
    .filter((manifest) => {
      return manifest.mode === mode || !manifest.mode
    })
    .map((manifest) => {
      webpackConfig
        .plugin('dll-reference-plugin')
        .use(webpack.DllReferencePlugin, [
          {
            context: dllConf.context,
            manifest: manifest.content
          }
        ])
      webpackConfig
        .plugin('copy-webpack-plugin-for-dll')
        .use(CopyWebpackPlugin, [
          [
            {
              context: path.join(dllConf.path, 'lib'),
              from: manifest.content.name,
              to: manifest.content.name
            }
          ]
        ])
    })
}
