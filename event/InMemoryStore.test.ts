
// import {describe, expect, it} from '@jest/globals';
import { InMemoryStore } from "./InMemoryStore";

describe("In Memory Store will", () => {
    it('will write and read a stream', async () => {
        const store = new InMemoryStore()
        await store.writeToStream('test', { type: 'TestEvent',position: 'notWrittenYet', data: { key: 'dave' } })
        const s = await store.readStream('test')

        expect(s).toEqual({"currentPosition": 1, "events": [{"data": {"key": "dave"}, "position": 0, "type": "TestEvent"}]})
    });

})