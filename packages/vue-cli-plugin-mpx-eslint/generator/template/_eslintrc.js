module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'standard',
  settings: {
    'html/html-extensions': ['.html', '.mpx'],  // consider .html and .mpx files as HTML
  },
  plugins: [
    'html'
  ],
  globals: {
    wx: true,
    getApp: true,
    App: true,
    __mpx_mode__: true
  },
  rules: {
    camelcase: ['error', { 'allow': ['__mpx_mode__'] }]
  },
  <%_ if(needTs) { _%>
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'standard',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: ['@typescript-eslint']
    }
  ]
  <%_ } _%>
}
