# @mpxjs/cli@next

基于 [`@vue/cli`](https://cli.vuejs.org/) 开发的 mpx 脚手架。

- [安装](#安装)
- [介绍](#介绍)
  - [mpx-cli](#mpx-cli)
  - [mpx-cli-service](#mpx-cli-service)
  - [mpx-cli 插件](#mpx-cli-插件)
- [基础](#基础)
  - [创建项目](#创建项目)
  - [CLI服务](#CLI服务)
    - [使用命令](#使用命令)
    - [构建多目标](#构建多目标)
- [开发](#开发)
  - [css相关](#css相关)
    - [css预编译](#css预编译)
    - [postcss](#postcss)
  - [template相关](#template相关)
  - [webpack相关](#webpack相关)
    - [mpx 编译构建配置](#mpx编译构建配置)
    - [根据不同的构建目标配置](#根据不同的构建目标配置)
  - [配置](#配置)
  - [开发插件](#开发插件)

## 安装

```sh
npm i @mpxjs/cli@next -g
```

## 介绍

### mpx-cli

- 全局包，用于创建项目

### mpx-cli-service

- 提供开发环境服务，用于调试开发

### mpx-cli 插件

- [vue-cli-plugin-mpx](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx) mpx 项目基础配置
- [vue-cli-plugin-mpx-plugin-eslint](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-plugin-eslint) eslint 配置
- [vue-cli-plugin-mpx-cloud-func](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-cloud-func)
- [vue-cli-plugin-mpx-dll](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-dll) dll 配置
- [vue-cli-plugin-mpx-mp](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-mp) 小程序配置
- [vue-cli-plugin-mpx-web](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-web) web 配置
- [vue-cli-plugin-mpx-unit-test](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-unit-test) 单元测试配置
- [vue-cli-plugin-mpx-plugin-mode](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mode) 小程序插件配置
- [vue-cli-plugin-mpx-typescript](https://github.com/mpx-ecology/mpx-cli/tree/master/packages/vue-cli-plugin-mpx-typescript) ts 配置

## 基础

### 创建项目

- mpx-cli create project-name

### CLI服务

#### 使用命令

- MPX_CLI_MODE=mp mpx-cli-service build:mp
- MPX_CLI_MODE=web mpx-cli-service build:web

#### 构建多目标

- MPX_CLI_MODE=mp mpx-cli-service build:mp --wx --ali --swan

**目前支持的模式**

- wx 微信
- ali 阿里
- swan 百度
- qq QQ
- tt 抖音

## 开发

### css相关

#### css预编译

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

### template相关

可以使用任何模板语言来编译template，只需要在template上添加lang属性

```html
<template lang="pug"></template>
```

然后在`vue.config.js`配置该语言的`loader`

```js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module.rule('pug')
      .test(/\.pug$/)
      .use('pug-html-loader')
      .loader('pug-html-loader')
      .end()
  }
}
```
### webpack相关

#### mpx编译构建配置

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

- `MPX_CLI_MODE`： `mp` | `web`

- `NODE_ENV`：`development` | `production`

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

### 配置

[配置](https://github.com/mpx-ecology/mpx-cli/tree/master/SETTING.md)

### 开发插件

[开发插件](https://github.com/mpx-ecology/mpx-cli/tree/master/PLUGIN_GUIDE.md)
