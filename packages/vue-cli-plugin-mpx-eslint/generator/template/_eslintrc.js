module.exports = {
  <%_ if(needTs) { _%>
  extends: ['@mpxjs/eslint-config-ts'], 
  <%_ } else { _%>
  extends: ['@mpxjs'],
  <%_ } _%>
  rules: {
    // .mpx文件规则 https://mpx-ecology.github.io/eslint-plugin-mpx/rules/
  },
  overrides: [
    <%_ if(needTs) { _%>
    {
      files: ['**/*.ts'],
      rules: {
        // .ts文件规则 https://typescript-eslint.io/rules/
      }
    },
    <%_ } _%>
    {
      files: ['**/*.js'],
      rules: {
        // .js文件规则 https://eslint.bootcss.com/docs/rules/
      }
    }
  ]
}
