const fs = require('fs')
const path = require('path')

module.exports = function extendDocs (api, templateDir, data = {}) {
  api.render((files, render) => {
    for (const name of ['AGENTS.md', 'README.md']) {
      const section = render(fs.readFileSync(path.join(templateDir, name), 'utf8'), data).trim()
      const content = files[name] || ''
      if (content.includes(section)) continue
      const marker = '\n## 校验与交付'
      files[name] = name === 'AGENTS.md' && content.includes(marker)
        ? content.replace(marker, `\n${section}\n${marker}`)
        : `${content.trimEnd()}\n\n${section}\n`.trimStart()
    }
  })
}
