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
      return this
    }

    data = patchedData
  }

  const indentation = options.pretty ? 2 : 0

  return JSON.stringify(data, (key, value) => {
    return replace(key, value, options)
  }, indentation)
}


function createSerializationStream(data, options = {}) {
  const indentation = options.pretty ? 2 : 0
  const replacer = options.bigChunks ? replace : replaceAsync

  const stream = JSONStreamStringify(data, replacer, indentation)
  return stream
}


function replace(key, value, options = {}) {
  let result = value

  if (value instanceof immutable.Record) {
    result = replaceRecord(value, replace, options)
  }
  else if (immutable.Iterable.isIterable(value)) {
    result = replaceIterable(value, replace, options)
  }
  else if (Array.isArray(value)) {
    result = replaceArray(value, replace, options)
  }
  else if (nativeTypeHelpers.isDate(value)) {
    result = { '__date': value.toISOString() }
  }
  else if (nativeTypeHelpers.isRegExp(value)) {
    result = { '__regexp': value.toString() }
  }
  else if (typeof value === 'object' && value !== null) {
    result = replacePlainObject(value, replace, options)
  }

  return result
}

function replaceAsync(key, value, options = {}) {
  let result = value

  if (!(value instanceof Promise)) {
    if (value instanceof immutable.Record) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceRecord(value, replaceAsync, options))
        })
      })
    }
    else if (immutable.Iterable.isIterable(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceIterable(value, replaceAsync, options))
        })
      })
    }
    else if (Array.isArray(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replaceArray(value, replaceAsync, options))
        })
      })
    }
    else if (typeof value === 'object' && value !== null) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(replacePlainObject(value, replaceAsync, options))
        })
      })
    }
  }

  return result
}


function replaceRecord(rec, replaceChild, options = {}) {
  const emptyRec = new rec.constructor()

  const recordDataMap = rec.toMap()
  const recordData = {}

  recordDataMap.forEach(function (value, key) {
    if (!options.omitDefaultRecordValues || value !== emptyRec.get(key)) {
      recordData[key] = replaceChild(key, value, options)
    }
  })

  if (!rec._name) {
    return recordData
  }
  return { "__record": rec._name, "data": recordData }
}

function getIterableType(iterable) {
  if (immutable.List.isList(iterable)) {
    return 'List'
  }

  if (immutable.Stack.isStack(iterable)) {
    return 'Stack'
  }

  if (immutable.Set.isSet(iterable)) {
    if (immutable.OrderedSet.isOrderedSet(iterable)) {
      return 'OrderedSet'
    }

    return 'Set'
  }

  if (immutable.Map.isMap(iterable)) {
    if (immutable.OrderedMap.isOrderedMap(iterable)) {
      return 'OrderedMap'
    }

    return 'Map'
  }

  return undefined;
}


function replaceIterable(iter, replaceChild, options = {}) {
  const iterableType = getIterableType(iter)
  if (!iterableType) {
    throw new Error(`Cannot find type of iterable: ${iter}`)
  }

  switch (iterableType) {
  case 'List':
  case 'Set':
  case 'OrderedSet':
  case 'Stack':
    const listData = []
    iter.forEach((value, key) => {
      listData.push(replaceChild(key, value, options))
    })
    return { "__iterable": iterableType, "data": listData }

  case 'Map':
  case 'OrderedMap':
    const mapData = []
    iter.forEach((value, key) => {
      mapData.push([ key, replaceChild(key, value, options) ])
    })
    return { "__iterable": iterableType, "data": mapData }
  }
}


function replaceArray(arr, replaceChild, options = {}) {
  return arr.map((value, index) => {
    return replaceChild(index, value, options)
  })
}


function replacePlainObject(obj, replaceChild, options = {}) {
  const objData = {}
  Object.keys(obj).forEach((key) => {
    objData[key] = replaceChild(key, obj[key], options)
  })

  return objData
}


module.exports = {
  createSerializationStream,
  serialize,
}
