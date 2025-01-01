import PaintApp from "..";
import GLMath from "../glmath";
import { HSVToRGB, RGBA, RGBToHSV } from "../util/colour";
import ColourPicker from "./colourPicker";

type Area = 'Outside' | 'Wheel' | 'Triangle';

export interface PickResult {
    Area: Area;
    Hue?: number;
    Sat?: number;
    Val?: number;
}

// Modified code from:
// https://stackoverflow.com/a/42533628
export default class TriangularColourPicker extends ColourPicker {
    private _currentHue: number = 0.0; // in radians
    private _currentSaturation: number = 1.0;
    private _currentValue: number = 1.0;

    constructor(protected _ctx: CanvasRenderingContext2D) {
        super(_ctx);
    }

    get CenterX(): number {
        return this.Size / 2;
    }

    get CenterY(): number {
        return this.Size / 2;
    }

    get InnerRadius(): number {
        return this.Size * 5 / 12;
    }

    get OuterRadius(): number {
        return this.Size / 2;
    }

    protected override PickColour(canvasMouseX: number, canvasMouseY: number, mouseButton: number): void {
        const result = this.Pick(canvasMouseX, canvasMouseY);
        if (result.Area === 'Wheel') {
            this._currentHue = result.Hue!;
        } else if (result.Area === 'Triangle') {
            this._currentSaturation = result.Sat!;
            this._currentValue = result.Val!;
        }

        if (result.Area === 'Wheel' || result.Area === 'Triangle') {
            this.DrawPicker(this._currentHue, 1, 1);

            const [wheelX, wheelY] = this.GetWheelPosition(this._currentHue);
            this.DrawChoosenPoint(wheelX, wheelY);

            const [triangleX, triangleY] = this.GetTrianglePosition(this._currentSaturation, this._currentValue);
            this.DrawChoosenPoint(triangleX, triangleY);

            // Update the colour in the PaintApp
            const rgba: RGBA = HSVToRGB(this._currentHue, this._currentSaturation, this._currentValue);
            if (mouseButton === 0) PaintApp.Get().SetPrimaryToolColour(rgba);
            else if (mouseButton === 2) PaintApp.Get().SetSecondaryToolColour(rgba);
        }
    }

    private Pick(x: number, y: number): PickResult {
        const distanceFromCenter = Math.sqrt((x - this.CenterX) ** 2 + (y - this.CenterY) ** 2);
        const sqrt3 = Math.sqrt(3);
        if (distanceFromCenter > this.OuterRadius) {
            // Outside
            return { Area: 'Outside' };
        } else if (distanceFromCenter > this.InnerRadius) {
            // Wheel
            let angle = Math.atan2(y - this.CenterX, x - this.CenterY) + Math.PI / 2;
            if (angle < 0) angle += 2 * Math.PI;
            const hue = angle;
            return { Area: 'Wheel', Hue: hue };
        } else {
            // Inside
            const x1 = (x - this.CenterX) / this.InnerRadius;
            const y1 = (y - this.CenterY) / this.InnerRadius;
            if (0 * x1 + 2 * y1 > 1) return { Area: 'Outside' };
            else if (sqrt3 * x1 + (-1) * y1 > 1) return { Area: 'Outside' };
            else if (-sqrt3 * x1 + (-1) * y1 > 1) return { Area: 'Outside' };
            else {
                // Triangle
                const sat = (1 - 2 * y1) / (sqrt3 * x1 - y1 + 2);
                const val = (sqrt3 * x1 - y1 + 2) / 3;
                return { Area: 'Triangle', Sat: sat, Val: val };
            }
        }
    }

    public DrawPicker(hue: number = 0.0, sat: number = 1.0, val: number = 1.0): void {
        const imgData = this._ctx.createImageData(this.Size, this.Size);
        const data = imgData.data;
        for (let y = 0; y < this.Size; y++) {
            for (let x = 0; x < this.Size; x++) {
                const result = this.Pick(x, y);
                let color: [number, number, number, number];
                if (result.Area === 'Outside') {
                    // Outside
                    color = [0, 0, 0, 0];
                } else if (result.Area === 'Wheel') {
                    // Wheel
                    color = HSVToRGB(result.Hue!, sat, val);
                } else {
                    // Triangle
                    color = HSVToRGB(hue, result.Sat!, result.Val!);
                }
                const index = (y * this.Size + x) * 4;
                data[index] = color[0];
                data[index + 1] = color[1];
                data[index + 2] = color[2];
                data[index + 3] = color[3];
            }
        }

        this._ctx.putImageData(imgData, 0, 0);
    }

    public GetWheelPosition(hue: number): [number, number] {
        const middleRadius = (this.InnerRadius + this.OuterRadius) / 2;
        return [
            this.CenterX + middleRadius * Math.sin(hue),
            this.CenterY - middleRadius * Math.cos(hue)
        ];
    }

    public GetTrianglePosition(sat: number, val: number): [number, number] {
        const sqrt3 = Math.sqrt(3);
        return [
            this.CenterX + this.InnerRadius * (2 * val - sat * val - 1) * sqrt3 / 2,
            this.CenterY + this.InnerRadius * (1 - 3 * sat * val) / 2
        ];
    }

    private DrawChoosenPoint(x: number, y: number, radius: number = 8): void {
        this._ctx.strokeStyle = 'black';
        this._ctx.lineWidth = 1;
        this._ctx.beginPath();
        this._ctx.arc(x, y, radius, 0, GLMath.ToRadian(360));
        this._ctx.stroke();
    }

    public SetPick(colour: RGBA): void {
        const [hue, sat, val] = RGBToHSV(colour);
        if (hue !== 0) this._currentHue = hue; // if the colour is black or white hue is always 0 so keep the previous selected hue
        this._currentSaturation = sat;
        this._currentValue = val;

        this.DrawPicker(this._currentHue, 1, 1);

        const [wheelX, wheelY] = this.GetWheelPosition(this._currentHue);
        this.DrawChoosenPoint(wheelX, wheelY);

        const [triangleX, triangleY] = this.GetTrianglePosition(this._currentSaturation, this._currentValue);
        this.DrawChoosenPoint(triangleX, triangleY);
    }
}
