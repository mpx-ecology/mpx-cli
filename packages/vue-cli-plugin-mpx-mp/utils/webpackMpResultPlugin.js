const chalk = require('chalk')

module.exports.WebpackMpResultPlugin = class WebpackMpResultPlugin {
  apply (compiler) {
    function WebpackMpResultPlugin (stats) {
      if (stats.hasErrors()) return
      const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats]
      statsArr.forEach((item) => {
        console.log(chalk.green(item.compilation.name + '打包结果：\n'))
        console.log(
          item.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
            entrypoints: false
          }) + '\n\n'
        )
      })
    }

    if (compiler.hooks) {
      const plugin = { name: 'WebpackMpResultPlugin', stage: Infinity }
      compiler.hooks.done.tap(plugin, WebpackMpResultPlugin)
    } else {
      compiler.plugin('done', WebpackMpResultPlugin)
    }
  }
}
