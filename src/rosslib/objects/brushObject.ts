import Camera2D from "../camera2d";
import { RGB } from "../util/colour";
import CircleObject from "./circleObject";
import Object2D from "./object2d";

export default class BrushObject extends Object2D {
    private _circleObject: CircleObject;

    public constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this._circleObject = new CircleObject(gl, 100);
        this._circleObject.Outlined = true;
    }

    public Render(camera: Camera2D): void {
        this._circleObject.Render(camera);
    }

    public SetColour(color: RGB) {
        this._circleObject.SetColour(color);
    }

    get Position() {
        return this._circleObject.Position;
    }

    set Position(value) {
        this._circleObject.Position = value;
    }

    get Rotation(): number {
        return this._circleObject.Rotation;
    }

    set Rotation(value: number) {
        this._circleObject.Rotation = value;
    }

    get Size() {
        return this._circleObject.Size;
    }

    set Size(value) {
        this._circleObject.Size = value;
    }
}