module.exports = function (api, options) {
  const templateOptions = {
    needTs: !!options.needTs,
    needSSR: !!options.needSSR
  }
  if (options.needTs) {
    // TS 页面和组件由 TypeScript 插件生成，应用入口由主插件统一生成。
    api.render({
      'src/app.mpx': './template/src/app.mpx'
    }, templateOptions)
  } else {
    api.render('./template', templateOptions)
  }
}
