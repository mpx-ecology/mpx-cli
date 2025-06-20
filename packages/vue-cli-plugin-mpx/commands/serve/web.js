const { hasProjectYarn, hasProjectPnpm } = require('@vue/cli-shared-utils')
const { getReporter } = require('../../utils/reporter')
const { extractResultFromStats } = require('../../utils/output')
const { resolveServeWebpackConfigByTarget } = require('../../config')
const { getCurrentTarget } = require('@mpxjs/cli-shared-utils/lib')
const { createDevServer } = require('./utils')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports.serveWeb = async (api, options, args) => {
  // although this is primarily a dev server, it is possible that we
  // are running it in a mode with a production env, e.g. in E2E tests.
  const isProduction = process.env.NODE_ENV === 'production'

  const { chalk } = require('@vue/cli-shared-utils')
  const webpack = require('webpack')

  // resolve webpack config
  const target = getCurrentTarget()
  const webpackConfig = await resolveServeWebpackConfigByTarget(
    api,
    options,
    target,
    args
  )
  // create compiler
  const compiler = webpack(webpackConfig)

  // resolve devServer options
  const projectDevServerOptions = webpackConfig.devServer || {}

  // create dev server instance
  const {
    server,
    publicUrl,
    urls,
    localUrlForBrowser,
    isInContainer,
    protocol
  } = await createDevServer(api, options, args, projectDevServerOptions, compiler)

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
        result.push(logChunk.map((v) => `  ${v}`).join('\n'))
      }

      result.push(
        '',
        extractResultFromStats(stats, {
          assets: false
        })
      )

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
