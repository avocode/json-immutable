import it from 'ava';

import helpers from './_helpers';

function testPlainDeserialization(test, data) {
  return helpers.testDeserialization(test, data, data);
}

it('should deserialize a null value', (test) => {
  testPlainDeserialization(test, null);
});

it('should deserialize a string value', (test) => {
  testPlainDeserialization(test, 'string value');
});

it('should deserialize a numeric value', (test) => {
  testPlainDeserialization(test, 123);
});

it('should deserialize a single-level plain object', (test) => {
  testPlainDeserialization(test, {
    a: 5,
    b: 6,
  });
});

it('should deserialize a nested plain object', (test) => {
  testPlainDeserialization(test, {
    a: 5,
    b: {
      c: 6,
    },
  });
});

it('should deserialize an array nested in a plain object', (test) => {
  testPlainDeserialization(test, {
    a: ['b', 123],
  });
});
