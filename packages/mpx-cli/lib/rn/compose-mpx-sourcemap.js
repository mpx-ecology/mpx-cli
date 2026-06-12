#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { SourceMapConsumer, SourceMapGenerator } = require('source-map')

function normalizeSourcePath (source) {
  return String(source || '')
    .replace(/\\/g, '/')
    .split('?')[0]
    .split('#')[0]
}

function isGeneratedSource (source, generatedSource) {
  const normalizedSource = normalizeSourcePath(source)
  const normalizedGeneratedSource = normalizeSourcePath(generatedSource)
  return normalizedSource === normalizedGeneratedSource ||
    normalizedSource.endsWith('/' + normalizedGeneratedSource)
}

async function createConsumer (map) {
  return new SourceMapConsumer(map)
}

function destroyConsumer (consumer) {
  if (consumer && consumer.destroy) {
    consumer.destroy()
  }
}

function addMapping (generator, mapping) {
  const nextMapping = {
    generated: {
      line: mapping.generatedLine,
      column: mapping.generatedColumn
    }
  }

  if (
    mapping.source != null &&
    mapping.originalLine != null &&
    mapping.originalColumn != null
  ) {
    nextMapping.original = {
      line: mapping.originalLine,
      column: mapping.originalColumn
    }
    nextMapping.source = mapping.source
    if (mapping.name != null) {
      nextMapping.name = mapping.name
    }
  }

  generator.addMapping(nextMapping)
}

function recordSourceContent (sourceContentBySource, consumer, source) {
  if (!source || sourceContentBySource.has(source)) return
  const content = consumer.sourceContentFor(source, true)
  if (content != null) {
    sourceContentBySource.set(source, content)
  }
}

function setSourceContents (generator, sourceContentBySource) {
  sourceContentBySource.forEach((content, source) => {
    generator.setSourceContent(source, content)
  })
}

async function composeMpxSourceMap (options) {
  const metroMap = options.metroMap
  const mpxMap = options.mpxMap
  const generatedSource = options.generatedSource || 'app.js'
  const sourceContentBySource = new Map()
  const generator = new SourceMapGenerator({ file: metroMap.file })
  const metroConsumer = await createConsumer(metroMap)
  const mpxConsumer = await createConsumer(mpxMap)
  let matchedAppMappings = 0
  let tracedMpxMappings = 0

  try {
    metroConsumer.eachMapping((mapping) => {
      if (!isGeneratedSource(mapping.source, generatedSource)) {
        addMapping(generator, mapping)
        recordSourceContent(sourceContentBySource, metroConsumer, mapping.source)
        return
      }

      matchedAppMappings++
      if (mapping.originalLine == null || mapping.originalColumn == null) {
        addMapping(generator, mapping)
        recordSourceContent(sourceContentBySource, metroConsumer, mapping.source)
        return
      }

      const original = mpxConsumer.originalPositionFor({
        line: mapping.originalLine,
        column: mapping.originalColumn
      })

      if (original.source == null || original.line == null || original.column == null) {
        addMapping(generator, mapping)
        recordSourceContent(sourceContentBySource, metroConsumer, mapping.source)
        return
      }

      tracedMpxMappings++
      addMapping(generator, {
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: original.line,
        originalColumn: original.column,
        source: original.source,
        name: original.name || mapping.name
      })
      recordSourceContent(sourceContentBySource, mpxConsumer, original.source)
    })

    if (matchedAppMappings === 0) {
      throw new Error(`No Metro mappings matched ${generatedSource}; sourcemap was not composed`)
    }
    if (tracedMpxMappings === 0) {
      throw new Error(`No ${generatedSource} mappings could be traced through Mpx sourcemap`)
    }

    setSourceContents(generator, sourceContentBySource)
    return generator.toJSON()
  } finally {
    destroyConsumer(metroConsumer)
    destroyConsumer(mpxConsumer)
  }
}

function readJsonMap (filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} sourcemap not found: ${filePath}`)
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Failed to parse ${label} sourcemap: ${filePath}\n${error.message}`)
  }
}

async function composeMpxSourceMapFiles (options) {
  const metroMapPath = options.metroMapPath
  const mpxMapPath = options.mpxMapPath
  const outputPath = options.outputPath || metroMapPath
  const metroMap = readJsonMap(metroMapPath, 'Metro')
  const mpxMap = readJsonMap(mpxMapPath, 'Mpx')
  const composedMap = await composeMpxSourceMap({
    metroMap,
    mpxMap,
    generatedSource: options.generatedSource,
    onWarn: options.onWarn
  })
  const tempPath = `${outputPath}.${process.pid}.${Date.now()}.tmp`

  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(tempPath, JSON.stringify(composedMap), 'utf8')
    fs.renameSync(tempPath, outputPath)
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    throw error
  }

  return composedMap
}

function parseArgs (argv) {
  const options = {
    generatedSource: 'app.js'
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const value = argv[i + 1]
    if (arg === '--metro-map') {
      options.metroMapPath = value
      i++
    } else if (arg === '--mpx-map') {
      options.mpxMapPath = value
      i++
    } else if (arg === '--output') {
      options.outputPath = value
      i++
    } else if (arg === '--generated-source') {
      options.generatedSource = value
      i++
    } else if (arg === '--allow-failure') {
      options.allowFailure = true
    } else if (arg === '--help' || arg === '-h') {
      options.help = true
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (options.help || !options.metroMapPath || !options.mpxMapPath) {
    throw new Error('Usage: node ./scripts/compose-mpx-sourcemap.js --metro-map <metro.map> --mpx-map <app.js.map> [--output <output.map>] [--generated-source app.js] [--allow-failure]')
  }

  if (!options.outputPath) {
    options.outputPath = options.metroMapPath
  }

  return options
}

async function runCli (argv) {
  const options = parseArgs(argv)
  try {
    await composeMpxSourceMapFiles({
      metroMapPath: options.metroMapPath,
      mpxMapPath: options.mpxMapPath,
      outputPath: options.outputPath,
      generatedSource: options.generatedSource,
      onWarn: (message) => console.warn(`[mpx sourcemap] ${message}`)
    })
  } catch (error) {
    if (!options.allowFailure) {
      throw error
    }
    console.warn(`[mpx sourcemap] ${error.message}`)
    console.warn('[mpx sourcemap] Compose failed; keep Metro sourcemap')
  }
}

if (require.main === module) {
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(`[mpx sourcemap] ${error.message}`)
    process.exitCode = 1
  })
}

module.exports = {
  composeMpxSourceMap,
  composeMpxSourceMapFiles,
  isGeneratedSource,
  normalizeSourcePath,
  parseArgs,
  runCli
}
