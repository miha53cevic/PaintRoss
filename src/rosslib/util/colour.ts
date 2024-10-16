export type RGBA = [number, number, number, number];

export function NormalizeRGBA(colour: RGBA): RGBA {
    return [
        colour[0] / 255,
        colour[1] / 255,
        colour[2] / 255,
        colour[3] / 255,
    ];
}

export class ColourSelection {
    public Primary: RGBA = [0, 0, 0, 255];
    public Secondary: RGBA = [255, 255, 255, 255];
}