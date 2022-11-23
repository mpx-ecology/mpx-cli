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
      jest: '^24.9.0',
      '@mpxjs/e2e': '^0.0.11',
      '@mpxjs/e2e-scripts': '^0.0.9',
      '@types/jest': '^27.5.1',
      'miniprogram-automator': '^0.10.0'
    }
  })

  if (needTs) {
    api.extendPackage({
      devDependencies: {
        'ts-jest': '^27.1.2'
      }
    })
  }

  api.render(needTs ? './template-typescript' : './template')
}
