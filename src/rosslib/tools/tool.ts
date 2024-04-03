import CanvasObject from "../objects/canvasObject";
import Colour from "../util/colour";

export default abstract class Tool {
    constructor(protected readonly gl: WebGL2RenderingContext, protected readonly canvasObj: CanvasObject) {}

    public Colour: Colour = new Colour();

    public abstract onMouseDown(x: number, y: number, mouseButton: number): void;
    public abstract onMouseUp(x: number, y: number, mouseButton: number): void;
    public abstract onMouseMove(x: number, y: number): void;
    
    public abstract GetID(): string;
}