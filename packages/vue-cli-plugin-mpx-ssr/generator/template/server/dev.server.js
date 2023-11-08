// nodejs服务
const express = require('express')
const path = require('path')
const { mfs } = require('@mpxjs/cli-shared-utils')
const fs = require('fs')
// 创建express实例和vue实例
const app = express()
// 创建渲染器 获得一个createBundleRenderer
const { createBundleRenderer } = require('vue-server-renderer')

const template = fs.readFileSync('../public/index.ssr.html', 'utf-8') // ssr模板文件
const axios = require('axios')

const getRenderer = async () => {
  const clientManifest = await axios.get(
    ' http://localhost:8081/vue-ssr-client-manifest.json'
  )
  // const bundlePath = path.join(
  //   // webpackConfig.output.path,
  //   'dist/web',
  //   'vue-ssr-server-bundle.json'
  // )
  const bundlePath = '/Users/didi/Documents/Work/Code/mpx-cli/packages/test/test-ssr/dist/web/vue-ssr-server-bundle.json'
  const serverManifest = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  console.log('11111serverManifest')
  return {
    clientManifest: clientManifest.data,
    serverManifest: serverManifest
  }
}

const startServer = async () => {
  // 前端请求返回数据
  app.get('*', async (req, res) => {
    try {
      const { clientManifest, serverManifest } = await getRenderer()
      const renderer = createBundleRenderer(serverManifest, {
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
