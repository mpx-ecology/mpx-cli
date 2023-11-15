module.exports = {
  git: {
    commitMessage: 'chore: release v${version}'
  },
  github: {
    release: true
  },
  npm: {
    skipChecks: true
  },
  plugins: {
    'release-it-yarn-workspaces': {
      workspaces: ['packages/mpx-cli-service', 'packages/vue-cli-plugin-*', 'packages/cli-shared-utils'],
      additionalManifests: {
        versionUpdates: [
          'packages/mpx-cli-service/package.json',
          'packages/vue-cli-plugin-*/package.json',
          'lerna.json',
          'packages/cli-shared-utils/package.json'
        ]
      }
    }
  },
  hooks: {
    'before:init': ['npm run lint', 'npm run test'],
    'after:bump': ['npm run changelog']
  }
}
