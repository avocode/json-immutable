const JsonImmutable = require('../../lib/')


exports.testDeserialization = function (test, data, expectedResult, options) {
  const result = exports.getDeserializationResult(data, options)
  test.deepEqual(result, expectedResult)
}

exports.getDeserializationResult = function (data, options) {
  return JsonImmutable.deserialize(JSON.stringify(data), options)
}
