import { vec2 } from 'gl-matrix';
import Camera2D from '../camera2d';

export default abstract class Object2D {
    private _position: vec2 = vec2.fromValues(0, 0);
    private _rotation: number = 0;
    private _size: vec2 = vec2.fromValues(1, 1);

    get Position(): vec2 {
        return this._position;
    }

    set Position(value: vec2) {
        this._position = value;
    }

    get Rotation(): number {
        return this._rotation;
    }

    set Rotation(value: number) {
        this._rotation = value;
    }

    get Size(): vec2 {
        return this._size;
    }

    set Size(value: vec2) {
        this._size = value;
    }

    constructor(protected readonly _gl: WebGL2RenderingContext) {}

    public abstract Render(camera: Camera2D): void;
}
