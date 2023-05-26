module.exports = {
  root: true,
  extends: ['@vue/standard'],
  globals: {
    name: 'off'
  },
  rules: {
    'no-unused-vars': ['warn']
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', '**/cli-test-utils/**/*.js'],
      env: {
        jest: true
      }
    }
  ]
}
