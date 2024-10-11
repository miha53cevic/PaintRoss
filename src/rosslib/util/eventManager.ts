import { vec2 } from "gl-matrix";
import { RGB } from "./colour";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventListener = (args: any) => void;
interface TEventTypeList {
    [eventName: string]: EventListener,
}
interface EventTypeList extends TEventTypeList {
    'ChangeTool': (toolId: string) => void,
    'ChangePrimaryColour': (colour: RGB) => void,
    'ChangeSecondaryColour': (colour: RGB) => void,
    'OpenImage': () => void,
    'ChangeCanvasCoordinates': (canvasPos: vec2) => void,
}
export type EventType = keyof EventTypeList;
type EventListenerParameter<T extends EventType> = Parameters<EventTypeList[T]>[0];

export default class EventManager {
    private _listeners: Map<EventType, EventListener[]> = new Map();

    public Subscribe<T extends EventType>(event: T, listener: EventTypeList[T]) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, [listener]);
        } else this._listeners.get(event)!.push(listener);
    }

    public Unsubscribe<T extends EventType>(event: T, listener: EventTypeList[T]) {
        if (!this._listeners.has(event)) throw new Error("Event doesn't have any listeners!");
        const filtered = this._listeners.get(event)!.filter(l => l !== listener);
        if (filtered.length === this._listeners.get(event)!.length) throw new Error(`Listener is not subscribed to ${event}`);
        this._listeners.set(event, filtered);
    }

    public Notify<T extends EventType>(event: T, data?: EventListenerParameter<T>) {
        if (!this._listeners.has(event)) return; // no listeners for this event registered
        this._listeners.get(event)!.forEach(listener => listener(data));
    }
}