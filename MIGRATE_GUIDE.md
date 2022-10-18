<!-- TOC -->

- [迁移指南](#%E8%BF%81%E7%A7%BB%E6%8C%87%E5%8D%97)
  - [升级@mpxjs/cli](#%E5%8D%87%E7%BA%A7mpxjscli)
  - [配置迁移](#%E9%85%8D%E7%BD%AE%E8%BF%81%E7%A7%BB)
  - [修改配置参数](#%E4%BF%AE%E6%94%B9%E9%85%8D%E7%BD%AE%E5%8F%82%E6%95%B0)
  - [项目结构变化](#%E9%A1%B9%E7%9B%AE%E7%BB%93%E6%9E%84%E5%8F%98%E5%8C%96)
  - [More](#more)
    - [插件化](#%E6%8F%92%E4%BB%B6%E5%8C%96)
    - [模板](#%E6%A8%A1%E6%9D%BF)
    - [调试](#%E8%B0%83%E8%AF%95)
    - [插件管理](#%E6%8F%92%E4%BB%B6%E7%AE%A1%E7%90%86)

<!-- /TOC -->

# 迁移指南

## 升级`@mpxjs/cli`

```
npm install @mpxjs/cli@3.x -g
```

## 配置迁移

- `config/devServer.js`迁移到`vue.config.js`下的`devServer`
- `config/mpxPlugin.conf.js`迁移到`vue.config.js`下的`pluginOptions.mpx.plugin`
- `config/mpxLoader.conf.js`迁移到`vue.config.js`下的`pluginOptions.mpx.loader`

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {
        // 这里等同于`@mpxjs/webpack-plugin`的参数
      },
      loader: {
        // 这里等同于`mpx-loader`参数
      }
    }
  },
  devServer: {
    // dev服务配置
  }
})
```

## 修改配置参数

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  chainWebpack(config){
    // 使用mpx inspect 可以根据注释来查看插件命名
    config.plugin('mpx-webpack-plugin').tap(args => newArgs)
  }
})
```

## 项目结构变化

<img src="./docs/assets/1666074957603.jpg" width="800"/>

v3版本相对于v2版本的目录结构更加清晰。
- 移除了`config/build`的配置目录，将其统一到了插件配置当中，可以通过`vue.config.js`修改。
- `index.html`移动到`public`目录下。
- 增加`jsconfig.json`,让类型提示更加友好。

## More

v3版本相对于v2版本的整体架构相差较大，v3版本主要基于`vue-cli`架构，主要有以下优势。

### 1. 插件化

v3版本的配置依靠插件化，将v2版本的文件配置整合到了各个自定义插件中。

- vue-cli-plugin-mpx-eslint eslint配置
- vue-cli-plugin-mpx-mp 小程序构建配置以及命令
- vue-cli-plugin-mpx-plugin-mode 插件配置
- vue-cli-plugin-mpx-typescript ts配置
- vue-cli-plugin-mpx-web web构建配置以及命令

除此之外，也可以使用统一的`vue.config.js`来自定义配置，或者将配置抽离到插件当中，来进行统一的管理。


### 2. 模板

v3版本的模板也可以通过插件进行自定义生成，同时不依赖于github，在国内网络下不会有生成模板时网络错误的问题。

### 3. 调试

v3版本可以通过`mpx inspect:mp/web`来直接调试相关配置，可以更直观的发现配置错误。

### 4. 插件管理

使用`mpx invoke`/`mpx add`/`mpx upgrade`来管理插件，可以更细粒度的控制相关配置的更新。

