import Camera2D from '../camera2d';
import { RGBA } from '../util/colour';
import LineObject from './lineObject';
import Object2D from './object2d';
import QuadObject from './quadObject';

export default class RectangleObject extends Object2D {
    private _lineObject: LineObject;
    private _quadObject: QuadObject;

    public Outlined = false;
    public Thickness = 1;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this._lineObject = new LineObject(gl);
        this._quadObject = new QuadObject(gl);

        this._lineObject.SetPoints(
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
            ],
            true,
        );
    }

    public Render(camera: Camera2D): void {
        this._lineObject.Thickness = this.Thickness;
        if (this.Outlined) this._lineObject.Render(camera);
        else this._quadObject.Render(camera);
    }

    public SetColour(colour: RGBA) {
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
        return this._lineObject.Rotation;
    }

    set Rotation(value: number) {
        this._lineObject.Rotation = value;
        this._quadObject.Rotation = value;
    }

    get Size() {
        return this._quadObject.Size;
    }

    set Size(value) {
        // lineObject size is not used since scaling lines would make them thicker
        this._lineObject.SetPoints(
            [
                [0, 0],
                [value[0], 0],
                [value[0], value[1]],
                [0, value[1]],
            ],
            true,
        );
        this._quadObject.Size = value;
    }
}
