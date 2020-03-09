'use strict'

// Class to recreate Streams.
class Stream {
  constructor(stream) {
    // Standard Stream properties
    this.id = stream.id
    this.createdAt = stream.createdAt
    this.name = stream.name
    this.videoType = stream.videoType

    // This will get set when we end the stream, using info from
    // the `streamDestroyed` event.
    this.destroyReason = stream.destroyReason || null
    this.duration = stream.duration || null
    this.destroyedAt = stream.destroyedAt || null
  }

  // Method to *end* the stream. When a stream is ended,
  // it's total duration is calculated.
  end({ timestamp, reason }) {
    this.destroyReason = reason
    this.duration = timestamp - this.createdAt
    this.destroyedAt = timestamp
  }
}

module.exports = Stream
