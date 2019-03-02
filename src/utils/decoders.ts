import { List, Map, OrderedMap, OrderedSet, Set, Stack } from 'immutable';
import { DeserializationOptions } from '../types/options';
import { SerializedIterable, SerializedRecord } from '../types/serializedData';

export function decodeData(
  key: string,
  value: any,
  options: DeserializationOptions,
) {
  if (typeof value === 'object' && value) {
    if (value.__record) {
      return decodeRecord(key, value, options);
    } else if (value.__iterable) {
      return decodeIterable(key, value, options);
    } else if (value.__date) {
      return new Date(value.__date);
    } else if (value.__regexp) {
      const regExpParts = value.__regexp.split('/');
      return new RegExp(regExpParts[1], regExpParts[2]);
    }
  }
  return value;
}

function decodeRecord(
  key: string,
  recInfo: SerializedRecord,
  options: DeserializationOptions,
) {
  const { __record: recordName, data } = recInfo;
  const { recordTypes = {} } = options;
  const RecordType = recordTypes[recordName];
  if (!RecordType) {
    throw new Error(`Unknown record type: ${recordName}`);
  }

  let decodedData: any = decodeData(key, data, options);
  if (typeof (RecordType as any).migrate === 'function') {
    decodedData = (RecordType as any).migrate(decodedData);
  }

  return new RecordType(decodedData);
}

function decodeIterable(
  key: string,
  iterInfo: SerializedIterable,
  options: DeserializationOptions,
):
  | Map<any, any>
  | Set<any>
  | List<any>
  | OrderedSet<any>
  | Stack<any>
  | OrderedMap<any, any>
  | never {
  const { __iterable: iterableType, data } = iterInfo;
  switch (iterableType) {
    case 'List':
      return List(decodeData(key, data, options));

    case 'Set':
      return Set(decodeData(key, data, options));

    case 'OrderedSet':
      return OrderedSet(decodeData(key, data, options));

    case 'Stack':
      return Stack(decodeData(key, data, options));

    case 'Map':
      return Map(decodeData(key, data, options));

    case 'OrderedMap':
      return OrderedMap(decodeData(key, data, options));

    default:
      throw new Error(`Unknown iterable type: ${iterableType}`);
  }
}
