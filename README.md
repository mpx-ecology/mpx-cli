## @mpxjs/cli@next

基于 [`@vue/cli`](https://cli.vuejs.org/) 开发的 mpx 脚手架。

### 安装

```javascript
npm i @mpxjs/cli@next -g
```

### 创建项目

```javascript
mpx create <project-name>
```

### 本地开发调试

```javascript
npm run watch:mp // 小程序

npm run watch:cross // 跨平台小程序

npm run watch:web // web
```

### Some Tips:

#### css 预编译处理器

通过 `mpx-cli` 初始化的项目内置 `stylus` 作为 `css` 的预编译处理器。不过在 `webpack` 构建配置当中也预置了 `sass`、`less` 这2个预编译处理器的配置。如果需要使用这2种预编译器，安装其对应的处理 `package` 即可：

```javascript
# Sass
npm install -D sass-loader sass

# Less
npm install -D less-loader less
```
