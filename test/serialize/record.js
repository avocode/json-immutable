import immutable from 'immutable'
import it from 'ava'

import helpers from './_helpers'



it('should not mark an unnamed immutable.Record as __record', (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  })

  const data = SampleRecord()
  const result = helpers.getSerializationResult(data)

  test.falsy(result['__record'])
})


it('should mark a named immutable.Record as __record=<name>', (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  }, 'SampleRecord')

  const data = SampleRecord()
  const result = helpers.getSerializationResult(data)

  test.is(result['__record'], 'SampleRecord')
  test.truthy(result['data'])
})


it('should serialize an unnamed immutable.Record as a plain object',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  })

  const data = SampleRecord()

  helpers.testSerialization(test, data, {
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
  const result = helpers.getSerializationResult(data)

  test.deepEqual(result['data'], {
    'a': 5,
    'b': 6,
  })
})


it('should serialize nested plain objects in immutable.Record data',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': { 'x': 5 },
    'b': { 'y': 6, 'z': 7 },
  })

  const data = SampleRecord()
  const result = helpers.getSerializationResult(data)

  test.deepEqual(result, {
    'a': { 'x': 5 },
    'b': { 'y': 6, 'z': 7 },
  })
})


it('should serialize an immutable.Map in immutable.Record data', (test) => {
  const SampleRecord = immutable.Record({
    'a': immutable.Map({ 'x': 5 }),
    'b': immutable.Map({ 'y': 6, 'z': 7 },)
  })

  const data = SampleRecord()
  const result = helpers.getSerializationResult(data)

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


it('should preserve key types of an immutable.Map in immutable.Record data',
    (test) => {
  let typedKeyedMap = immutable.Map()
  typedKeyedMap = typedKeyedMap.set(123, 'a')
  typedKeyedMap = typedKeyedMap.set(true, 'b')

  const SampleRecord = immutable.Record({
    'a': typedKeyedMap
  })

  const data = SampleRecord()
  const result = helpers.getSerializationResult(data)

  test.deepEqual(result['a']['data'], [
    [ 123, 'a' ],
    [ true, 'b' ],
  ])
})


it('should include default unnamed record key values by default',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  })

  const data = SampleRecord({ 'a': 3 })
  const result = helpers.getSerializationResult(data)

  test.deepEqual(result, {
    'a': 3,
    'b': 2,
  })
})


it('should not include default unnamed record key values when they should be omitted',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  })

  const data = SampleRecord({ 'a': 3 })
  const result = helpers.getSerializationResult(data, {
    omitDefaultRecordValues: true,
  })

  test.deepEqual(result, {
    'a': 3,
  })
})


it('should include default named record key values by default',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'X')

  const data = SampleRecord({ 'a': 3 })
  const result = helpers.getSerializationResult(data)

  test.deepEqual(result['data'], {
    'a': 3,
    'b': 2,
  })
})


it('should not include default named record key values when they should be omitted',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'X')

  const data = SampleRecord({ 'a': 3 })
  const result = helpers.getSerializationResult(data, {
    omitDefaultRecordValues: true,
  })

  test.deepEqual(result['data'], {
    'a': 3,
  })
})


it('should not include default record key values of records ' +
    'nested within plain objects when they should be omitted',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'X')

  const data = {
    'x': SampleRecord({ 'a': 3 }),
  }
  const result = helpers.getSerializationResult(data, {
    omitDefaultRecordValues: true,
  })

  test.deepEqual(result['x']['data'], {
    'a': 3,
  })
})


it('should not include default record key values of records ' +
    'nested within arrays when they should be omitted',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'X')

  const data = [
    SampleRecord({ 'a': 3 }),
  ]
  const result = helpers.getSerializationResult(data, {
    omitDefaultRecordValues: true,
  })

  test.deepEqual(result[0]['data'], {
    'a': 3,
  })
})


it('should not include default record key values of records ' +
    'nested within immutable lists when they should be omitted',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'X')

  const data = immutable.List([
    SampleRecord({ 'a': 3 }),
  ])
  const result = helpers.getSerializationResult(data, {
    omitDefaultRecordValues: true,
  })

  test.deepEqual(result['data'][0]['data'], {
    'a': 3,
  })
})


it('should not include default record key values of records ' +
    'nested within immutable lists when they should be omitted',
    (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
    'child': null,
  }, 'X')

  const data = SampleRecord({
    'a': 3,
    'child': SampleRecord({ 'a': 4 }),
  })
  const result = helpers.getSerializationResult(data, {
    omitDefaultRecordValues: true,
  })

  test.deepEqual(result['data']['child']['data'], {
    'a': 4,
  })
})
