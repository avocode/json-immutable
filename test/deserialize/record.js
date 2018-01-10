import immutable from 'immutable'
import it from 'ava'

import helpers from './_helpers'


it('should deserialize a record of a known type', (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'SampleRecord')

  const data = {
    '__record': 'SampleRecord',
    'data': {
      'a': 5,
      'b': 6,
    },
  }

  helpers.testDeserialization(test, data, SampleRecord(data['data']), {
    recordTypes: {
      'SampleRecord': SampleRecord,
    },
  })
})


it('should deserialize a record of a known class type', (test) => {
  class SampleRecord extends immutable.Record({
    'a': 1,
    'b': 2,
  }, 'SampleRecord') {
  }

  const data = {
    '__record': 'SampleRecord',
    'data': {
      'a': 5,
      'b': 6,
    },
  }

  helpers.testDeserialization(test, data, new SampleRecord(data['data']), {
    recordTypes: {
      'SampleRecord': SampleRecord,
    },
  })
})


it('should not deserialize a record of an unknown type', (test) => {
  const data = {
    '__record': 'SampleRecord',
    'data': {
      'a': 5,
      'b': 6,
    },
  }

  test.throws(() => {
    helpers.getDeserializationResult(data, {
      recordTypes: {},
    })
  })
})


it('should deserialize nested records of known types', (test) => {
  const RecordA = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'RecordA')
  const RecordB = immutable.Record({
    'c': 3,
  }, 'RecordB')

  const data = {
    '__record': 'RecordA',
    'data': {
      'a': 5,
      'b': {
        '__record': 'RecordB',
        'data': {
          'c': 6,
        },
      },
    },
  }

  const expectedResult = RecordA({
    'a': data['data']['a'],
    'b': RecordB(data['data']['b']['data']),
  })

  helpers.testDeserialization(test, data, expectedResult, {
    recordTypes: {
      'RecordA': RecordA,
      'RecordB': RecordB,
    },
  })
})


it('should call migrate record method when defined', (test) => {
  test.plan(1)
  class CustomRecord extends immutable.Record({ 'test_key': 'test-value' }) {
    static migrate(values) {
      test.pass()
      return values
    }
  }

  const data = {
    '__record': 'CustomRecord',
    'data': {},
  }

  helpers.getDeserializationResult(data, {
    recordTypes: {
      'CustomRecord': CustomRecord,
    },
  })
})


it('should pass deserialized List to migrate method', (test) => {
  class CustomRecord extends immutable.Record({ 'test_key': 'test-value' }) {
    static migrate(values) {
      test.true(immutable.List.isList(values['test_key']))
      return values
    }
  }

  const data = {
    '__record': 'CustomRecord',
    'data': {
      "test_key": {
        "__iterable": "List",
        "data": ['a', 'b', 'c']
      },
    },
  }

  helpers.getDeserializationResult(data, {
    recordTypes: {
      'CustomRecord': CustomRecord,
    },
  })
})


it('should use the result of the migrate method', (test) => {
  class CustomRecord extends immutable.Record({ 'test_key': 'test-value' }) {
    static migrate(values) {
      if (immutable.List.isList(values['test_key'])) {
        return {
          test_key: values['test_key'].join('-'),
        }
      }

      return values
    }
  }

  const data = {
    '__record': 'CustomRecord',
    'data': {
      "test_key": {
        "__iterable": "List",
        "data": ['a', 'b', 'c']
      },
    },
  }

  const expectedResult = new CustomRecord({
    'test_key': 'a-b-c',
  })

  helpers.testDeserialization(test, data, expectedResult, {
    recordTypes: {
      'CustomRecord': CustomRecord,
    },
  })
})


it('should apply deserializer onto outcoming data if option is present', (test) => {
  const SampleRecord = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'SampleRecord')

  const data = {
    '__record': 'SampleRecord',
    'data': {
      'a': 5,
      'b': 6,
    },
  }

  const expectedResult = SampleRecord({
    'a': '5-transformed',
    'b': '6-transformed'
  })

  helpers.testDeserialization(test, data, expectedResult, {
    recordTypes: {
      'SampleRecord': SampleRecord,
    },
    deserializers: { 
      'SampleRecord': (data) => {
        return Object.assign(data, {
          'a': `${data['a']}-transformed`,
          'b': `${data['b']}-transformed`,
        }) 
      },
    },
  })
})


it('should apply deserializer only to specified record classes', (test) => {
  const SampleRecord1 = immutable.Record({
    'a': 1,
    'b': 2,
  }, 'SampleRecord1')

  const SampleRecord2 = immutable.Record({
    'a': 3,
    'b': 4,
  }, 'SampleRecord2')

  const data = {
    '__iterable': 'Map',
    'data': {
      's1': {
        '__record': 'SampleRecord1',
        'data': {
          'a': 1,
          'b': 2,
        },
      },
      's2': {
        '__record': 'SampleRecord2',
        'data': {
          'a': 3,
          'b': 4,
        },
      }
    }
  }

  const expectedResult = immutable.Map({
    's1': SampleRecord1({
      'a': '1-transformed',
      'b': '2-transformed'
    }),
    's2': SampleRecord2({
      'a': 3,
      'b': 4,
    })
  })

  helpers.testDeserialization(test, data, expectedResult, {
    recordTypes: {
      'SampleRecord1': SampleRecord1,
      'SampleRecord2': SampleRecord2,
    },
    deserializers: { 
      'SampleRecord1': (data) => {
        return Object.assign(data, {
          'a': `${data['a']}-transformed`,
          'b': `${data['b']}-transformed`,
        }) 
      },
    },
  })
})
