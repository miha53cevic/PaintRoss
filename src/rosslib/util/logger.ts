export default class Logger {
    private static enabled: boolean = false;

    static enable(): void {
        this.enabled = true;
    }

    static disable(): void {
        this.enabled = false;
    }

    static log(level: string, message: string): void {
        if (!this.enabled) return;
        console.log(`[${level}]: ${message}`);
    }

    static debug(message: string): void {
        this.log("DEBUG", message);
    }

    static warn(message: string): void {
        this.log("WARN", message);
    }

    static error(message: string): void {
        this.log("ERROR", message);
    }
}