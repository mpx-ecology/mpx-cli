const os = require('os')
const path = require('path')
const { Buffer } = require('buffer')
const fs = require('fs-extra')
const execa = require('execa')
const { SourceMapConsumer, SourceMapGenerator } = require('source-map')
const {
  composeMpxSourceMap,
  composeMpxSourceMapFiles
} = require('../lib/rn/compose-mpx-sourcemap')
const {
  createMpxSourcemapMiddleware
} = require('../lib/rn/metro-mpx-sourcemap-middleware')
const {
  applyRnPackageConfig,
  copyRnSourcemapScript,
  writeRnMetroConfig
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

function writeMapFile (filePath, map) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(map), 'utf8')
}

function runMiddlewareRequest ({ url, method = 'GET', body, mpxMapPath, warn = function () {}, contentType = 'application/json' }) {
  return new Promise((resolve, reject) => {
    const middleware = (req, res) => {
      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Length', Buffer.byteLength(body))
      res.end(body)
    }
    const enhancedMiddleware = createMpxSourcemapMiddleware({ mpxMapPath, warn })(middleware)
    const chunks = []
    const headers = {}
    const res = {
      statusCode: 200,
      setHeader (name, value) {
        headers[name.toLowerCase()] = String(value)
      },
      getHeader (name) {
        return headers[name.toLowerCase()]
      },
      removeHeader (name) {
        delete headers[name.toLowerCase()]
      },
      writeHead (statusCode, nextHeaders) {
        this.statusCode = statusCode
        Object.keys(nextHeaders || {}).forEach((name) => {
          this.setHeader(name, nextHeaders[name])
        })
      },
      write (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
      },
      end (chunk) {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
        }
        resolve({
          body: Buffer.concat(chunks).toString(),
          headers,
          statusCode: this.statusCode
        })
      }
    }

    try {
      enhancedMiddleware({ method, url }, res, reject)
    } catch (error) {
      reject(error)
    }
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

  test('keeps untraced app.js fallback mappings when some mappings trace successfully', async () => {
    const mpxSource = 'webpack://app/src/pages/index.mpx'
    const appSource = '/project/ReactNativeProject/app.js'
    const metroMap = createMap({
      file: 'main.jsbundle',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 10 },
          source: appSource,
          name: 'render'
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 1, column: 0 },
          source: appSource,
          name: 'bootstrap'
        }
      ],
      sourcesContent: {
        [appSource]: 'var context = this; render();'
      }
    })
    const mpxMap = createMap({
      file: 'app.js',
      mappings: [
        {
          generated: { line: 1, column: 10 },
          original: { line: 8, column: 2 },
          source: mpxSource,
          name: 'render'
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

    const tracedMapping = await generatedMappingForLine(composedMap, 1)
    expect(tracedMapping.source).toBe(mpxSource)
    expect(tracedMapping.originalLine).toBe(8)
    expect(tracedMapping.originalColumn).toBe(2)

    const fallbackMapping = await generatedMappingForLine(composedMap, 2)
    expect(fallbackMapping.source).toBe(appSource)
    expect(fallbackMapping.originalLine).toBe(1)
    expect(fallbackMapping.originalColumn).toBe(0)
    expect(fallbackMapping.name).toBe('bootstrap')
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

  test('CLI can keep Metro sourcemap and exit zero when compose fails', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-cli-fallback-'))
    const scriptPath = path.resolve(__dirname, '../lib/rn/compose-mpx-sourcemap.js')
    const metroMapPath = path.join(tempDir, 'index.android.bundle.map')
    const metroMap = createMap({
      file: 'index.android.bundle',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 'app.js'
        }
      ],
      sourcesContent: {
        'app.js': 'require("./app")'
      }
    })
    writeMapFile(metroMapPath, metroMap)

    const result = await execa.node(scriptPath, [
      '--metro-map',
      metroMapPath,
      '--mpx-map',
      path.join(tempDir, 'missing-app.js.map'),
      '--output',
      metroMapPath,
      '--allow-failure'
    ])

    expect(result.exitCode).toBe(0)
    expect(result.stderr).toMatch(/keep Metro sourcemap/)
    expect(JSON.parse(fs.readFileSync(metroMapPath, 'utf8')).sources).toEqual(metroMap.sources)
  })
})

