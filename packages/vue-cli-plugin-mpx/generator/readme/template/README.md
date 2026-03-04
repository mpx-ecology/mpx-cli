# <%= pkgName %>

## Project setup

```javascript
// 开发构建，默认输出微信小程序
npm run serve

// 开发构建，跨平台输出支付宝小程序
npm run serve:ali

// 开发构建，跨平台输出 Web
npm run serve:web

// 开发构建，跨平台输出React Native
npm run serve:ios
npm run serve:android

// 开发构建，跨平台输出其他平台小程序target = swan|tt|qq|jd|ks
npm run serve -- --targets={target}

// 开发构建，同时输出多平台产物
npm run serve -- --targets=wx,ali,ios,android

// 生产构建，默认输出微信小程序
npm run build

// 生产构建，跨平台输出
npm run build:ali
npm run build:web
npm run build:ios
npm run build:android
npm run build -- --targets=wx,ali,ios,android
```
