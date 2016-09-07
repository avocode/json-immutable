const JsonImmutable = require('../../lib/')


exports.testSerializationStream = function (test, data, expectedResult) {
  const result = exports.getSerializationStreamResult(data)
  return result.then((result) => {
    test.deepEqual(result, expectedResult)
  })
}

exports.getSerializationStreamResult = function (data) {
  return new Promise((resolve) => {
    const jsonStream = JsonImmutable.createSerializationStream(data)
    const jsonChunks = []
    jsonStream.on('data', (chunk) => {
      jsonChunks.push(chunk)
    })
    jsonStream.on('end', () => {
      const json = jsonChunks.join('')
      resolve(JSON.parse(json))
    })
  })
}
