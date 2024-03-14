import { vec2 } from 'gl-matrix';
import App from './rosslib/app';
import Quad from './rosslib/quad';
import Scene2d from './rosslib/scene2d';
import Camera2D from './rosslib/camera2d';
import Texture from './rosslib/glo/texture';
import Canvas from './rosslib/canvas';
import Tool from './rosslib/tools/tool';
import Pen from './rosslib/tools/pen';

let scene: Scene2d;
let camera2d: Camera2D;

let tool: Tool;
let panning = false;
let panningStartPos: [number, number] = [0, 0];

const app = new App('#app');
app.onSetup = (gl, glCanvas) => {
    tool = new Pen(gl);

    glCanvas.addEventListener('mousedown', (ev) => {
        let mousePos = app.GetMousePos();
        if (canvas.IsMouseInCanvas(mousePos[0], mousePos[1]) && ev.button === 0) {
            mousePos = canvas.MouseToCanvasCoordinates(mousePos[0], mousePos[1]);
            tool.onMouseDown(mousePos[0], mousePos[1], ev.button);
        }
        if (ev.button === 1) {
            panningStartPos = app.GetMousePos();
            panning = true;
        }
    });

    glCanvas.addEventListener('mousemove', () => {
        let mousePos = app.GetMousePos();
        if (canvas.IsMouseInCanvas(mousePos[0], mousePos[1])) {
            mousePos = canvas.MouseToCanvasCoordinates(mousePos[0], mousePos[1]);
            tool.onMouseMove(mousePos[0], mousePos[1]);
        }
        if (panning) {
            let [x, y] = app.GetMousePos();
            camera2d.SetPan(x - panningStartPos[0], y - panningStartPos[1]);
        }
    });

    glCanvas.addEventListener('mouseup', (ev) => {
        let mousePos = app.GetMousePos();
        if (canvas.IsMouseInCanvas(mousePos[0], mousePos[1])) {
            mousePos = canvas.MouseToCanvasCoordinates(mousePos[0], mousePos[1]);
            tool.onMouseUp(mousePos[0], mousePos[1]);
        }
        if (ev.button === 1) {
            panning = false;
        }
    });

    glCanvas.addEventListener('wheel', (evt) => {
        const sensetivity = 0.1;
        const wheelDelta = Math.sign(-evt.deltaY);
        const zoomAmount = wheelDelta * sensetivity;

        const [x, y] = app.GetMousePos();
        camera2d.ZoomBy(zoomAmount, [x, y]);
    });

    scene = new Scene2d();
    camera2d = new Camera2D(gl.canvas.width, gl.canvas.height);

    const quad1 = new Quad(gl);
    quad1.Size = vec2.fromValues(100, 100);
    quad1.Position = vec2.fromValues(0, 0);
    quad1.Texture = Texture.loadTexture(gl, '/test.png');

    const quad2 = new Quad(gl);
    quad2.Size = vec2.fromValues(100, 100);
    quad2.Position = vec2.fromValues(100, 100);

    const canvas = new Canvas(gl);
    canvas.Size = vec2.fromValues(800, 600);
    canvas.Position = vec2.fromValues(gl.canvas.width / 2 - canvas.Size[0] / 2, gl.canvas.height / 2 - canvas.Size[1] / 2);
    canvas.onCanvasRender = (camera) => {
        (tool as Pen).Render(camera);
    };

    scene.Add([canvas, quad1, quad2]);
};
app.onResize = (width, height) => {
    camera2d.updateProjectionMatrix(width, height);
};
app.onUpdate = () => {
};
app.onRender = () => {
    scene.Render(camera2d);
};

app.Run();
