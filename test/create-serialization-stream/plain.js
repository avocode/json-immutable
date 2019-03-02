import it from 'ava';

import helpers from './_helpers';

function testPlainSerializationStream(test, data) {
  return helpers.testSerializationStream(test, data, data);
}

it('should serialize a null value', (test) => {
  return testPlainSerializationStream(test, null);
});

it('should serialize a string value', (test) => {
  return testPlainSerializationStream(test, 'string value');
});

it('should serialize a numeric value', (test) => {
  return testPlainSerializationStream(test, 123);
});

it('should serialize a single-level plain object', (test) => {
  return testPlainSerializationStream(test, {
    a: 5,
    b: 6,
  });
});

it('should serialize a nested plain object', (test) => {
  return testPlainSerializationStream(test, {
    a: {
      b: {
        c: 123,
      },
    },
  });
});

it('should serialize an array nested in a plain object', (test) => {
  return testPlainSerializationStream(test, {
    a: ['b', 123],
  });
});
