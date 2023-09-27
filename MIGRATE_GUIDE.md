<!-- TOC -->

- [mpx-cli v2迁移到v3](#mpx-cli-v2%E8%BF%81%E7%A7%BB%E5%88%B0v3)
  - [升级@mpxjs/cli](#%E5%8D%87%E7%BA%A7mpxjscli)
  - [配置迁移](#%E9%85%8D%E7%BD%AE%E8%BF%81%E7%A7%BB)
  - [新增自定义配置/修改已有配置参数](#%E6%96%B0%E5%A2%9E%E8%87%AA%E5%AE%9A%E4%B9%89%E9%85%8D%E7%BD%AE%E4%BF%AE%E6%94%B9%E5%B7%B2%E6%9C%89%E9%85%8D%E7%BD%AE%E5%8F%82%E6%95%B0)
  - [项目结构变化](#%E9%A1%B9%E7%9B%AE%E7%BB%93%E6%9E%84%E5%8F%98%E5%8C%96)
  - [More](#more)
    - [插件化](#%E6%8F%92%E4%BB%B6%E5%8C%96)
    - [模板](#%E6%A8%A1%E6%9D%BF)
    - [调试](#%E8%B0%83%E8%AF%95)
    - [插件管理](#%E6%8F%92%E4%BB%B6%E7%AE%A1%E7%90%86)
- [mpx-cli 插件 1.0 升级到 2.0](#mpx-cli-%E6%8F%92%E4%BB%B6-10-%E5%8D%87%E7%BA%A7%E5%88%B0-20)

<!-- /TOC -->

# mpx-cli v2迁移到v3

## 升级`@mpxjs/cli`

```
npm install @mpxjs/cli@3.x -g
```

## 配置迁移

> v3兼容了v2的所有配置，如果没有特殊修改，则不需要进行配置迁移。

- `config/devServer.js`迁移到`vue.config.js`下的`devServer`
- `config/mpxPlugin.conf.js`迁移到`vue.config.js`下的`pluginOptions.mpx.plugin`
- `config/mpxLoader.conf.js`迁移到`vue.config.js`下的`pluginOptions.mpx.loader`

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      plugin: {
        // 这里等同于`@mpxjs/webpack-plugin`的参数
        srcMode: 'wx',
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

## 新增自定义配置/修改已有配置参数

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  chainWebpack(config){
    config.plugin('newPlugin').use(newPlugin, [params])
    // 使用mpx inspect 可以根据注释来查看插件命名
    config.plugin('mpx-webpack-plugin').tap(args => newArgs)
  },
  // 或者也可以通过configureWebpack配置,这里返回的配置会通过webpack-merge合并到内部配置中
  configureWebpack(){
    return {
      plugins: [
        new Plugin()
      ]
    }
  }
})
```

- [webpack-chain](https://github.com/neutrinojs/webpack-chain)
- [webpack-merge](https://github.com/survivejs/webpack-merge)

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

v3版本可以通过`mpx inspect`来直接调试相关配置，可以更直观的发现配置错误。

### 4. 插件管理

使用`mpx invoke`/`mpx add`/`mpx upgrade`来管理插件，可以更细粒度的控制相关配置的更新。

# mpx-cli 插件 1.0 升级到 2.0

插件1.0和2.0在构建流程上做了很大的改动，所以如果需要从1.0 升级到 2.0，需要做以下改动

1. npm uninstall @mpxjs/vue-cli-plugin-mpx-mp @mpxjs/vue-cli-plugin-mpx-web
2. 修改 `package.json` 里的`build:mp`为`build`,`serve:mp`为`serve`

之后正常运行命令即可
