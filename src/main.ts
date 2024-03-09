import $ from 'jquery';
import VAO from './rosslib/glo/vao';
import VBO from './rosslib/glo/vbo';
import Shader from './rosslib/glo/shader';

$('#app').append('<canvas width="640px" height="480px" id="canvas"></canvas>');
$('#canvas').css('border', '1px solid black');

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error("Error creating webgl2 context");

// setup
gl.clearColor(0.21, 0.21, 0.21, 1.0);

const triangleVert = [
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
     0.0,  0.5, 0.0
];

const vao = new VAO(gl);
const vbo = new VBO(gl);
vao.Bind();
vbo.SetBufferData(triangleVert);
vao.DefineVertexAttribPointer(vbo, 0, 3, 0, 0);

const shader = new Shader(gl, 
`#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`, 
`#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`);

requestAnimationFrame(() => Loop(gl));

function Loop(gl: WebGL2RenderingContext) {
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.Use();
    vao.Bind();
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(() => Loop(gl));
}