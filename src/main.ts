import $ from 'jquery';

$('#app').append('<canvas width="640px" height="480px" id="canvas"></canvas>');
$('#canvas').css('border', '1px solid black');

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error("Error creating webgl2 context");

// setup
gl.clearColor(0.21, 0.21, 0.21, 1.0);

requestAnimationFrame(() => Loop(gl));

function Loop(gl: WebGL2RenderingContext) {
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(() => Loop(gl));
}