import Logger from "../util/logger";

export interface ToolOption {
    Name: string,
    Type: 'number' | 'string' | 'boolean' | 'select',
    Value: unknown,
    PossibleValues?: unknown[],
}

export type ToolOptionListener = (option: ToolOption) => void;

export default abstract class ToolOptions {
    protected _options: Map<string, ToolOption> = new Map();
    protected _listeners: ToolOptionListener[] = [];

    constructor(initialOptions: ToolOption[]) {
        initialOptions.forEach(option => {
            this._options.set(option.Name, option);
        });
    }

    public GetAllOptions(): ToolOption[] {
        return Array.from(this._options.values());
    }

    public GetOption(option: string): ToolOption {
        if (!this._options.has(option)) throw new Error(`Option ${option as string} does not exist`);
        return this._options.get(option)!;
    }

    public SetOption(option: string, value: unknown): void {
        if (!this._options.has(option)) throw new Error(`Option ${option as string} does not exist`);
        this._options.get(option)!.Value = value;
        this.Notify(this._options.get(option)!);
    }

    public Subscribe(listener: ToolOptionListener): void {
        this._listeners.push(listener);
        Logger.Log(this.constructor.name, `OnToolChange Subscribed`);
    }

    public Unsubscribe(listener: ToolOptionListener): void {
        this._listeners = this._listeners.filter(l => l !== listener);
        Logger.Log(this.constructor.name, `OnToolChange Unsubscribed`);
    }

    public Notify(option: ToolOption): void {
        this._listeners.forEach(listener => listener(option));
    }
}
