import { EventStore } from "./EventStore"
import { Command, PolicyApplicator, Event } from "./types"

// this lacks expected version handling - with an aggregate with multiple users this will go bad
export const CommandHandler = <State, TCommand extends Command, TEvent extends Event>(
    getEventStore: () => EventStore,
    buildStreamName: (id: string) => string,
    policyApplicator: PolicyApplicator<State, TCommand, TEvent>
) => async (id: string, command: TCommand) => {
    const store = getEventStore()
    const streamId = buildStreamName(id)
    const stream = await store.readStream(streamId)
    const events = stream === undefined ? [] : stream.events
    const currentPosition = stream === undefined ? -1 : stream.currentPosition
    const state = events.reduce<State>(policyApplicator.applyEvent, policyApplicator.getInitialState())
    const newEvents = await policyApplicator.applyPolicy(command, state)
    return await store.writeToStream(streamId, currentPosition, newEvents)
}