const getDllManifests = require('./getDllManifests')
const resolveDllConf = require('./resolveDllConf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = function addDllConf (
  api,
  options,
  webpackConfig,
  mode = 'web'
) {
  const dllConf = resolveDllConf(api, options)
  if (!dllConf) {
    return
  }
  const dllManifests = getDllManifests(api, mode)

  dllManifests
    .filter((manifest) => {
      return manifest.mode === mode || !manifest.mode
    })
    .forEach((manifest) => {
      webpackConfig
        .plugin('dll-reference-plugin')
        .use(webpack.DllReferencePlugin, [
          {
            context: dllConf.context,
            manifest: manifest.content
          }
        ])

      // 注意：小程序部分的 Dll 直接 copy 至 dist 目录，web 侧的 Dll 不做处理，这个需要开发者单独去部署这个 Dll 文件
      if (mode === 'mp') {
        webpackConfig
          .plugin('copy-webpack-plugin-for-dll')
          .use(CopyWebpackPlugin, [{
            patterns: [
              {
                context: path.join(dllConf.path, `${mode}/lib`),
                from: manifest.content.name,
                to: manifest.content.name
              }
            ]
          }])
      }
    })
}
