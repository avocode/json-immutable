export function getObjectType(value: any): string | null {
  if (!value) {
    return null;
  }
  return value.constructor.name;
}

export function isSupportedNativeType(value: any): boolean {
  return isDate(value) || isRegExp(value);
}

export function isDate(value: any): boolean {
  return getObjectType(value) === 'Date';
}

export function isRegExp(value: any): boolean {
  return getObjectType(value) === 'RegExp';
}

export function patchNativeTypeMethods(patchedObj: any, nativeObj: any): void {
  patchedObj.toString = nativeObj.toString.bind(nativeObj);
  if (isDate(nativeObj)) {
    patchedObj.toISOString = nativeObj.toISOString.bind(nativeObj);
  }
}
