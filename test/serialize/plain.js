import it from 'ava';

import helpers from './_helpers';

function testPlainSerialization(test, data) {
  return helpers.testSerialization(test, data, data);
}

it('should serialize a null value', (test) => {
  testPlainSerialization(test, null);
});

it('should serialize a string value', (test) => {
  testPlainSerialization(test, 'string value');
});

it('should serialize a numeric value', (test) => {
  testPlainSerialization(test, 123);
});

it('should serialize a single-level plain object', (test) => {
  testPlainSerialization(test, {
    a: 5,
    b: 6,
  });
});

it('should serialize a nested plain object', (test) => {
  testPlainSerialization(test, {
    a: {
      b: {
        c: 123,
      },
    },
  });
});

it('should serialize an array nested in a plain object', (test) => {
  testPlainSerialization(test, {
    a: ['b', 123],
  });
});
