import CanvasObject from "../objects/canvasObject";

export default abstract class Tool {
    constructor(protected readonly gl: WebGL2RenderingContext, protected readonly canvasObj: CanvasObject) {}

    public abstract onMouseDown(x: number, y: number, mouseButton: number): void;
    public abstract onMouseUp(x: number, y: number, mouseButton: number): void;
    public abstract onMouseMove(x: number, y: number): void;
}