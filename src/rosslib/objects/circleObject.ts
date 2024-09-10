import Camera2D from "../camera2d";
import LineObject from "./lineObject";
import Object2D from "./object2d";

export default class CircleObject extends Object2D {
    private _lineObject: LineObject;

    public constructor(gl: WebGL2RenderingContext, segments: number) {
        super(gl);

        this._lineObject = new LineObject(gl);
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
    }

    public Render(camera: Camera2D): void {
        this._lineObject.Render(camera);
    }

    get Position() {
        return this._lineObject.Position;
    }

    set Position(value) {
        this._lineObject.Position = value;
    }

    get Rotation(): number {
        return this._lineObject.Rotation;
    }

    set Rotation(value: number) {
        this._lineObject.Rotation = value;
    }

    get Size() {
        return this._lineObject.Size;
    }

    set Size(value) {
        this._lineObject.Size = value;
    }
}