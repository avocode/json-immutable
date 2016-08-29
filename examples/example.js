const immutable = require('immutable')

const { deserialize, serialize } = require('../')


const RecordA = immutable.Record({
  'a1': 3,
  'a2': 4,
  'b': null,
}, 'RecordA')

const RecordB = immutable.Record({
  'b1': 5,
  'b2': 6,
  'c': null
}, 'RecordB')


let data = immutable.Map()
data = data.set(1, new RecordA({
  'b': immutable.List.of(
    new RecordB({
      'c': immutable.List()
    })
  )
}))


const json = serialize(data)
console.log('data =', data)
console.log('json =', json)
console.log('---')


const result = deserialize(json, {
  recordTypes: {
    'RecordA': RecordA,
    'RecordB': RecordB,
  },
})
console.log('result =', result)
console.log('data   =', data)
