const fs = require('fs')
const path = require('path')
const { Buffer } = require('buffer')
const { SourceMapConsumer } = require('source-map')
const {
  composeMpxSourceMap,
  isGeneratedSource,
  normalizeSourcePath
} = require('./compose-mpx-sourcemap')

const warnedMessages = new Set()

function defaultWarn (message) {
  console.warn(`[mpx sourcemap] ${message}`)
}

function warnOnce (warn, message) {
  if (warnedMessages.has(message)) return
  warnedMessages.add(message)
  warn(message)
}

function parsePathname (req) {
  try {
    return new URL(req.url || '', 'http://localhost').pathname || ''
  } catch (error) {
    return ''
  }
}

function shouldHandleMapRequest (req) {
  return req.method === 'GET' && parsePathname(req).endsWith('.map')
}

function shouldHandleSymbolicateRequest (req) {
  return req.method === 'POST' && parsePathname(req) === '/symbolicate'
}

function readMpxMap (mpxMapPath) {
  if (!fs.existsSync(mpxMapPath)) {
    throw new Error(`Mpx sourcemap not found: ${mpxMapPath}`)
  }

  try {
    return JSON.parse(fs.readFileSync(mpxMapPath, 'utf8'))
  } catch (error) {
    throw new Error(`Failed to parse Mpx sourcemap: ${mpxMapPath}\n${error.message}`)
  }
}

function toBuffer (chunk, encoding) {
  if (Buffer.isBuffer(chunk)) return chunk
  return Buffer.from(String(chunk), typeof encoding === 'string' ? encoding : undefined)
}

function setJsonHeaders (res, body) {
  if (res.headersSent) return
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Length', Buffer.byteLength(body))
  }
}

function interceptResponseBody (res, transformBody) {
  const originalWrite = res.write.bind(res)
  const originalEnd = res.end.bind(res)
  const chunks = []

  res.write = function (chunk, encoding, cb) {
    if (chunk) {
      chunks.push(toBuffer(chunk, encoding))
    }
    if (typeof cb === 'function') cb()
    return true
  }

  res.end = function (chunk, encoding, cb) {
    if (typeof encoding === 'function') {
      cb = encoding
      encoding = undefined
    }
    if (chunk) {
      chunks.push(toBuffer(chunk, encoding))
    }

    const originalBody = Buffer.concat(chunks).toString()
    Promise.resolve(transformBody(originalBody))
      .then((body) => {
        setJsonHeaders(res, body)
        originalEnd(body, 'utf8', cb)
      })
      .catch(() => {
        originalWrite(Buffer.concat(chunks))
        originalEnd(null, undefined, cb)
      })
  }
}

async function traceFrameToMpxSource (frame, mpxMap, generatedSource) {
  if (!frame || !isGeneratedSource(frame.file, generatedSource)) return frame
  if (typeof frame.lineNumber !== 'number') return frame

  const consumer = await new SourceMapConsumer(mpxMap)
  try {
    const original = consumer.originalPositionFor({
      line: frame.lineNumber,
      column: typeof frame.column === 'number' ? frame.column : 0
    })

    if (original.source == null || original.line == null || original.column == null) {
      return frame
    }

    return {
      ...frame,
      file: original.source,
      lineNumber: original.line,
      column: original.column,
      methodName: original.name || frame.methodName
    }
  } finally {
    if (consumer.destroy) {
      consumer.destroy()
    }
  }
}

function platformGeneratedSource (source) {
  const match = normalizeSourcePath(source).match(/(?:^|\/)(mpx-build\/(?:ios|android|harmony)\/app\.js)$/)
  return match && match[1]
}

function resolveMpxMap (source, options, mapCache) {
  const generatedSource = options.generatedSource || platformGeneratedSource(source) || 'app.js'
  const mpxMapPath = options.mpxMapPath || path.resolve(options.projectRoot || process.cwd(), `${generatedSource}.map`)
  if (mapCache && mapCache.has(mpxMapPath)) {
    return { mpxMap: mapCache.get(mpxMapPath), generatedSource }
  }
  const mpxMap = readMpxMap(mpxMapPath)
  if (mapCache) mapCache.set(mpxMapPath, mpxMap)
  return { mpxMap, generatedSource }
}

async function composeMapResponse (body, options) {
  const metroMap = JSON.parse(body)
  const source = (metroMap.sources || []).find(platformGeneratedSource)
  const { mpxMap, generatedSource } = resolveMpxMap(source, options)
  const composedMap = await composeMpxSourceMap({
    metroMap,
    mpxMap,
    generatedSource
  })
  return JSON.stringify(composedMap)
}

async function composeSymbolicateResponse (body, options) {
  const response = JSON.parse(body)
  const stackKey = response && Array.isArray(response.stack) ? 'stack' : 'symbolicatedStack'
  if (!response || !Array.isArray(response[stackKey])) {
    throw new Error('Metro symbolicate response does not contain a stack')
  }

  const originalStack = response[stackKey]
  const mapCache = new Map()
  const hasPlatformSource = originalStack.some((frame) => frame && platformGeneratedSource(frame.file))
  response[stackKey] = await Promise.all(
    originalStack.map((frame) => {
      if (hasPlatformSource && (!frame || !platformGeneratedSource(frame.file))) return frame
      if (!frame || !isGeneratedSource(frame.file, options.generatedSource || 'app.js')) return frame
      const { mpxMap, generatedSource } = resolveMpxMap(frame.file, options, mapCache)
      return traceFrameToMpxSource(frame, mpxMap, generatedSource)
    })
  )
  // Metro's code frame refers to generated JS; do not show it beside a remapped Mpx frame.
  if (response.codeFrame && originalStack.some((frame, index) =>
    frame && frame.file === response.codeFrame.fileName && frame.file !== response[stackKey][index].file
  )) {
    response.codeFrame = null
  }
  return JSON.stringify(response)
}

function createMpxSourcemapMiddleware (options = {}) {
  const warn = options.warn || defaultWarn

  return function enhanceMiddleware (middleware) {
    return function mpxSourcemapMiddleware (req, res, next) {
      const isMapRequest = shouldHandleMapRequest(req)
      const isSymbolicateRequest = shouldHandleSymbolicateRequest(req)

      if (!isMapRequest && !isSymbolicateRequest) {
        return middleware(req, res, next)
      }

      interceptResponseBody(res, async (body) => {
        try {
          if (isMapRequest) {
            return await composeMapResponse(body, options)
          }
          return await composeSymbolicateResponse(body, options)
        } catch (error) {
          warnOnce(warn, error.message)
          return body
        }
      })

      return middleware(req, res, next)
    }
  }
}

const enhanceMiddleware = createMpxSourcemapMiddleware()

module.exports = {
  createMpxSourcemapMiddleware,
  enhanceMiddleware,
  traceFrameToMpxSource
}
