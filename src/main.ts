import $ from 'jquery';
import VAO from './rosslib/glo/vao';
import VBO from './rosslib/glo/vbo';
import Shader from './rosslib/glo/shader';
import GLMath from './rosslib/glmath';
import { vec2 } from 'gl-matrix';

$('#app').append('<canvas width="640px" height="480px" id="canvas"></canvas>');
$('#canvas').css('border', '1px solid black');

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error("Error creating webgl2 context");

const width =  gl.canvas.width;
const height = gl.canvas.height;

// setup
gl.clearColor(0.21, 0.21, 0.21, 1.0);
gl.viewport(0, 0, width, height);

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

const quadPos = vec2.fromValues(width / 2, height / 2);
const quadRot = 0;
const quadScale = vec2.fromValues(100, 100);
const modelMatrix = GLMath.createTransformationMatrix2D(quadPos, quadRot, quadScale);
const projMatrix = GLMath.createOrthoProjectionMatrix(width, height);

shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMatrix);
shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), projMatrix);

requestAnimationFrame(() => Loop(gl));

function Loop(gl: WebGL2RenderingContext) {
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.Use();
    vao.Bind();
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(() => Loop(gl));
}