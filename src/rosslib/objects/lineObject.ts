import Shader from "../glo/shader";
import VAO from "../glo/vao";
import VBO from "../glo/vbo";
import Object2D from "./object2d";
import Camera2D from "../camera2d";
import { RGB } from "../util/colour";

const lineVertexShader =
    `#version 300 es
in vec2 a_position;

uniform mat4 u_projMat;
uniform mat4 u_viewMat;
 
void main() {
  vec4 pos = u_projMat * u_viewMat * vec4(a_position, 0.0, 1.0);
  gl_Position = pos;
  gl_PointSize = 0.0;
}
`;
const lineFragShader =
    `#version 300 es
precision highp float;

uniform vec3 colour;

out vec4 FragColor;

void main() {
  FragColor = vec4(colour.xyz, 1);
}
`;

export default class LineObject extends Object2D {
    private static _shader: Shader;
    private static _vao: VAO;
    private static _vbo: VBO;
    private _points: [number, number][] = [];

    public Colour: RGB = [0, 0, 0];

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        if (!LineObject._shader && !LineObject._vao && !LineObject._vbo) {
            LineObject._shader = new Shader(gl, lineVertexShader, lineFragShader);
            LineObject._vao = new VAO(gl);
            LineObject._vbo = new VBO(gl);
        }
    }

    public SetPoints(points: [number, number][]) {
        this._points = points;
        const vao = LineObject._vao;
        const vbo = LineObject._vbo;
        vao.Bind();
        vbo.SetBufferData(points.flat());
        vao.DefineVertexAttribPointer(vbo, 0, 2, 0, 0);
    }

    public Render(camera: Camera2D) {
        const shader = LineObject._shader;
        shader.Use();
        shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        shader.SetMatrix4(shader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        shader.SetVector3(shader.GetUniformLocation('colour'), this.Colour);

        // If it's only 1 point draw it instead of a line
        if (this._points.length > 1) this.gl.drawArrays(this.gl.LINE_STRIP, 0, this._points.length);
        else this.gl.drawArrays(this.gl.POINTS, 0, 1);
    }
}