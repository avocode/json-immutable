import { isCollection, Record } from 'immutable';
import JSONStreamStringify from 'json-stream-stringify';
import {
  SerializationOptions,
  SerializationStreamOptions,
} from './types/options';
import {
  isSupportedNativeType,
  patchNativeTypeMethods,
} from './utils/nativeTypes';
import { serializeData, serializeDataAsync } from './utils/serializers';

export function serialize(
  data: any,
  options: SerializationOptions = {},
): string | never {
  if (
    isCollection(data) ||
    Record.isRecord(data) ||
    isSupportedNativeType(data)
  ) {
    const patchedData = Object.create(data);

    if (isSupportedNativeType(data)) {
      // NOTE: When native type (such as Date or RegExp) methods are called
      //   on an `Object.create()`'d objects, invalid usage errors are thrown
      //   in many cases. We need to patch the used methods to work
      //   on originals.
      patchNativeTypeMethods(patchedData, data);
    }

    // NOTE: JSON.stringify() calls the #toJSON() method of the root object.
    //   Immutable.JS provides its own #toJSON() implementation which does not
    //   preserve map key types.
    patchedData.toJSON = function() {
      return this;
    };

    data = patchedData;
  }

  const indentation = options.pretty ? 2 : 0;

  return JSON.stringify(data, serializeData, indentation);
}

export function createSerializationStream(
  data: any,
  options: SerializationStreamOptions = {},
) {
  const indentation = options.pretty ? 2 : 0;
  const replacer = options.bigChunks ? serializeData : serializeDataAsync;

  const stream = new JSONStreamStringify(
    data,
    replacer,
    indentation,
    undefined,
  );
  return stream;
}
