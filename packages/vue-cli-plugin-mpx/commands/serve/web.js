const { hasProjectYarn, hasProjectPnpm } = require('@vue/cli-shared-utils')
const { getReporter } = require('../../utils/reporter')
const { extractResultFromStats } = require('../../utils/output')
const { resolveServeWebpackConfigByTarget } = require('../../config')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils/lib')

const defaults = {
  host: '0.0.0.0',
  port: 8080,
  https: false
}

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.serveWeb = async (api, options, args) => {
  // although this is primarily a dev server, it is possible that we
  // are running it in a mode with a production env, e.g. in E2E tests.
  const isInContainer = checkInContainer()
  const isProduction = process.env.NODE_ENV === 'production'

  const { chalk } = require('@vue/cli-shared-utils')
  const webpack = require('webpack')
  const WebpackDevServer = require('webpack-dev-server')
  const portfinder = require('portfinder')
  const prepareURLs = require('@vue/cli-service/lib/util/prepareURLs')
  const prepareProxy = require('@vue/cli-service/lib/util/prepareProxy')
  const launchEditorMiddleware = require('launch-editor-middleware')
  const isAbsoluteUrl = require('@vue/cli-service/lib/util/isAbsoluteUrl')

  // resolve webpack config
  const target = getCurrentTarget()
  const webpackConfig = resolveServeWebpackConfigByTarget(
    api,
    options,
    target,
    args
  )
  const projectDevServerOptions = webpackConfig.devServer || {}

  // resolve server options
  const protocol = 'http'
  const host = process.env.HOST || projectDevServerOptions.host || defaults.host
  portfinder.basePort =
    process.env.PORT || projectDevServerOptions.port || defaults.port
  const port = await portfinder.getPortPromise()
  const rawPublicUrl = args.public || projectDevServerOptions.public
  const publicUrl = rawPublicUrl
    ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
      ? rawPublicUrl
      : `${protocol}://${rawPublicUrl}`
    : null
  const publicHost = publicUrl
    ? /^[a-zA-Z]+:\/\/([^/?#]+)/.exec(publicUrl)[1]
    : undefined

  const urls = prepareURLs(
    protocol,
    host,
    port,
    isAbsoluteUrl(options.publicPath) ? '/' : options.publicPath
  )
  const localUrlForBrowser = publicUrl || urls.localUrlForBrowser

  const proxySettings = prepareProxy(
    projectDevServerOptions.proxy,
    api.resolve('public')
  )

  // inject dev & hot-reload middleware entries
  let webSocketURL
  if (!isProduction) {
    if (publicHost) {
      // explicitly configured via devServer.public
      webSocketURL = {
        protocol: protocol === 'https' ? 'wss' : 'ws',
        hostname: publicHost,
        port
      }
    } else if (isInContainer) {
      // can't infer public network url if inside a container
      // infer it from the browser instead
      webSocketURL = 'auto://0.0.0.0:0/ws'
    } else {
      // otherwise infer the url from the config
      webSocketURL = {
        protocol: protocol === 'https' ? 'wss' : 'ws',
        hostname: urls.lanUrlForConfig || 'localhost',
        port
      }
    }
  }

  // create compiler
  const compiler = webpack(webpackConfig)

  // create server
  const server = new WebpackDevServer(
    Object.assign(
      {
        historyApiFallback: {
          disableDotRule: true,
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          rewrites: genHistoryApiFallbackRewrites(
            options.publicPath,
            options.pages
          )
        },
        hot: !isProduction
      },
      projectDevServerOptions,
      {
        host,
        port,
        proxy: proxySettings,

        static: {
          directory: api.resolve('public'),
          publicPath: options.publicPath,
          watch: !isProduction,

          ...projectDevServerOptions.static
        },

        client: {
          webSocketURL,

          logging: 'none',
          overlay: isProduction // TODO disable this
            ? false
            : { warnings: false, errors: true },
          progress: !process.env.VUE_CLI_TEST,

          ...projectDevServerOptions.client
        },
        setupExitSignals: true,

        setupMiddlewares (middlewares, devServer) {
          // launch editor support.
          // this works with vue-devtools & @vue/cli-overlay
          devServer.app.use(
            '/__open-in-editor',
            launchEditorMiddleware(() =>
              console.log(
                'To specify an editor, specify the EDITOR env variable or ' +
                  'add "editor" field to your Vue project config.\n'
              )
            )
          )

          // allow other plugins to register middlewares, e.g. PWA
          // todo: migrate to the new API interface
          api.service.devServerConfigFns.forEach((fn) =>
            fn(devServer.app, devServer)
          )

          if (projectDevServerOptions.setupMiddlewares) {
            return projectDevServerOptions.setupMiddlewares(
              middlewares,
              devServer
            )
          }

          return middlewares
        },
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    ),
    compiler
  )

  return new Promise((resolve, reject) => {
    // handle compiler error
    compiler.hooks.failed.tap('mpx-cli-service serve', (msg) => {
      reject(msg)
    })

    // log instructions & open browser on first compilation complete
    let isFirstCompile = true
    compiler.hooks.afterDone.tap('vue-cli-service serve', (stats) => {
      const hasErrors = stats.hasErrors()
      const hasWarnings = stats.hasWarnings()
      const status = hasErrors
        ? 'with some errors'
        : hasWarnings
          ? 'with some warnings'
          : 'successfully'

      const result = []

      if (!hasErrors) {
        const networkUrl = publicUrl
          ? publicUrl.replace(/([^/])$/, '$1/')
          : urls.lanUrlForTerminal

        const logChunk = [
          '',
          'App running at:',
          `  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`
        ]
        if (!isInContainer) {
          logChunk.push(`  - Network: ${chalk.cyan(networkUrl)}`)
        } else {
          logChunk.push('')
          logChunk.push(
            chalk.yellow(
              '  It seems you are running Vue CLI inside a container.'
            )
          )
          if (!publicUrl && options.publicPath && options.publicPath !== '/') {
            logChunk.push('')
            logChunk.push(
              chalk.yellow(
                '  Since you are using a non-root publicPath, the hot-reload socket'
              )
            )
            logChunk.push(
              chalk.yellow(
                '  will not be able to infer the correct URL to connect. You should'
              )
            )
            logChunk.push(
              chalk.yellow(
                `  explicitly specify the URL via ${chalk.blue(
                  'devServer.public'
                )}.`
              )
            )
            logChunk.push('')
          }
          logChunk.push(
            chalk.yellow(
              `  Access the dev server via ${chalk.cyan(
                `${protocol}://localhost:<your container's external mapped port>${options.publicPath}`
              )}`
            )
          )
        }
        logChunk.push('')

        if (isFirstCompile) {
          isFirstCompile = false

          if (!isProduction) {
            const buildCommand = hasProjectYarn(api.getCwd())
              ? 'yarn build'
              : hasProjectPnpm(api.getCwd())
                ? 'pnpm run build'
                : 'npm run build'
            logChunk.push('  Note that the development build is not optimized.')
            logChunk.push(
              `  To create a production build, run ${chalk.cyan(buildCommand)}.`
            )
          } else {
            logChunk.push('  App is served in production mode.')
            logChunk.push('  Note this is for preview or E2E testing only.')
          }
          logChunk.push()

          // resolve returned Promise
          // so other commands can do api.service.run('serve').then(...)
          resolve({
            server,
            url: localUrlForBrowser
          })
        } else if (process.env.VUE_CLI_TEST) {
          // signal for test to check HMR
          logChunk.push('App updated')
        }
        result.push(logChunk.map(v => `  ${v}`).join('\n'))
      }

      result.push('', extractResultFromStats(stats, {
        assets: false
      }))

      getReporter()._renderStates([
        {
          message: `Compiled ${status}`,
          color: hasErrors ? 'red' : 'green',
          progress: 100,
          hasErrors: hasErrors,
          result: result.join('\n')
        }
      ])
    })

    server.start().catch((err) => reject(err))
  })
}

// https://stackoverflow.com/a/20012536
function checkInContainer () {
  if ('CODESANDBOX_SSE' in process.env) {
    return true
  }
  const fs = require('fs')
  if (fs.existsSync('/proc/1/cgroup')) {
    const content = fs.readFileSync('/proc/1/cgroup', 'utf-8')
    return /:\/(lxc|docker|kubepods(\.slice)?)\//.test(content)
  }
}

function genHistoryApiFallbackRewrites (baseUrl, pages = {}) {
  const path = require('path')
  const multiPageRewrites = Object.keys(pages)
    // sort by length in reversed order to avoid overrides
    // eg. 'page11' should appear in front of 'page1'
    .sort((a, b) => b.length - a.length)
    .map((name) => ({
      from: new RegExp(`^/${name}`),
      to: path.posix.join(baseUrl, pages[name].filename || `${name}.html`)
    }))
  return [
    ...multiPageRewrites,
    { from: /./, to: path.posix.join(baseUrl, 'index.html') }
  ]
}
