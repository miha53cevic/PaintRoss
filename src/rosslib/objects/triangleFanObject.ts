import Camera2D from "../camera2d";
import GLMath from "../glmath";
import Shader from "../glo/shader";
import VAO from "../glo/vao";
import VBO from "../glo/vbo";
import { NormalizeRGBA, RGBA } from "../util/colour";
import Object2D from "./object2d";

const triangleFanVertexShader =
    `#version 300 es
in vec2 a_position;

uniform mat4 u_modelMat;
uniform mat4 u_projMat;
uniform mat4 u_viewMat;
 
void main() {
  vec4 pos = u_projMat * u_viewMat * u_modelMat * vec4(a_position, 0.0, 1.0);
  gl_Position = pos;
}
`;
const triangleFanFragSHader =
    `#version 300 es
precision highp float;

uniform vec4 colour;

out vec4 FragColor;

void main() {
  FragColor = vec4(colour);
}
`;

export default class TriangleFanObject extends Object2D {
    private static _shader: Shader;
    private _vao: VAO;
    private _vbo: VBO;
    private _points: [number, number][] = [];

    public Colour: RGBA = [0, 0, 0, 255];

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        if (!TriangleFanObject._shader) TriangleFanObject._shader = new Shader(gl, triangleFanVertexShader, triangleFanFragSHader);

        this._vao = new VAO(gl);
        this._vbo = new VBO(gl);
    }

    public SetPoints(points: [number, number][]) {
        this._points = points;
        this._vao.Bind();
        this._vbo.SetBufferData(points.flat());
        this._vao.DefineVertexAttribPointer(this._vbo, 0, 2, 0, 0);
    }

    public Render(camera: Camera2D) {
        if (this._points.length < 3) return;

        const modelMat = GLMath.CreateTransformationMatrix2D(this.Position, this.Rotation, this.Size);

        const shader = TriangleFanObject._shader;
        shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMat);
        shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        shader.SetMatrix4(shader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        shader.SetVector4(shader.GetUniformLocation('colour'), NormalizeRGBA(this.Colour));

        shader.Use();
        this._vao.Bind();

        this._gl.drawArrays(this._gl.TRIANGLE_FAN, 0, this._points.length);
    }
}