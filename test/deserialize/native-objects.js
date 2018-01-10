import it from 'ava'

import helpers from './_helpers'



it('should deserialize a Date object', (test) => {
  const data = { '__date': '2016-09-08T00:01:02Z' }

  helpers.testDeserialization(test, data, new Date(data['__date']))
})


it('should deserialize a RegExp object', (test) => {
  const data = { '__regexp': '/(what)?\\w+$/' }

  helpers.testDeserialization(test, data, new RegExp('(what)?\\w+$'))
})


it('should deserialize a RegExp object with flags', (test) => {
  const data = { '__regexp': '/(what)?\\w+$/ig' }

  helpers.testDeserialization(test, data, new RegExp('(what)?\\w+$', 'ig'))
})


it('should ignore deserializers option', (test) => {
  const data = { '__regexp': '/(what)?\\w+$/ig' }

  helpers.testDeserialization(test, data, new RegExp('(what)?\\w+$', 'ig'), {
    deserializers: {
      'Sample': (data) => `${data}-transformed`,
    },
  })
})
