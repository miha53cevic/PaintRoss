export type EventListener = (data?: unknown) => void;
export type EventType =
    'change tool' |
    'change primary colour' |
    'change secondary colour' |
    'open image' |
    'change canvas coordinates';

export default class EventManager {
    private _listeners: Map<EventType, EventListener[]> = new Map();

    public Subscribe(event: EventType, listener: EventListener) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, [listener]);
        } else this._listeners.get(event)!.push(listener);
    }

    public Unsubscribe(event: EventType, listener: EventListener) {
        if (!this._listeners.has(event)) throw new Error("Event doesn't have any listeners!");
        const filtered = this._listeners.get(event)!.filter(l => l !== listener);
        if (filtered.length === this._listeners.get(event)!.length) throw new Error(`Listener is not subscribed to ${event}`);
        this._listeners.set(event, filtered);
    }

    public Notify(event: EventType, data?: unknown) {
        if (!this._listeners.has(event)) return; // no listeners for this event registered
        this._listeners.get(event)!.forEach(listener => listener(data));
    }
}