import BrushCursorObject from './objects/brushCursorObject';

export default class BrushCursor {
    private static _instance: BrushCursor | null = null;
    private _brushCursorObject: BrushCursorObject;

    private constructor(gl: WebGL2RenderingContext) {
        this._brushCursorObject = new BrushCursorObject(gl);
    }

    public static Init(gl: WebGL2RenderingContext) {
        if (!this._instance) {
            this._instance = new BrushCursor(gl);
        } else {
            throw new Error('BrushCursor already initialized');
        }
    }

    public static Get() {
        if (!this._instance) throw new Error('Trying to get BrushCursor before initialization');
        return this._instance;
    }

    public GetObject2D() {
        return this._brushCursorObject;
    }

    public SetBrushCursorPosition(worldX: number, worldY: number) {
        this._brushCursorObject.Position = [worldX, worldY];
    }

    public SetBrushCursorSize(size: number) {
        this._brushCursorObject.Size = [size, size];
    }

    public ResetBrushCursorSize() {
        this._brushCursorObject.Size = [1, 1];
    }
}
