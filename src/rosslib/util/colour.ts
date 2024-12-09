import Logger from "./logger";

export type RGBA = [number, number, number, number];

export function NormalizeRGBA(colour: RGBA): RGBA {
    return [
        colour[0] / 255,
        colour[1] / 255,
        colour[2] / 255,
        colour[3] / 255,
    ];
}

export type ColourSelectionListener = (ColourSelection: ColourSelection) => void;

export class ColourSelection {
    private _primary: RGBA = [0, 0, 0, 255];
    private _secondary: RGBA = [255, 255, 255, 255];
    private _listeners: ColourSelectionListener[] = [];

    public AssignColours(colourSelection: ColourSelection) {
        this.Primary = [...colourSelection.Primary];
        this.Secondary = [...colourSelection.Secondary];
    }

    public get Primary() {
        return this._primary;
    }

    public set Primary(colour: RGBA) {
        this._primary = colour;
        this.Notify();
        Logger.Log("ColourSelection", "Primary colour changed to: " + colour);
    }

    public get Secondary() {
        return this._secondary;
    }

    public set Secondary(colour: RGBA) {
        this._secondary = colour;
        this.Notify();
        Logger.Log("ColourSelection", "Seconadry colour changed to: " + colour);
    }

    public Subscribe(listener: ColourSelectionListener) {
        this._listeners.push(listener);
        Logger.Log(this.constructor.name, `OnColourSelectionChange Subscribed`);
    }

    public Unsubscribe(listener: ColourSelectionListener) {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    public Notify() {
        this._listeners.forEach(l => l(this));
    }
}