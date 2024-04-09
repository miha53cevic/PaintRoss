import CanvasObject from "../objects/canvasObject";
import Tool from "./tool";
import LineObject from "../objects/lineObject";

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

    onMouseDown(x: number, y: number, mouseButton: number): void {
        if (mouseButton === 0) {
            this.drawing = true;
            this.points = [[x, y]]; // add initial click point
        }
    }

    onMouseUp(x: number, y: number, mouseButton: number): void {
        if (mouseButton === 0) {
            this.drawing = false;
            this.RenderLines();
            this.points = [];
        }
    }

    onMouseMove(x: number, y: number): void {
        if (this.drawing) {
            this.points.push([x, y]);
            this.RenderLines();

            // After draw keep only the last point so you can continue line drawing in next iteration
            this.points = [this.points[this.points.length - 1]]; // optimization for not keeping old points that are already drawn
        }
    }

    private RenderLines() {
        this.lineObject.Colour = this.Colour.NormalizedPrimary();
        this.lineObject.SetPoints(this.points);
        this.canvasObj.DrawOnCanvas(this.lineObject);
    }
}