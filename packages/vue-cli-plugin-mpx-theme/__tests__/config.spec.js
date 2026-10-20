const Config = require('webpack-chain')
const apply = require('..')

test('adds theme imports without replacing existing Stylus options', () => {
  const config = new Config()
  class Plugin {}
  config.plugin('mpx-webpack-plugin').use(Plugin, [{}])
  config.plugin('webpackbar').use(Plugin, [{}])
  const loader = config.module.rule('stylus').oneOf('normal').use('stylus-loader')
  loader.options({ sourceMap: true, stylusOptions: { compress: false } })
  const api = { service: { mode: 'production' }, chainWebpack: fn => fn(config) }
  const options = { pluginOptions: { themeFilePath: ['theme.styl'] } }
  apply(api, options)
  expect(loader.get('options')).toEqual({
    sourceMap: true,
    stylusOptions: { compress: false, import: ['theme.styl'] }
  })
})
