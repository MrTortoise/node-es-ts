import { IEventStore, StoredEvent } from "./EventStore";
import { Streams, Stream, Event } from "./types"

export class InMemoryStore implements IEventStore {
    streams: Streams
    // think dynamo db with an document that stores position and a list of events
    constructor() {
        this.streams = {}
    }

    async writeToStream(streamName: string, event: Event): Promise<void> {
        let stream = this.streams[streamName];
        if (stream == undefined) {
            const e: StoredEvent = {...event, position : 0};
            stream = { events: [e], currentPosition: 0 };
        } else {
            const e: StoredEvent = {...event, position : stream.events.length};
            
            stream = {
                events: [...stream.events, e],
                currentPosition: stream.currentPosition++,
            };
        }

        this.streams[streamName] = stream;
    }

    async readStream(streamName: string): Promise<Stream> {
        return this.streams[streamName];
    }
}