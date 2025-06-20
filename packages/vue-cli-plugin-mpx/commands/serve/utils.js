const WebpackDevServer = require('webpack-dev-server')
const launchEditorMiddleware = require('launch-editor-middleware')

const defaults = {
  host: '0.0.0.0',
  port: 8080,
  https: false
}

module.exports.createDevServer = async function (api, options, args, projectDevServerOptions, compiler) {
  const portfinder = require('portfinder')
  const prepareURLs = require('@vue/cli-service/lib/util/prepareURLs')
  const prepareProxy = require('@vue/cli-service/lib/util/prepareProxy')
  const isAbsoluteUrl = require('@vue/cli-service/lib/util/isAbsoluteUrl')

  const isInContainer = checkInContainer()
  const isProduction = process.env.NODE_ENV === 'production'

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

  return {
    server,
    urls,
    publicUrl,
    publicHost,
    localUrlForBrowser,
    isInContainer,
    protocol
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
