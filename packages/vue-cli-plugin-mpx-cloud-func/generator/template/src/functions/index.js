exports.main = (event, context) => {
  let { a, b } = event
  let sum = a + b
  return {
    sum
  }
}
