import { Event } from "../event/types";

export type Projector<State> = {
    applyEvent: (currentState: State, event: Event) => State;
    getInitialState: () => State;
};
