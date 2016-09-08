
function getObjectType(value) {
  if (!value) {
    return null
  }

  return value.constructor.name
}


function isSupportedNativeType(value) {
  return (
    isDate(value) ||
    isRegExp(value)
  )
}


function isDate(value) {
  return (getObjectType(value) === 'Date')
}


function isRegExp(value) {
  return (getObjectType(value) === 'RegExp')
}


function patchNativeTypeMethods(patchedObj, nativeObj) {
  patchedObj.toString = nativeObj.toString.bind(nativeObj)
  if (isDate(nativeObj)) {
    patchedObj.toISOString = nativeObj.toISOString.bind(nativeObj)
  }
}


module.exports = {
  getObjectType,
  isSupportedNativeType,
  isDate,
  isRegExp,
  patchNativeTypeMethods,
}
