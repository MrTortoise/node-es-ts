import { EventRouter, Handler, Matcher } from "./eventRouter";
import { Stream, Event } from "./types";

export interface IEventStore {
  writeToStream(streamName: string, event: Event): Promise<void>
  readStream(streamName: string): Promise<Stream>
}

export type StoredEvent = Event & {position:number}

export class EventStore {
  private store: IEventStore;
  private router: EventRouter;
  
  constructor(store: IEventStore, router: EventRouter) {
    this.store = store
    this.router = router
  }

  async writeToStream(streamId: string, currentPosition: number, event: Event) {
    let stream = await this.store.readStream(streamId);
    if (stream == undefined) {
      stream = { events: [], currentPosition: -1 };
    }

    if (stream.currentPosition != currentPosition)
      throw new Error("incorrect stream position");

    await this.store.writeToStream(streamId, event);
    this.router.routeEvent(event);
  }

  async readStream(streamId: string): Promise<Stream> {
    return await this.store.readStream(streamId)
  }

  registerForEvent(name: string, matcher: Matcher, eventHandler: Handler) {
    this.router.registerForEvent(name, matcher, eventHandler)
  }
}
