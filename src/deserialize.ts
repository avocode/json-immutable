import { DeserializationOptions } from './types/options';
import { decodeData } from './utils/decoders';

export function deserialize(
  json: string,
  options: DeserializationOptions = {},
) {
  return JSON.parse(json, (key, value) => {
    return decodeData(key, value, options);
  });
}
