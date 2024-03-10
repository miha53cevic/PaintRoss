import VAO from './rosslib/glo/vao';
import VBO from './rosslib/glo/vbo';
import Shader from './rosslib/glo/shader';
import GLMath from './rosslib/glmath';
import { vec2 } from 'gl-matrix';
import App from './rosslib/app';

const app = new App('#app', () => {}, Loop);
const gl = app.GetGLContext();

const quadVert = [
    -0.5, -0.5,
     0.5, -0.5,
     0.5,  0.5,

     0.5,  0.5,
    -0.5,  0.5,
    -0.5, -0.5,
];

const vao = new VAO(gl);
const vbo = new VBO(gl);
vao.Bind();
vbo.SetBufferData(quadVert);
vao.DefineVertexAttribPointer(vbo, 0, 2, 0, 0);

const shader = new Shader(gl, 
`#version 300 es
in vec2 a_position;

uniform mat4 u_modelMat;
uniform mat4 u_projMat;
 
void main() {
  vec4 pos = u_projMat * u_modelMat * vec4(a_position, 1.0, 1.0);
  gl_Position = pos;
}
`, 
`#version 300 es
precision highp float;
 
out vec4 FragColor;
 
void main() {
  FragColor = vec4(1, 0, 0, 1);
}
`);

const quadPos = vec2.fromValues(gl.canvas.width / 2, gl.canvas.height / 2);
const quadRot = 0;
const quadScale = vec2.fromValues(100, 100);
const modelMatrix = GLMath.createTransformationMatrix2D(quadPos, quadRot, quadScale);
const projMatrix = GLMath.createOrthoProjectionMatrix(gl.canvas.width, gl.canvas.height);

shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMatrix);
shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), projMatrix);

function Loop(app: App) {
    const gl = app.GetGLContext();

    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.Use();
    vao.Bind();
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

app.Run();
