import { EventRouter, Handler } from "./eventRouter";
import { Event } from "./types"

describe("readmodels want to specify what events they recievee", () => {
    it("registers for event type 'BasketCreated' and gets the event", () => {
        const router = new EventRouter();
        let result: Event;
        const handler: Handler = {
            handle: (e: Event): void => {
                result = e;
            },
        };

        router.registerForEvent(
            "TotalBasketReadmodel",
            { type: "BasketCreated" },
            handler
        );
        router.routeEvent({ type: "BasketCreated", position: 'notWrittenYet', data: {} });

        expect(result.type).toEqual("BasketCreated");
    });

    it("registers for  events and gets both events", () => {
        let router = new EventRouter();
        let result = [];
        const handler = {
            handle: (e: Event) => {
                result.push(e.type);
            },
        };

        router.registerForEvent(
            "TotalBasketReadmodel",
            { type: ["BasketCreated", "ItemAddedToBasket"] },
            handler
        );

        router.routeEvent({ type: "BasketCreated", data: {}, position: 'notWrittenYet' });
        router.routeEvent({ type: "ItemAddedToBasket", data: {}, position: 'notWrittenYet' });

        expect(result).toEqual(["BasketCreated", "ItemAddedToBasket"]);
    });

    it("registers for  events and gets both events and not others", () => {
        let router = new EventRouter();
        let result = [];
        const handler = {
            handle: (e: Event) => {
                result.push(e.type);
            },
        };
        router.registerForEvent(
            "TotalBasketReadmodel",
            { type: ["BasketCreated", "ItemAddedToBasket"] },
            handler
        );

        router.routeEvent({ type: "BasketCreated", data: {}, position: 'notWrittenYet' });
        router.routeEvent({ type: "ItemAddedToBasket", data: {}, position: 'notWrittenYet' });
        router.routeEvent({ type: "Dave", data: {}, position: 'notWrittenYet' });

        expect(result).toEqual(["BasketCreated", "ItemAddedToBasket"]);
    });

    it("2 registrations, one sends event one way and the other another", () => {
        let router = new EventRouter();
        let result1: Event, result2: Event;

        const handler = {
            handle: (e: Event) => {
                result1 = e;
            },
        };

        const handler2 = {
            handle: (e: Event) => {
                result2 = e;
            },
        };

        router.registerForEvent(
            "TotalBasketReadmodel",
            { type: "BasketCreated" },
            handler
        );
        router.registerForEvent(
            "TotalBasketReadmodel2",
            { type: "BasketCreated" },
            handler2
        );
        const inputEvent : Event= { type: "BasketCreated", position: 'notWrittenYet', data: {} };
        router.routeEvent(inputEvent);
        expect(result1).toEqual(result2);
        expect(result1).toEqual(inputEvent);
    });

    it("1 registrationfor 1 event, send 2 events ensure only 1 recieved", () => {
        let router = new EventRouter();
        let result = [];
        const handler = {
            handle: (e: Event) => {
                result.push(e);
            },
        };
        router.registerForEvent(
            "TotalBasketReadmodel",
            { type: "BasketCreated" },
            handler
        );
        router.routeEvent({ type: "BasketCreated", data: {}, position: 'notWrittenYet' });
        router.routeEvent({ type: "Dave", data: {}, position: 'notWrittenYet' });

        expect(result).toEqual([{ type: "BasketCreated", data: {}, position: 'notWrittenYet' }]);
    });
});
