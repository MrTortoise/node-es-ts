import { IEventStore } from "./EventStore";
import { Streams, Stream, Event } from "./types"

export class InMemoryStore implements IEventStore {
    streams: Streams
    // think dynamo db with an document that stores position and a list of events
    constructor() {
        this.streams = {}
    }

    async writeToStream(streamName: string, event: Event | Event[]): Promise<Event[]> {
        let stream = this.streams[streamName];
        const events = Array.isArray(event) ? event.map(e => { return { ...e } }) : [{ ...event }]

        if (stream == undefined) {
            const l = events.length
            for (let i = 0; i < l; i++) {
                events[i].position = i
            }

            stream = { events: events, currentPosition: l };
        } else {
            const start = stream.events.length
            const l = events.length
            for (let i = start; i < start + l; i++) {
                events[i].position = i
            }

            stream = {
                events: [...stream.events, ...events],
                currentPosition: stream.currentPosition + l,
            };
        }

        this.streams[streamName] = stream;
        return events
    }

    async readStream(streamName: string): Promise<Stream> {
        return this.streams[streamName];
    }
}