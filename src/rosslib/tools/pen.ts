import CanvasObject from "../objects/canvasObject";
import LineObject from "../objects/lineObject";
import Tool from "./tool";

export default class Pen extends Tool {
    private _points: [number, number][] = [];
    private _drawing = false;
    private _lineObject: LineObject;

    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        super(gl, canvasObj);
        this._lineObject = new LineObject(gl);
    }

    public GetID(): string {
        return "Pen";
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
            this._points.push([canvasX, canvasY]);
            this.RenderLines();

            // After draw keep only the last point so you can continue line drawing in next iteration
            this._points = [this._points[this._points.length - 1]]; // optimization for not keeping old points that are already drawn
        }
    }

    public OnKeyPress(key: string): void {
    }

    public OnDestroy(): void {
        this._canvasObj.MergePreviewCanvas();
    }

    private RenderLines() {
        this._lineObject.Colour = this.ColourSelection.Primary;
        this._lineObject.SetPoints(this._points);
        this._canvasObj.DrawOnCanvas(this._lineObject);
    }
}