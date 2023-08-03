import { EventStore } from "../event/EventStore"
import { InMemoryStore } from "../event/InMemoryStore"
import { EventRouter, Handler, Matcher } from "../event/eventRouter"
import { CommandHandler, Event } from "../event/types"
import { Basket, BasketCommand, BasketEvent, BasketPolicyApplicator } from "./basket"

interface BasketReportItem { id: string }
type BasketReport = Record<string, BasketReportItem>

export type Projector<State> = {
    applyEvent: (currentState: State, event: Event) => State;
    getInitialState: () => State;
};

export class ProjectionStore {
    private store: Record<string, unknown> = {}
    put(id: string, data: unknown) {
        this.store[id] = data
    }
    get<T>(id: string): T {
        return this.store[id] as T
    }
}

const ProjectionHandler = <State>(
    getEventRouter: () => EventRouter,
    getProjectionStore: () => ProjectionStore,
    projectionName: string,
    matcher: Matcher,
    projection: Projector<State>) => {
    const handler: Handler = {
        handle: (event: Event) => {
            const projectionStore = getProjectionStore()
            const state = projectionStore.get<State>(projectionName) ?? projection.getInitialState()
            const newState = projection.applyEvent(state, event)
            projectionStore.put(projectionName, newState)
        }
    }

    const router = getEventRouter()
    router.registerForEvent(projectionName, matcher, handler)
}



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
            getInitialState: ()=>{return {}}
        }

        const projectBasketModel = ProjectionHandler<BasketReport>(
            () => eventRouter,
            () => projectionStore,
            'testProjection',
            matcher,
            basketProjector)

            await handleBasketCommand('dave', {type: 'CreateBasket',data:{id:'davesBasket'}})
            
            const result = projectionStore.get('testProjection')
            expect(result).toEqual({"davesBasket": {"id": "davesBasket"}})

    })
})