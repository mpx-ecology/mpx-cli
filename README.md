# @mpxjs/cli

基于 [`@vue/cli`](https://cli.vuejs.org/) 开发的 mpx 脚手架。

<!-- TOC -->

- [@mpxjs/cli](#mpxjscli)
  - [安装](#%E5%AE%89%E8%A3%85)
  - [使用](#%E4%BD%BF%E7%94%A8)
    - [平台选择与项目结构](#平台选择与项目结构)
    - [Web 与 SSR](#web-与-ssr)
    - [React Native](#react-native)
  - [基础](#%E5%9F%BA%E7%A1%80)
    - [CLI 命令](#cli-%E5%91%BD%E4%BB%A4)
      - [create](#create)
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
    - [mpx.config.js](#mpxconfigjs)
  - [mpx-cli 插件 1.0 升级到 2.0](#mpx-cli-%E6%8F%92%E4%BB%B6-10-%E5%8D%87%E7%BA%A7%E5%88%B0-20)
  - [开发插件](#%E5%BC%80%E5%8F%91%E6%8F%92%E4%BB%B6)
  - [cli 相关介绍](#cli-%E7%9B%B8%E5%85%B3%E4%BB%8B%E7%BB%8D)

<!-- /TOC -->

## 安装

```sh
npm i @mpxjs/cli -g
```

> 如果插件版本是1.x，需要前往https://github.com/mpx-ecology/mpx-cli/tree/master  查看文档

## 使用

```sh
mpx create project-name
cd project-name
npm run build
```

生成项目的基础命令：

```sh
npm run serve                         # 开发构建，持续监听
npm run build                         # 生产构建
npm run serve -- --targets=ali         # 指定支付宝目标
npm run build -- --targets=wx,ali      # 同时构建多个目标
```

默认目标为微信（`wx`）；其他源码模式请显式指定 `--targets`。默认产物目录为 `dist/<目标>`，可在 `mpx.config.js` 中修改。

### 平台选择与项目结构

创建项目时先选择源码模式，仅微信源码（`srcMode: 'wx'`）支持跨平台输出。Web、RN 的生成逻辑均由核心插件 `@mpxjs/vue-cli-plugin-mpx` 提供，无需安装独立的 Web 或 RN 插件。

| 选项 | 默认值 | 作用 |
| --- | --- | --- |
| `needWeb` | `false` | 生成 Web 依赖、构建脚本和 `public/index.html` |
| `needRn` | `false` | 生成 RN 配置、构建脚本，并创建原生宿主 |
| `rnProjectName` | 项目名称 | RN 宿主目录及注册名称；只能包含字母、数字、下划线，不能以数字开头，也不能为 `React` |
| `needSSR` | `false` | 同时启用 Web 时，添加 SSR 插件、服务端模板和应用生命周期 |
| `needTs` | `true` | 生成 TypeScript 应用入口、页面、组件及配置 |
| `needEslint` | `true` | 添加 ESLint 配置和 `lint` 脚本 |

原子 CSS、单元测试和端到端测试可按需选择。选择 Web 或 RN 后，不再询问云开发和小程序插件模式。

普通微信源码项目默认生成其他小程序平台的静态配置，与是否选择 Web 无关；云开发、插件模式只生成当前源码平台的静态配置。RN 项目另生成 `static/ios`、`static/android` 和 `static/harmony`。

普通项目的应用入口位于 `src/app.mpx`，页面和组件分别位于 `src/pages/`、`src/components/`；云开发和插件模式使用各自模板。项目会生成根 `README.md` 和 `AGENTS.md`，记录所选平台的构建、运行和验证方法。

### Web 与 SSR

选择 Web 后可执行：

```sh
npm run serve:web
npm run build:web
```

同时选择 SSR 后可执行：

```sh
npm run serve:ssr              # 启动客户端开发构建和 SSR 服务
npm run build:ssr              # 构建客户端与服务端产物
cd server
node build.server.js          # 按默认模板启动生产 SSR 服务
```

开发客户端端口由 `mpx.config.js` 的 `pluginOptions.SSR.devClientPort` 配置，生成值为 `8000`；模板中的 SSR 服务端口为 `8091`。默认构建产物位于 `dist/web`，包含客户端 manifest 和服务端 bundle。修改输出目录或部署路径时，应同步调整 `server/build.server.js`。

### React Native

选择 RN 后，CLI 会在项目内创建 React Native `0.77.2` 宿主，目录名由 `rnProjectName` 决定。Mpx 项目可以使用 npm、Yarn 或 pnpm；原生宿主不使用 pnpm，选择 pnpm 时宿主安装会自动切换到本机可用的 Yarn 或 npm。

日常开发先在项目根目录启动对应平台的 Mpx 编译：

```sh
npm run serve -- --targets=ios
# Android 使用 npm run serve -- --targets=android
```

首次运行 iOS 时，在另一终端进入实际宿主目录，安装 Pods 并构建 App：

```sh
cd <rnProjectName>
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

Android 在宿主目录执行 `npm run android`。如果已安装开发版 App，且原生依赖和配置未变，可在宿主执行 `npm start` 后打开或 Reload App；已有 Metro 时直接复用。iOS 需要 Xcode，Android 需要相应的 JDK、SDK 和设备环境。

根目录的 `serve:ios`、`serve:android` 脚本会先运行宿主的原生构建命令，再启动 Mpx 编译。生产构建使用：

```sh
npm run build:ios
npm run build:android
```

这些脚本完成 Mpx 编译和宿主 JS bundle 打包；IPA/APK 需通过原生工程构建。两端产物分别同步到宿主的 `mpx-build/ios/`、`mpx-build/android/`，由 `mpx-entry.ios.js`、`mpx-entry.android.js` 选择，支持两端 Mpx watcher 同时运行。

宿主的 `metro.config.js` 从核心插件加载 sourcemap 中间件；bundle 脚本调用 `compose-mpx-sourcemap` 合成 Metro 与 Mpx sourcemap，失败时保留 Metro 原始映射。详见[核心插件 RN sourcemap 说明](packages/vue-cli-plugin-mpx/README.md#rn-sourcemap)。

## 基础

### CLI 命令

#### create

```sh
用法: mpx create [options] <app-name>

选项:

  -p, --preset <presetName>       使用已保存或远程预设
  -d, --default                   使用默认预设
  -i, --inlinePreset <json>       使用行内预设
  -m, --packageManager <command>  在安装依赖项时使用指定的npm管理器
  -r, --registry <url>            在安装依赖项时使用指定的源
  -g, --git [message]             使用初始提交消息强制git初始化
  -n, --no-git                    跳过git初始化
  -f, --force                     如果目标目录存在，则覆盖该目录
  --merge                         合并目标目录（如果存在）
  -c, --clone                     使用git克隆获取远程预置
  -x, --proxy <proxyUrl>          创建项目时使用指定的代理
```

预设可通过 `--preset` 指定本地文件、目录或远程仓库，也可通过 `--inlinePreset` 传入 JSON。旧 `cross` 选项已废弃，请改用 `needWeb`；`needWeb` 与 `needRn` 独立控制平台功能。

只有选择 Web 后才显示 SSR 问题；未启用 `needWeb` 时，预设中的 `needSSR: true` 也不生效。非微信源码模式下，Web、RN 和 SSR 选项均不生效。

预设值会合并到交互答案中。需要隐藏问题时，可通过 `mpxCliPrompts.remove` 指定问题名；移除问题不会取消预设已启用的功能。例如：

```json
{
  "srcMode": "wx",
  "needWeb": true,
  "needSSR": true,
  "needRn": false,
  "mpxCliPrompts": {
    "remove": ["srcMode", "needWeb", "needSSR", "needRn"]
  }
}
```

CLI 会为 npm 项目在 `package.json` 中配置 `@achrinza/node-ipc` 的兼容包 override；pnpm 项目则写入 `pnpm-workspace.yaml` 的 `overrides`、`allowBuilds`，并在传入 `--registry` 时写入 `.npmrc`。无需手动添加 `shamefully-hoist`；Yarn 不自动配置该 override。

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
| 头条   | tt     |
| QQ     | qq     |
| 京东   | jd     |
| 快手   | ks     |
| 滴滴   | dd     |
| 浏览器 | web    |
| React Native（Android） | android |
| React Native（iOS） | ios |
| Harmony 构建目标 | harmony |
| Tenon 构建目标 | tenon |

目标列表表示编译器支持的目标；Web/RN 需要在创建时启用对应功能。CLI 自动创建的 RN 宿主和快捷脚本面向 iOS、Android，其他目标需自行准备运行环境。

#### serve

```sh
用法：mpx-cli-service serve [options]

选项:

  --targets    编译目标 (默认值: wx)
  --mode       指定环境模式 (默认值：development)
  --env        自定义 __mpx_env__
```

## 开发

### webpack 相关

#### mpx 编译构建配置

新版的 `@mpxjs/cli` 整体是基于 `@vue/cli` 的架构设计开发的。因此有关 `mpx` 编译构建相关的配置统一使用 `mpx.config.js` 来进行管理。

有关 `mpx` 相关的 webpack 插件、loader 等在 `mpx.config.js` 当中 `pluginOptions.mpx` 进行相关的配置：

```javascript
// mpx.config.js
module.exports = {
  pluginOptions: {
    mpx: {
      // 传入 @mpxjs/webpack-plugin 当中的配置信息
      // 具体可参考文档：https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options
      plugin: {
        srcMode: 'wx',
      },
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

注：通过 `@mpxjs/cli` 初始化的项目提供了开箱即用的配置（在[核心插件配置](packages/vue-cli-plugin-mpx/config/base.js)中设置默认值）。更多配置参见 [mpx 官方文档](https://www.mpxjs.cn/api/compile.html#mpxwebpackplugin-options)。

#### 根据不同的构建目标配置

可根据构建平台和开发环境进行选择性的配置，在构建过程中暴露出来的环境变量包括：

- `MPX_CLI_MODE`: 'mp' | 'web'，RN 等非 Web 目标也使用 'mp'
- `NODE_ENV`：'development' | 'production'
- `MPX_CURRENT_TARGET_MODE`: 当前构建目标，对应上表的 target
- `MPX_CURRENT_TARGET_ENV`: 使用 `--targets=wx:development` 等 `目标:环境` 语法时设置的环境值，同时作为该目标的 `--mode`

```javascript
// mpx.config.js
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

可以使用 `mpx inspect` 查看 webpack 配置。

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

### mpx.config.js

以下表格为 `mpx.config.js` 当中 `web` 侧和 `小程序` 侧支持的字段一览表，具体每个字段的配置功能请参见 [@vue/cli 官方配置](https://cli.vuejs.org/config/#configuration-reference)：

注：`yes` 表示在对应环境支持配置，`no` 表示在对应环境不支持配置。

| 字段                       | web | 小程序 | 备注                                                          |
| -------------------------- | --- | ------ | ------------------------------------------------------------- |
| publicPath                 | yes | no     | -                                                             |
| outputDir                  | yes | yes    | `dist/${process.env.MPX_CURRENT_TARGET_MODE}`目录作为输出目录 |
| assetsDir                  | yes | no     | -                                                             |
| indexPath                  | yes | no     | -                                                             |
| filenameHashing            | yes | no     | -                                                             |
| pages                      | yes | no     | -                                                             |
| lintOnSave                 | yes  | yes     | -                                                             |
| runtimeCompiler            | yes | no     | -                                                             |
| transpileDependencies      | yes | yes    | -                                                             |
| productionSourceMap        | yes | yes    |                                                   |
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

可通过 `mpx.config.js` 中提供的 `chainWebpack` 或 `configureWebpack` 字段进行配置，具体使用规则请参见[@vue/cli](https://cli.vuejs.org/guide/webpack.html#simple-configuration)：

```javascript
// mpx.config.js
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
| @mpxjs/cli-shared-utils | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fcli-shared-utils.svg)](https://badge.fury.io/js/%40mpxjs%2Fcli-shared-utils) | 构建目标、命令调用和 SSR 状态等共享工具 |
| @mpxjs/vue-cli-plugin-mpx             | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx)                         | mpx-cli 核心插件，包含基础配置，文件模板等           |
| @mpxjs/vue-cli-plugin-mpx-eslint      | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-eslint.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-eslint)           | eslint 插件，包含 eslint 相关配置                    |
| @mpxjs/vue-cli-plugin-mpx-cloud-func  | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-cloud-func.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-cloud-func)   | 云函数编译构建插件                                   |
| @mpxjs/vue-cli-plugin-mpx-ssr         | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-ssr.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-ssr)                 | Web SSR 构建、开发服务和服务端模板 |
| @mpxjs/vue-cli-plugin-mpx-unit-test   | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-unit-test.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-unit-test)     | 单测插件，包含单元测试相关配置                       |
| @mpxjs/vue-cli-plugin-mpx-plugin-mode | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-plugin-mode.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-plugin-mode) | 小程序插件模式插件，包含小程序插件的 js，ts 模板等   |
| @mpxjs/vue-cli-plugin-mpx-typescript  | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-typescript.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-typescript)   | ts 插件，包含小程序 ts 模板以及相关配置等            |
| @mpxjs/vue-cli-plugin-mpx-e2e-test | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-e2e-test.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-e2e-test) | 端到端测试配置和模板 |
| @mpxjs/vue-cli-plugin-mpx-utility-first-css | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-utility-first-css.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-utility-first-css) | UnoCSS 原子 CSS 配置 |
| @mpxjs/vue-cli-plugin-mpx-theme | [![npm version](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-theme.svg)](https://badge.fury.io/js/%40mpxjs%2Fvue-cli-plugin-mpx-theme) | Stylus 主题配置 |

小程序、Web 和 RN 的基础生成及构建能力均在核心插件内维护；SSR、TypeScript、ESLint 和测试等功能由对应插件扩展。重新调用核心生成器时会保留已有应用源码；配置扩展优先保留 `mpx.config.js` 中已有值，对无法安全合并的动态结构会报错。已有 Babel 配置也会保留，启用 RN 时请按生成器提示检查 React preset 和 Reanimated 插件。
