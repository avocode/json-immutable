import immutable from 'immutable'
import it from 'ava'

import helpers from './_helpers'



it('should not mark an unnamed immutable.Record as __record', (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  })

  const data = SampleRecord()
  const result = helpers.getSerializationStreamResult(data)
  return result.then((result) => {
    test.falsy(result['__record'])
  })
})


it('should mark a named immutable.Record as __record=<name>', (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  }, 'SampleRecord')

  const data = SampleRecord()
  const result = helpers.getSerializationStreamResult(data)
  return result.then((result) => {
    test.is(result['__record'], 'SampleRecord')
    test.truthy(result['data'])
  })
})


it('should serialize an unnamed immutable.Record as a plain object',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  })

  const data = SampleRecord()

  return helpers.testSerializationStream(test, data, {
    'a': 5,
    'b': 6,
  })
})


it('should serialize a named immutable.Record data as a plain object',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  }, 'SampleRecord')

  const data = SampleRecord()
  const result = helpers.getSerializationStreamResult(data)
  return result.then((result) => {
    test.deepEqual(result['data'], {
      'a': 5,
      'b': 6,
    })
  })
})


it('should serialize nested plain objects in immutable.Record data',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': { 'x': 5 },
    'b': { 'y': 6, 'z': 7 },
  })

  const data = SampleRecord()
  const result = helpers.getSerializationStreamResult(data)
  return result.then((result) => {
    test.deepEqual(result, {
      'a': { 'x': 5 },
      'b': { 'y': 6, 'z': 7 },
    })
  })
})


it('should serialize an immutable.Map in immutable.Record data', (test) => {
  const SampleRecord = immutable.Record({
    'a': immutable.Map({ 'x': 5 }),
    'b': immutable.Map({ 'y': 6, 'z': 7 },)
  })

  const data = SampleRecord()
  const result = helpers.getSerializationStreamResult(data)
  return result.then((result) => {
    test.deepEqual(result, {
      'a': {
        '__iterable': 'Map',
        'data': [
          [ 'x', 5 ],
        ],
      },
      'b': {
        '__iterable': 'Map',
        'data': [
          [ 'y', 6 ],
          [ 'z', 7 ],
        ],
      },
    })
  })
})


it('should preserve key types of an immutable.Map in immutable.Record data',
    (test) => {
  let typedKeyedMap = immutable.Map()
  typedKeyedMap = typedKeyedMap.set(123, 'a')
  typedKeyedMap = typedKeyedMap.set(true, 'b')

  const SampleRecord = immutable.Record({
    'a': typedKeyedMap
  })

  const data = SampleRecord()
  const result = helpers.getSerializationStreamResult(data)
  return result.then((result) => {
    test.deepEqual(result['a']['data'], [
      [ 123, 'a' ],
      [ true, 'b' ],
    ])
  })
})
