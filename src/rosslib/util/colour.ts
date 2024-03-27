export type RGB = [number, number, number];

export default class Colour {
    public Primary: RGB = [0, 0, 0];
    public Secondary: RGB = [255, 255, 255]; 

    private normalize(colour: RGB): RGB {
        return [
            colour[0] / 255,
            colour[1] / 255,
            colour[2] / 255,
        ];
    }

    public NormalizedPrimary() {
        return this.normalize(this.Primary);
    }

    public NormalizedSecondary() {
        return this.normalize(this.Secondary);
    }
}