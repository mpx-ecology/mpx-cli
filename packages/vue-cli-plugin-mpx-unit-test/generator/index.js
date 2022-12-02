module.exports = function (api, options = {}) {
  const needTs = !!options.needTs
  api.extendPackage({
    scripts: {
      test: 'jest'
    }
  })

  api.extendPackage({
    devDependencies: {
      '@mpxjs/mpx-jest': '^0.0.24',
      '@mpxjs/miniprogram-simulate': '^1.4.17',
      'babel-jest': '^27.4.5',
      jest: '^27.4.5'
    }
  })

  if (needTs) {
    api.extendPackage({
      devDependencies: {
        'ts-jest': '^27.1.2',
        '@types/jest': '^27.5.1'
      }
    })
  }

  api.render('./template', {
    needTs
  })
}
