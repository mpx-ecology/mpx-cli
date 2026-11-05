const recast = require('recast')
const parser = require('@babel/parser')
const { stringify } = require('javascript-stringify')

function cannotMerge (location) {
  throw new Error(`无法安全合并 mpx.config.js 的 ${location}：请使用对象字面量配置或手动添加插件配置`)
}

function parse (source) {
  return recast.parse(source, {
    parser: {
      parse: source => parser.parse(source, { sourceType: 'unambiguous', tokens: true })
    }
  })
}

function isModuleExports (node) {
  return node && node.type === 'MemberExpression' && !node.computed &&
    node.object.type === 'Identifier' && node.object.name === 'module' &&
    node.property.name === 'exports'
}

function findConfigObject (ast) {
  const statements = ast.program.body
  const exports = statements.filter(statement =>
    statement.type === 'ExpressionStatement' &&
    statement.expression.type === 'AssignmentExpression' &&
    statement.expression.operator === '=' &&
    isModuleExports(statement.expression.left)
  )
  if (exports.length !== 1) return cannotMerge('module.exports')

  let node = exports[0].expression.right
  const visited = new Set()
  while (node && !visited.has(node)) {
    visited.add(node)
    if (node.type === 'ObjectExpression') return node
    if (node.type === 'CallExpression' && node.callee.name === 'defineConfig' && node.arguments.length === 1) {
      node = node.arguments[0]
    } else if (node.type === 'Identifier') {
      const declarations = statements
        .filter(statement => statement.type === 'VariableDeclaration' && statement.kind === 'const')
        .flatMap(statement => statement.declarations)
      const declaration = declarations.find(declaration => declaration.id.name === node.name)
      node = declaration && declaration.init
    } else {
      break
    }
  }
  return cannotMerge('module.exports')
}

function propertyName (property) {
  return property.key.type === 'Identifier' ? property.key.name : property.key.value
}

function mergeObjects (existing, additions, location) {
  if (!additions.properties.length) return
  if (!existing || existing.type !== 'ObjectExpression') return cannotMerge(location)
  // 展开和计算属性可能覆盖待添加的键，不能在未知值上静默合并。
  if (existing.properties.some(property => property.type === 'SpreadElement' || property.computed)) {
    return cannotMerge(location)
  }
  for (const property of additions.properties) {
    const name = propertyName(property)
    const matches = existing.properties.filter(item => propertyName(item) === name)
    if (matches.length > 1) return cannotMerge(`${location}.${name}`)
    const current = matches[0]
    if (!current) {
      existing.properties.push(property)
    } else if (property.value && property.value.type === 'ObjectExpression') {
      mergeObjects(current.value, property.value, `${location}.${name}`)
    }
    // 已有叶子配置优先；保留动态表达式、函数及用户自定义值。
  }
}

module.exports = function mergeConfigSource (source, config) {
  const generated = `module.exports = ${stringify(config, null, 2)}\n`
  if (!source) return generated
  const ast = parse(source)
  const additions = parse(generated).program.body[0].expression.right
  mergeObjects(findConfigObject(ast), additions, 'module.exports')
  return recast.print(ast, { quote: 'single', tabWidth: 2 }).code
}

// 只读取静态字符串，不执行用户配置中的表达式或函数。
module.exports.readConfigString = function readConfigString (source, keys) {
  if (!source) return undefined
  let node = findConfigObject(parse(source))
  let location = 'module.exports'
  for (const key of keys) {
    if (!node || node.type !== 'ObjectExpression' ||
      node.properties.some(property => property.type === 'SpreadElement' || property.computed)) {
      return cannotMerge(location)
    }
    const matches = node.properties.filter(property => propertyName(property) === key)
    location += `.${key}`
    if (!matches.length) return undefined
    if (matches.length > 1) return cannotMerge(location)
    node = matches[0].value
  }
  if (!node || node.type !== 'StringLiteral') return cannotMerge(location)
  return node.value
}
