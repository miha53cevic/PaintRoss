import { vec2, vec4 } from "gl-matrix";
import Shader from "./glo/shader";
import VAO from "./glo/vao";
import VBO from "./glo/vbo";
import GLMath from "./glmath";

const vertexShader = 
`#version 300 es
in vec2 a_position;

uniform mat4 u_modelMat;
uniform mat4 u_projMat;
 
void main() {
  vec4 pos = u_projMat * u_modelMat * vec4(a_position, 1.0, 1.0);
  gl_Position = pos;
}
`;
const fragShader =  
`#version 300 es
precision highp float;
 
out vec4 FragColor;

uniform vec4 u_colour;
 
void main() {
  FragColor = u_colour;
}
`;

export default class Quad {
    private static _verticies = [
        -0.5, -0.5,
         0.5, -0.5,
         0.5,  0.5,

         0.5,  0.5,
        -0.5,  0.5,
        -0.5, -0.5,
    ];
    private static _shader: Shader;
    private static _vao: VAO;
    private static _vbo: VBO;

    public Position: vec2 = vec2.fromValues(0, 0);
    public Rotation: number = 0;
    public Scale: vec2 = vec2.fromValues(1, 1);
    public Colour: vec4 = vec4.fromValues(1, 0, 0, 1);

    constructor(private readonly gl: WebGL2RenderingContext) {
        if (!Quad._shader && !Quad._vao && !Quad._vbo) {
            Quad._shader = new Shader(gl, vertexShader, fragShader);
            Quad._vao = new VAO(gl);
            Quad._vbo = new VBO(gl);


            Quad._vao.Bind();
            Quad._vbo.SetBufferData(Quad._verticies);
            Quad._vao.DefineVertexAttribPointer(Quad._vbo, 0, 2, 0, 0);
        }
    }

    public Render() {
        const modelMat = GLMath.createTransformationMatrix2D(this.Position, this.Rotation, this.Scale);
        const projMat = GLMath.createOrthoProjectionMatrix(this.gl.canvas.width, this.gl.canvas.height);

        const shader = Quad._shader;
        shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMat);
        shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), projMat);
        shader.SetVector4(shader.GetUniformLocation('u_colour'), this.Colour);

        shader.Use();
        Quad._vao.Bind();
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}