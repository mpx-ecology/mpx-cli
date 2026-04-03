const { hasYarn, hasPnpm3OrLater, execa } = require('@vue/cli-shared-utils')
const path = require('path')
const fs = require('fs-extra')
const { loadOptions } = require('@vue/cli/lib/options')
const PackageManager = require('@vue/cli/lib/util/ProjectPackageManager')

const RN_DEP = {
  '@d11/react-native-fast-image': '^8.6.12',
  '@react-native-async-storage/async-storage': '^2.2.0',
  '@react-native-community/netinfo': '^11.3.2',
  '@react-navigation/native': '^7.1.13',
  '@react-navigation/native-stack': '^7.2.1',
  'react-native-device-info': '^13.2.0',
  'react-native-gesture-handler': '^2.23.0',
  'react-native-get-location': '^5.0.0',
  'react-native-haptic-feedback': '^2.3.3',
  'react-native-linear-gradient': '^2.8.3',
  'react-native-reanimated': '3.16.7',
  'react-native-screens': '~4.18.0',
  'react-native-webview': '^13.13.2',
  'react-native-safe-area-context': '^4.10.9',
  'react-native-ble-manager': '^12.4.4',
  'react-native-wifi-reborn': '^4.13.6',
  react: '18.3.1',
  'react-native': '0.77.2',
  'react-native-video': '^6.11.0'
}

const RN_SCRIPTS = {
  'bundle:ios': 'react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ./ios/main.jsbundle --assets-dest ./ios',
  'bundle:android': 'react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/'
}

function updateJsonFile (filePath, updater) {
  const config = require(filePath)
  updater(config)
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
}

function updateJsModule (filePath, updater) {
  const config = require(filePath)
  updater(config)
  fs.writeFileSync(filePath, `module.exports = ${JSON.stringify(config, null, 2)};`)
}

function addArrayItem (arr, item) {
  if (!arr.includes(item)) {
    arr.push(item)
  }
}

async function createRnProject (targetDir, options) {
  const rnProjectPath = path.resolve(targetDir, 'ReactNativeProject')
  const packageManager =
    options.packageManager ||
    loadOptions().packageManager ||
    (hasYarn() ? 'yarn' : null) ||
    (hasPnpm3OrLater() ? 'pnpm' : 'npm')
  const pm = new PackageManager({
    context: rnProjectPath,
    forcePackageManager: packageManager
  })
  if (pm.bin === 'pnpm') throw new Error('暂不支持pnpm创建，请切换npm或yarn。eg: mpx create -m npm')
  await execa(
    'npx',
    [
      '@react-native-community/cli@^19.0.0',
      'init',
      'ReactNativeProject',
      '--version',
      '0.77.2',
      '--pm',
      pm.bin,
      '--skip-install',
      true,
      '--skip-git-init',
      true
    ],
    { stdio: 'inherit', cwd: targetDir }
  )

  const pkgPath = path.resolve(targetDir, 'ReactNativeProject', 'package.json')
  updateJsonFile(pkgPath, pkg => {
    Object.assign(pkg.dependencies, RN_DEP)
    Object.assign(pkg.scripts, RN_SCRIPTS)
  })

  const babelConfigPath = path.resolve(targetDir, 'ReactNativeProject', 'babel.config.js')
  updateJsModule(babelConfigPath, config => {
    if (!config.plugins) {
      config.plugins = []
    }
    addArrayItem(config.plugins, 'react-native-reanimated/plugin')
  })

  await pm.install()
}

module.exports.createRnProject = createRnProject
