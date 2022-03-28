const path = require('path')

function resolveSrc (file) {
  return path.resolve(__dirname, '../src', file || '')
}

function resolve (file) {
  return path.resolve(__dirname, '..', file || '')
}

module.exports = {
  path: resolve('dll'),
  context: resolveSrc(),
  groups: {
    cacheGroups: [
      {
        entries: [resolveSrc('lib/dll')],
        name: 'dll'
      }
    ],
    webpackCfg: {
      mode: 'none'
    }
  }
}
