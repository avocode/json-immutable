import immutable from 'immutable'
import it from 'ava'

import helpers from './_helpers'


it('should deserialize an immutable.Map serialized as an array of entries',
    (test) => {
  const data = {
    '__iterable': 'Map',
    'data': [
      [ 'a', 5 ],
      [ 'b', 6 ],
    ],
  }

  helpers.testDeserialization(test, data, immutable.Map(data['data']))
})


it('should deserialize an immutable.Map serialized as a plain object',
    (test) => {
  const data = {
    '__iterable': 'Map',
    'data': {
      'a': 5,
      'b': 6,
    },
  }

  helpers.testDeserialization(test, data, immutable.Map(data['data']))
})


it('should preserve key types of an immutable.Map', (test) => {
  const data = {
    '__iterable': 'Map',
    'data': [
      [ 5, 'a' ],
      [ 6, 'b' ],
    ],
  }

  helpers.testDeserialization(test, data, immutable.Map(data['data']))
})


it('should deserialize an immutable.OrderedMap serialized as an array of entries',
    (test) => {
  const data = {
    '__iterable': 'OrderedMap',
    'data': [
      [ 'a', 5 ],
      [ 'b', 6 ],
    ],
  }

  helpers.testDeserialization(test, data, immutable.OrderedMap(data['data']))
})


it('should deserialize an immutable.OrderedMap serialized as a plain object',
    (test) => {
  const data = {
    '__iterable': 'OrderedMap',
    'data': {
      'a': 5,
      'b': 6,
    },
  }

  helpers.testDeserialization(test, data, immutable.OrderedMap(data['data']))
})


it('should deserialize a record of a known type nested in an immutable.Map',
    (test) => {
  const SampleRecord = immutable.Record({
    'b': 1,
    'c': 2,
  }, 'SampleRecord')


  const data = {
    '__iterable': 'Map',
    'data': [
      [ 'a', {
        '__record': 'SampleRecord',
        'data': {
          'b': 5,
          'c': 6,
        }
      } ],
    ],
  }

  const expectedResult = immutable.Map({
    'a': SampleRecord(data['data'][0][1]['data']),
  })

  helpers.testDeserialization(test, data, expectedResult, {
    recordTypes: {
      'SampleRecord': SampleRecord,
    },
  })
})


it('should deserialize an immutable.List', (test) => {
  const data = {
    '__iterable': 'List',
    'data': [ 5, 6 ],
  }

  helpers.testDeserialization(test, data, immutable.List(data['data']))
})


it('should deserialize an immutable.Set', (test) => {
  const data = {
    '__iterable': 'Set',
    'data': [ 5, 6 ],
  }

  helpers.testDeserialization(test, data, immutable.Set(data['data']))
})


it('should deserialize an immutable.OrderedSet', (test) => {
  const data = {
    '__iterable': 'OrderedSet',
    'data': [ 5, 6 ],
  }

  helpers.testDeserialization(test, data, immutable.OrderedSet(data['data']))
})


it('should deserialize an immutable.Stack', (test) => {
  const data = {
    '__iterable': 'Stack',
    'data': [ 5, 6 ],
  }

  helpers.testDeserialization(test, data, immutable.Stack(data['data']))
})


it('should not deserialize an iterable of an unknown type', (test) => {
  const data = {
    '__iterable': 'UnknownType',
    'data': [ 5, 6 ],
  }

  test.throws(() => {
    test.getDeserializationResult(data)
  })
})
