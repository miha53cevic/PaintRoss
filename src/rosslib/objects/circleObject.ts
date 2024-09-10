import Camera2D from "../camera2d";
import { RGB } from "../util/colour";
import LineObject from "./lineObject";
import Object2D from "./object2d";
import TriangleFanObject from "./triangleFanObject";

export default class CircleObject extends Object2D {
    private _lineObject: LineObject;
    private _triangleFanObject: TriangleFanObject;
    
    public Outlined = false;

    public constructor(gl: WebGL2RenderingContext, segments: number) {
        super(gl);

        this._lineObject = new LineObject(gl);
        this._triangleFanObject = new TriangleFanObject(gl);
        this.RecreateCircle(segments);
    }

    public RecreateCircle(segments: number) {
        this.CreateCirclePoints(segments);
    }

    private CreateCirclePoints(segments: number) {
        const linePoints: [number, number][] = [];
        const step = 2 * Math.PI / segments;
        for (let i = 0; i < segments; i++) {
            const angle = i * step;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            linePoints.push([x, y]);
        }
        linePoints.push(linePoints[0]); // add first point to the end to close the circle
        this._lineObject.SetPoints(linePoints);
        this._triangleFanObject.SetPoints(linePoints);
    }

    public Render(camera: Camera2D): void {
        if (this.Outlined) this._lineObject.Render(camera);
        else {
            this._triangleFanObject.Render(camera);
        }
    }

    public SetColour(color: RGB) {
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
        return this._lineObject.Size;
    }

    set Size(value) {
        this._lineObject.Size = value;
        this._triangleFanObject.Size = value;
    }
}