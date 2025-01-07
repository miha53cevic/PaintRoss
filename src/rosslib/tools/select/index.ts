import CanvasObject from '../../objects/canvasObject';
import QuadObject from '../../objects/quadObject';
import SelectionObject from '../../objects/selectionObject';
import { ColourSelection } from '../../util/colour';
import { GetTouchingControlPoint, Point } from '../../util/controlPoints';
import Tool from '../tool';
import { ToolOption } from '../toolOptions';
import SelectToolOptions from './selectToolOptions';

type SelectState = 'waiting for initial point' | 'waiting for initial release' | 'waiting for controlpoint edit finish';

export default class SelectTool extends Tool {
    private _state: SelectState = 'waiting for initial point';
    private _selectionObject: SelectionObject;
    private _controlPoints: Point[] = [];
    private _selectedControlPoint: Point | null = null;

    public ControlPointSize: Point = [10, 10];

    constructor(
        _gl: WebGL2RenderingContext,
        _canvasObj: CanvasObject,
        colourSelection: ColourSelection,
        selectionObj: SelectionObject
    ) {
        super(_gl, _canvasObj, new SelectToolOptions(), colourSelection);
        this._selectionObject = selectionObj;
    }

    public OnToolOptionChange(option: ToolOption): void {
        switch (this._state) {
            case 'waiting for initial point':
            case 'waiting for initial release':
            case 'waiting for controlpoint edit finish': {
                this._canvasObj.CancelPreviewCanvas();
                this.RenderSelection();
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
                this.RenderSelection();
                break;
            }
        }
    }

    public OnMouseDown(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (canvasX === undefined || canvasY === undefined) return;
        // Pixel perfect
        canvasX = Math.floor(canvasX);
        canvasY = Math.floor(canvasY);

        if (!this._selectionObject.Visible) this.ResetState();

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
                if (mouseButton === 2) {
                    // finish with right click
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderSelection(false);
                    this._canvasObj.MergePreviewCanvas();
                    this.ResetState();
                }
                if (mouseButton === 0) {
                    const cp = GetTouchingControlPoint([canvasX, canvasY], this._controlPoints, this.ControlPointSize);
                    this._selectedControlPoint = cp;
                    this.RenderSelection();
                }
                break;
            }
        }
    }

    public OnMouseUp(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (canvasX === undefined || canvasY === undefined) return;
        canvasX = Math.floor(canvasX);
        canvasY = Math.floor(canvasY);
        switch (this._state) {
            case 'waiting for initial release': {
                if (mouseButton === 0) {
                    this.RenderSelection();
                    this._state = 'waiting for controlpoint edit finish';
                }
                break;
            }
            case 'waiting for controlpoint edit finish': {
                if (mouseButton === 0) {
                    this._selectedControlPoint = null;
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderSelection();
                }
                break;
            }
        }
    }

    public OnMouseMove(canvasX: number | undefined, canvasY: number | undefined): void {
        if (canvasX === undefined || canvasY === undefined) return;
        canvasX = Math.floor(canvasX);
        canvasY = Math.floor(canvasY);
        switch (this._state) {
            case 'waiting for initial release': {
                // If the second control point is already placed just change it
                if (this._controlPoints.length == 2) {
                    this._controlPoints[1] = [canvasX, canvasY];
                    // Otherwise add the second control point
                } else this._controlPoints.push([canvasX, canvasY]);
                // Rerender the line
                this._canvasObj.CancelPreviewCanvas();
                this.RenderSelection();
                break;
            }
            case 'waiting for controlpoint edit finish': {
                if (this._selectedControlPoint) {
                    this._selectedControlPoint[0] = canvasX;
                    this._selectedControlPoint[1] = canvasY;
                    // Rerender spline
                    this._canvasObj.CancelPreviewCanvas();
                    this.RenderSelection();
                }
                break;
            }
        }
    }

    public OnKeyPress(key: string): void {}

    public OnExit(): void {
        this._canvasObj.CancelPreviewCanvas();
        this.RenderSelection(false);
        this._canvasObj.MergePreviewCanvas();
        this.ResetState();
    }

    public GetID(): string {
        return 'Select';
    }

    private RenderControlPoints() {
        const quad = new QuadObject(this._gl);
        quad.Size = this.ControlPointSize;
        for (const controlPoint of this._controlPoints) {
            if (this._selectedControlPoint === controlPoint) {
                quad.Colour = [255, 255, 0, 255];
            } else quad.Colour = [255, 0, 0, 255];
            const pos: Point = [controlPoint[0] - quad.Size[0] / 2, controlPoint[1] - quad.Size[1] / 2];
            quad.Position = pos;
            this._canvasObj.DrawOnCanvas(quad);
        }
    }

    private RenderSelection(drawControlPoints = true): void {
        if (this._controlPoints.length < 2) return;
        const p1 = this._controlPoints[0];
        const p4 = this._controlPoints[1];
        const width = Math.abs(p4[0] - p1[0]);
        const height = Math.abs(p4[1] - p1[1]);

        const topLeftPoint = [p1[0] < p4[0] ? p1[0] : p4[0], p1[1] < p4[1] ? p1[1] : p4[1]];

        this._selectionObject.Position = [
            this._canvasObj.Position[0] + topLeftPoint[0],
            this._canvasObj.Position[1] + topLeftPoint[1],
        ];
        this._selectionObject.Size = [width, height];
        this._selectionObject.Visible = true;

        if (drawControlPoints) this.RenderControlPoints();
    }

    private ResetState(): void {
        this._state = 'waiting for initial point';
        this._controlPoints = [];
        this._selectedControlPoint = null;
    }
}
