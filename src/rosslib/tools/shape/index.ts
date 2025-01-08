import CanvasObject from '../../objects/canvasObject';
import CircleObject from '../../objects/circleObject';
import RectangleObject from '../../objects/rectangleObject';
import { ColourSelection } from '../../util/colour';
import { ControllablePoints, ControlPoint } from '../../util/controlPoints';
import Tool from '../tool';
import { ToolOption } from '../toolOptions';
import ShapeToolOptions from './shapeToolOptions';

type ShapeState = 'waiting for initial point' | 'waiting for initial release' | 'waiting for controlpoint edit finish';

export default class ShapeTool extends Tool {
    private _state: ShapeState = 'waiting for initial point';
    private _circleObject: CircleObject;
    private _rectangleObject: RectangleObject;
    private _controllablePoints: ControllablePoints = new ControllablePoints();

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
                    this._controllablePoints.ControlPoints = [];
                    this._controllablePoints.ControlPoints.push(new ControlPoint([canvasX, canvasY]));
                    this._state = 'waiting for initial release';
                }
                break;
            }
            case 'waiting for controlpoint edit finish': {
                if (mouseButton === 2) {
                    // finish with right click
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderShape(false);
                    this._canvasObj.MergePreviewCanvas();
                    this.ResetState();
                }
                if (mouseButton === 0) {
                    const cp = this._controllablePoints.GetTouching([canvasX, canvasY]);
                    if (cp) {
                        this._controllablePoints.Select(cp);
                        this.RenderShape();
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
                    this.RenderShape();
                    this._state = 'waiting for controlpoint edit finish';
                }
                break;
            }
            case 'waiting for controlpoint edit finish': {
                if (mouseButton === 0) {
                    this._controllablePoints.Select(null);
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
                if (this._controllablePoints.ControlPoints.length == 2) {
                    this._controllablePoints.ControlPoints[1] = new ControlPoint([canvasX, canvasY]);
                    // Otherwise add the second control point
                } else this._controllablePoints.ControlPoints.push(new ControlPoint([canvasX, canvasY]));
                // Rerender the line
                this._canvasObj.CancelPreviewCanvas();
                this.RenderShape();
                break;
            }
            case 'waiting for controlpoint edit finish': {
                const selectedControlPoint = this._controllablePoints.GetSelected();
                if (selectedControlPoint) {
                    selectedControlPoint.Position = [canvasX, canvasY];
                    // Rerender spline
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderShape();
                }
                break;
            }
        }
    }

    public OnKeyPress(key: string): void {}

    public OnEnter(): void {}

    public OnExit(): void {
        this._canvasObj.CancelPreviewCanvas();
        this.RenderShape(false);
        this._canvasObj.MergePreviewCanvas();
        this.ResetState();
    }

    public GetID(): string {
        return 'Shape';
    }

    private RenderShape(drawControlPoints = true): void {
        if (this._controllablePoints.ControlPoints.length < 2) return;
        const p1 = this._controllablePoints.ControlPoints[0].Position;
        const p4 = this._controllablePoints.ControlPoints[1].Position;
        const width = p4[0] - p1[0];
        const height = p4[1] - p1[1];

        switch (this._toolOptions.GetOption('Type').Value) {
            case 'Rectangle': {
                this._rectangleObject.Position = [p1[0], p1[1]];
                this._rectangleObject.Size = [width, height];
                this._rectangleObject.SetColour(this.ColourSelection.Primary);

                this._rectangleObject.Outlined = this._toolOptions.GetOption('FillMode').Value === 'Outline';
                this._rectangleObject.Thickness = this._toolOptions.GetOption('BrushSize').Value as number;

                this._canvasObj.DrawOnCanvas(this._rectangleObject);
                if (drawControlPoints) this._controllablePoints.Render(this._gl, this._canvasObj);
                break;
            }
            case 'Ellipse': {
                this._circleObject.Position = [p1[0], p1[1]];
                this._circleObject.Size = [width, height];
                this._circleObject.SetColour(this.ColourSelection.Primary);

                this._circleObject.Outlined = this._toolOptions.GetOption('FillMode').Value === 'Outline';
                this._circleObject.Thickness = this._toolOptions.GetOption('BrushSize').Value as number;

                this._canvasObj.DrawOnCanvas(this._circleObject);
                if (drawControlPoints) this._controllablePoints.Render(this._gl, this._canvasObj);
                break;
            }
        }
    }

    private ResetState(): void {
        this._state = 'waiting for initial point';
        this._controllablePoints.ControlPoints = [];
        this._controllablePoints.Select(null);
    }
}
