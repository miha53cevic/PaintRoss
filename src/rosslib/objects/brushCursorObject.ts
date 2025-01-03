import Camera2D from '../camera2d';
import CircleObject from './circleObject';
import Object2D from './object2d';

export default class BrushCursorObject extends Object2D {
    private _circleObject: CircleObject;

    public Visible = true;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        this._circleObject = new CircleObject(gl);
        this._circleObject.Outlined = true;
        this._circleObject.Thickness = 0.1;
        this.Position = [0, 0];
    }

    public Render(camera: Camera2D): void {
        if (!this.Visible) return;
        this._circleObject.Render(camera);
    }

    get Position() {
        return this._circleObject.Position;
    }

    set Position(value) {
        const centeredPosition: [number, number] = [value[0] - this.Size[0] / 2, value[1] - this.Size[1] / 2];
        this._circleObject.Position = centeredPosition;
    }

    get Rotation() {
        return this._circleObject.Rotation;
    }

    set Rotation(value) {
        this._circleObject.Rotation = value;
    }

    get Size() {
        return this._circleObject.Size;
    }

    set Size(value) {
        this._circleObject.Size = value;

        if (value[0] >= 10 && value[1] >= 10)
            this._circleObject.Thickness = 1; // when using higher brushSize makes it more visible
        else this._circleObject.Thickness = 0.1;
    }
}
