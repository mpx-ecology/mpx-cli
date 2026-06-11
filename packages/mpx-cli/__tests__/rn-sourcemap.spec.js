const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const { SourceMapConsumer, SourceMapGenerator } = require('source-map')
const {
  composeMpxSourceMap,
  composeMpxSourceMapFiles
} = require('../lib/rn/compose-mpx-sourcemap')
const {
  applyRnPackageConfig,
  copyRnSourcemapScript
} = require('../lib/createRn')

function createMap ({ file, mappings, sourcesContent = {} }) {
  const generator = new SourceMapGenerator({ file })
  mappings.forEach((mapping) => {
    generator.addMapping(mapping)
  })
  Object.keys(sourcesContent).forEach((source) => {
    generator.setSourceContent(source, sourcesContent[source])
  })
  return generator.toJSON()
}

async function withConsumer (map, cb) {
  const consumer = await new SourceMapConsumer(map)
  try {
    return cb(consumer)
  } finally {
    if (consumer.destroy) {
      consumer.destroy()
    }
  }
}

async function generatedMappingForLine (map, line) {
  return withConsumer(map, (consumer) => {
    let result
    consumer.eachMapping((mapping) => {
      if (mapping.generatedLine === line && mapping.generatedColumn === 0) {
        result = mapping
      }
    })
    return result
  })
}

describe('compose-mpx-sourcemap', () => {
  test('traces Metro app.js mappings back to original Mpx sources only', async () => {
    const metroOnlySource = 'node_modules/react-native/Libraries/Core/InitializeCore.js'
    const mpxSource = 'webpack://app/src/pages/index.mpx'
    const metroMap = createMap({
      file: 'main.jsbundle',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: '/project/ReactNativeProject/app.js',
          name: 'render'
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 3, column: 4 },
          source: metroOnlySource,
          name: 'init'
        }
      ],
      sourcesContent: {
        '/project/ReactNativeProject/app.js': 'require("./app")',
        [metroOnlySource]: 'InitializeCore();'
      }
    })
    const mpxMap = createMap({
      file: 'app.js',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 8, column: 2 },
          source: mpxSource,
          name: 'created'
        }
      ],
      sourcesContent: {
        [mpxSource]: '<template><view /></template>'
      }
    })

    const composedMap = await composeMpxSourceMap({
      metroMap,
      mpxMap,
      generatedSource: 'app.js'
    })

    expect(composedMap.sources).toContain(mpxSource)
    expect(composedMap.sources).toContain(metroOnlySource)
    expect(composedMap.sources).not.toContain('/project/ReactNativeProject/app.js')
    expect(composedMap.sourcesContent[composedMap.sources.indexOf(mpxSource)]).toBe('<template><view /></template>')
    expect(composedMap.sourcesContent[composedMap.sources.indexOf(metroOnlySource)]).toBe('InitializeCore();')

    const mpxMapping = await generatedMappingForLine(composedMap, 1)
    expect(mpxMapping.source).toBe(mpxSource)
    expect(mpxMapping.originalLine).toBe(8)
    expect(mpxMapping.originalColumn).toBe(2)
    expect(mpxMapping.name).toBe('created')

    const metroMapping = await generatedMappingForLine(composedMap, 2)
    expect(metroMapping.source).toBe(metroOnlySource)
    expect(metroMapping.originalLine).toBe(3)
    expect(metroMapping.originalColumn).toBe(4)
    expect(metroMapping.name).toBe('init')
  })

  test('fails when Metro map has no app.js mapping', async () => {
    const metroMap = createMap({
      file: 'main.jsbundle',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 'node_modules/react-native/index.js'
        }
      ]
    })
    const mpxMap = createMap({
      file: 'app.js',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 'src/app.mpx'
        }
      ]
    })

    await expect(composeMpxSourceMap({
      metroMap,
      mpxMap,
      generatedSource: 'app.js'
    })).rejects.toThrow(/No Metro mappings matched app\.js/)
  })

  test('fails clearly for missing and invalid sourcemap files', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-sourcemap-'))
    const metroMapPath = path.join(tempDir, 'metro.map')
    const mpxMapPath = path.join(tempDir, 'app.js.map')
    const outputPath = path.join(tempDir, 'out.map')

    await expect(composeMpxSourceMapFiles({
      metroMapPath,
      mpxMapPath,
      outputPath
    })).rejects.toThrow(/Metro sourcemap not found/)

    fs.writeFileSync(metroMapPath, '{ invalid', 'utf8')
    fs.writeFileSync(mpxMapPath, '{}', 'utf8')

    await expect(composeMpxSourceMapFiles({
      metroMapPath,
      mpxMapPath,
      outputPath
    })).rejects.toThrow(/Failed to parse Metro sourcemap/)
  })

  test('CLI exits non-zero when compose inputs are invalid', async () => {
    const scriptPath = path.resolve(__dirname, '../lib/rn/compose-mpx-sourcemap.js')

    await expect(execa.node(scriptPath, [
      '--metro-map',
      path.resolve(__dirname, 'missing-metro.map'),
      '--mpx-map',
      path.resolve(__dirname, 'missing-app.js.map')
    ])).rejects.toMatchObject({
      exitCode: 1
    })
  })
})

describe('RN project sourcemap generation config', () => {
  test('adds sourcemap dependencies and bundle scripts to RN package.json', () => {
    const pkg = {
      dependencies: {},
      devDependencies: {},
      scripts: {}
    }

    applyRnPackageConfig(pkg)

    expect(pkg.devDependencies).toHaveProperty('source-map', '^0.7.6')
    expect(pkg.devDependencies).not.toHaveProperty('@jridgewell/remapping')
    expect(pkg.scripts['bundle:ios']).toContain('--sourcemap-output ./ios/main.jsbundle.map')
    expect(pkg.scripts['bundle:ios']).toContain('node ./scripts/compose-mpx-sourcemap.js')
    expect(pkg.scripts['bundle:android']).toContain('--sourcemap-output android/app/src/main/assets/index.android.bundle.map')
    expect(pkg.scripts['bundle:android']).toContain('node ./scripts/compose-mpx-sourcemap.js')
  })

  test('copies compose script into generated RN project', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-project-'))

    copyRnSourcemapScript(tempDir)

    const targetPath = path.join(tempDir, 'scripts/compose-mpx-sourcemap.js')
    expect(fs.existsSync(targetPath)).toBe(true)
    expect(fs.readFileSync(targetPath, 'utf8')).toContain('composeMpxSourceMap')
  })
})
