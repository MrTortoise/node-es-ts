import { EventStore } from "./EventStore";
import { InMemoryStore } from "../adapters/InMemoryStore";
import { EventRouter } from "./eventRouter";
import { Event } from "./types";

describe("eventstore  will write events and route them to appropiate projections", () => {
  let eventStore: EventStore;
  let router: EventRouter;
  beforeEach(() => {
    const store = new InMemoryStore();
    router = new EventRouter();
    eventStore = new EventStore(store, router);
  });

  it("will store an event", async () => {
    const streamName = "streamName";
    await eventStore.writeToStream(streamName, -1, { type: "test", position: 'notWrittenYet', data: { name: "dave" } });
    const stream = await eventStore.readStream(streamName);
    expect(stream.events[0].data.name).toEqual("dave");
  });

  it("will throw if stream is in wrong position", async () => {
    const streamName = "streamName";
    try {
      await eventStore.writeToStream(streamName, 0, { type: "test", position: 'notWrittenYet', data: { name: "dave" } });
    } catch (e) {
      expect(e).toEqual(new Error("incorrect stream position"));
    }
  });

  it("will not forward the event to any not matching handlers / projections", async () => {
    let result: Event;
    const handler = {
      handle: (e: Event) => {
        result = e;
      }
    }

    router.registerForEvent("test", { eventType: "created" }, handler);
    await eventStore.writeToStream("doesntMatter", -1, {
      type: "created",
      data: { key: "dave" },
      position: 'notWrittenYet',
    });

    expect(result).toBeUndefined();
  });

  it("will forward the event to any matching handlers / projections", async () => {
    let result: Event;
    const handler = {
      handle: (e: Event) => {
        result = e;
      }
    }

    router.registerForEvent("test", { type: "created" }, handler);
    await eventStore.writeToStream("doesntMatter", -1, {
      type: "created",
      data: { key: "dave" },
      position: 'notWrittenYet',
    });

    expect(result.data.key).toEqual("dave");
  });
});
