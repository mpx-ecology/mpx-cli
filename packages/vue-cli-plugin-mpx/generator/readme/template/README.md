# <%= pkgName %>

## Project setup

```javascript
// development
npm run serve // 小程序本地开发构建

<%_ if (transWeb) { _%>
// 小程序跨web
npm run serve -- --targets=web
yarn serve --targets=web
<%_ } _%>

// production
npm run build // 小程序生产环境构建

<%_ if (transWeb) { _%>
// 小程序跨web
npm run build -- --targets=web
yarn build --targets=web
<%_ } _%>
```
