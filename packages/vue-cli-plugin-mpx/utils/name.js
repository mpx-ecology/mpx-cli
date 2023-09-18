module.exports.getWebpackName = function (api, target, pluginConfig) {
  return [target.mode, api.service.mode, pluginConfig.env]
    .filter((v) => v !== undefined)
    .join('-')
}
