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

/**
 * @param hue angle in radians (0-2PI)
 * @param sat 0.0-1.0
 * @param val 0.0-1.0
 * @returns RGBA(0-255, 0-255, 0-255, 255) alpha is always 255
 */
export function HSVToRGB(hue: number, sat: number, val: number): RGBA {
    const BoundRGBA = (red: number, green: number, blue: number, alpha: number): RGBA => {
        return [
            Math.min(255, Math.round(red * 255)),
            Math.min(255, Math.round(green * 255)),
            Math.min(255, Math.round(blue * 255)),
            Math.min(255, Math.round(alpha * 255))
        ];
    }

    const alpha = 1.0;
    const chroma = val * sat;
    const step = Math.PI / 3;
    const interm = chroma * (1 - Math.abs((hue / step) % 2 - 1));
    const shift = val - chroma;
    if (hue < 1 * step) return BoundRGBA(shift + chroma, shift + interm, shift + 0, alpha);
    if (hue < 2 * step) return BoundRGBA(shift + interm, shift + chroma, shift + 0, alpha);
    if (hue < 3 * step) return BoundRGBA(shift + 0, shift + chroma, shift + interm, alpha);
    if (hue < 4 * step) return BoundRGBA(shift + 0, shift + interm, shift + chroma, alpha);
    if (hue < 5 * step) return BoundRGBA(shift + interm, shift + 0, shift + chroma, alpha);
    return BoundRGBA(shift + chroma, shift + 0, shift + interm, alpha);
}

/**
 * 
 * @param rgba RGBA(0-255, 0-255, 0-255, 255) alpha is ignored
 * @returns [hue, sat, val] hue in radians (0-2PI), sat 0.0-1.0, val 0.0-1.0
 */
export function RGBToHSV(rgba: RGBA): [number, number, number] {
    const r = rgba[0] / 255;
    const g = rgba[1] / 255;
    const b = rgba[2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let hue = 0;
    if (delta !== 0) {
        if (max === r) {
            hue = ((g - b) / delta) % 6;
        } else if (max === g) {
            hue = (b - r) / delta + 2;
        } else {
            hue = (r - g) / delta + 4;
        }
        hue *= 60;
        if (hue < 0) hue += 360;
    }

    hue = hue * Math.PI / 180;
    const sat = max === 0 ? 0 : delta / max;
    const val = max;

    return [hue, sat, val];
}

export type ColourSelectionListener = (ColourSelection: ColourSelection) => void;

export class ColourSelection {
    private _primary: RGBA = [0, 0, 0, 255];
    private _secondary: RGBA = [255, 255, 255, 255];
    private _listeners: ColourSelectionListener[] = [];

    public AssignColoursCopy(colourSelection: ColourSelection) {
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