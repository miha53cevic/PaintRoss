
export default abstract class ColourPicker {
    public Size: number = 400;

    constructor(protected _ctx: CanvasRenderingContext2D) {
        this._ctx.canvas.width = this.Size;
        this._ctx.canvas.height = this.Size;

        // Add color picking
        _ctx.canvas.addEventListener('click', (ev) => {
            const { X, Y } = this.TransformLocalMouseToCanvasMouse(ev);
            this.PickColour(X, Y, ev.button);
        });
        _ctx.canvas.addEventListener('contextmenu', (ev) => {
            ev.preventDefault();
            const { X, Y } = this.TransformLocalMouseToCanvasMouse(ev);
            this.PickColour(X, Y, ev.button);
        });
    }

    protected abstract PickColour(canvasX: number, canvasY: number, mouseButton: number): void;
    public abstract DrawPicker(): void;

    private TransformLocalMouseToCanvasMouse(ev: MouseEvent): { X: number, Y: number } {
        const rect = this._ctx.canvas.getBoundingClientRect();
        const localMousePosition = {
            X: ev.clientX - rect.left,
            Y: ev.clientY - rect.top
        };

        const localMousePositionNormalized = {
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