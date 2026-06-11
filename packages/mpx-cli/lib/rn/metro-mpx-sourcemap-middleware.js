const fs = require('fs')
const path = require('path')
const { Buffer } = require('buffer')
const { SourceMapConsumer } = require('source-map')
const {
  composeMpxSourceMap,
  isGeneratedSource
} = require('./compose-mpx-sourcemap')

const DEFAULT_MPX_MAP_PATH = path.resolve(__dirname, '../app.js.map')
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

async function composeMapResponse (body, mpxMap, warn, generatedSource) {
  const metroMap = JSON.parse(body)
  const composedMap = await composeMpxSourceMap({
    metroMap,
    mpxMap,
    generatedSource,
    onWarn: (message) => warnOnce(warn, message)
  })
  return JSON.stringify(composedMap)
}

async function composeSymbolicateResponse (body, mpxMap, generatedSource) {
  const response = JSON.parse(body)
  if (!response || !Array.isArray(response.symbolicatedStack)) {
    throw new Error('Metro symbolicate response does not contain symbolicatedStack')
  }

  response.symbolicatedStack = await Promise.all(
    response.symbolicatedStack.map((frame) => traceFrameToMpxSource(frame, mpxMap, generatedSource))
  )
  return JSON.stringify(response)
}

function createMpxSourcemapMiddleware (options = {}) {
  const mpxMapPath = options.mpxMapPath || DEFAULT_MPX_MAP_PATH
  const generatedSource = options.generatedSource || 'app.js'
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
          const mpxMap = readMpxMap(mpxMapPath)
          if (isMapRequest) {
            return await composeMapResponse(body, mpxMap, warn, generatedSource)
          }
          return await composeSymbolicateResponse(body, mpxMap, generatedSource)
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
