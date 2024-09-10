import Camera2D from "../camera2d";
import LineObject from "./lineObject";
import Object2D from "./object2d";

export default class CursorObject extends Object2D {
    private _lineObject: LineObject;

    public constructor(gl: WebGL2RenderingContext, radius: number, segments: number) {
        super(gl);

        this._lineObject = new LineObject(gl);
        this.CreateCircle(radius, segments);
    }

    public CreateCircle(radius: number, segments: number) {
        this.CreateCirclePoints(radius, segments);
    }

    private CreateCirclePoints(radius: number, segments: number) {
        const linePoints: [number, number][] = [];
        const step = 2 * Math.PI / segments;
        for (let i = 0; i < segments; i++) {
            const angle = i * step;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            linePoints.push([x, y]);
        }
        linePoints.push(linePoints[0]); // add first point to the end to close the circle
        this._lineObject.SetPoints(linePoints);
    }

    public Render(camera: Camera2D): void {
        this._lineObject.Render(camera);
    }
    
}