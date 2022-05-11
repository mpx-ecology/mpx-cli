module.exports = function (api, options = {}) {
  const needTs = !!options.needTs
  api.extendPackage({
    scripts: {
      test: 'jest'
    }
  })

  api.extendPackage({
    devDependencies: {
      '@mpxjs/mpx-jest': '^0.0.9',
      '@mpxjs/miniprogram-simulate': '^1.4.8',
      'babel-jest': '^25.3.0',
      jest: '^24.9.0'
    }
  })

  if (needTs) {
    api.extendPackage({
      devDependencies: {
        'ts-jest': '^27.1.2'
      }
    })
  }

  api.render('./template', {
    needTs
  })
}
