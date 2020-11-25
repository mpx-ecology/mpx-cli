const webpack = require('webpack')
const merge = require('webpack-merge')
const getDllEntries = require('../utils/getDllEntries')
const normalizeArr = require('../utils/normalizeArr')
const resolveDllConf = require('../utils/resolveDllConf')
const path = require('path')

const dllName = '[name].[chunkHash].dll.js'
const manifestName = '[chunkHash].manifest.json'

const webpackCfgs = []

module.exports = function(api, options) {
  api.registerCommand('build:dll', function() {
    const dllConf = resolveDllConf(api, options)
    if (!dllConf) {
      return
    }
    normalizeArr(dllConf.groups).forEach((item) => {
      const entries = getDllEntries(item.cacheGroups, item.modes)
      if (Object.keys(entries).length) {
        webpackCfgs.push(merge({
          entry: entries,
          output: {
            path: dllConf.path,
            filename: path.join('lib', dllName),
            libraryTarget: 'commonjs2'
          },
          mode: 'production',
          plugins: [
            new webpack.DllPlugin({
              path: path.join(dllConf.path, manifestName),
              name: dllName,
              format: item.format,
              entryOnly: item.entryOnly,
              type: 'commonjs2',
              context: dllConf.context
            })
          ]
        }, item.webpackCfg))
      }
    })

    webpack(webpackCfgs[0], function(err) {
      if (err) console.log(err)
    })
  })
}
