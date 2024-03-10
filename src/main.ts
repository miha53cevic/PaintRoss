import { vec2, vec4 } from 'gl-matrix';
import App from './rosslib/app';
import Quad from './rosslib/quad';

const app = new App('#app', () => {}, Loop);
const gl = app.GetGLContext();

const quad1 = new Quad(gl);
quad1.Position = vec2.fromValues(gl.canvas.width / 2, gl.canvas.height / 2);
quad1.Scale = vec2.fromValues(100, 100);
quad1.Colour = vec4.fromValues(1, 1, 1, 1);

const quad2 = new Quad(gl);
quad2.Position = vec2.fromValues(100, 100);
quad2.Scale = vec2.fromValues(100, 100);

function Loop() {
    //const gl = app.GetGLContext();

    quad1.Render();
    quad2.Render();
}

app.Run();
