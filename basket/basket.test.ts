import { EventStore } from "../event/EventStore"
import { InMemoryStore } from "../event/InMemoryStore"
import { EventRouter } from "../event/eventRouter"
import { CommandHandler } from "../event/types"
import { Basket, BasketCommand, BasketEvent, BasketPolicyApplicator } from "./basket"

describe('basket will do things like', () => {
    it('will have basket created on create basket', async () => {
        const store = new InMemoryStore()
        const handleBasketCommand =
            CommandHandler<Basket, BasketCommand, BasketEvent>(
                () => new EventStore(store, new EventRouter()),
                (id) => 'Basket-' + id,
                BasketPolicyApplicator)

        await handleBasketCommand('4', { type: 'CreateBasket', data: { id: '4' } })
        const stream = await store.readStream('Basket-4')
        expect(stream.currentPosition).toBe(1)
    })
})