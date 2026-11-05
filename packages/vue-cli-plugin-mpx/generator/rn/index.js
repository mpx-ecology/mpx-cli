const extendMpxConfig = require('../utils/extendMpxConfig')
const resolveRnProjectName = require('../utils/resolveRnProjectName')

module.exports = function (api, options) {
  if (!options.needRn) return

  const rnProjectName = resolveRnProjectName(api, options)
  // 文档生成器与配置、脚本共用最终宿主名称。
  options.rnProjectName = rnProjectName

  extendMpxConfig(api, { pluginOptions: { mpx: { plugin: { rnConfig: { projectName: rnProjectName } } } } })
  api.extendPackage({
    dependencies: {
      'react-native-reanimated': '3.16.7',
      promise: '^8.3.0'
    },
    scripts: {
      'serve:ios': `cd ${rnProjectName} && npm run ios && cd .. && mpx-cli-service serve --targets=ios`,
      'build:ios': `mpx-cli-service build --targets=ios && cd ${rnProjectName} && npm run bundle:ios`,
      'serve:android': `cd ${rnProjectName} && npm run android && cd .. && mpx-cli-service serve --targets=android`,
      'build:android': `mpx-cli-service build --targets=android && cd ${rnProjectName} && npm run bundle:android`
    }
  })
}
