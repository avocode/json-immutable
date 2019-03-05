import { CollectionType } from './collectionTypes';

export interface SerializedCollection {
  __collection: CollectionType;
  data: any[] | Array<[string | number, any]>;
}

export interface SerializedRecord {
  __record: string;
  data: { [key: string]: any };
}
