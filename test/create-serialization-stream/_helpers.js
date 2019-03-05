const assert = require('assert');

const JsonImmutable = require('../../lib/');

exports.testSerializationStream = function(test, data, expectedResult) {
  const littleChunkedData = getSerializationStreamDataWithOptions(data, {});
  const bigChunkedData = getSerializationStreamDataWithOptions(data, {
    bigChunks: true,
  });

  return littleChunkedData.then((littleChunkedData) => {
    return bigChunkedData.then((bigChunkedData) => {
      assert.equal(
        littleChunkedData,
        bigChunkedData,
        'Little-chunked and big-chunked serialization results do not match.',
      );
      test.deepEqual(JSON.parse(littleChunkedData), expectedResult);
    });
  });
};

exports.getSerializationStreamResult = function(data, options) {
  const littleChunkedData = getSerializationStreamDataWithOptions(data, {});
  const bigChunkedData = getSerializationStreamDataWithOptions(data, {
    bigChunks: true,
  });

  return littleChunkedData.then((littleChunkedData) => {
    return bigChunkedData.then((bigChunkedData) => {
      assert.equal(
        littleChunkedData,
        bigChunkedData,
        'Little-chunked and big-chunked serialization results do not match.',
      );
      return JSON.parse(littleChunkedData);
    });
  });
};

function getSerializationStreamDataWithOptions(data, options) {
  return new Promise((resolve) => {
    const jsonStream = JsonImmutable.createSerializationStream(data, options);
    const jsonChunks = [];
    jsonStream.on('data', (chunk) => {
      jsonChunks.push(chunk);
    });
    jsonStream.on('end', () => {
      const json = jsonChunks.join('');
      resolve(json);
    });
  });
}
