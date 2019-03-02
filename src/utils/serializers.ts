import { Collection, isCollection, Record } from 'immutable';
import {
  SerializedCollection,
  SerializedRecord,
} from '../types/serializedData';
import { getCollectionType } from './collections';
import { isDate, isRegExp } from './nativeTypes';

export function serializeData(_key: string | number, value: any): any {
  let result = value;

  if (Record.isRecord(value)) {
    result = serializeRecord(value as any, serializeData);
  } else if (isCollection(value)) {
    result = serializeCollection(value, serializeData);
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

function serializeListLikeData(
  collection: Collection<any, any>,
  serializeChild: typeof serializeData,
): any[] {
  const listData: any[] = [];
  collection.forEach((value, key) => {
    listData.push(serializeChild(key, value));
  });
  return listData;
}

function serializeMapLikeData(
  collection: Collection<any, any>,
  serializeChild: typeof serializeData,
): Array<[string | number, any]> {
  const mapData: Array<[string | number, any]> = [];
  collection.forEach((value, key) => {
    mapData.push([key, serializeChild(key, value)]);
  });
  return mapData;
}

const collectionToSerializer = {
  List: serializeListLikeData,
  OrderedSet: serializeListLikeData,
  Set: serializeListLikeData,
  Stack: serializeListLikeData,

  Map: serializeMapLikeData,
  OrderedMap: serializeMapLikeData,
};

export function serializeCollection(
  collection: Collection<any, any>,
  serializeChild: typeof serializeData,
): SerializedCollection | never {
  const collectionType = getCollectionType(collection);
  if (!collectionType) {
    throw new Error(`Cannot find type of collection: ${collection}`);
  }

  return {
    __collection: collectionType,
    data: collectionToSerializer[collectionType](collection, serializeChild),
  };
}

export function serializeRecord(
  record: Record<any>,
  serializeChild: typeof serializeData,
): SerializedRecord | any {
  const recordData: { [key: string]: any } = {};

  record.toSeq().forEach((value, key) => {
    recordData[key as string] = serializeChild(key as string, value);
  });

  const recordName =
    Record.getDescriptiveName(record) ||
    (record as any).displayName ||
    (record as any)._name;

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
    if (Record.isRecord(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(serializeRecord(value as any, serializeDataAsync));
        });
      });
    } else if (isCollection(value)) {
      result = new Promise((resolve) => {
        setImmediate(() => {
          resolve(serializeCollection(value, serializeDataAsync));
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
