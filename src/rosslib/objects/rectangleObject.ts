import Camera2D from "../camera2d";
import { RGB } from "../util/colour";
import LineObject from "./lineObject";
import Object2D from "./object2d";
import QuadObject from "./quadObject";

export default class RectangleObject extends Object2D {
    private _lineObject: LineObject;
    private _quadObject: QuadObject;

    public Outlined = false;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this._lineObject = new LineObject(gl);
        this._quadObject = new QuadObject(gl);

        this._lineObject.SetPoints([
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
        ]);
    }

    public Render(camera: Camera2D): void {
        if (this.Outlined) this._lineObject.Render(camera);
        else this._quadObject.Render(camera);
    }

    public SetColour(colour: RGB) {
        this._lineObject.Colour = colour;
        this._quadObject.Colour = colour;
    }
    
    get Position() {
        return this._lineObject.Position;
    }

    set Position(value) {
        this._lineObject.Position = value;
        this._quadObject.Position = value;
    }

    get Rotation() {
        return this._lineObject.Rotation
    }

    set Rotation(value: number) {
        this._lineObject.Rotation = value;
        this._quadObject.Rotation = value;
    }

    get Size() {
        return this._lineObject.Size;
    }

    set Size(value) {
        this._lineObject.Size = value;
        this._quadObject.Size = value;
    }
}