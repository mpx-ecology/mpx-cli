const Service = require('@vue/cli-service')

const { getServerBundle } = require('@mpxjs/cli-shared-utils')

process.env.CI = 't'

module.exports = Service

module.exports.getServerBundle = getServerBundle
