module.exports.getWebpackName = function (api, target, pluginConfig) {
  return [target.mode, pluginConfig.env, api.service.mode]
    .filter((v) => v !== undefined)
    .join('-')
}
