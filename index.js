'use strict'

const fs = require('fs')
const Stream = require('./classes/Stream')
const filepath = './sample-events/2020-03-06T00:00:00.000Z-to-2020-03-06T23:59:59.999Z.json'
const events = JSON.parse(fs.readFileSync(filepath, 'utf8'))

console.log('Handling events...')

// Will hold all Streams created by `streamCreated` events.
const savedStreams = []

events
  // sort events by timestamp to make sure they are ordered correctly.
  .sort((a, b) => a.timestamp - b.timestamp)
  // for each event:
  .forEach(event => {
    switch (event.event) {
      case 'streamCreated':
        // push new `Stream` to Saved Streams.
        savedStreams.push(new Stream(event.stream))
        break;
      case 'streamDestroyed':
        // find existing Saved Stream and end it.
        const stream =
          savedStreams.find(stream => stream.id === event.stream.id)

        if (stream) {
          stream.end({
            timestamp: event.timestamp,
            reason: event.reason
          })
        }
        break;
      default:
        // we only handle `streamCreated`, `streamDestroyed` events.
    }
  })

// Calculate total duration of all Saved Streams.
const totalStreamsDurationSeconds =
  savedStreams.reduce((sum, s) => sum += s.duration, 0)

// Log the result in minutes.
console.log({
  events_filepath: filepath,
  handled_events: events.length,
  total_streams: savedStreams.length,
  total_streams_duration_minutes: (totalStreamsDurationSeconds / 1000) / 60
})
