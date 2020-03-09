'use strict'

const fs = require('fs')
const filepath = './2020-03-06T00:00:01.289Z-to-2020-03-06T23:59:56.767Z.json'

class Stream {
  constructor(stream) {
    this.id = stream.id
    this.createdAt = stream.createdAt
    this.name = stream.name
    this.videoType = stream.videoType

    this.destroyReason = stream.destroyReason || null
    this.duration = stream.duration || null
    this.destroyedAt = stream.destroyedAt || null
  }

  end({ timestamp, reason }) {
    this.destroyReason = reason
    this.duration = timestamp - this.createdAt
    this.destroyedAt = timestamp
  }
}

const events = JSON.parse(fs.readFileSync(filepath, 'utf8'))
const streams = []

console.log('Handling events...')

events
  .sort((a, b) => a.timestamp - b.timestamp)
  .forEach(event => {
    switch (event.event) {
      case 'streamCreated':
        streams.push(new Stream(event.stream))
        break;
      case 'streamDestroyed':
        const stream = streams.find(stream => stream.id === event.stream.id)

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

const totalStreamsDurationSeconds = streams.reduce((sum, s) => sum += s.duration, 0)

console.log({
  events_filepath: filepath,
  handled_events: events.length,
  total_streams: streams.length,
  total_streams_duration_minutes: (totalStreamsDurationSeconds / 1000) / 60
})
