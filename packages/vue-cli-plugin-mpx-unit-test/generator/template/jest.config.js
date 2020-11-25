/**
 * @file config of jest
 * @url https://jestjs.io/docs/en/configuration
 */
module.exports = {
  // rootDir: path.join(__dirname),
  moduleFileExtensions: ['js', 'mpx'],
  moduleNameMapper: {
    // webpack的alias需要在此处理
  },
  testPathIgnorePatterns: ['dist', 'node_modules'],
  testURL: 'http://test.api.com',
  setupFiles: ['<rootDir>/test/setup'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(@mpxjs))']
}
