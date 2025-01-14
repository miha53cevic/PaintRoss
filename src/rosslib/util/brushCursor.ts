import CircleObject from '../objects/circleObject';

export default class BrushCursor {
    private static _instance: BrushCursor | null = null;
    private _circleObject: CircleObject;

    private constructor(gl: WebGL2RenderingContext) {
        this._circleObject = new CircleObject(gl);
        this._circleObject.Outlined = true;
        this._circleObject.Thickness = 0.1;
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
        return this._circleObject;
    }

    public SetBrushCursorPosition(worldX: number, worldY: number) {
        const cursorSize = this._circleObject.Size;
        const centeredPosition: [number, number] = [worldX - cursorSize[0] / 2, worldY - cursorSize[1] / 2];
        this._circleObject.Position = centeredPosition;
    }

    public SetBrushCursorSize(size: number) {
        if (size >= 10) this._circleObject.Thickness = 1; // when using higher brushSize makes it more visible
        else this._circleObject.Thickness = 0.1;

        this._circleObject.Size = [size, size];
    }

    public ResetBrushCursorSize() {
        this.SetBrushCursorSize(1);
    }
}
