import { vec2 } from 'gl-matrix';
import App from './app';
import Quad from './quad';
import Scene2d from './scene2d';
import Camera2D from './camera2d';
import Texture from './glo/texture';
import Canvas from './canvas';
import Tool from './tools/tool';
import Pen from './tools/pen';

export function loadPaintApp(canvas: HTMLCanvasElement) {
    let scene: Scene2d;
    let camera2d: Camera2D;

    let tool: Tool;
    let panning = false;
    let panningStartPos: [number, number] = [0, 0];

    const app = new App(canvas);
    app.onSetup = (gl, glCanvas) => {
        tool = new Pen(gl);

        glCanvas.addEventListener('mousedown', (ev) => {
            const mousePos = app.GetMousePos();
            const mouseWorld = camera2d.mouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            if (canvas.IsMouseInCanvas(mouseWorld[0], mouseWorld[1]) && ev.button === 0) {
                const canvasPos = canvas.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
                tool.onMouseDown(canvasPos[0], canvasPos[1], ev.button);
            }
            if (ev.button === 1) {
                panningStartPos = app.GetMousePos();
                panning = true;
            }
        });

        glCanvas.addEventListener('mousemove', () => {
            const mousePos = app.GetMousePos();
            const mouseWorld = camera2d.mouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            if (canvas.IsMouseInCanvas(mouseWorld[0], mouseWorld[1])) {
                const canvasPos = canvas.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
                tool.onMouseMove(canvasPos[0], canvasPos[1]);
            }
            if (panning) {
                const [x, y] = app.GetMousePos();
                camera2d.SetPan(x - panningStartPos[0], y - panningStartPos[1]);
            }
        });

        glCanvas.addEventListener('mouseup', (ev) => {
            const mousePos = app.GetMousePos();
            const mouseWorld = camera2d.mouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            if (canvas.IsMouseInCanvas(mouseWorld[0], mouseWorld[1])) {
                const canvasPos = canvas.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
                tool.onMouseUp(canvasPos[0], canvasPos[1], ev.button);
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
}
