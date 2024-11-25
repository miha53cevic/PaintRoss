import Camera2D from "../camera2d";
import { RGBA } from "../util/colour";
import LineObject from "./lineObject";
import Object2D from "./object2d";
import TriangleFanObject from "./triangleFanObject";

export default class CircleObject extends Object2D {
    private _lineObject: LineObject;
    private _triangleFanObject: TriangleFanObject;

    public Outlined = false;
    public Thickness = 1;
    public LineSegments = 100;

    public constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this._lineObject = new LineObject(gl);
        this._triangleFanObject = new TriangleFanObject(gl);

        const c: [number, number] = [this.Size[0] / 2, this.Size[1] / 2]; // center should be half the size
        const r: [number, number] = [this.Size[0] / 2, this.Size[1] / 2]; // radius should be half the size
        this._triangleFanObject.SetPoints(this.CreateCirclePoints(c[0], c[1], r));
        this._lineObject.SetPoints(this.CreateCirclePoints(c[0], c[1], r), true); // closed path
    }

    private CreateCirclePoints(cx = 0, cy = 0, radius: [number, number] = [1, 1]): [number, number][] {
        const circlePoints: [number, number][] = [];
        const step = 2 * Math.PI / this.LineSegments;
        for (let i = 0; i < this.LineSegments; i++) {
            const angle = i * step;
            const x = cx + radius[0] * Math.cos(angle);
            const y = cy + radius[1] * Math.sin(angle);
            circlePoints.push([x, y]);
        }
        return circlePoints;
    }

    public Render(camera: Camera2D): void {
        this._lineObject.Thickness = this.Thickness;
        if (this.Outlined) this._lineObject.Render(camera);
        else {
            this._triangleFanObject.Render(camera);
        }
    }

    public SetColour(color: RGBA) {
        this._lineObject.Colour = color;
        this._triangleFanObject.Colour = color;
    }

    get Position() {
        return this._lineObject.Position;
    }

    set Position(value) {
        this._lineObject.Position = value;
        this._triangleFanObject.Position = value;
    }

    get Rotation(): number {
        return this._lineObject.Rotation;
    }

    set Rotation(value: number) {
        this._lineObject.Rotation = value;
        this._triangleFanObject.Rotation = value;
    }

    get Size() {
        return this._triangleFanObject.Size;
    }

    set Size(value) {
        // LineObject size would make the lines thicker (set the points instead)
        const c: [number, number] = [value[0] / 2, value[1] / 2]; // center should be half the size
        const r: [number, number] = [value[0] / 2, value[1] / 2]; // radius should be half the size
        this._lineObject.SetPoints(this.CreateCirclePoints(c[0], c[1], r), true); // closed path

        this._triangleFanObject.Size = value;
    }
}