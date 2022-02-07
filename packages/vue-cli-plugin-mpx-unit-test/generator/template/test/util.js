const path = require('path')
const simulate = require('miniprogram-simulate')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

function resolveDist(dir) {
  return path.join(__dirname, '../dist/wx', dir)
}

const outputMap = require(resolve('dist/outputMap.json'))

/**
 * 从组件路径获取真实路径
 * @param componentPathStr
 */
function getComponentPath(componentPathStr) {
  const componentPath = resolve(componentPathStr)
  return resolveDist(outputMap[componentPath])
}

function loadComponent(componentPathStr) {
  const realComponentPath = getComponentPath(componentPathStr)
  return simulate.load(realComponentPath)
}

module.exports = {
  loadComponent
}
