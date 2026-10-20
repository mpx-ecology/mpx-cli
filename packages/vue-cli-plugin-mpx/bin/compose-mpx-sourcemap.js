#!/usr/bin/env node

require('../utils/compose-mpx-sourcemap').runCli(process.argv.slice(2)).catch((error) => {
  console.error(`[mpx sourcemap] ${error.message}`)
  process.exitCode = 1
})
