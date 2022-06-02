
## 1.5.0 (2022-06-02)

#### :rocket: New Features
* `vue-cli-plugin-mpx-mp`
  * [#40](https://github.com/mpx-ecology/mpx-cli/pull/40) feat: support child process build ([@mater1996](https://github.com/mater1996))

#### Committers: 1
- Mater ([@mater1996](https://github.com/mater1996))



## 1.4.2 (2022-05-26)

#### :bug: Bug Fix
* Other
  * [#39](https://github.com/mpx-ecology/mpx-cli/pull/39) fix: version update ([@mater1996](https://github.com/mater1996))
* `vue-cli-plugin-mpx`
  * [#38](https://github.com/mpx-ecology/mpx-cli/pull/38) fix: npm package build error ([@mater1996](https://github.com/mater1996))

#### Committers: 1
- Mater ([@mater1996](https://github.com/mater1996))



## 1.4.1 (2022-05-25)

#### :rocket: New Features
* [#35](https://github.com/mpx-ecology/mpx-cli/pull/35) Feature/release ([@mater1996](https://github.com/mater1996))

#### :bug: Bug Fix
* `vue-cli-plugin-mpx`
  * [#37](https://github.com/mpx-ecology/mpx-cli/pull/37) fix: isPlugin error ([@mater1996](https://github.com/mater1996))

#### Committers: 1
- Mater ([@mater1996](https://github.com/mater1996))


# [](https://github.com/mater1996/mpx-cli/compare/v1.2.0...v) (2022-03-28)


### Bug Fixes

* 默认关闭vue-cli modern模式 ([880caba](https://github.com/mater1996/mpx-cli/commit/880cabafa1e5f07c14bf1b982a00f2fd24a01140))
* args.module为true时build逻辑 ([e25cd84](https://github.com/mater1996/mpx-cli/commit/e25cd84256fe813fd9a32b25f422835cc5ff77af))
* build web modern error ([e8141d5](https://github.com/mater1996/mpx-cli/commit/e8141d5b7b1e36b22982e06964f583403ce0f94d))
* copy-webpack-plugin降级 ([a86a8d6](https://github.com/mater1996/mpx-cli/commit/a86a8d645222f4fe54e6b997eeca007e6fcd0fb7))
* copy-webpack-plugin降级 ([#10](https://github.com/mater1996/mpx-cli/issues/10)) ([2ccbd45](https://github.com/mater1996/mpx-cli/commit/2ccbd45a33fa98405c32b1a00167a99379658cfd))
* modern build ([7f93cde](https://github.com/mater1996/mpx-cli/commit/7f93cde14125559f8c68e856e803ed9aacdcbe18))
* module判断逻辑 ([65ade2a](https://github.com/mater1996/mpx-cli/commit/65ade2aefdc9ab05e9748c2c63371bafa8db4659))
* pnpm全局安装,mpx执行vue bin错误 ([7a1d861](https://github.com/mater1996/mpx-cli/commit/7a1d8617b39af03982fba84b14fcb570a5412e7a))
* remove mpx url-loader config in build web mode ([#14](https://github.com/mater1996/mpx-cli/issues/14)) ([c7a62b2](https://github.com/mater1996/mpx-cli/commit/c7a62b2d1ce6f4c2994e031ea004c39d03fc4c54))
* web image url build error ([5b041cc](https://github.com/mater1996/mpx-cli/commit/5b041cc3c5e7d97d475077b17268738f11253522))


### Features

* add babel eslint ([87acc90](https://github.com/mater1996/mpx-cli/commit/87acc905de36c91c3f3ba42424625c26ede5dae6))



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
