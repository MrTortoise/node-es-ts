import { EventStore } from "../event/EventStore"
import { InMemoryStore } from "../event/InMemoryStore"
import { EventRouter } from "../event/eventRouter"
import { PolicyApplicator, Event, CommandHandler } from "../event/types"

export interface IItem {
    name: string
}
export type Basket = | { status: 'notCreated' }
    | {
        status: 'available'
    }

export type BasketCommand = {
    type: 'CreateBasket',
    data: { id: string }
}

export type BasketEvent =
    | Event & {
        type: 'BasketCreated',
        data: { id: string }
    }
    | Event & {
        type: 'ItemAdded',
        data: {
            item: IItem,
            cost: number
        }
    }
// Basket Example

// figure out nice errors ... without either
export type BasketErrors =
    | 'UnrecognisedCommand'

const applyToBasket = (state: Basket, { type, data }: BasketEvent): Basket => {
    switch (type) {
        case 'BasketCreated': {
            return { status: 'available' }
        }
    }
}

const getBasketDefaults = (): Basket => {
    return {
        status: 'notCreated'
    }
}

 const basketPolicy = async (command: BasketCommand, state: Basket): Promise<BasketEvent> => {
    const { type, data } = command
    switch (type) {
        case 'CreateBasket': {
            // validation logic on state (throw if invalid state)
            const e: BasketEvent = { type: 'BasketCreated', data, position: 'notWrittenYet' }
            return e;
        }
        default: {
            throw 'UnrecognisedCommand'
        }
    }
}

export const BasketPolicyApplicator:
    PolicyApplicator<
        Basket,
        BasketCommand,
        BasketEvent> = {
    applyPolicy: basketPolicy,
    applyEvent: applyToBasket,
    getInitialState: getBasketDefaults
}
