const RN_EXTERNAL_DEPENDENCIES = [
  '@d11/react-native-fast-image',
  '@react-native-async-storage/async-storage',
  '@react-native-community/netinfo',
  '@react-navigation/native',
  '@react-navigation/native-stack',
  'react-native-device-info',
  'react-native-gesture-handler',
  'react-native-get-location',
  'react-native-haptic-feedback',
  'react-native-linear-gradient',
  'react-native-reanimated',
  'react-native-screens',
  'react-native-webview',
  'react-native-safe-area-context',
  'react-native-ble-manager',
  'react-native-wifi-reborn',
  'react-native-svg',
  'react',
  'react-native',
  'react-native-video',
  'react-native-vision-camera'
]

const RN_EXTERNALS = [
  ...RN_EXTERNAL_DEPENDENCIES,
  'react/jsx-runtime',
  'react-native-gesture-handler/DrawerLayout',
  'react-native-gesture-handler/Swipeable',
  'react-native-svg/css'
].reduce((externals, name) => {
  externals[name] = name
  return externals
}, {})

module.exports.RN_EXTERNAL_DEPENDENCIES = RN_EXTERNAL_DEPENDENCIES
module.exports.RN_EXTERNALS = RN_EXTERNALS
