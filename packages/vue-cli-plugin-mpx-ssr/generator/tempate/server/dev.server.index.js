
// nodejs服务
const webpack = require('webpack')
const express = require('express')
const MemoryFS = require('memory-fs')
const path = require('path')
const fs = require('fs')
// 创建express实例和vue实例
const app = express()
const getWebpackConf = require('../build/getWebpackConf')
// 创建渲染器 获得一个createBundleRenderer
const { createBundleRenderer } = require('vue-server-renderer')

const template = fs.readFileSync('../src/index.template.html', 'utf-8') // ssr模板文件
const axios = require('axios')
const webpackConfig = getWebpackConf({
  mode: 'web',
  watch: true,
  subDir: '',
  production: false,
  WEBPACK_TARGET: 'node',
  srcMode: 'wx'
})
const serverCompiler = webpack(webpackConfig)

const mfs = new MemoryFS()
// 指定输出到的内存流中
serverCompiler.outputFileSystem = mfs

// 3、监听文件修改，实时编译获取最新的 vue-ssr-server-bundle.json
let bundle
serverCompiler.watch({}, (err, stats) => {
  if (err) {
    throw err
  }
  stats = stats.toJson()
  stats.errors.forEach(error => console.error(error))
  stats.warnings.forEach(warn => console.warn(warn))
  console.log('====', webpackConfig.output.path)
  const bundlePath = path.join(
    // webpackConfig.output.path,
    '/Users/didi/Documents/Work/Daily/mpx-2.9-ssr-hot/dist',
    'vue-ssr-server-bundle.json'
  )
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  console.log('new bundle generated')
})

const getRenderer = async () => {
  const clientManifest = await axios.get(
    'http://localhost:8080/vue-ssr-client-manifest.json'
  )
  return {
    clientManifest: clientManifest.data
  }
}

const startServer = async () => {
// 中间件处理静态文件请求
  //   app.use(express.static("../dist/client", { index: false })); // 为false是不让它渲染成dist/client/index.template.html
  // app.use(express.static('../dist/client'))
  // 前端请求返回数据
  app.get('*', async (req, res) => {
    try {
      const { clientManifest } = await getRenderer()
      const renderer = createBundleRenderer(bundle, {
        runInNewContext: false,
        template,
        clientManifest
      })
      const context = { url: req.url }
      renderer.renderToString(context, (err, html) => {
        if (err) {
          res.status(500).end('Internal Server Error')
          return
        }
        res.end(html)
      })
    } catch (error) {
      console.log(error)
      res.status(500).send('服务器内部错误')
    }
  })

  /* 服务启动 */
  const port = 8091
  app.listen(port, () => {
    console.log(`server started at localhost:${port}`)
  })
}
startServer()
