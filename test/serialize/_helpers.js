const JsonImmutable = require('../../lib/')


exports.testSerialization = function (test, data, expectedResult, options) {
  const result = exports.getSerializationResult(data, options)
  test.deepEqual(result, expectedResult)
}

exports.getSerializationResult = function (data, options) {
  const json = JsonImmutable.serialize(data, options || {})
  return JSON.parse(json)
}
