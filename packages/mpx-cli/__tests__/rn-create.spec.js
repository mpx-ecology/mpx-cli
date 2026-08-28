const mockExeca = jest.fn()
const mockInstall = jest.fn()
const mockPackageManager = jest.fn(({ context, forcePackageManager }) => ({
  bin: forcePackageManager,
  context,
  install: mockInstall
}))

jest.mock('@vue/cli-shared-utils', () => ({
  chalk: { yellow: (message) => message },
  execa: mockExeca,
  hasYarn: () => false
}))
jest.mock('@vue/cli/lib/options', () => ({ loadOptions: () => ({}) }))
jest.mock('@vue/cli/lib/util/ProjectPackageManager', () => mockPackageManager)

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const createPrompts = require('../lib/prompts')
const { createRnProject, validateRnProjectName } = require('../lib/createRn')

describe('React Native project name', () => {
  let targetDir

  beforeEach(() => {
    targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpx-cli-rn-'))
    mockExeca.mockImplementation(async (command, args, options) => {
      const rnProjectPath = path.resolve(options.cwd, args[2])
      fs.mkdirSync(rnProjectPath)
      fs.writeJsonSync(path.resolve(rnProjectPath, 'package.json'), {
        dependencies: {
          react: '18.3.1',
          'react-native': '0.77.2',
          'react-native-reanimated': '3.16.7',
          'react-native-ble-manager': '^12.4.4',
          'react-native-wifi-reborn': '^4.13.6'
        }
      })
      fs.writeFileSync(path.resolve(rnProjectPath, 'babel.config.js'), 'module.exports = {}')
    })
  })

  afterEach(() => {
    fs.removeSync(targetDir)
    jest.clearAllMocks()
  })

  test('uses the mpx project name as the prompt default', () => {
    const prompt = createPrompts('MyMpxProject').find(({ name }) => name === 'rnProjectName')

    expect(prompt.default).toBe('MyMpxProject')
    expect(prompt.when({ srcMode: 'wx', needRn: true })).toBe(true)
    expect(prompt.when({ srcMode: 'wx', needRn: false })).toBe(false)
  })

  test('validates names using React Native identifier rules', () => {
    expect(validateRnProjectName('CustomRnProject')).toBe(true)
    expect(validateRnProjectName('_CustomRnProject')).toBe(true)
    expect(validateRnProjectName('custom-rn-project')).not.toBe(true)
    expect(validateRnProjectName('../CustomRnProject')).not.toBe(true)
    expect(validateRnProjectName('$CustomRnProject')).not.toBe(true)
    expect(validateRnProjectName('Custom$RnProject')).not.toBe(true)
    expect(validateRnProjectName('React')).not.toBe(true)
  })

  test('creates and configures the requested project directory', async () => {
    await createRnProject(targetDir, { packageManager: 'npm' }, 'CustomRnProject')

    const initArgs = mockExeca.mock.calls[0][1]
    expect(initArgs[0]).toBe('@react-native-community/cli@^19.0.0')
    expect(initArgs.slice(1, 3)).toEqual(['init', 'CustomRnProject'])
    expect(initArgs.slice(initArgs.indexOf('--version'), initArgs.indexOf('--version') + 2))
      .toEqual(['--version', '0.77.2'])
    expect(mockPackageManager).toHaveBeenCalledWith({
      context: path.resolve(targetDir, 'CustomRnProject'),
      forcePackageManager: 'npm'
    })
    const dependencies = fs.readJsonSync(path.resolve(targetDir, 'CustomRnProject/package.json')).dependencies
    expect(dependencies).toHaveProperty('react', '18.3.1')
    expect(dependencies).toHaveProperty('react-native', '0.77.2')
    expect(dependencies).toHaveProperty('react-native-reanimated', '3.16.7')
    expect(dependencies).toHaveProperty('react-native-ble-manager', '^12.4.4')
    expect(dependencies).toHaveProperty('react-native-wifi-reborn', '^4.13.6')
    expect(dependencies).toHaveProperty('react-native-svg', '^15.8.0')
    expect(dependencies).toHaveProperty('react-native-vision-camera', '^4.7.3')
    expect(mockInstall).toHaveBeenCalledTimes(1)
  })
})
