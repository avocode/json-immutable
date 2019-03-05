import { Record } from 'immutable';

export interface SerializationOptions {
  pretty?: boolean;
}

export interface SerializationStreamOptions {
  bigChunks?: boolean;
  pretty?: boolean;
}

export interface DeserializationOptions {
  recordTypes?: { [recordName: string]: ReturnType<typeof Record> };
  throwOnMissingRecordType?: boolean;
}
