import Camera2D from '../camera2d';
import GLMath from '../glmath';
import Shader from '../glo/shader';
import VAO from '../glo/vao';
import VBO from '../glo/vbo';
import Object2D from './object2d';

const vertexShader = `#version 300 es
in vec2 a_position;
out vec4 clipSpaceSelectionRect;

uniform mat4 u_modelMat;
uniform mat4 u_projMat;
uniform mat4 u_viewMat;
 
void main() {
  mat4 mvp = u_projMat * u_viewMat * u_modelMat;
  vec4 pos = mvp * vec4(a_position, 0.0, 1.0);
  gl_Position = pos;
}
`;
const fragShader = `#version 300 es
precision highp float;

out vec4 FragColor;

uniform float u_time;

// Marching ants animation
float dashedLine(float coordDiagonalDistance, float dashLength, float gapLength, float speed) {
    float totalLineLength = dashLength + gapLength;
    return mod(coordDiagonalDistance + u_time * speed, totalLineLength) < dashLength ? 1.0 : 0.0;
}
 
void main() {
    vec4 outColour = vec4(0.0, 0.0, 1.0, 0.25);

    vec2 fragCoord = gl_FragCoord.xy;

    float coordDiagonalDistance = fragCoord.x + fragCoord.y;
    float dashEffect = dashedLine(coordDiagonalDistance, 8.0, 8.0, 50.0);

    if (dashEffect == 1.0) outColour = vec4(0.0, 0.5, 1.0, 0.5);
    else discard;

    FragColor = outColour;
}
`;

export default class SelectionObject extends Object2D {
    private static _verticies = [
        0.0, 1.0,

        1.0, 1.0,

        1.0, 0.0,

        1.0, 0.0,

        0.0, 0.0,

        0.0, 1.0,
    ];
    private static _shader: Shader;
    private static _vao: VAO;
    private static _vbo: VBO;
    private _time: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        if (!SelectionObject._shader && !SelectionObject._vao && !SelectionObject._vbo) {
            SelectionObject._shader = new Shader(gl, vertexShader, fragShader);
            SelectionObject._vao = new VAO(gl);
            SelectionObject._vbo = new VBO(gl);

            SelectionObject._vao.Bind();
            SelectionObject._vbo.SetBufferData(SelectionObject._verticies);
            SelectionObject._vao.DefineVertexAttribPointer(SelectionObject._vbo, 0, 2, 0, 0);
        }
    }

    public SetUniformTime(time: number) {
        this._time = time / 1000; // in seconds
    }

    public Render(camera: Camera2D): void {
        const modelMat = GLMath.CreateTransformationMatrix2D(this.Position, this.Rotation, this.Size);

        const shader = SelectionObject._shader;
        shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMat);
        shader.SetMatrix4(shader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        shader.SetFloat(shader.GetUniformLocation('u_time'), this._time);

        shader.Use();
        SelectionObject._vao.Bind();
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
    }
}
