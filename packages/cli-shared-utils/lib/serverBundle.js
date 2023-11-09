let serverBundle

const setServerBundle = (bundle) => {
  serverBundle = bundle
}

const getServerBundle = () => {
  return serverBundle
}

module.exports.setServerBundle = setServerBundle
module.exports.getServerBundle = getServerBundle
