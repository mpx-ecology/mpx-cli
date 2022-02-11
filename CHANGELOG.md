## 3.1.0-beta.1 (2022-02-10)

#### New Features

- `@mpxjs/cli`
  - chore: 升级`@vue/cli`到`^5.0.0`以支持webpack5
- `@mpxjs/cli-service`
  - chore: 升级`@vue/cli-service`到`^5.0.0`
- `@mpxjs/vue-cli-plugin-mpx`
  - chore: 升级依赖以及项目依赖`@mpxjs/webpack-plugin`到`^2.7.0`
  - chore: 升级项目依赖`@mpxjs/api-proxy`到`^2.7.0`
  - chore: 升级项目依赖`@mpxjs/core`到`^2.7.0`
- `@mpxjs/vue-cli-plugin-mpx-mp`
  - chore: 升级`@mpxjs/webpack-plugin`到`^2.7.0`
- `@mpxjs/vue-cli-plugin-mpx-web`
  - chore: 升级`@mpxjs/webpack-plugin`到`^2.7.0`

#### Bug Fix

- `@mpxjs/vue-cli-plugin-mpx-mp`
  - fix: `stylus-loader`升级后配置由`resolve url`改为`resolveUrl`

#### Internal

- `@mpxjs/cli-service`
  - refactor: `MPX_CLI_MODE`为`mp`时移除`built-in:config/css`
- `@mpxjs/vue-cli-plugin-mpx`
  - perf: 开启webpack5持久化缓存
- `@mpxjs/vue-cli-plugin-eslint`
  - refactor: 项目依赖`eslint-loader`替换为`eslint-webpack-plugin`
- `@mpxjs/vue-cli-plugin-mpx-mp`
  - refactor: 替换所有的`@vue/cli`样式处理到`mpx`的样式处理
