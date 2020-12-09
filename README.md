# @mpxjs/cli@next

基于 [`@vue/cli`](https://cli.vuejs.org/) 开发的 mpx 脚手架。

## 安装

```javascript
npm i @mpxjs/cli@next -g
```

## 创建项目

```javascript
mpx create <project-name>
```

## 本地开发调试

```javascript
npm run watch:mp // 小程序

npm run watch:cross // 跨平台小程序

npm run watch:web // web
```

## Some Tips:

### css 预编译处理器

通过 `mpx-cli` 初始化的项目内置 `stylus` 作为 `css` 的预编译处理器。

同时在 `webpack` 构建配置当中也预置了 `sass`、`less` 这2个预编译处理器的配置。如果你的项目需要使用这2种预编译器，安装对应的预编译处理工具即可：

```javascript
# Sass
npm install -D sass-loader sass

# Less
npm install -D less-loader less
```

### mpx 编译构建配置

新版的 `@mpxjs/cli` 整体是基于 `@vue/cli` 的架构设计开发的。因此有关 `mpx` 编译构建相关的配置统一使用 `vue.config.js` 来进行管理。

有关 `mpx` 相关的 webpack 插件、loader 等在 `vue.config.js` 当中 `pluginOptions.mpx` 进行相关的配置：

```javascript
module.exports = {
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {}, // 传入 @mpxjs/webpack-plugin 当中的配置信息，具体可参考文档：https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options
      loader: {} // 传入 @mpxjs/webpack-plugin loader 当中的配置信息，具体可参考文档：https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-loader
    }
  }
}
```

注：通过 `@mpxjs/cli` 初始化的项目提供了开箱即用的配置(在[插件内部](https://github.com/mpx-ecology/mpx-cli/blob/master/packages/vue-cli-plugin-mpx/utils/resolveMpxWebpackPluginConf.js#L6-L59)设置了默认的配置)，如果开发过程中有一些其他的配置需求，参见 [mpx 官方文档](https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options)。

### vue.config.js 配置说明

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

### 其他 webpack 构建配置

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

其中在进行相关的配置过程中，可根据构建平台和开发环境进行选择性的配置，在构建过程中暴露出来的环境变量包括：

* `MPX_CLI_MODE`： `mp` | `web`

* `NODE_ENV`：`development` | `production`

```javascript
// vue.config.js
module.exports = {
  chainWebpack: config => {
    if (process.env.MPX_CLI_MODE === 'mp') {
      // do something
    }

    if (process.env.MPX_CLI_MODE === 'web' && process.env.NODE_ENV === 'development') {
      // do something
    }
  }
}
```

### 其他官方插件

* `vue-cli-plugin-mpx-unit-test`

`mpx` 单元测试插件，具体参见[文档](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-unit-test)

* `vue-cli-plugin-mpx-dll`

`mpx dll` 插件，具体参见[文档](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-dll)
