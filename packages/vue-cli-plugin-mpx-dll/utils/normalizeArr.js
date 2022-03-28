module.exports = function normalizeArr (arrCfg) {
  if (Array.isArray(arrCfg) && arrCfg.length) {
    return arrCfg
  } else if (arrCfg) {
    return [arrCfg]
  }
  return []
}
