module.exports = function (api, options = {}) {
  const needTs = !!options.needTs
  api.extendPackage({
    scripts: {
      test: 'jest'
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
