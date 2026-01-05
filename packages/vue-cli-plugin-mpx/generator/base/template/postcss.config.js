const autoprefixer = require('autoprefixer')
const RN = ['android', 'ios', 'harmony']
const isRN = RN.includes(
  process.env.MPX_CURRENT_TARGET_MODE
)
// RN环境下去除postcss的autoprefix插件
module.exports = {
  plugins: [
    !isRN && autoprefixer({ remove: false })
  ].filter(Boolean)
}