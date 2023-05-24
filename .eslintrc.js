module.exports = {
  root: true,
  extends: ['@vue/standard'],
  globals: {
    name: 'off'
  },
  rules: {},
  overrides: [
    {
      files: ['**/__tests__/**/*.js', '**/cli-test-utils/**/*.js'],
      env: {
        jest: true
      }
    }
  ]
}
