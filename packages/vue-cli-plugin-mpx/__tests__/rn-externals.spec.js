const {
  RN_EXTERNAL_DEPENDENCIES,
  RN_EXTERNALS
} = require('../config/rnExternals')
const { RN_DEP } = require('../../mpx-cli/lib/createRn')

test('RN externals match dependencies installed in the RN project', () => {
  const dependencyNames = Object.keys(RN_DEP)
  const subpathNames = [
    'react/jsx-runtime',
    'react-native-gesture-handler/DrawerLayout',
    'react-native-gesture-handler/Swipeable',
    'react-native-svg/css'
  ]

  expect(RN_EXTERNAL_DEPENDENCIES).toEqual(dependencyNames)
  expect(Object.keys(RN_EXTERNALS)).toEqual([...dependencyNames, ...subpathNames])
  Object.entries(RN_EXTERNALS).forEach(([request, external]) => {
    expect(external).toBe(request)
  })
})