describe('metro-mpx-sourcemap-middleware', () => {
  test('composes Metro .map responses with the latest Mpx app.js.map', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-dev-map-'))
    const mpxMapPath = path.join(tempDir, 'app.js.map')
    const metroOnlySource = 'node_modules/react-native/index.js'
    const mpxSource = 'src/pages/index.mpx'
    const metroMap = createMap({
      file: 'index.bundle',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: path.join(tempDir, 'app.js')
        },
        {
          generated: { line: 2, column: 0 },
          original: { line: 4, column: 1 },
          source: metroOnlySource
        }
      ],
      sourcesContent: {
        [path.join(tempDir, 'app.js')]: 'require("./app")',
        [metroOnlySource]: 'module.exports = require("react-native")'
      }
    })
    const mpxMap = createMap({
      file: 'app.js',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 7, column: 3 },
          source: mpxSource
        }
      ],
      sourcesContent: {
        [mpxSource]: '<template><view /></template>'
      }
    })
    writeMapFile(mpxMapPath, mpxMap)

    const result = await runMiddlewareRequest({
      url: '/index.bundle.map?platform=ios&dev=true',
      body: JSON.stringify(metroMap),
      mpxMapPath
    })
    const composedMap = JSON.parse(result.body)

    expect(composedMap.sources).toContain(mpxSource)
    expect(composedMap.sources).toContain(metroOnlySource)
    expect(composedMap.sources).not.toContain(path.join(tempDir, 'app.js'))
    expect(result.headers['content-type']).toBe('application/json')
    expect(Number(result.headers['content-length'])).toBe(Buffer.byteLength(result.body))
  })

  test('passes through non sourcemap requests unchanged', async () => {
    const body = 'console.log("bundle")'
    const result = await runMiddlewareRequest({
      url: '/index.bundle?platform=ios&dev=true',
      body,
      mpxMapPath: path.resolve(__dirname, 'missing-app.js.map'),
      contentType: 'application/javascript'
    })

    expect(result.body).toBe(body)
    expect(result.headers['content-type']).toBe('application/javascript')
  })

  test('returns original Metro map and warns when app.js.map cannot be read', async () => {
    const warnings = []
    const metroMap = createMap({
      file: 'index.bundle',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 'app.js'
        }
      ]
    })

    const result = await runMiddlewareRequest({
      url: '/index.bundle.map?platform=android&dev=true',
      body: JSON.stringify(metroMap),
      mpxMapPath: path.resolve(__dirname, 'missing-app.js.map'),
      warn: (message) => warnings.push(message)
    })

    expect(JSON.parse(result.body).sources).toEqual(metroMap.sources)
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toMatch(/Mpx sourcemap not found/)
  })

  test('returns original Metro map and warns when app.js.map is invalid', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-invalid-map-'))
    const mpxMapPath = path.join(tempDir, 'app.js.map')
    const warnings = []
    const metroMap = createMap({
      file: 'index.bundle',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 1, column: 0 },
          source: 'app.js'
        }
      ]
    })
    fs.writeFileSync(mpxMapPath, '{ invalid', 'utf8')

    const result = await runMiddlewareRequest({
      url: '/index.bundle.map?platform=android&dev=true',
      body: JSON.stringify(metroMap),
      mpxMapPath,
      warn: (message) => warnings.push(message)
    })

    expect(JSON.parse(result.body).sources).toEqual(metroMap.sources)
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toMatch(/Failed to parse Mpx sourcemap/)
  })

  test('returns original Metro map and warns when Metro map response is invalid', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-invalid-response-'))
    const mpxMapPath = path.join(tempDir, 'app.js.map')
    const warnings = []
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
    writeMapFile(mpxMapPath, mpxMap)

    const result = await runMiddlewareRequest({
      url: '/index.bundle.map?platform=ios&dev=true',
      body: '{ invalid',
      mpxMapPath,
      warn: (message) => warnings.push(message)
    })

    expect(result.body).toBe('{ invalid')
    expect(warnings.length).toBe(1)
  })

  test('rewrites app.js symbolicated frames to original Mpx source frames', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-symbolicate-'))
    const mpxMapPath = path.join(tempDir, 'app.js.map')
    const mpxSource = 'src/pages/index.mpx'
    const mpxMap = createMap({
      file: 'app.js',
      mappings: [
        {
          generated: { line: 1, column: 0 },
          original: { line: 9, column: 4 },
          source: mpxSource,
          name: 'mounted'
        }
      ]
    })
    writeMapFile(mpxMapPath, mpxMap)

    const result = await runMiddlewareRequest({
      url: '/symbolicate',
      method: 'POST',
      body: JSON.stringify({
        symbolicatedStack: [
          {
            file: path.join(tempDir, 'app.js'),
            lineNumber: 1,
            column: 0,
            methodName: 'render'
          },
          {
            file: path.join(tempDir, 'app.js'),
            lineNumber: 99,
            column: 0,
            methodName: 'unmapped'
          },
          {
            file: 'node_modules/react-native/index.js',
            lineNumber: 2,
            column: 1,
            methodName: 'require'
          }
        ]
      }),
      mpxMapPath
    })
    const symbolicated = JSON.parse(result.body)

    expect(symbolicated.symbolicatedStack[0]).toMatchObject({
      file: mpxSource,
      lineNumber: 9,
      column: 4,
      methodName: 'mounted'
    })
    expect(symbolicated.symbolicatedStack[1]).toMatchObject({
      file: path.join(tempDir, 'app.js'),
      lineNumber: 99,
      column: 0,
      methodName: 'unmapped'
    })
    expect(symbolicated.symbolicatedStack[2]).toMatchObject({
      file: 'node_modules/react-native/index.js',
      lineNumber: 2,
      column: 1,
      methodName: 'require'
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
    expect(pkg.scripts['bundle:ios']).toContain('npm run compose-sourcemap:ios')
    expect(pkg.scripts['bundle:ios']).not.toContain('node ./scripts/compose-mpx-sourcemap.js')
    expect(pkg.scripts['bundle:android']).toContain('--sourcemap-output android/app/src/main/assets/index.android.bundle.map')
    expect(pkg.scripts['bundle:android']).toContain('npm run compose-sourcemap:android')
    expect(pkg.scripts['bundle:android']).not.toContain('node ./scripts/compose-mpx-sourcemap.js')
    expect(pkg.scripts['compose-sourcemap:ios']).toContain('node ./scripts/compose-mpx-sourcemap.js')
    expect(pkg.scripts['compose-sourcemap:ios']).toContain('--metro-map ./ios/main.jsbundle.map')
    expect(pkg.scripts['compose-sourcemap:ios']).toContain('--allow-failure')
    expect(pkg.scripts['compose-sourcemap:android']).toContain('node ./scripts/compose-mpx-sourcemap.js')
    expect(pkg.scripts['compose-sourcemap:android']).toContain('--metro-map android/app/src/main/assets/index.android.bundle.map')
    expect(pkg.scripts['compose-sourcemap:android']).toContain('--allow-failure')
  })

  test('copies compose script into generated RN project', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-project-'))

    copyRnSourcemapScript(tempDir)

    const targetPath = path.join(tempDir, 'scripts/compose-mpx-sourcemap.js')
    const middlewarePath = path.join(tempDir, 'scripts/metro-mpx-sourcemap-middleware.js')
    expect(fs.existsSync(targetPath)).toBe(true)
    expect(fs.existsSync(middlewarePath)).toBe(true)
    expect(fs.readFileSync(targetPath, 'utf8')).toContain('composeMpxSourceMap')
    expect(fs.readFileSync(middlewarePath, 'utf8')).toContain('enhanceMiddleware')
  })

  test('writes metro config with Mpx sourcemap middleware enabled', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-rn-metro-config-'))

    writeRnMetroConfig(tempDir)

    const metroConfigPath = path.join(tempDir, 'metro.config.js')
    const metroConfig = fs.readFileSync(metroConfigPath, 'utf8')
    expect(metroConfig).toContain("require('./scripts/metro-mpx-sourcemap-middleware')")
    expect(metroConfig).toContain('enhanceMiddleware')
  })
})
