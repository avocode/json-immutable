const { deserialize } = require('../../src/')


exports.testDeserialization = function (test, data, expectedResult, options = {}) {
  const result = exports.getDeserializationResult(data, options)
  test.deepEqual(result, expectedResult)
}

exports.getDeserializationResult = function (data, options = {}) {
  return deserialize(JSON.stringify(data), options)
}
