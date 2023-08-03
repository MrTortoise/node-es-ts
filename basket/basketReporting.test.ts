import { EventStore } from "../event/EventStore"
import { InMemoryStore } from "../adapters/InMemoryStore"
import { CommandHandler } from "../event/commandHandler"
import { EventRouter, Matcher } from "../event/eventRouter"
import { Event } from "../event/types"
import { ProjectionStore } from "../adapters/ProjectionStore"
import { ProjectionHandler } from "../projection/projectionHandler"
import { Projector } from "../projection/projector"
import { Basket, BasketCommand, BasketEvent, BasketPolicyApplicator } from "./basket"

interface BasketReportItem { id: string }
type BasketReport = Record<string, BasketReportItem>

describe('basket report listens for basket events and updates a set of basket data', () => {
    it('will maintain a lis tof created baskets', async () => {
        const store = new InMemoryStore()
        const eventRouter = new EventRouter()
        const eventStore = new EventStore(store, eventRouter)
        const handleBasketCommand =
            CommandHandler<Basket, BasketCommand, BasketEvent>(
                () => eventStore,
                (id) => 'Basket-' + id,
                BasketPolicyApplicator)

        const matcher: Matcher = {
            type: 'BasketCreated'
        }
        const projectionStore = new ProjectionStore()

        const basketProjector: Projector<BasketReport> = {
            applyEvent: (state: BasketReport, event: Event): BasketReport => {
                switch (event.type) {
                    case 'BasketCreated':
                        const e = event as BasketEvent
                        if ("id" in e.data) {
                            return { ...state, [e.data.id]: { id: e.data.id } }
                        }
                }

                return state
            },
            getInitialState: () => { return {} }
        }

        const projectBasketModel = ProjectionHandler<BasketReport>(
            () => eventRouter,
            () => projectionStore,
            'testProjection',
            matcher,
            basketProjector)

        await handleBasketCommand('dave', { type: 'CreateBasket', data: { id: 'davesBasket' } })

        const result = projectionStore.get('testProjection')
        expect(result).toEqual({ "davesBasket": { "id": "davesBasket" } })

    })
})