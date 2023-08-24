# @mpxjs/cli

基于 [`@vue/cli`](https://cli.vuejs.org/) 开发的 mpx 脚手架。

<!-- TOC -->

- [@mpxjs/cli](#mpxjscli)
  - [安装](#%E5%AE%89%E8%A3%85)
  - [使用](#%E4%BD%BF%E7%94%A8)
  - [基础](#%E5%9F%BA%E7%A1%80)
    - [CLI 命令](#cli-%E5%91%BD%E4%BB%A4)
      - [build](#build)
      - [serve](#serve)
  - [开发](#%E5%BC%80%E5%8F%91)
    - [webpack 相关](#webpack-%E7%9B%B8%E5%85%B3)
      - [mpx 编译构建配置](#mpx-%E7%BC%96%E8%AF%91%E6%9E%84%E5%BB%BA%E9%85%8D%E7%BD%AE)
      - [根据不同的构建目标配置](#%E6%A0%B9%E6%8D%AE%E4%B8%8D%E5%90%8C%E7%9A%84%E6%9E%84%E5%BB%BA%E7%9B%AE%E6%A0%87%E9%85%8D%E7%BD%AE)
      - [调试 webpack 配置](#%E8%B0%83%E8%AF%95-webpack-%E9%85%8D%E7%BD%AE)
    - [css 相关](#css-%E7%9B%B8%E5%85%B3)
      - [css 预编译](#css-%E9%A2%84%E7%BC%96%E8%AF%91)
      - [postcss](#postcss)
    - [template 相关](#template-%E7%9B%B8%E5%85%B3)
  - [配置](#%E9%85%8D%E7%BD%AE)
    - [vue.config.js](#vueconfigjs)
  - [mpx-cli 插件 1.0 升级到 2.0](#mpx-cli-%E6%8F%92%E4%BB%B6-10-%E5%8D%87%E7%BA%A7%E5%88%B0-20)
  - [开发插件](#%E5%BC%80%E5%8F%91%E6%8F%92%E4%BB%B6)
  - [cli 相关介绍](#cli-%E7%9B%B8%E5%85%B3%E4%BB%8B%E7%BB%8D)

<!-- /TOC -->

## 安装

```sh
npm i @mpxjs/cli -g
```

## 使用

```sh
mpx create project-name
cd project-name
npm run build
```

相关命令

```json
{
  "serve": "mpx-cli-service serve", // 开发模式
  "build": "mpx-cli-service build" // 构建模式
}
```

## 基础

### CLI 命令

#### build

```sh
用法：mpx-cli-service build [options]

选项:

  --targets    编译目标(默认值: wx)
  --mode       指定环境模式 (默认值：production)
  --env        自定义 __mpx_env__
  --watch      监听文件变化
  --report     生成包分析报告
```

```sh
# 构建小程序，默认微信
mpx-cli-service build --targets=wx,ali
```

**目前支持的平台**

| 平台   | target |
| ------ | ------ |
| 微信   | wx     |
| 阿里   | ali    |
| 百度   | swan   |
| QQ     | qq     |
| 头条   | tt     |
| 浏览器 | web    |

#### serve

```sh
用法：mpx-cli-service serve [options]

选项:

  --targets    编译到小程序目标(默认值: wx)
  --mode       指定环境模式 (默认值：production)
  --env        自定义 __mpx_env__
```

## 开发

### webpack 相关

#### mpx 编译构建配置

新版的 `@mpxjs/cli` 整体是基于 `@vue/cli` 的架构设计开发的。因此有关 `mpx` 编译构建相关的配置统一使用 `vue.config.js` 来进行管理。

有关 `mpx` 相关的 webpack 插件、loader 等在 `vue.config.js` 当中 `pluginOptions.mpx` 进行相关的配置：

```javascript
// vue.config.js
module.exports = {
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      // 传入 @mpxjs/webpack-plugin 当中的配置信息
      // 具体可参考文档：https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options
      plugin: {},
      // 传入 @mpxjs/webpack-plugin loader 当中的配置信息
      // 具体可参考文档：https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-loader
      loader: {},
      // 提供图片资源处理简单操作
      // 具体配置参考 https://mpxjs.cn/guide/advance/image-process.html#%E5%9B%BE%E5%83%8F%E8%B5%84%E6%BA%90%E5%BC%95%E5%85%A5%E6%9C%89%E4%B8%89%E7%A7%8D%E6%96%B9%E5%BC%8F
      urlLoader: {
        name: 'img/[name][hash].[ext]',
        publicPath: '',
        publicPathScope: '',
        limit: 10
      }
    }
  }
}
```

注：通过 `@mpxjs/cli` 初始化的项目提供了开箱即用的配置(在[插件内部](https://github.com/mpx-ecology/mpx-cli/blob/master/packages/vue-cli-plugin-mpx/utils/resolveMpxWebpackPluginConf.js#L6-L59)设置了默认的配置)，如果开发过程中有一些其他的配置需求，参见 [mpx 官方文档](https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options)。

#### 根据不同的构建目标配置

可根据构建平台和开发环境进行选择性的配置，在构建过程中暴露出来的环境变量包括：

- `MPX_CLI_MODE`: 'mp' | 'web'
- `NODE_ENV`：'development' | 'production'
- `MPX_CURRENT_TARGET_MODE`: 'wx' | 'ali' | 'swan' | 'qq' | 'tt' | 'dd' | 'web'
- `MPX_CURRENT_TARGET_ENV` : 'development' | 'production'

```javascript
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    if (process.env.MPX_CLI_MODE === 'mp') {
      // do something
    }

    if (
      process.env.MPX_CLI_MODE === 'web' &&
      process.env.NODE_ENV === 'development'
    ) {
      // do something
    }
  }
}
```

#### 调试 webpack 配置

可以使用 `mpx inspect` 以及 `mpx inspect` 调试 webpack 配置。

可以将其输出重定向到一个文件以便进行查阅。

```sh
mpx inspect > output.js
```

还可以增加`targets`,`mode`等选项来输出针对不同条件下的配置。

```sh
mpx inspect --targets=wx,ali --mode=development
```

### css 相关

#### css 预编译

通过 `mpx-cli` 初始化的项目内置 `stylus` 作为 `css` 的预编译处理器。

同时在 `webpack` 构建配置当中也预置了 `sass`、`less` 这 2 个预编译处理器的配置。如果你的项目需要使用这 2 种预编译器，安装对应的预编译处理工具即可：

```sh
# Sass
npm install -D sass-loader sass

# Less
npm install -D less-loader less
```

#### postcss

创建`postcss.config.js`即可

也可以使用`mpx`配置[postcssInlineConfig](https://www.mpxjs.cn/api/compile.html#postcssinlineconfig)的方式.

```js
// postcss.config.js
module.exports = {
  plugins: {
    // 'postcss-import': {},
    // 'postcss-preset-env': {},
    // 'cssnano': {},
    // 'autoprefixer': {}
  }
}
```

### template 相关

可以使用任何模板语言来编译 template，只需要在 template 上添加 lang 属性.
mpx-cli 内置了 pug 模板配置，如果需要使用 pug 模板，只需要安装 pug 依赖即可。

```html
<template lang="pug"></template>
```

然后安装相关依赖即可

```sh
npm install -D pug pug-plain-loader
```

## 配置

### vue.config.js

以下表格为 `vue.config.js` 当中 `web` 侧和 `小程序` 侧支持的字段一览表，具体每个字段的配置功能请参见 [@vue/cli 官方配置](https://cli.vuejs.org/config/#configuration-reference)：

注：`yes` 表示在对应环境支持配置，`no` 表示在对应环境不支持配置。

| 字段                       | web | 小程序 | 备注                                                          |
| -------------------------- | --- | ------ | ------------------------------------------------------------- |
| publicPath                 | yes | no     | -                                                             |
| outputDir                  | yes | yes    | `dist/${process.env.MPX_CURRENT_TARGET_MODE}`目录作为输出目录 |
| assetsDir                  | yes | no     | -                                                             |
| indexPath                  | yes | no     | -                                                             |
| filenameHashing            | yes | no     | -                                                             |
| pages                      | yes | no     | -                                                             |
| lintOnSave                 | no  | no     | -                                                             |
| runtimeCompiler            | yes | no     | -                                                             |
| transpileDependencies      | yes | yes    | -                                                             |
| productionSourceMap        | yes | no     | 未来会支持                                                    |
| crossorigin                | yes | no     | -                                                             |
| integrity                  | yes | no     | -                                                             |
| configureWebpack           | yes | yes    | -                                                             |
| chainWebpack               | yes | yes    | -                                                             |
| css.requireModuleExtension | yes | no     | -                                                             |
| css.extract                | yes | no     | -                                                             |
| css.sourceMap              | yes | no     | 未来会支持                                                    |
| css.loaderOptions          | yes | no     | 未来会支持                                                    |
| devServer                  | yes | no     | -                                                             |
| devServer.proxy            | yes | no     | -                                                             |
| parallel                   | yes | no     | -                                                             |
| pwa                        | yes | no     | -                                                             |
| pluginOptions              | yes | yes    | -                                                             |

可通过 `vue.config.js` 中提供的 `chainWebpack` 或 `configureWebpack` 字段进行配置，具体使用规则请参见[@vue/cli](https://cli.vuejs.org/guide/webpack.html#simple-configuration)：

```javascript
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [new MyOwnWebpackPlugin()]
  },
  chainWebpack: (config) => {
    config
      .rule('some-rule')
      .test(/some-rule/)
      .use('some-loader')
      .loader('some-loader')
  }
}
```

## mpx-cli 插件 1.0 升级到 2.0

插件 1.0 和 2.0 在构建流程上做了很大的改动，所以如果需要从 1.0 升级到 2.0，需要做以下改动

1. npm uninstall @mpxjs/vue-cli-plugin-mpx-mp @mpxjs/vue-cli-plugin-mpx-web
2. 修改 `package.json` 里的`build:mp`为`build`,`serve:mp`为`serve`

之后正常运行命令即可

## 开发插件

一个 CLI 插件是一个 npm 包，它能够为 `MPX CLI` 创建的项目添加额外的功能，这些功能包括：

- 修改项目的 webpack 配置
- 添加新的`mpx-cli-service`命令
- 扩展 package.json
- 在项目中创建新文件、或者修改老文件。
- 提示用户选择一个特定的选项

[开发插件](https://github.com/mpx-ecology/mpx-cli/tree/master/PLUGIN_GUIDE.md)

## cli 相关介绍

| 包名                                  | 版本                                                                                                                                                         | 描述                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| @mpxjs/cli                            | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fcli.svg)](https://badge.fury.io/js/%40mpxjs%2Fcli)                                                       | mpx-cli                                              |
| @mpxjs/mpx-cli-service                | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fmpx-cli-service.svg)](https://badge.fury.io/js/%40mpxjs%2Fmpx-cli-service)                               | mpx-cli 服务                                         |
| @mpxjs/vue-cli-plugin-mpx             | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx)                         | mpx-cli 核心插件，包含基础配置，文件模板等           |
| @mpxjs/vue-cli-plugin-mpx-eslint      | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-eslint.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-eslint)           | eslint 插件，包含 eslint 相关配置                    |
| @mpxjs/vue-cli-plugin-mpx-cloud-func  | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-cloud-func.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-cloud-func)   | 云函数编译构建插件                                   |
| @mpxjs/vue-cli-plugin-mpx-mp          | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-mp.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-mp)                   | 小程序插件，包含小程序构建，开发命令，以及相关配置等 |
| @mpxjs/vue-cli-plugin-mpx-web         | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-web.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-web)                 | web 插件，包含 web 构建，开发命令，以及相关配置等    |
| @mpxjs/vue-cli-plugin-mpx-unit-test   | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-unit-test.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-unit-test)     | 单测插件，包含单元测试相关配置                       |
| @mpxjs/vue-cli-plugin-mpx-plugin-mode | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-plugin-mode.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-plugin-mode) | 小程序插件模式插件，包含小程序插件的 js，ts 模板等   |
| @mpxjs/vue-cli-plugin-mpx-typescript  | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-typescript.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-typescript)   | ts 插件，包含小程序 ts 模板以及相关配置等            |
