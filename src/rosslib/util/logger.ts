export default class Logger {
    private static _enabled: boolean = false;

    static Enable(): void {
        this._enabled = true;
    }

    static Disable(): void {
        this._enabled = false;
    }

    static Log(level: string, message: string): void {
        if (!this._enabled) return;
        console.log(`[${level}]: ${message}`);
    }

    static Debug(message: string): void {
        this.Log('DEBUG', message);
    }

    static Warn(message: string): void {
        this.Log('WARN', message);
    }

    static Error(message: string): void {
        this.Log('ERROR', message);
    }
}
