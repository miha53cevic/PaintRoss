import PaintApp from '..';
import GLMath from '../glmath';
import { HSVToRGB, RGBA, RGBToHSV } from '../util/colour';
import ColourPicker from './colourPicker';

export default class CircleColourPicker extends ColourPicker {
    private _image: ImageData;

    public get Radius(): number {
        return this.Size / 2;
    }

    constructor(protected _ctx: CanvasRenderingContext2D) {
        super(_ctx);

        this._image = _ctx.createImageData(this.Size, this.Size);
    }

    protected override PickColour(canvasX: number, canvasY: number, mouseButton: number): void {
        // translate to 0,0 in middle
        const sx = canvasX - this.Size / 2;
        const sy = canvasY - this.Size / 2;

        // Check if in circle
        const distance = Math.sqrt(sx * sx + sy * sy);
        if (distance > this.Radius) return;

        // Reset previous position (just redraw circle)
        this.DrawPicker();
        this._ctx.putImageData(this._image, 0, 0);

        // draw circle on point
        this.DrawChosenPoint(canvasX, canvasY);

        // Show chosen point rgb value
        const angle = Math.atan2(sy, sx) + Math.PI;
        const distanceNormalized = distance / this.Radius;
        const rgb = HSVToRGB(angle, distanceNormalized, 1);
        const rgba: RGBA = [rgb[0], rgb[1], rgb[2], 255];

        if (mouseButton === 0) PaintApp.Get().SetPrimaryToolColour(rgba);
        else if (mouseButton === 2) PaintApp.Get().SetSecondaryToolColour(rgba);
    }

    private DrawChosenPoint(x: number, y: number, radius: number = 8) {
        this._ctx.strokeStyle = 'black';
        this._ctx.lineWidth = 1;
        this._ctx.beginPath();
        this._ctx.arc(x, y, radius, 0, GLMath.ToRadian(360));
        this._ctx.stroke();
    }

    public DrawPicker() {
        const radius = this.Radius;
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                const distance = Math.sqrt(x * x + y * y);
                if (distance > radius) continue;

                // angle of (x,y) point to center
                const angle = Math.atan2(y, x) + Math.PI; // atan2 returns [-pi, +pi] so we move to [0, 2pi]

                // use polar coordinates for HSV (distance, angle) or (radius, phi)
                const distanceNormalized = distance / radius;
                const rgb = HSVToRGB(angle, distanceNormalized, 1);

                // translate from (0, 0) in middle back to (0, 0) in top left corner
                const sx = x + this.Size / 2;
                const sy = y + this.Size / 2;
                const offset = 4; // RGBA values for each pixel
                const index = (this.Size * sy + sx) * offset;

                this._image.data[index + 0] = rgb[0];
                this._image.data[index + 1] = rgb[1];
                this._image.data[index + 2] = rgb[2];
                this._image.data[index + 3] = 255;
            }
        }
        this._ctx.putImageData(this._image, 0, 0);

        // initial chosen circle is in the middle
        this.DrawChosenPoint(this.Size / 2, this.Size / 2);
    }

    public SetPick(colour: RGBA): void {
        // I have the angle and the normalized distance from center, I need to find the x, y position
        const [hue, sat, _] = RGBToHSV(colour);
        const angle = hue - Math.PI;
        const distance = sat * this.Radius;
        const x = this.Radius + distance * Math.cos(angle);
        const y = this.Radius + distance * Math.sin(angle);

        this.DrawPicker();
        this._ctx.putImageData(this._image, 0, 0);
        this.DrawChosenPoint(x, y);
    }
}
