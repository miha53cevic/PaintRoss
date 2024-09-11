import CanvasObject from "../objects/canvasObject";
import { ColourSelection } from "../util/colour";

export default abstract class Tool {
    constructor(protected readonly gl: WebGL2RenderingContext, protected readonly canvasObj: CanvasObject) {}

    public ColourSelection: ColourSelection = new ColourSelection();

    public onMouseDown(x: number, y: number, mouseButton: number): void {
        if (this.isValidCoords(x, y)) return;
        this.handleMouseDown(x, y, mouseButton);
    }
    public onMouseUp(x: number, y: number, mouseButton: number): void {
        if (this.isValidCoords(x, y)) return;
        this.handleMouseUp(x, y, mouseButton);
    }
    public onMouseMove(x: number, y: number): void {
        if (this.isValidCoords(x, y)) return;
        this.handleMouseMove(x, y);
    }
    public onDestroy(): void {
        this.handleDestroy();
    }

    protected abstract handleMouseDown(x: number, y: number, mouseButton: number): void;
    protected abstract handleMouseUp(x: number, y: number, mouseButton: number): void;
    protected abstract handleMouseMove(x: number, y: number): void;
    protected abstract handleDestroy(): void;
    
    public abstract GetID(): string;

    private isValidCoords(x: number, y: number): boolean {
        return (isNaN(x) || isNaN(y));
    }
}