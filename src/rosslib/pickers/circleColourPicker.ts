import PaintApp from "..";
import GLMath from "../glmath";
import { RGBA } from "../util/colour";
import ColourPicker from "./colourPicker";

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
        const distance = Math.sqrt((sx * sx) + (sy * sy));
        if (distance > this.Radius) return;

        // Reset previous position (just redraw circle)
        this.DrawPicker();
        this._ctx.putImageData(this._image, 0, 0);

        // draw circle on point
        this.DrawChosenPoint(canvasX, canvasY);

        // Show chosen point rgb value
        const angle = GLMath.ToDegrees(Math.atan2(sy, sx) + Math.PI);
        const radiusNormalized = distance / this.Radius * 100;
        const rgb = this.HSVtoRGB(angle, radiusNormalized, 100);
        const rgba: RGBA = [rgb[0], rgb[1], rgb[2], 255];

        if (mouseButton === 0) PaintApp.Get().SetPrimaryToolColour(rgba);
        else if (mouseButton === 2) PaintApp.Get().SetSecondaryToolColour(rgba);
    }

    // H [0, 360],  S [0, 100], V [0, 100]
    private HSVtoRGB(H: number, S: number, V: number): [number, number, number] {
        // normalize to [0, 1.0]
        H /= 360;
        S /= 100;
        V /= 100;

        let r, g, b;
        if (S == 0) {
            r = V * 255;
            g = V * 255;
            b = V * 255;
        }
        else {
            let var_h = H * 6
            if (var_h == 6) var_h = 0
            const var_i = Math.floor(var_h)
            const var_1 = V * (1 - S)
            const var_2 = V * (1 - S * (var_h - var_i))
            const var_3 = V * (1 - S * (1 - (var_h - var_i)))

            let var_r, var_g, var_b;
            if (var_i == 0) { var_r = V; var_g = var_3; var_b = var_1 }
            else if (var_i == 1) { var_r = var_2; var_g = V; var_b = var_1 }
            else if (var_i == 2) { var_r = var_1; var_g = V; var_b = var_3 }
            else if (var_i == 3) { var_r = var_1; var_g = var_2; var_b = V }
            else if (var_i == 4) { var_r = var_3; var_g = var_1; var_b = V }
            else { var_r = V; var_g = var_1; var_b = var_2 }

            r = var_r * 255;
            g = var_g * 255;
            b = var_b * 255;
        }
        return [Math.floor(r), Math.floor(g), Math.floor(b)];
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
                const distance = Math.sqrt((x * x) + (y * y));
                if (distance > radius) continue;

                // angle of (x,y) point to center
                const angle = Math.atan2(y, x) + Math.PI; // atan2 returns [-pi, +pi] so we move to [0, 2pi]

                // use polar coordinates for HSV (distance, angle) or (radius, phi)
                const radiusNormalized = distance / radius * 100; // normalize to [0, 100]
                const rgb = this.HSVtoRGB(GLMath.ToDegrees(angle), radiusNormalized, 100);

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
}