import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Record,
  Set,
  Stack,
} from 'immutable';
import { DeserializationOptions } from '../types/options';
import {
  SerializedCollection,
  SerializedRecord,
} from '../types/serializedData';
import { getUniqueId } from './getUniqueId';

export function decodeData(
  key: string,
  value: any,
  options: DeserializationOptions,
) {
  if (typeof value === 'object' && value) {
    if (value.__record) {
      return decodeRecord(key, value, options);
    } else if (value.__collection) {
      return decodeCollection(key, value, options);
    } else if (value.__date) {
      return new Date(value.__date);
    } else if (value.__regexp) {
      const regExpParts = value.__regexp.split('/');
      return new RegExp(regExpParts[1], regExpParts[2]);
    }
  }
  return value;
}

const getUniqueAnonymousRecordId = getUniqueId('AnonymousRecord');

function decodeRecord(
  key: string,
  recInfo: SerializedRecord,
  options: DeserializationOptions,
) {
  const { __record: recordName, data } = recInfo;
  const { recordTypes = {}, throwOnMissingRecordType = true } = options;
  const RecordType = recordTypes[recordName];
  if (!RecordType && throwOnMissingRecordType) {
    throw new Error(`Unknown record type: ${recordName}`);
  }

  let decodedData: any = decodeData(key, data, options);
  if (!!RecordType && typeof (RecordType as any).migrate === 'function') {
    decodedData = (RecordType as any).migrate(decodedData);
  }

  let record;
  if (!RecordType) {
    // If the record type does not exist, create an AnonymousRecord
    // that contains all of the keys in the decodedData with a default of
    // undefined
    const defaultsForAnonymousRecord = Object.keys(decodedData).reduce(
      (defaults, dataKey: string) => {
        defaults[dataKey] = undefined;
        return defaults;
      },
      {} as any,
    );
    record = new (Record(
      defaultsForAnonymousRecord,
      getUniqueAnonymousRecordId(),
    ))(decodedData);
  } else {
    record = new RecordType(decodedData);
  }

  return record;
}

const collectionTypeToConstructor = {
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Set,
  Stack,
};

function decodeCollection(
  key: string,
  iterInfo: SerializedCollection,
  options: DeserializationOptions,
): Collection<any, any> | never {
  const { __collection: collectionType, data } = iterInfo;
  const CollectionConstructor = collectionTypeToConstructor[collectionType];

  if (!CollectionConstructor) {
    throw new Error(`Unknown collection type: ${collectionType}`);
  }

  return (CollectionConstructor as any)(decodeData(key, data, options));
}
