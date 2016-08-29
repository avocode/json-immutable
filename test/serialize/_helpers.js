const JsonImmutable = require('../../lib/')


exports.testSerialization = function (test, data, expectedResult) {
  const result = exports.getSerializationResult(data)
  test.deepEqual(result, expectedResult)
}

exports.getSerializationResult = function (data) {
  const json = JsonImmutable.serialize(data)
  return JSON.parse(json)
}
