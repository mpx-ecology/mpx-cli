
// nodejs服务
const express = require('express')
const fs = require('fs')
// 创建express实例和vue实例
const app = express()

// 创建渲染器 获得一个createBundleRenderer
const { createBundleRenderer } = require('vue-server-renderer')
const serverBundle = require('../dist/web/vue-ssr-server-bundle.json')
const clientManifest = require('../dist/web/vue-ssr-client-manifest.json')
const template = fs.readFileSync('../public/index.ssr.html', 'utf-8') // ssr模板文件

const startServer = async () => {
  // 前端请求返回数据
  app.get('*', async (req, res) => {
    try {
      const renderer = createBundleRenderer(serverBundle, {
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
