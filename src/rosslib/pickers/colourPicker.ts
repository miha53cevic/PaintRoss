import { RGBA } from "../util/colour";

export default abstract class ColourPicker {
    public Size: number = 400;

    constructor(protected _ctx: CanvasRenderingContext2D) {
        this._ctx.canvas.width = this.Size;
        this._ctx.canvas.height = this.Size;

        // Add color picking
        _ctx.canvas.addEventListener('click', this.PickListener);
        _ctx.canvas.addEventListener('contextmenu', this.PickListener);
    }

    // Must be arrow function because they inherit the 'this' context, otherwise 'this' would be the canvas element
    // Also trying to bind the function doesn't work because bind creates a new function and the event listener doesn't know about it
    // when trying to remove the event listener
    private PickListener = (e: MouseEvent) => {
        const { X, Y } = this.TransformLocalMouseToCanvasMouse(e);
        this.PickColour(X, Y, e.button);
    }

    public OnExit(): void {
        this._ctx.canvas.removeEventListener('click', this.PickListener);
        this._ctx.canvas.removeEventListener('contextmenu', this.PickListener);
    }

    protected abstract PickColour(canvasX: number, canvasY: number, mouseButton: number): void;
    public abstract DrawPicker(): void;
    public abstract SetPick(colour: RGBA): void;

    private TransformLocalMouseToCanvasMouse(ev: MouseEvent): { X: number, Y: number } {
        const rect = this._ctx.canvas.getBoundingClientRect();
        const localMousePosition = {
            X: ev.clientX - rect.left,
            Y: ev.clientY - rect.top
        };

        const localMousePositionNormalized = { // 0.0 to 1.0
            X: localMousePosition.X / rect.width,
            Y: localMousePosition.Y / rect.height
        };

        // If canvas is 400x400px the actual canvas size could be 200x200px so we need to transform the mouse position
        const canvasMousePosition = {
            X: localMousePositionNormalized.X * this.Size,
            Y: localMousePositionNormalized.Y * this.Size
        };

        return canvasMousePosition;
    }
}