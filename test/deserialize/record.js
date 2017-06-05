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
