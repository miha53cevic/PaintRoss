import { vec2 } from "gl-matrix";
import Camera2D from "./camera2d";

export default abstract class Object2D {
    public Position: vec2 = vec2.fromValues(0, 0);
    public Rotation: number = 0;
    public Size: vec2 = vec2.fromValues(1, 1);

    constructor(protected readonly gl: WebGL2RenderingContext) {}

    public abstract Render(camera: Camera2D): void;
}