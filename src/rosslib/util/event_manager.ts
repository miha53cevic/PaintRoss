import { RGB } from "./colour";
import Point from "./point";

export interface EventTypeList {
    'change tool': (toolId: string) => void,
    'change primary colour': (colour: RGB) => void,
    'change secondary colour': (colour: RGB) => void,
    'open image': () => void,
    'change canvas coordinates': (canvasPos: Point) => void,
}
export type EventType = keyof EventTypeList;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventListener = (...args: any) => void;

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

    public Notify<T extends EventType>(event: T, data?: Parameters<EventTypeList[T]>[0]) {
        if (!this._listeners.has(event)) return; // no listeners for this event registered
        this._listeners.get(event)!.forEach(listener => listener(data));
    }
}