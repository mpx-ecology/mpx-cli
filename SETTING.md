# 配置

## vue.config.js

以下表格为 `vue.config.js` 当中 `web` 侧和 `小程序` 侧支持的字段一览表，具体每个字段的配置功能请参见 [@vue/cli官方配置](https://cli.vuejs.org/config/#configuration-reference)：

注：`yes` 表示在对应环境支持配置，`no` 表示在对应环境不支持配置。

| 字段 | web | 小程序 | 备注 |
| -- | -- | -- | -- |
| publicPath | yes | no | - |
| outputDir | no | no | `dist`目录作为输出目录 |
| assetsDir | yes | no | - |
| indexPath | yes | no | - |
| filenameHashing | yes | no | - |
| pages | yes | no | - |
| lintOnSave | no | no | - |
| runtimeCompiler | yes | no | - |
| transpileDependencies | yes | yes | - |
| productionSourceMap | yes | no | 未来会支持 |
| crossorigin | yes | no | - |
| integrity | yes | no | - |
| configureWebpack | yes | yes | - |
| chainWebpack | yes | yes | - |
| css.requireModuleExtension | yes | no | - |
| css.extract | yes | no | - |
| css.sourceMap | yes | no | 未来会支持 |
| css.loaderOptions | yes | no | 未来会支持 |
| devServer | yes | no | - |
| devServer.proxy | yes | no | - |
| parallel | yes | no | - |
| pwa | yes | no | - |
| pluginOptions | yes | yes | - |

可通过 `vue.config.js` 中提供的 `chainWebpack` 或 `configureWebpack` 字段进行配置，具体使用规则请参见[@vue/cli](https://cli.vuejs.org/guide/webpack.html#simple-configuration)：

```javascript
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      new MyOwnWebpackPlugin()
    ]
  },
  chainWebpack: config => {
    config.rule('some-rule')
      .test(/some-rule/)
      .use('some-loader')
      .loader('some-loader')
  }
}
```

## eslint

## typescript

## 单元测试
