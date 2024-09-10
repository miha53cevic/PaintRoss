import CanvasObject from "../objects/canvasObject";
import LineObject from "../objects/lineObject";
import QuadObject from "../objects/quadObject";
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

type SplineState = 'waiting for initial click' | 'waiting for initial release' | 'waiting for point edit finish';

export default class Spline extends Tool {
    private _controlPoints: Point[] = [];
    private _lineObject: LineObject;
    private _state: SplineState = 'waiting for initial click';
    private _selectedControlPoint: Point | null = null;

    public LineSegments = 200;
    public ControlPointSize: Point = [10, 10];

    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        super(gl, canvasObj);
        this._lineObject = new LineObject(gl);
    }

    public onMouseDown(x: number, y: number, mouseButton: number): void {
        switch (this._state) {
            case 'waiting for initial click': {
                if (mouseButton === 0) {
                    this._controlPoints = [];
                    this._controlPoints.push([x, y]); // initial line starting point
                    this._state = 'waiting for initial release';
                }
                break;
            }
            case 'waiting for point edit finish': {
                if (mouseButton === 2) { // finish with right click
                    this.canvasObj.CancelPreviewCanvas();
                    this.RenderSpline(false);
                    this.canvasObj.MergePreviewCanvas();
                    this._state = 'waiting for initial click';
                }
                if (mouseButton === 0) {
                    const cp = this.GetTouchingControlPoint([x, y]);
                    this._selectedControlPoint = cp;
                    this.RenderSpline();
                }
                break;
            }
        }
    }
    public onMouseUp(x: number, y: number, mouseButton: number): void {
        switch (this._state) {
            case 'waiting for initial release': {
                if (mouseButton === 0) {
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
                    this._state = 'waiting for point edit finish';
                }
                break;
            }
            case 'waiting for point edit finish': {
                if (mouseButton === 0) {
                    this._selectedControlPoint = null;
                    this.canvasObj.CancelPreviewCanvas();
                    this.RenderSpline();
                }
                break;
            }
        }
    }
    public onMouseMove(x: number, y: number): void {
        switch (this._state) {
            case 'waiting for initial release': {
                if (this._controlPoints.length == 2) {
                    this._controlPoints[1] = [x, y];
                } else this._controlPoints.push([x, y]);
                this.canvasObj.CancelPreviewCanvas();
                this.RenderInitialLine();
                break;
            }
            case 'waiting for point edit finish': {
                if (this._selectedControlPoint) {
                    this._selectedControlPoint[0] = x;
                    this._selectedControlPoint[1] = y;
                    this.canvasObj.CancelPreviewCanvas();
                    this.RenderSpline();
                }
                break;
            }
        }
    }
    public GetID(): string {
        return "Spline";
    }
    public onDestroy(): void {
        this.canvasObj.CancelPreviewCanvas();
        this.RenderSpline(false);
        this.canvasObj.MergePreviewCanvas();
    }

    private RenderSpline(renderControlPoints: boolean = true) {
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
            this._lineObject.Colour = this.ColourSelection.Primary;
            this._lineObject.SetPoints(curvePoints);
            this.canvasObj.DrawOnCanvas(this._lineObject);

            // Render control points
            if (renderControlPoints) this.RenderControlPoints();
        }
    }

    private RenderInitialLine() {
        this._lineObject.Colour = this.ColourSelection.Primary;
        this._lineObject.SetPoints(this._controlPoints);
        this.canvasObj.DrawOnCanvas(this._lineObject);
    }

    private RenderControlPoints() {
        const quad = new QuadObject(this.gl);
        quad.Size = this.ControlPointSize;
        for (const controlPoint of this._controlPoints) {
            if (this._selectedControlPoint === controlPoint) {
                quad.Colour = [1, 1, 0, 1];
            } else quad.Colour = [1, 0, 0, 1];
            const pos: Point = [
                controlPoint[0] - quad.Size[0] / 2,
                controlPoint[1] - quad.Size[1] / 2,
            ];
            quad.Position = pos;
            this.canvasObj.DrawOnCanvas(quad);
        }
    }

    private InRect(point: Point, rectTopLeft: Point, rectSize: Point): boolean {
        const dx = point[0] - rectTopLeft[0];
        const dy = point[1] - rectTopLeft[1];

        // If dx or dy are negative the point is on the left or above the rect
        if (dx < 0 || dy < 0) return false;
        // If dx or dy are greater then rectPos+rectSize then mouse is right or bottom of rect
        if (dx > rectSize[0] || dy > rectSize[1]) return false;
        // Otherwise point is in rect
        return true;
    }

    private GetTouchingControlPoint(mousePos: Point): Point | null {
        for (const cp of this._controlPoints) {
            const cpTopLeft: Point = [
                cp[0] - this.ControlPointSize[0] / 2,
                cp[1] - this.ControlPointSize[1] / 2,
            ];
            if (this.InRect(mousePos, cpTopLeft, this.ControlPointSize)) {
                return cp;
            }
        }
        return null;
    } 
}