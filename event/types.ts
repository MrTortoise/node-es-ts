import { EventStore } from "./EventStore";

export type Event<
    EventType extends string = string,
    EventData extends Record<string, unknown> = Record<string, unknown>
> = Readonly<{
    type: Readonly<EventType>;
    data: Readonly<EventData>;
    position: Readonly<number | 'notWrittenYet'>
}>;

export type Command<
    CommandType extends string = string,
    CommandData extends Record<string, unknown> = Record<string, unknown>
> = Readonly<{
    type: Readonly<CommandType>;
    data: Readonly<CommandData>;
}>;

export type Streams = Record<string, Stream>
export type Stream = {
    currentPosition: number,
    events: Event[]
}

// This is named after DDD ideas ... im not sure that makes sense to other people
// because it hasnt made sense to me for years ... what should we call it?
// Command -> [Aggregate .... applies policy ] -> event[]
export type PolicyApplicator<
    State,
    TypeOfCommand extends Command,
    TypeOfEvent extends Event  // We want to emit events - but it is 
// *very often* bad design to emit 2 
// differnt events at once
> = {
    applyPolicy: (command: TypeOfCommand, state: State) => Promise<TypeOfEvent | TypeOfEvent[]>;
    applyEvent: (currentState: State, event: TypeOfEvent) => State;
    getInitialState: () => State;
};




