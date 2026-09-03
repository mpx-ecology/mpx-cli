const { defineConfig } = require('unocss')
const presetMpxModule = require('@mpxjs/unocss-base')
const presetMpx = presetMpxModule.default || presetMpxModule

module.exports = defineConfig({
  content: {
    pipeline: {
      include: [/\.mpx($|\?)/],
    },
  },
  presets: [
    presetMpx()
  ]
})
