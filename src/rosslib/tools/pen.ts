import CanvasObject from "../objects/canvasObject";
import LineObject from "../objects/lineObject";
import Tool from "./tool";

export default class Pen extends Tool {
    private points: [number, number][] = [];
    private drawing = false;
    private lineObject: LineObject;

    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        super(gl, canvasObj);
        this.lineObject = new LineObject(gl);
    }

    public GetID(): string {
        return "Pen";
    }

    handleMouseDown(x: number, y: number, mouseButton: number): void {
        if (mouseButton === 0) {
            this.drawing = true;
            this.points = [[x, y]]; // add initial click point
        }
    }

    handleMouseUp(x: number, y: number, mouseButton: number): void {
        if (mouseButton === 0) {
            this.drawing = false;
            this.RenderLines();
            this.points = [];
        }
    }

    handleMouseMove(x: number, y: number): void {
        if (this.drawing) {
            this.points.push([x, y]);
            this.RenderLines();

            // After draw keep only the last point so you can continue line drawing in next iteration
            this.points = [this.points[this.points.length - 1]]; // optimization for not keeping old points that are already drawn
        }
    }

    public handleDestroy(): void {
        this.canvasObj.MergePreviewCanvas();
    }

    private RenderLines() {
        this.lineObject.Colour = this.ColourSelection.Primary;
        this.lineObject.SetPoints(this.points);
        this.canvasObj.DrawOnCanvas(this.lineObject);
    }
}