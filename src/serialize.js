const debug = require('debug')('json-immutable')
const immutable = require('immutable')

const JSONStreamStringify = require('json-stream-stringify')


function serialize(data, options = {}) {
  if (immutable.Iterable.isIterable(data) || data instanceof immutable.Record) {
    // NOTE: JSON.stringify() calls the #toJSON() method of the root object.
    //   Immutable.JS provides its own #toJSON() implementation which does not
    //   preserve map key types.
    data = Object.create(data)
    data.toJSON = function () {
      debug('#toJSON()', this)
      return this
    }
  }

  const indentation = options.pretty ? 2 : 0

  return JSON.stringify(data, replace, indentation)
}


function createSerializationStream(data, options = {}) {
  const indentation = options.pretty ? 2 : 0
  const replacer = options.bigChunks ? replace : replaceAsync

  const stream = JSONStreamStringify(data, replacer, indentation)
  return stream
}


function replace(key, value) {
  debug('key:', key)
  debug('value:', value)

  let result = value

  if (value instanceof immutable.Record) {
    result = replaceRecord(value, replace)
  }
  else if (immutable.Iterable.isIterable(value)) {
    result = replaceIterable(value, replace)
  }
  else if (Array.isArray(value)) {
    result = replaceArray(value, replace)
  }
  else if (typeof value === 'object' && value !== null) {
    result = replacePlainObject(value, replace)
  }

  debug('result:', result, '\n---')
  return result
}

function replaceAsync(key, value) {
  debug('key:', key)
  debug('value:', value)

  let result = value

  if (!(value instanceof Promise)) {
    if (value instanceof immutable.Record) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceRecord(value, replaceAsync))
        })
      })
    }
    else if (immutable.Iterable.isIterable(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceIterable(value, replaceAsync))
        })
      })
    }
    else if (Array.isArray(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceArray(value, replaceAsync))
        })
      })
    }
    else if (typeof value === 'object' && value !== null) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replacePlainObject(value, replaceAsync))
        })
      })
    }
  }

  debug('result:', result, '\n---')
  return result
}


function replaceRecord(rec, replaceChild) {
  debug('replaceRecord()', rec)
  const recordDataMap = rec.toMap()
  const recordData = {}

  recordDataMap.forEach((value, key) => {
    recordData[key] = replaceChild(key, value)
  })

  if (!rec._name) {
    return recordData
  }
  return { "__record": rec._name, "data": recordData }
}


function replaceIterable(iter, replaceChild) {
  debug('replaceIterable()', iter)

  const iterableType = iter.constructor.name
  switch (iterableType) {
  case 'List':
  case 'Set':
  case 'OrderedSet':
  case 'Stack':
    const listData = []
    iter.forEach((value, key) => {
      listData.push(replaceChild(key, value))
    })
    return { "__iterable": iterableType, "data": listData }

  case 'Map':
  case 'OrderedMap':
    const mapData = []
    iter.forEach((value, key) => {
      mapData.push([ key, replaceChild(key, value) ])
    })
    return { "__iterable": iterableType, "data": mapData }

  default:
    const iterData = {}
    iter.forEach((value, key) => {
      iterData[key] = replaceChild(key, value)
    })
    return { "__iterable": iterableType, "data": iterData }
  }
}


function replaceArray(arr, replaceChild) {
  debug('replaceArray()', arr)

  return arr.map((value, index) => {
    return replaceChild(index, value)
  })
}


function replacePlainObject(obj, replaceChild) {
  debug('replacePlainObject()', obj)

  const objData = {}
  Object.keys(obj).forEach((key) => {
    objData[key] = replaceChild(key, obj[key])
  })

  return objData
}


module.exports = {
  createSerializationStream,
  serialize,
}
