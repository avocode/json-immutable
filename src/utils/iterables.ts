import {
  Iterable,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Set,
  Stack,
} from 'immutable';
import { IterableType } from '../types/iterableTypes';

export function getIterableType(
  iterable: Iterable<string | number, any>,
): IterableType | undefined {
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
