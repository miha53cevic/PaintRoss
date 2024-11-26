import CanvasObject from "../../objects/canvasObject";
import LineObject from "../../objects/lineObject";
import Tool from "../tool";
import { ToolOption } from "../toolOptions";
import PenToolOptions from "./penToolOptions";

export default class PenTool extends Tool {
    private _points: [number, number][] = [];
    private _drawing = false;
    private _lineObject: LineObject;
    private _maxPointHistory = 3;

    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        super(gl, canvasObj, new PenToolOptions());
        this._lineObject = new LineObject(gl);
    }

    public GetID(): string {
        return "Pen";
    }

    public OnToolOptionChange(option: ToolOption): void {
    }

    public OnMouseDown(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (!canvasX || !canvasY) return;
        if (mouseButton === 0) {
            this._drawing = true;
            this._points = [[canvasX, canvasY]]; // add initial click point
        }
    }

    public OnMouseUp(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (mouseButton === 0) {
            this._drawing = false;
            this.RenderLines();
            this._points = [];
        }
    }

    public OnMouseMove(canvasX: number | undefined, canvasY: number | undefined): void {
        if (this._drawing) {
            if (!canvasX || !canvasY) return;
            this._points.push([canvasX, canvasY]); // don't math.floor here, because on zoom in it will create artifacts
            this.RenderLines();

            // After draw keep only the last N point so you can continue line drawing in next iteration
            // Keeping multiple points helps to draw smooth lines (fix gaps between points)
            this._points = this._points.slice(-this._maxPointHistory);
        }
    }

    public OnKeyPress(key: string): void {
    }

    public OnExit(): void {
        this._canvasObj.MergePreviewCanvas();
    }

    private RenderLines() {
        this._lineObject.Thickness = this._toolOptions.GetOption('BrushSize').Value as number;
        this._lineObject.Colour = this.ColourSelection.Primary;
        this._lineObject.SetPoints(this._points);
        this._canvasObj.DrawOnCanvas(this._lineObject);
    }
}