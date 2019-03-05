import it from 'ava';

import helpers from './_helpers';

it('should serialize a Date object', (test) => {
  const date = new Date('2016-09-08');
  const result = helpers.getSerializationResult(date);

  test.is(result['__date'], date.toISOString());
});

it('should serialize a RegExp object', (test) => {
  const regexp = new RegExp('(what)?\\w+$');
  const result = helpers.getSerializationResult(regexp);

  test.is(result['__regexp'], regexp.toString());
});

it('should serialize a RegExp object with flags', (test) => {
  const regexp = new RegExp('(what)?\\w+$', 'ig');
  const result = helpers.getSerializationResult(regexp);

  test.is(result['__regexp'], regexp.toString());
});
