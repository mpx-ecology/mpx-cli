module.exports = function(api) {
  // TODO: build 命令的执行
  api.extendPackage({
    scripts: {
      test: 'npm run build && jest',
      puretest: 'jest'
    }
  })

  api.extendPackage({
    devDependencies: {
      jest: '^24.9.0',
      'miniprogram-simulate': '^1.1.6',
      'babel-jest': '^25.3.0'
    }
  })

  api.render('./template')
}
