import { IterableType } from './iterableTypes';

export interface SerializedIterable {
  __iterable: IterableType;
  data: any[] | Array<[string | number, any]>;
}

export interface SerializedRecord {
  __record: string;
  data: { [key: string]: any };
}
