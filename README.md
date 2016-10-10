# JsonImmutable

[![Build Status](https://travis-ci.org/avocode/json-immutable.svg)](https://travis-ci.org/avocode/json-immutable)

Immutable.JS structure-aware JSON serializer/deserializer built around the native `JSON` API.

## Motivation

By using the native `JSON` API, Immutable.JS structures are serialized as plain objects and arrays with no type information. The goal was to preserve both Immutable.JS `Iterable` types (maps, lists, etc.) and `Record` types. `immutable.Map` supports and preserves key types while plain JavaScript object keys are coerced to strings. These types should also preserved.

## Usage

### Plain Objects and Primitive Types

```javascript
const data = { 'a': 'b', 'c': 123, 'd': true }

// Serialize
const json = serialize(data)
// json == '{"a":"b","c":123,"d":true}'

// Deserialize
const result = deserialize(json)
```

### Native Object Types

```javascript
const data = { 'created_at': new Date('2016-09-08'), 'pattern': /iamnative/g }

// Serialize
const json = serialize(data)
// json == '{"created_at":{"__date":"2016-09-08T00:00:00Z"},"pattern":{"__regexp":"/iamnative/g"}}'

// Deserialize
const result = deserialize(json)
```

### Immutable Records

```javascript
const SampleRecord = immutable.Record(
  { 'a': 3, 'b': 4 },
  'SampleRecord'
)

const data = {
  'x': SampleRecord({ 'a': 5 }),
}

// Serialize
const json = serialize(data)
// json == '{"x":{"__record":"SampleRecord","data":{"a":5}}}'

// Deserialize
const result = deserialize(json, {
  recordTypes: {
    'SampleRecord': SampleRecord
  }
})
```

Record types can be named. This is utilized by the serializer/deserializer to revive `immutable.Record` objects. See the `SampleRecord` name passed into `immutable.Record()` as the second argument.

### Unknown Records

```javascript
const SampleRecord = immutable.Record(
  { 'a': 3, 'b': 4 },
  'SampleRecord'
)

const data = {
  'x': SampleRecord({ 'a': 5 }),
}

// Serialize
const json = serialize(data)
// json == '{"x":{"__record":"SampleRecord","data":{"a":5}}}'

// Deserialize
const result = deserialize(json, {
  parseUnknownRecords: true
})
```

```javascript
const UnnamedRecord = immutable.Record(
  { 'a': 3, 'b': 4 }
)

const data = {
  'x': UnnamedRecord({ 'a': 5 }),
}

// Serialize
const json = serialize(data)
// json == '{"x":{"a":5}}'
const json2 = serialize(data, { storeUnknownRecords: true })
// json == '{"x":{"__record":"__unknown","data":{"a":5}}}'

// Deserialize
const result = deserialize(json2, {
  parseUnknownRecords: true
})
```

### General Immutable Structures

```javascript
const data = {
  'x': immutable.Map({
    'y': immutable.List.of(1, 2, 3)
  }),
}

// Serialization
const json = serialize(data)
// json == '{"x":{"__iterable":"Map","data":[["y",{"__iterable":"List","data":[1,2,3]"}]]}}'

// Deserialize
const result = deserialize(json)
```

- Immutable structures, plain objects and primitive data can be safely composed together.

- `immutable.Map` key type information is preserved as opposed to the bare `JSON` API.

NOTE: When an unknown Immutable iterable type is encountered during deserialization, an error is thrown. The supported types are `List`, `Map`, `OrderedMap`, `Set`, `OrderedSet` and `Stack`.

## API

- **`serialize()`**

    Arguments:

    - `data`: The data to serialize.
    - `options={}`: Serialization options.
        - `pretty=false`: Whether to pretty-print the result (2 spaces).
        - `storeUnknownRecords=false`: Whether to save unnamed records as objects or records

    Return value:

    - `string`: The JSON representation of the input (`data`).

- **`deserialize()`**

    Arguments:

    - `json`: A JSON representation of data.
    - `options={}`: Deserialization options.
        - `recordTypes={}`: `immutable.Record` factories.
        - `parseUnknownRecords=true`: deserialize unknown `immutable.Record`

    Return value:

    - `any`: Deserialized data.

### Streaming API

- **`createSerializationStream()`**

    Arguments:

    - `data`: The data to serialize.
    - `options={}`: Serialization options.
        - `pretty=false`: Whether to pretty-print the result (2 spaces).
        - `bigChunks=false`: Whether the serialized data should only be split into chunks based on the reader speed. By default, each data structure level is processed in its own event loop microtask which.
            - NOTE: When `bigChunks=true`, a (possibly substantial) portion of the data is serialized synchronously.

    Return value:

    - `stream.PassThrough<!Buffer>`: A readable stream emitting the JSON representation of the input (`data`).

## Running Tests

1. Clone the repository.
2. `npm install`
3. `npm test`
