import { IEventStore } from "./EventStore";
import { Streams, Stream, Event } from "./types"

export class InMemoryStore implements IEventStore {
    streams: Streams
    // think dynamo db with an document that stores position and a list of events
    constructor() {
        this.streams = {}
    }

    async writeToStream(streamName: string, event: Event): Promise<Event> {
        let stream = this.streams[streamName];
        const eventToWrite = {...event}
        if (stream == undefined) {
            eventToWrite.position = 0
            stream = { events: [eventToWrite], currentPosition: 0 };
        } else {
            eventToWrite.position = stream.events.length
            
            stream = {
                events: [...stream.events, eventToWrite],
                currentPosition: stream.currentPosition++,
            };
        }

        this.streams[streamName] = stream;
        return eventToWrite
    }

    async readStream(streamName: string): Promise<Stream> {
        return this.streams[streamName];
    }
}