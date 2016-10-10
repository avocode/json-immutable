const debug = require('debug')('json-immutable')
const immutable = require('immutable')

const JSONStreamStringify = require('json-stream-stringify')

const nativeTypeHelpers = require('./helpers/native-type-helpers')


function serialize(data, options = {}) {
  if (immutable.Iterable.isIterable(data) ||
      data instanceof immutable.Record ||
      nativeTypeHelpers.isSupportedNativeType(data)
  ) {
    const patchedData = Object.create(data)

    if (nativeTypeHelpers.isSupportedNativeType(data)) {
      // NOTE: When native type (such as Date or RegExp) methods are called
      //   on an `Object.create()`'d objects, invalid usage errors are thrown
      //   in many cases. We need to patch the used methods to work
      //   on originals.
      nativeTypeHelpers.patchNativeTypeMethods(patchedData, data)
    }

    // NOTE: JSON.stringify() calls the #toJSON() method of the root object.
    //   Immutable.JS provides its own #toJSON() implementation which does not
    //   preserve map key types.
    patchedData.toJSON = function () {
      debug('#toJSON()', this)
      return this
    }

    data = patchedData
  }

  const indentation = options.pretty ? 2 : 0

  return JSON.stringify(data, replace.bind(this, options), indentation)
}


function createSerializationStream(data, options = {}) {
  const indentation = options.pretty ? 2 : 0
  const replacer = options.bigChunks ? replace.bind(this, options) : replaceAsync.bind(this, options)

  const stream = JSONStreamStringify(data, replacer, indentation)
  return stream
}


function replace(options, key, value) {
  debug('key:', key)
  debug('value:', value)

  let result = value
  const replaceBind = replace.bind(this, options)

  if (value instanceof immutable.Record) {
    result = replaceRecord(value, options, replaceBind)
  }
  else if (immutable.Iterable.isIterable(value)) {
    result = replaceIterable(value, replaceBind)
  }
  else if (Array.isArray(value)) {
    result = replaceArray(value, replaceBind)
  }
  else if (nativeTypeHelpers.isDate(value)) {
    result = { '__date': value.toISOString() }
  }
  else if (nativeTypeHelpers.isRegExp(value)) {
    result = { '__regexp': value.toString() }
  }
  else if (typeof value === 'object' && value !== null) {
    result = replacePlainObject(value, replaceBind)
  }

  debug('result:', result, '\n---')
  return result
}

function replaceAsync(options, key, value) {
  debug('key:', key)
  debug('value:', value)

  let result = value
  const replaceAsyncBind = replaceAsync.bind(this, options)

  if (!(value instanceof Promise)) {
    if (value instanceof immutable.Record) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceRecord(value, options, replaceAsyncBind))
        })
      })
    }
    else if (immutable.Iterable.isIterable(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceIterable(value, replaceAsyncBind))
        })
      })
    }
    else if (Array.isArray(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceArray(value, replaceAsyncBind))
        })
      })
    }
    else if (typeof value === 'object' && value !== null) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replacePlainObject(value, replaceAsyncBind))
        })
      })
    }
  }

  debug('result:', result, '\n---')
  return result
}


function replaceRecord(rec, options, replaceChild) {
  debug('replaceRecord()', rec)
  const recordDataMap = rec.toMap()
  const recordData = {}

  recordDataMap.forEach((value, key) => {
    recordData[key] = replaceChild(key, value)
  })

  let name = rec._name
  if (!rec._name) {

    if (options.storeUnknownRecords) {
      name = '__unknown'
    } else {
      return recordData
    }
  }
  return { "__record": name, "data": recordData }
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
