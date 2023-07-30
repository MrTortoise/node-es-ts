import { EventEmitter } from "events";
import { Event } from "./types";

export type Matcher = Record<string, unknown | unknown[]>
export type Handler = {handle: (e: Event) => void}

function isMatch(matcher: Matcher, event: Event) {
  // whilst this is very standard its intended to be compatible with AWS kinesis
  if (matcher == undefined) {
    return false;
  }

  for (var prop in matcher) {
    const value = matcher[prop];
    if (typeof value == "string" || value instanceof String) {
      if (event[prop] !== value) return false;
    }

    if (Array.isArray(value)) {
      return value.some((v) => {
        return event[prop] === v;
      });
    }
  }
  return true;
}

export class EventRouter {
  private subscrptions: Record<string, Matcher>;
  private emitter: EventEmitter;
  
  // think kinesis
  constructor() {
    this.subscrptions = {};
    this.emitter = new EventEmitter();
  }

  registerForEvent(name: string, matcher: Matcher, eventHandler: Handler ) {
    this.subscrptions = { ...this.subscrptions, [name]: matcher };
    this.emitter.on(name, eventHandler.handle.bind(eventHandler));
  }

  routeEvent(event: Event) {
    const names = Object.keys(this.subscrptions);
    const matchedNames = names.filter((n) =>
      isMatch(this.subscrptions[n], event)
    );
    //console.log({matchedNames, emitter: this.emitter, event})
    matchedNames.forEach((n) => this.emitter.emit(n, event));
  }
}
