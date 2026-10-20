module.exports = function (api, options) {
  const srcMode = options.srcMode || 'wx'
  const multiMiniProgram = srcMode === 'wx' && !options.cloudFunc && !options.isPlugin
  const platformNames = {
    wx: '微信',
    ali: '支付宝',
    swan: '百度',
    qq: 'QQ',
    tt: '抖音',
    dd: '滴滴',
    ks: '快手',
    jd: '京东'
  }

  const existing = api.generator.files['AGENTS.md']
  api.render('./template', {
    srcMode,
    miniModes: multiMiniProgram ? Object.keys(platformNames) : [srcMode],
    platformNames,
    needWeb: !!options.needWeb,
    needRn: !!options.needRn,
    rnProjectName: options.rnProjectName || 'ReactNativeProject',
    cloudFunc: !!options.cloudFunc,
    isPlugin: !!options.isPlugin
  })
  if (existing) {
    api.render((files) => {
      const generated = files['AGENTS.md'].trim()
      files['AGENTS.md'] = existing.includes(generated) ? existing : `${existing.trimEnd()}\n\n${generated}\n`
    })
  }
}
