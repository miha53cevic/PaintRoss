import { vec2, vec4 } from 'gl-matrix';
import App from './rosslib/app';
import Quad from './rosslib/quad';
import Scene2d from './rosslib/scene2d';
import Camera2D from './rosslib/camera2d';
import Texture from './rosslib/glo/texture';

const app = new App('#app', () => {}, Loop, (width, height) => {
    camera2d.updateProjectionMatrix(width, height);
});
const gl = app.GetGLContext();

const scene = new Scene2d();
const camera2d = new Camera2D(gl.canvas.width, gl.canvas.height);
camera2d.SetPos(-100, 0);

const quad1 = new Quad(gl);
quad1.Position = vec2.fromValues(gl.canvas.width / 2, gl.canvas.height / 2);
quad1.Scale = vec2.fromValues(100, 100);
quad1.Colour = vec4.fromValues(1, 1, 1, 1);
quad1.Texture = Texture.loadTexture(gl, '/test.png');

const quad2 = new Quad(gl);
quad2.Position = vec2.fromValues(100, 100);
quad2.Scale = vec2.fromValues(100, 100);

scene.Add([quad1, quad2]);

function Loop() {
    //const gl = app.GetGLContext();

    scene.Render(camera2d);
}

app.Run();
