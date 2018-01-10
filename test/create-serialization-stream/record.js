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


it('should apply serializer for incoming data if option is present', (test) => {
  const SampleRecord = immutable.Record({
    'a': 5,
    'b': 6,
  }, 'SampleRecord')

  const options = {
    serializers: {
      'SampleRecord': (data) => {
        return data.set('a', '5-transformed').set('b', '6-transformed')
      },
    }
  }

  const data = SampleRecord()
  const result = helpers.getSerializationStreamResult(data, options)

  return result.then((result) => {
    test.deepEqual(result['data'], {
      'a': '5-transformed',
      'b': '6-transformed',
    })
  })
})


it('should apply serializer only for specified record classes', (test) => {
  const SampleRecord1 = immutable.Record({
    'a': 5,
    'b': 6,
  }, 'SampleRecord1')

  const SampleRecord2 = immutable.Record({
    'a': 7,
    'b': 8,
  }, 'SampleRecord2')

  const SampleRecord3 = immutable.Record({
    'x': 10,
    'y': 20,
  }, 'SampleRecord3')

  const data = immutable.Map({
    's1': SampleRecord1(),
    's2': SampleRecord2(),
    's3': SampleRecord3(),
  })

  const options = {
    serializers: {
      'SampleRecord1': (data) => {
        return data.set('a', '5-transformed').set('b', '6-transformed')
      },
      'SampleRecord3': (data) => {
        return data.set('x', data.get('x') + 10)
                   .set('y', data.get('y') + 10)
      },
    }
  }

  const result = helpers.getSerializationStreamResult(data, options)

  return result.then((result) => {
    test.deepEqual(result, {
      '__iterable': 'Map',
      'data': [
        ['s1', {
          '__record': 'SampleRecord1',
          'data': {
            'a': '5-transformed',
            'b': '6-transformed',
          }
        }],
        ['s2', {
          '__record': 'SampleRecord2',
          'data': {
            'a': 7,
            'b': 8,
          }
        }],
        ['s3', {
          '__record': 'SampleRecord3',
          'data': {
            'x': 20,
            'y': 30,
          }
        }],
      ]
    })
  })
})
