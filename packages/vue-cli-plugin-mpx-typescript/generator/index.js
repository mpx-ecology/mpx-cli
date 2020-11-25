module.exports = function(api, options) {
  api.extendPackage({
    devDependencies: {
      'ts-loader': '^6.0.0',
      typescript: '^4.0.0',
      // TODO: typescript lint 和 plugin-mpx-eslint 的联动
      '@typescript-eslint/eslint-plugin': '^2.27.0',
      '@typescript-eslint/parser': '^2.27.0'
    }
  })

  api.render('./template')
}
