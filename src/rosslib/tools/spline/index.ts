import CanvasObject from '../../objects/canvasObject';
import LineObject from '../../objects/lineObject';
import { ColourSelection } from '../../util/colour';
import { ControllablePoints, ControlPoint, HalfPoint, Point } from '../../util/controllablePoints';
import Tool from '../tool';
import { ToolOption } from '../toolOptions';
import SplineToolOptions from './splineToolOptions';

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

type SplineState = 'waiting for initial click' | 'waiting for initial release' | 'waiting for point edit finish';

export default class SplineTool extends Tool {
    private _lineObject: LineObject;
    private _state: SplineState = 'waiting for initial click';
    private _controllablePoints: ControllablePoints = new ControllablePoints();

    public LineSegments = 200;
    public ControlPointSize: Point = [10, 10];

    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject, colourSelection: ColourSelection) {
        super(gl, canvasObj, new SplineToolOptions(), colourSelection);
        this._lineObject = new LineObject(gl);
    }

    public OnToolOptionChange(option: ToolOption): void {
        switch (this._state) {
            case 'waiting for point edit finish': {
                this._canvasObj.CancelPreviewCanvas();
                this.RenderSpline();
                break;
            }
        }
    }

    public OnColourSelectionChange(colourSelection: ColourSelection): void {
        if (!this.IsActive) return;
        switch (this._state) {
            case 'waiting for point edit finish': {
                this._canvasObj.CancelPreviewCanvas();
                this.RenderSpline();
                break;
            }
        }
    }

    public OnMouseDown(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (canvasX === undefined || canvasY === undefined) return;
        switch (this._state) {
            case 'waiting for initial click': {
                if (mouseButton === 0) {
                    this._controllablePoints.Points.push(new ControlPoint([canvasX, canvasY])); // initial line starting point
                    this._state = 'waiting for initial release';
                }
                break;
            }
            case 'waiting for point edit finish': {
                if (mouseButton === 2) {
                    // finish with right click
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderSpline(false);
                    this._canvasObj.MergePreviewCanvas();
                    this.ResetState();
                }
                if (mouseButton === 0) {
                    const cp = this._controllablePoints.GetTouching([canvasX, canvasY]);
                    if (cp) {
                        this._controllablePoints.Select(cp);
                        this.RenderSpline();
                    }
                }
                break;
            }
        }
    }

    public OnMouseUp(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (canvasX === undefined || canvasY === undefined) return;
        switch (this._state) {
            case 'waiting for initial release': {
                if (mouseButton === 0) {
                    // If it was a click and release mouse move ignore it
                    if (this._controllablePoints.Points.length <= 1) return;

                    const p1 = this._controllablePoints.Points[0].Position;
                    const p4 = this._controllablePoints.Points[1].Position;
                    const middlePoint = HalfPoint(p1, p4);
                    const p2 = HalfPoint(p1, middlePoint);
                    const p3 = HalfPoint(middlePoint, p4);

                    const cp1 = this._controllablePoints.Points[0];
                    const cp4 = this._controllablePoints.Points[1];
                    const cp2 = new ControlPoint(p2);
                    const cp3 = new ControlPoint(p3);
                    this._controllablePoints.Points = [cp1, cp1, cp2, cp3, cp4, cp4];
                    this.RenderSpline();
                    this._state = 'waiting for point edit finish';
                }
                break;
            }
            case 'waiting for point edit finish': {
                if (mouseButton === 0) {
                    this._controllablePoints.Select(null);
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderSpline();
                }
                break;
            }
        }
    }

    public OnMouseMove(canvasX: number | undefined, canvasY: number | undefined): void {
        if (canvasX === undefined || canvasY === undefined) return;
        switch (this._state) {
            case 'waiting for initial release': {
                // If the second control point is already placed just change it
                if (this._controllablePoints.Points.length === 2) {
                    this._controllablePoints.Points[1] = new ControlPoint([canvasX, canvasY]);
                    // Otherwise add the second control point
                } else this._controllablePoints.Points.push(new ControlPoint([canvasX, canvasY]));
                // Rerender the line
                this._canvasObj.CancelPreviewCanvas();
                this.RenderInitialLine();
                break;
            }
            case 'waiting for point edit finish': {
                const selectedControlPoint = this._controllablePoints.GetSelected();
                if (selectedControlPoint) {
                    selectedControlPoint.Position = [canvasX, canvasY];
                    // Rerender spline
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderSpline();
                }
                break;
            }
        }
    }

    public GetOptions(): SplineToolOptions {
        return this._toolOptions;
    }

    public GetID(): string {
        return 'Spline';
    }

    public OnKeyPress(key: string): void {}

    public OnEnter(): void {}

    public OnExit(): void {
        this._canvasObj.CancelPreviewCanvas();
        this.RenderSpline(false);
        this._canvasObj.MergePreviewCanvas();
        this.ResetState();
    }

    private RenderSpline(renderControlPoints: boolean = true) {
        let numberOfConnectedSplines = this._controllablePoints.Points.length - 2; // makni rubne kontrolne točke
        numberOfConnectedSplines -= 1; // za 2 imamo 1, za 3 imamo 2, za 4 imamo 3 spline-a... (odnosno length(controlPoints)-3)
        for (let j = 0; j < numberOfConnectedSplines; j++) {
            const curvePoints: Point[] = [];
            const controlPositions = this._controllablePoints.GetPositions();
            const controlSubset = [
                controlPositions[0 + j],
                controlPositions[1 + j],
                controlPositions[2 + j],
                controlPositions[3 + j],
            ];
            for (let i = 0; i <= this.LineSegments; i++) {
                const t = i / this.LineSegments;
                const Ct = CatmulRomSpline(controlSubset, t);
                curvePoints.push(Ct);
            }
            // Render linestrip
            this._lineObject.Thickness = this._toolOptions.GetOption('BrushSize').Value as number;
            this._lineObject.Colour = this.ColourSelection.Primary;
            this._lineObject.SetPoints(curvePoints);
            this._canvasObj.DrawOnCanvas(this._lineObject);

            // Render control points
            if (renderControlPoints) this._controllablePoints.Render(this._gl, this._canvasObj);
        }
    }

    private RenderInitialLine() {
        this._lineObject.Thickness = this._toolOptions.GetOption('BrushSize').Value as number;
        this._lineObject.Colour = this.ColourSelection.Primary;
        this._lineObject.SetPoints(this._controllablePoints.GetPositions());
        this._canvasObj.DrawOnCanvas(this._lineObject);
    }

    private ResetState() {
        this._controllablePoints.Points = [];
        this._controllablePoints.Select(null);
        this._state = 'waiting for initial click';
    }
}
