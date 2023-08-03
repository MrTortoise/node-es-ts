import { EventRouter, Handler, Matcher } from "../event/eventRouter"
import { ProjectionStore } from "./ProjectionStore"
import { Projector } from "./projector"
import {Event} from "../event/types"

export const ProjectionHandler = <State>(
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

