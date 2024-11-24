export interface ToolOption {
    Name: string,
    Type: 'number' | 'string' | 'boolean' | 'select',
    Value: unknown,
    PossibleValues?: unknown[],
}

export default abstract class ToolOptions {
    protected _options: Map<string, ToolOption> = new Map();

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
    }
}
