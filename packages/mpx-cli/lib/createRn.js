const { hasYarn, hasPnpm3OrLater, execa } = require('@vue/cli-shared-utils')
const path = require('path')
const fs = require('fs-extra')
const { loadOptions } = require('@vue/cli/lib/options')
const PackageManager = require('@vue/cli/lib/util/ProjectPackageManager')

const RN_DEP = {
  '@ant-design/icons-react-native': '^2.3.2',
  '@ant-design/react-native': '^5.2.2',
  '@react-native-async-storage/async-storage': '^1.24.0',
  '@react-native-clipboard/clipboard': '^1.14.2',
  '@react-native-community/netinfo': '^11.3.2',
  '@react-native-masked-view/masked-view': '^0.3.1',
  '@react-native/assets-registry': '^0.75.2',
  '@react-native/gradle-plugin': '^0.75.2',
  '@react-navigation/elements': '^1.3.31',
  '@react-navigation/native': '^6.1.18',
  '@react-navigation/native-stack': '^6.11.0',
  expo: '^51.0.32',
  'expo-brightness': '~12.0.1',
  'expo-clipboard': '~6.0.3',
  react: '18.3.1',
  'react-native': '0.75.2',
  'react-native-collapsible': '^1.6.1',
  'react-native-device-info': '^11.1.0',
  'react-native-gesture-handler': '^2.18.1',
  'react-native-get-location': '^5.0.0',
  'react-native-haptic-feedback': '^2.3.3',
  'react-native-linear-gradient': '^2.8.3',
  'react-native-maps': '^1.18.0',
  'react-native-modal-popover': '^2.1.3',
  'react-native-reanimated': '3.15.0',
  'react-native-root-siblings': '^5.0.1',
  'react-native-safe-area-context': '^4.10.9',
  'react-native-screens': '^3.34.0',
  'react-native-webview': '^13.12.1'
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
  await execa(
    'npx',
    [
      '@react-native-community/cli',
      'init',
      'ReactNativeProject',
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
  const pkg = require(pkgPath)
  Object.assign(pkg.dependencies, RN_DEP)
  Object.assign(pkg.scripts, {
    'bundle:ios': 'react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ./ios/main.jsbundle --assets-dest ./ios',
    'bundle:android': 'react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/'
  })
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  await pm.install()
  await execa('npx', ['install-expo-modules'], {
    stdio: 'inherit',
    cwd: rnProjectPath
  })
}

module.exports.createRnProject = createRnProject
