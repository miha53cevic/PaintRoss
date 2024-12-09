import CanvasObject from "../../objects/canvasObject";
import CircleObject from "../../objects/circleObject";
import QuadObject from "../../objects/quadObject";
import RectangleObject from "../../objects/rectangleObject";
import { ColourSelection } from "../../util/colour";
import { GetTouchingControlPoint, Point } from "../../util/controlPoints";
import Tool from "../tool";
import { ToolOption } from "../toolOptions";
import ShapeToolOptions from "./shapeToolOptions";

type ShapeState = 'waiting for initial point' | 'waiting for initial release' | 'waiting for controlpoint edit finish';

export default class ShapeTool extends Tool {
    private _state: ShapeState = 'waiting for initial point';
    private _circleObject: CircleObject;
    private _rectangleObject: RectangleObject;
    private _controlPoints: Point[] = [];
    private _selectedControlPoint: Point | null = null;

    public ControlPointSize: Point = [10, 10];

    constructor(_gl: WebGL2RenderingContext, _canvasObj: CanvasObject, colourSelection: ColourSelection) {
        super(_gl, _canvasObj, new ShapeToolOptions(), colourSelection);
        this._circleObject = new CircleObject(_gl);
        this._rectangleObject = new RectangleObject(_gl);
    }

    public OnToolOptionChange(option: ToolOption): void {
        switch (this._state) {
            case 'waiting for initial point':
            case 'waiting for initial release':
            case 'waiting for controlpoint edit finish': {
                this._canvasObj.CancelPreviewCanvas();
                this.RenderShape();
                break;
            }
        }
    }

    public OnColourSelectionChange(colourSelection: ColourSelection): void {
        if (!this.IsActive) return; // Only update if the tool is active
        switch (this._state) {
            case 'waiting for initial point':
            case 'waiting for initial release':
            case 'waiting for controlpoint edit finish': {
                this._canvasObj.CancelPreviewCanvas();
                this.RenderShape();
                break;
            }
        }
    }

    public OnMouseDown(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (canvasX === undefined || canvasY === undefined) return;
        switch (this._state) {
            case 'waiting for initial point': {
                if (mouseButton === 0) {
                    this._controlPoints = [];
                    this._controlPoints.push([canvasX, canvasY]);
                    this._state = 'waiting for initial release';
                }
                break;
            }
            case 'waiting for controlpoint edit finish': {
                if (mouseButton === 2) { // finish with right click
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderShape(false);
                    this._canvasObj.MergePreviewCanvas();
                    this.ResetState();
                }
                if (mouseButton === 0) {
                    const cp = GetTouchingControlPoint([canvasX, canvasY], this._controlPoints, this.ControlPointSize);
                    this._selectedControlPoint = cp;
                    this.RenderShape();
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
                    this.RenderShape();
                    this._state = 'waiting for controlpoint edit finish';
                }
                break;
            }
            case 'waiting for controlpoint edit finish': {
                if (mouseButton === 0) {
                    this._selectedControlPoint = null;
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderShape();
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
                if (this._controlPoints.length == 2) {
                    this._controlPoints[1] = [canvasX, canvasY];
                    // Otherwise add the second control point
                } else this._controlPoints.push([canvasX, canvasY]);
                // Rerender the line
                this._canvasObj.CancelPreviewCanvas();
                this.RenderShape();
                break;
            }
            case 'waiting for controlpoint edit finish': {
                if (this._selectedControlPoint) {
                    this._selectedControlPoint[0] = canvasX;
                    this._selectedControlPoint[1] = canvasY;
                    // Rerender spline
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderShape();
                }
                break;
            }
        }
    }

    public OnKeyPress(key: string): void {
    }

    public OnExit(): void {
        this._canvasObj.CancelPreviewCanvas();
        this.RenderShape(false);
        this._canvasObj.MergePreviewCanvas();
        this.ResetState();
    }

    public GetID(): string {
        return "Shape";
    }

    private RenderControlPoints() {
        const quad = new QuadObject(this._gl);
        quad.Size = this.ControlPointSize;
        for (const controlPoint of this._controlPoints) {
            if (this._selectedControlPoint === controlPoint) {
                quad.Colour = [255, 255, 0, 255];
            } else quad.Colour = [255, 0, 0, 255];
            const pos: Point = [
                controlPoint[0] - quad.Size[0] / 2,
                controlPoint[1] - quad.Size[1] / 2,
            ];
            quad.Position = pos;
            this._canvasObj.DrawOnCanvas(quad);
        }
    }

    private RenderShape(drawControlPoints = true): void {
        if (this._controlPoints.length < 2) return;
        const p1 = this._controlPoints[0];
        const p4 = this._controlPoints[1];
        const width = p4[0] - p1[0];
        const height = p4[1] - p1[1];

        switch (this._toolOptions.GetOption("Type").Value) {
            case 'Rectangle': {
                this._rectangleObject.Position = [p1[0], p1[1]];
                this._rectangleObject.Size = [width, height];
                this._rectangleObject.SetColour(this.ColourSelection.Primary)

                this._rectangleObject.Outlined = this._toolOptions.GetOption("FillMode").Value === "Outline";
                this._rectangleObject.Thickness = this._toolOptions.GetOption("BrushSize").Value as number;

                this._canvasObj.DrawOnCanvas(this._rectangleObject);
                if (drawControlPoints) this.RenderControlPoints();
                break;
            }
            case 'Ellipse': {
                this._circleObject.Position = [p1[0], p1[1]];
                this._circleObject.Size = [width, height];
                this._circleObject.SetColour(this.ColourSelection.Primary)

                this._circleObject.Outlined = this._toolOptions.GetOption("FillMode").Value === "Outline";
                this._circleObject.Thickness = this._toolOptions.GetOption("BrushSize").Value as number;

                this._canvasObj.DrawOnCanvas(this._circleObject);
                if (drawControlPoints) this.RenderControlPoints();
                break;
            }
        }
    }

    private ResetState(): void {
        this._state = 'waiting for initial point';
        this._controlPoints = [];
        this._selectedControlPoint = null;
    }
}