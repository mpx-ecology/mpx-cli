exports.main = (event, context) => {
  const { a, b } = event
  const sum = a + b
  return {
    sum
  }
}
