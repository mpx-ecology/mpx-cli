# <%= pkgName %>

## Project setup

```javascript
// development
npm run serve // 小程序本地开发构建

<%_ if (transWeb) { _%>
npm run serve:web // 小程序跨web
<%_ } _%>

// production
npm run build // 小程序生产环境构建

<%_ if (transWeb) { _%>
npm run build:web // 小程序跨web
<%_ } _%>
```
