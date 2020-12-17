# 如何去开发一个 mpx 项目的 vue-cli-plugin

对于 `mpx` 项目而言，例如要增加 `loader` 配置、`plugin` 插件等等，都可以在 `vue.config.js` 当中完成：

```javascript
module.exports = {
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {},
      loader: {}
    }
  },
  configureWebpack() {},
  chainWebpack() {
    if (process.env.MPX_CLI_MODE === 'mp') {
      // do something
    }

    if (process.env.MPX_CLI_MODE === 'web' && process.env.NODE_ENV === 'development') {
      // do something
    }
  }
}
```

但是在我们实际的业务开发场景当中，我们可能会将一些公共能力也单独抽成 `vue-cli-plugin-mpx` 以达到公共能力的复用，这样在其他的项目当中如果要使用这部分的能力即可通过 `mpx add vue-cli-plugin-mpx-xxx` 安装这个插件就可以启用对应的功能。

如何开发一个 `vue-cli-plugin` 参见 [`@vue/cli` 官方文档](https://cli.vuejs.org/dev-guide/plugin-dev.html)即可。

不过对于 `mpx` 项目而言，由于要支持不同平台的编译构建，在这些流程当中是有些差异化的处理的。例如普通小程序的编译构建和小程序转web的编译构建是2套差异性很大的配置，为了确保不同平台编译构建正常进行，所以通过环境变量以及约定的方式来将不同平台的配置隔离。

## 约定一：插件命名

`mpx` 项目的 `vue-cli-plugin` 命名的格式为：

```javascript
vue-cli-plugin-mpx-xxx
```

如果是带有 `namespace` 的包，加上对应的 `namespace` 即可：

```javascript
@namespace/vue-cli-plugin-mpx-xxx
```

## 约定二：生效平台

在平台差异化的构建配置这个背景下，一个 `vue-cli-plugin-mpx` 可能只期望在编译小程序的流程当中生效，或者是只在跨 `web` 平台的流程生效，也可能二者皆有。

一个 `vue-cli-plugin-mpx` 的 `service plugin` 当中根据具体使用场景来暴露 `platform` 平台配置。

```javascript
// 你的 service plugin 入口文件
module.exports = function(api, options) {
  // do something
}

module.exports.platform = 'mp' // 另外两个可选值为 'web'、`all`
```

这个 `platform` 配置标识用以决定插件的适用平台，`mpx-cli-service` 会根据这个配置来决定具体在哪个平台编译构建时生效：

* `mp` 仅在小程序平台生效；

* `web` 仅在小程序跨 web 平台生效；

* `all` 在小程序平台和小程序跨 web 平台都会生效；

* 不暴露 `platform` 配置等效于 `all`，会在小程序平台和小程序跨 web 平台都会生效；

## 环境变量

如果 `vue-cli-plugin-mpx` 插件在小程序平台和小程序跨 web 平台都会生效，但是具体的操作配置还有一些差异，可通过 `MPX_CLI_MODE` 环境变量来进行区分：

```javascript
// 你的 service plugin 入口文件
module.exports = function(api, options) {
  if (process.env.MPX_CLI_MODE === 'mp') {
    // 更新小程序配置
  }

  if (process.env.MPX_CLI_MODE === 'web') {
    // 更新web配置
  }

  if (process.env.MPX_CLI_MODE === 'mp' && process.env.NODE_ENV === 'development') {
    // 仅在开发环境下更新小程序配置
  }
}
```
