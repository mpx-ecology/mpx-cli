# @mpxjs/vue-cli-plugin-mpx

`@mpxjs/cli` 基础构建配置插件(所有的平台编译构建都依赖此插件)。
### Generator

* babel
* readme
* src
* static

### 编译构建

内置了 `小程序` 和 `web` 平台基础构建配置。

### RN sourcemap

安装本插件后，可在 npm scripts 中调用 `compose-mpx-sourcemap`，将 Metro sourcemap 与 Mpx sourcemap 合成：

```sh
compose-mpx-sourcemap --metro-map ./ios/main.jsbundle.map --mpx-map ./mpx-build/ios/app.js.map --generated-source mpx-build/ios/app.js --output ./ios/main.jsbundle.map --allow-failure
```

`--allow-failure` 表示合成失败时保留原 Metro sourcemap；省略该参数时失败会返回非零退出码。Android 使用对应的 `mpx-build/android` 和 bundle 路径。

Metro 中间件通过模块调用，在 RN 宿主的 `metro.config.js` 中配置：

```js
const { createMpxSourcemapMiddleware } = require('@mpxjs/vue-cli-plugin-mpx/utils/metro-mpx-sourcemap-middleware')

const config = {
  server: {
    enhanceMiddleware: createMpxSourcemapMiddleware({ projectRoot: __dirname })
  }
}
```

新建 RN 宿主会声明本插件为开发依赖并生成以上调用配置，无需在宿主中复制 sourcemap 脚本。
