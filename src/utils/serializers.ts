import { Iterable, Record } from 'immutable';
import { SerializedIterable, SerializedRecord } from '../types/serializedData';
import { getIterableType } from './iterables';
import { isDate, isRegExp } from './nativeTypes';

export function serializeData(_key: string | number, value: any): any {
  let result = value;

  if (value instanceof Record) {
    result = serializeRecord(value as any, serializeData);
  } else if (Iterable.isIterable(value)) {
    result = serializeIterable(value, serializeData);
  } else if (Array.isArray(value)) {
    result = serializeArray(value, serializeData);
  } else if (isDate(value)) {
    result = { __date: value.toISOString() };
  } else if (isRegExp(value)) {
    result = { __regexp: value.toString() };
  } else if (typeof value === 'object' && value !== null) {
    result = serializePlainObject(value, serializeData);
  }

  return result;
}

export function serializeArray(
  arr: any[],
  serializeChild: typeof serializeData,
): any[] {
  return arr.map((value, index) => {
    return serializeChild(index, value);
  });
}

export function serializePlainObject(
  obj: object,
  serializeChild: typeof serializeData,
): object {
  const objData: any = {};
  (Object.keys(obj) as [keyof typeof obj]).forEach((key) => {
    objData[key] = serializeChild(key, obj[key]);
  });

  return objData;
}

export function serializeIterable(
  iter: Iterable<any, any>,
  serializeChild: typeof serializeData,
): SerializedIterable | never {
  const iterableType = getIterableType(iter);
  if (!iterableType) {
    throw new Error(`Cannot find type of iterable: ${iter}`);
  }

  switch (iterableType) {
    case 'List':
    case 'Set':
    case 'OrderedSet':
    case 'Stack':
      const listData: any[] = [];
      iter.forEach((value, key) => {
        listData.push(serializeChild(key, value));
      });
      return { __iterable: iterableType, data: listData };

    case 'Map':
    case 'OrderedMap':
      const mapData: Array<[string | number, any]> = [];
      iter.forEach((value, key) => {
        mapData.push([key, serializeChild(key, value)]);
      });
      return { __iterable: iterableType, data: mapData };
    default:
      return {} as any;
  }
}

export function serializeRecord(
  record: Iterable<string, any>,
  serializeChild: typeof serializeData,
): SerializedRecord | any {
  const recordDataMap = record.toMap();
  const recordData: { [key: string]: any } = {};

  recordDataMap.forEach((value, key) => {
    recordData[key!] = serializeChild(key!, value);
  });

  const recordName = (record as any)._name;

  if (!recordName) {
    return recordData;
  }

  return {
    __record: recordName,
    data: recordData,
  };
}

export function serializeDataAsync(_key: string | number, value: any) {
  let result = value;

  if (!(value instanceof Promise)) {
    if (value instanceof Record) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(serializeRecord(value as any, serializeDataAsync));
        });
      });
    } else if (Iterable.isIterable(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(serializeIterable(value, serializeDataAsync));
        });
      });
    } else if (Array.isArray(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(serializeArray(value, serializeDataAsync));
        });
      });
    } else if (typeof value === 'object' && value !== null) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(serializePlainObject(value, serializeDataAsync));
        });
      });
    }
  }

  return result;
}
