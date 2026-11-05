const createPrompts = require('../lib/prompts')

const prompts = createPrompts('Example')
const prompt = name => prompts.find(item => item.name === name)

test('uses needWeb instead of cross without requiring separate platform plugins', () => {
  expect(prompt('cross')).toBeUndefined()
  expect(prompt('needWeb').default).toBe(false)
  expect(prompt('needWeb').when({ srcMode: 'wx' })).toBe(true)
  expect(prompt('needWeb').when({ srcMode: 'ali' })).toBe(false)
  expect(prompt('needWeb').preset).toBeUndefined()
  expect(prompt('needRn').preset).toBeUndefined()
})

test('offers SSR only after selecting Web', () => {
  expect(prompt('needSSR').when({ srcMode: 'wx', needWeb: true })).toBe(true)
  for (const needWeb of [false, undefined]) {
    expect(prompt('needSSR').when({ srcMode: 'wx', needWeb })).toBe(false)
  }
  expect(prompt('needSSR').when({ srcMode: 'ali', needWeb: true })).toBe(false)
  expect(Object.keys(prompt('needSSR').preset.plugins)).toEqual(['@mpxjs/vue-cli-plugin-mpx-ssr'])
})

test('does not offer cloud or plugin mode when Web or RN is selected', () => {
  const answers = { srcMode: 'wx', needWeb: false, needRn: false, cloudFunc: false }
  for (const name of ['cloudFunc', 'isPlugin']) {
    expect(prompt(name).when(answers)).toBe(true)
    expect(prompt(name).when({ ...answers, needWeb: true })).toBe(false)
    expect(prompt(name).when({ ...answers, needRn: true })).toBe(false)
    expect(prompt(name).when({ ...answers, srcMode: 'ali' })).toBe(false)
  }
  expect(prompt('isPlugin').when({ ...answers, cloudFunc: true })).toBe(false)
})
