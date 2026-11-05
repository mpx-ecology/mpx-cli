module.exports = function (api, options) {
  const needRn = options.needRn
  const hasBabelConfig = !!(api.generator.files['babel.config.json'] || api.generator.files['babel.config.js'])
  if (!hasBabelConfig) {
    api.render('./template', { needRn })
  }
  api.extendPackage({
    devDependencies: {
      '@babel/core': '^7.10.4',
      '@babel/plugin-transform-runtime': '^7.10.4',
      '@babel/preset-env': '^7.10.4',
      '@babel/runtime-corejs3': '^7.10.4'
    }
  })
  if (needRn) {
    api.extendPackage({
      devDependencies: {
        '@babel/preset-react': '^7.24.7'
      }
    })
  }
  if (needRn && hasBabelConfig) {
    api.exitLog(
      '已保留现有 Babel 配置（babel.config.js / babel.config.json）。启用 RN 时，请确认 presets 包含 ["@babel/preset-react", { "runtime": "automatic" }]，并将 "react-native-reanimated/plugin" 放在 plugins 的最后一项；缺失时请手动添加。',
      'warn'
    )
  }
}
