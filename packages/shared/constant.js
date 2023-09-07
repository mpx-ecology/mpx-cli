/**
 * @typedef { 'wx'|'ali'|'swan' | 'qq' | 'tt' |'dd' |'web' } Mode
 */

/**
 * @typedef { Mode[] } SupportMode
 * @type { SupportMode }
 */
module.exports.SUPPORT_MODE = ['wx', 'ali', 'swan', 'qq', 'tt', 'dd', 'web']
module.exports.MODE_CONFIG_FILES_MAP = {
  wx: ['project.config.json'],
  ali: ['mini.project.json'],
  swan: ['project.swan.json'],
  qq: ['project.config.json'],
  tt: ['project.config.json'],
  dd: ['project.config.json'],
  web: []
}
module.exports.DEFAULT_MODE = 'wx'
