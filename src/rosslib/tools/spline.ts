import CanvasObject from "../objects/canvasObject";
import LineObject from "../objects/lineObject";
import Tool from "./tool";

type Point = [number, number];

function CatmulRomSpline(P: Point[], t: number): Point {
    const tt = t * t;
    const ttt = tt * t;

    // https://lucidar.me/en/mathematics/catmull-rom-splines/
    const q0 = -ttt + 2.0 * tt - t;
    const q1 = 3.0 * ttt - 5.0 * tt + 2.0;
    const q2 = -3.0 * ttt + 4.0 * tt + t;
    const q3 = ttt - tt;

    const Cx = 0.5 * (P[0][0] * q0 + P[1][0] * q1 + P[2][0] * q2 + P[3][0] * q3);
    const Cy = 0.5 * (P[0][1] * q0 + P[1][1] * q1 + P[2][1] * q2 + P[3][1] * q3);
    return [Cx, Cy];
}

function HalfPoint(p1: Point, p2: Point): Point {
    return [
        (p1[0] + p2[0]) / 2,
        (p1[1] + p2[1]) / 2
    ];
}

export default class Spline extends Tool {
    private _controlPoints: Point[] = [];
    private _lineObject: LineObject;

    public LineSegments = 200;

    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        super(gl, canvasObj);
        this._lineObject = new LineObject(gl);
    }

    public onMouseDown(x: number, y: number, mouseButton: number): void {
        this._controlPoints = [];
        this._controlPoints.push([x, y]); // initial line starting point
    }
    public onMouseUp(x: number, y: number, mouseButton: number): void {
        const p1 = this._controlPoints[0];
        const p4 = this._controlPoints[1];
        const middlePoint = HalfPoint(p1, p4);
        const p2 = HalfPoint(p1, middlePoint);
        const p3 = HalfPoint(middlePoint, p4);
        this._controlPoints = [
            p1,
            p1,
            p2,
            p3,
            p4,
            p4,
        ];
        this.RenderSpline();
    }
    public onMouseMove(x: number, y: number): void {
        if (this._controlPoints.length == 2) {
            this._controlPoints[1] = [x, y];
        } else this._controlPoints.push([x, y]);
    }
    public GetID(): string {
        return "spline";
    }

    public RenderSpline() {
        let numberOfConnectedSplines = (this._controlPoints.length - 2); // makni rubne kontrolne točke
        numberOfConnectedSplines -= 1; // za 2 imamo 1, za 3 imamo 2, za 4 imamo 3 spline-a... (odnosno length(controlPoints)-3)
        for (let j = 0; j < numberOfConnectedSplines; j++) {
            const curvePoints: Point[] = [];
            const controlSubset = [
                this._controlPoints[0 + j],
                this._controlPoints[1 + j],
                this._controlPoints[2 + j],
                this._controlPoints[3 + j],
            ];
            for (let i = 0; i <= this.LineSegments; i++) {
                const t = i / this.LineSegments;
                const Ct = CatmulRomSpline(controlSubset, t);
                curvePoints.push(Ct);
            }
            // Render linestrip
            this._lineObject.SetPoints(curvePoints);
            this.canvasObj.DrawOnCanvas(this._lineObject);
        }
    }

    public RenderInitialLine() {
        this._lineObject.SetPoints(this._controlPoints);
        this.canvasObj.DrawOnCanvas(this._lineObject);
    }
}