
// import {describe, expect, it} from '@jest/globals';
import { InMemoryStore } from "./InMemoryStore";
import { Event } from "./types";

describe("In Memeory Store will", () => {
    it('will write and read a stream', async () => {
        const store = new InMemoryStore()
        await store.writeToStream('test', { type: 'TestEvent', position: 0, data: { key: 'dave' } })
        const s = await store.readStream('test')

        expect(s).toEqual({"currentPosition": 0, "events": [{"data": {"key": "dave"}, "position": 0, "type": "TestEvent"}]})

    });

})