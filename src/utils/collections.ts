import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Set,
  Stack,
} from 'immutable';
import { CollectionType } from '../types/collectionTypes';

export function getCollectionType(
  iterable: Collection<string | number, any>,
): CollectionType | undefined {
  if (List.isList(iterable)) {
    return 'List';
  }

  if (Stack.isStack(iterable)) {
    return 'Stack';
  }

  if (Set.isSet(iterable)) {
    if (OrderedSet.isOrderedSet(iterable)) {
      return 'OrderedSet';
    }

    return 'Set';
  }

  if (Map.isMap(iterable)) {
    if (OrderedMap.isOrderedMap(iterable)) {
      return 'OrderedMap';
    }

    return 'Map';
  }

  return undefined;
}
