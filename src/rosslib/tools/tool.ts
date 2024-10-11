import CanvasObject from "../objects/canvasObject";
import { ColourSelection } from "../util/colour";

export default abstract class Tool {
    constructor(protected readonly gl: WebGL2RenderingContext, protected readonly canvasObj: CanvasObject) { }

    public ColourSelection: ColourSelection = new ColourSelection();

    public OnMouseDown(x: number, y: number, mouseButton: number): void {
        if (this.IsValidCoords(x, y)) return;
        this.HandleMouseDown(x, y, mouseButton);
    }
    public OnMouseUp(x: number, y: number, mouseButton: number): void {
        if (this.IsValidCoords(x, y)) return;
        this.HandleMouseUp(x, y, mouseButton);
    }
    public OnMouseMove(x: number, y: number): void {
        if (this.IsValidCoords(x, y)) return;
        this.HandleMouseMove(x, y);
    }
    public OnKeyPress(key: string): void {
        this.HandleKeyPress(key);
    }
    public OnDestroy(): void {
        this.HandleDestroy();
    }

    protected abstract HandleMouseDown(x: number, y: number, mouseButton: number): void;
    protected abstract HandleMouseUp(x: number, y: number, mouseButton: number): void;
    protected abstract HandleMouseMove(x: number, y: number): void;
    protected abstract HandleKeyPress(key: string): void;
    protected abstract HandleDestroy(): void;

    public abstract GetID(): string;

    private IsValidCoords(x: number, y: number): boolean {
        return (isNaN(x) || isNaN(y));
    }
}