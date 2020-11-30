const webpack = require('webpack')
const merge = require('webpack-merge')
const getDllEntries = require('../utils/getDllEntries')
const normalizeArr = require('../utils/normalizeArr')
const resolveDllConf = require('../utils/resolveDllConf')
const path = require('path')

const dllName = '[name]_[chunkHash:7]'
const manifestName = '[chunkHash:7].manifest.json'

const webpackCfgs = []

module.exports = function (api, options) {
  api.registerCommand(
    'build:dll',
    {
      '--mp': 'build dll for mp',
      '--web': 'build dll for web'
    },
    function (args) {
      const dllConf = resolveDllConf(api, options)
      if (!dllConf) {
        return
      }
      let mode = ''
      if (args.mp) {
        mode = 'mp'
      } else if (args.web) {
        mode = 'web'
      }
      const basePath = path.resolve(dllConf.path, mode)
      normalizeArr(dllConf.groups).forEach((item) => {
        const entries = getDllEntries(item.cacheGroups, item.modes)
        if (Object.keys(entries).length) {
          let baseConf = {
            entry: entries,
            output: {
              path: basePath,
              filename: path.join('lib', `${dllName}.js`)
            },
            mode: 'production',
            plugins: []
          }
          let dllPlugin = {
            path: path.join(basePath, manifestName),
            format: item.format || true,
            entryOnly: item.entryOnly || true,
            context: dllConf.context
          }
          if (args.mp) {
            baseConf.output.libraryTarget = 'commonjs2'
            dllPlugin.type = 'commonjs2'
            dllPlugin.name = `${dllName}.js`
          }
          if (args.web) {
            baseConf.output.library = dllName
            dllPlugin.name = dllName
          }

          baseConf.plugins.push(new webpack.DllPlugin(dllPlugin))

          webpackCfgs.push(
            merge(baseConf, item.webpackCfg)
          )
        }
      })

      webpack(webpackCfgs[0], function (err) {
        if (err) console.log(err)
      })
    }
  )
}
