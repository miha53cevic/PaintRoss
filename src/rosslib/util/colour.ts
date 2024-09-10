export type RGB = [number, number, number];

export function NormalizeRGB(colour: RGB): RGB {
    return [
        colour[0] / 255,
        colour[1] / 255,
        colour[2] / 255,
    ];
}

export class ColourSelection {
    public Primary: RGB = [0, 0, 0];
    public Secondary: RGB = [255, 255, 255]; 
}