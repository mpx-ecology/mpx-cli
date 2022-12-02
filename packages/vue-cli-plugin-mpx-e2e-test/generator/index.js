module.exports = function (api, options = {}) {
  const needTs = !!options.needTs
  api.extendPackage({
    scripts: {
      'test:e2e': 'npx e2e-runner j---config=./jest-e2e.config.js',
      'build:e2e': 'npm run build && npm run test:e2e'
    }
  })

  api.extendPackage({
    devDependencies: {
      jest: '^27.4.5',
      '@types/jest': '^27.5.1'
    }
  })

  if (needTs) {
    api.extendPackage({
      devDependencies: {
        'ts-jest': '^27.1.2'
      }
    })
  }
  api.render(needTs ? './template-typescript' : './template', options)
}
