import immutable from 'immutable';
import it from 'ava';

import helpers from './_helpers';

it('should serialize an unnamed immutable.Record as __record', (test) => {
  const SampleRecord = immutable.Record({
    a: 5,
    b: 6,
  });

  const data = SampleRecord();
  const result = helpers.getSerializationResult(data);

  test.is(result['__record'], 'Record');
  test.truthy(result['data']);
});

it('should mark a named immutable.Record as __record=<name>', (test) => {
  const SampleRecord = immutable.Record(
    {
      a: 5,
      b: 6,
    },
    'SampleRecord',
  );

  const data = SampleRecord();
  const result = helpers.getSerializationResult(data);

  test.is(result['__record'], 'SampleRecord');
  test.truthy(result['data']);
});

it('should serialize an unnamed immutable.Record as a record', (test) => {
  const SampleRecord = immutable.Record({
    a: 5,
    b: 6,
  });

  const data = SampleRecord();
  const result = helpers.getSerializationResult(data);

  test.deepEqual(result['data'], {
    a: 5,
    b: 6,
  });
});

it('should serialize a named immutable.Record data as a plain object', (test) => {
  const SampleRecord = immutable.Record(
    {
      a: 5,
      b: 6,
    },
    'SampleRecord',
  );

  const data = SampleRecord();
  const result = helpers.getSerializationResult(data);

  test.deepEqual(result['data'], {
    a: 5,
    b: 6,
  });
});

it('should serialize nested plain objects in immutable.Record data', (test) => {
  const SampleRecord = immutable.Record({
    a: { x: 5 },
    b: { y: 6, z: 7 },
  });

  const data = SampleRecord();
  const result = helpers.getSerializationResult(data);

  test.deepEqual(result['data'], {
    a: { x: 5 },
    b: { y: 6, z: 7 },
  });
});

it('should serialize an immutable.Map in immutable.Record data', (test) => {
  const SampleRecord = immutable.Record({
    a: immutable.Map({ x: 5 }),
    b: immutable.Map({ y: 6, z: 7 }),
  });

  const data = SampleRecord();
  const result = helpers.getSerializationResult(data);

  test.deepEqual(result['data'], {
    a: {
      __collection: 'Map',
      data: [['x', 5]],
    },
    b: {
      __collection: 'Map',
      data: [['y', 6], ['z', 7]],
    },
  });
});

it('should preserve key types of an immutable.Map in immutable.Record data', (test) => {
  let typedKeyedMap = immutable.Map();
  typedKeyedMap = typedKeyedMap.set(123, 'a');
  typedKeyedMap = typedKeyedMap.set(true, 'b');

  const SampleRecord = immutable.Record({
    a: typedKeyedMap,
  });

  const data = SampleRecord();
  const result = helpers.getSerializationResult(data);

  test.deepEqual(result['data']['a']['data'], [[123, 'a'], [true, 'b']]);
});
