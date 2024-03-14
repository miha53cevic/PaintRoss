import Camera2D from "../camera2d";
import Shader from "../glo/shader";
import VAO from "../glo/vao";
import VBO from "../glo/vbo";
import Tool from "./tool";

const lineVertexShader =
`#version 300 es
in vec2 a_position;

uniform mat4 u_projMat;
uniform mat4 u_viewMat;
 
void main() {
  vec4 pos = u_projMat * u_viewMat * vec4(a_position, 1.0, 1.0);
  gl_Position = pos;
}
`;
const lineFragShader =
`#version 300 es
precision highp float;

out vec4 FragColor;

void main() {
  FragColor = vec4(0, 0, 0, 1);
}
`;

export default class Pen implements Tool {
    private readonly lineShader: Shader;
    private points: [number, number][] = [];
    private drawing = false;

    constructor(private readonly gl: WebGL2RenderingContext) {
        this.lineShader = new Shader(gl, lineVertexShader, lineFragShader);
    }

    onMouseDown(): void {
        this.drawing = true;
        this.points = [];
    }

    onMouseUp(): void {
        this.drawing = false;
        this.points = [];
    }

    onMouseMove(x: number, y: number): void {
        if (!this.drawing) return;
        this.points.push([x, y]);
    }

    Render(camera: Camera2D) {
        this.lineShader.Use();
        this.lineShader.SetMatrix4(this.lineShader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        this.lineShader.SetMatrix4(this.lineShader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        const vao = new VAO(this.gl);
        const vbo = new VBO(this.gl);
        vao.Bind();
        vbo.SetBufferData(this.points.flat());
        vao.DefineVertexAttribPointer(vbo, 0, 2, 0, 0);
        this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.points.length);
    }
}