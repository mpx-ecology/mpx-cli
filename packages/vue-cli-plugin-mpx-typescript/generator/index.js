const resolveRnProjectName = require('@mpxjs/vue-cli-plugin-mpx/generator/utils/resolveRnProjectName')

module.exports = function (api, options) {
  api.extendPackage({
    devDependencies: {
      typescript: '^4.1.3'
    }
  })

  if (!options.cloudFunc && !options.isPlugin) {
    api.render('./template-src', options)
  }

  api.render('./template-tsconfig', {
    needTest: !!options.needUnitTest || !!options.needE2ETest,
    needRn: !!options.needRn,
    rnProjectName: options.needRn ? resolveRnProjectName(api, options) : undefined
  })

  api.render((files) => delete files['jsconfig.json'])
}
