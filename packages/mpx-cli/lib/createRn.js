const { hasYarn, execa, chalk } = require('@vue/cli-shared-utils')
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
  'react-native-video': '^6.11.0',
  'react-native-vision-camera': '^5.0.10'
}

const RN_DEV_DEP = {
  'source-map': '^0.7.6'
}

const RN_SCRIPTS = {
  'bundle:ios': 'react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ./ios/main.jsbundle --assets-dest ./ios --sourcemap-output ./ios/main.jsbundle.map && npm run compose-sourcemap:ios',
  'bundle:android': 'react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ --sourcemap-output android/app/src/main/assets/index.android.bundle.map && npm run compose-sourcemap:android',
  'compose-sourcemap:ios': 'node ./scripts/compose-mpx-sourcemap.js --metro-map ./ios/main.jsbundle.map --mpx-map ./app.js.map --output ./ios/main.jsbundle.map --allow-failure',
  'compose-sourcemap:android': 'node ./scripts/compose-mpx-sourcemap.js --metro-map android/app/src/main/assets/index.android.bundle.map --mpx-map ./app.js.map --output android/app/src/main/assets/index.android.bundle.map --allow-failure'
}

const RN_SOURCEMAP_SCRIPTS = [
  'compose-mpx-sourcemap.js',
  'metro-mpx-sourcemap-middleware.js'
].map((file) => path.resolve(__dirname, 'rn', file))

const RN_METRO_CONFIG = `const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {enhanceMiddleware} = require('./scripts/metro-mpx-sourcemap-middleware');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    enhanceMiddleware
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
`

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

function applyRnPackageConfig (pkg) {
  if (!pkg.dependencies) pkg.dependencies = {}
  if (!pkg.devDependencies) pkg.devDependencies = {}
  if (!pkg.scripts) pkg.scripts = {}
  Object.assign(pkg.dependencies, RN_DEP)
  Object.assign(pkg.devDependencies, RN_DEV_DEP)
  Object.assign(pkg.scripts, RN_SCRIPTS)
}

function copyRnSourcemapScript (rnProjectPath) {
  const scriptDir = path.resolve(rnProjectPath, 'scripts')
  fs.mkdirSync(scriptDir, { recursive: true })
  RN_SOURCEMAP_SCRIPTS.forEach((src) => {
    fs.copyFileSync(src, path.resolve(scriptDir, path.basename(src)))
  })
}

function writeRnMetroConfig (rnProjectPath) {
  fs.writeFileSync(path.resolve(rnProjectPath, 'metro.config.js'), RN_METRO_CONFIG)
}

async function createRnProject (targetDir, options) {
  const rnProjectPath = path.resolve(targetDir, 'ReactNativeProject')

  const defaultPm = (hasYarn() ? 'yarn' : null) || 'npm'
  let packageManager = options.packageManager || loadOptions().packageManager || defaultPm

  if (packageManager === 'pnpm') {
    console.warn(chalk.yellow(`ReactNative暂不支持使用pnpm创建，已自动切换为${defaultPm}`))
    packageManager = defaultPm
  }

  const pm = new PackageManager({
    context: rnProjectPath,
    forcePackageManager: packageManager
  })

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
  updateJsonFile(pkgPath, applyRnPackageConfig)

  const babelConfigPath = path.resolve(targetDir, 'ReactNativeProject', 'babel.config.js')
  updateJsModule(babelConfigPath, config => {
    if (!config.plugins) {
      config.plugins = []
    }
    addArrayItem(config.plugins, 'react-native-reanimated/plugin')
  })

  copyRnSourcemapScript(rnProjectPath)
  writeRnMetroConfig(rnProjectPath)

  await pm.install()
}

module.exports.createRnProject = createRnProject
module.exports.applyRnPackageConfig = applyRnPackageConfig
module.exports.copyRnSourcemapScript = copyRnSourcemapScript
module.exports.writeRnMetroConfig = writeRnMetroConfig
