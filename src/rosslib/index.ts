import { vec2 } from 'gl-matrix';
import App from './app';
import QuadObject from './objects/quadObject';
import Scene2d from './scene2d';
import Camera2D from './camera2d';
import Texture from './glo/texture';
import CanvasObject from './objects/canvasObject';
import Tool from './tools/tool';
import Pen from './tools/pen';
import create_png from './util/create_png';
import { RGB } from './util/colour';

export default class PaintApp {
    private static _instance: PaintApp | null = null;
    private app: App;

    private scene: Scene2d;
    private camera2d: Camera2D;
    private canvasObj: CanvasObject;
    private tool: Tool;

    private constructor(private readonly canvas: HTMLCanvasElement) {
        this.app = new App(this.canvas);
        const gl = this.app.GetGLContext();
        const glCanvas = this.app.GetGLCanvas();

        let panning = false;
        let panningStartPos: [number, number] = [0, 0];

        glCanvas.addEventListener('mousedown', (ev) => {
            const mousePos = this.app.GetMousePos();
            const mouseWorld = this.camera2d.mouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            if (this.canvasObj.IsMouseInCanvas(mouseWorld[0], mouseWorld[1])) {
                const canvasPos = this.canvasObj.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
                this.tool.onMouseDown(canvasPos[0], canvasPos[1], ev.button);
            }
            if (ev.button === 1) {
                panningStartPos = this.app.GetMousePos();
                panning = true;
            }
        });

        glCanvas.addEventListener('mousemove', () => {
            const mousePos = this.app.GetMousePos();
            const mouseWorld = this.camera2d.mouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            if (this.canvasObj.IsMouseInCanvas(mouseWorld[0], mouseWorld[1])) {
                const canvasPos = this.canvasObj.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
                this.tool.onMouseMove(canvasPos[0], canvasPos[1]);
            }
            if (panning) {
                const [x, y] = this.app.GetMousePos();
                const dx = x - panningStartPos[0];
                const dy = y - panningStartPos[1];
                this.camera2d.PanBy(dx, dy);
                panningStartPos = [x, y]; // after panning set new starting pos
            }
        });

        glCanvas.addEventListener('mouseup', (ev) => {
            const mousePos = this.app.GetMousePos();
            const mouseWorld = this.camera2d.mouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            if (this.canvasObj.IsMouseInCanvas(mouseWorld[0], mouseWorld[1])) {
                const canvasPos = this.canvasObj.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
                this.tool.onMouseUp(canvasPos[0], canvasPos[1], ev.button);
            }
            if (ev.button === 1) {
                panning = false;
            }
        });

        glCanvas.addEventListener('wheel', (evt) => {
            const sensetivity = 0.1;
            const wheelDelta = Math.sign(-evt.deltaY);
            const zoomAmount = wheelDelta * sensetivity;

            const [x, y] = this.app.GetMousePos();
            this.camera2d.ZoomBy(zoomAmount, [x, y]);
        });

        document.addEventListener('keypress', (evt) => {
            switch (evt.key) {
                case ' ':
                    this.canvasObj.MergePreviewCanvas();
                    break;
                default:
                    console.log(`Pressed ${evt.key}`);
            }
        });

        this.scene = new Scene2d();
        this.camera2d = new Camera2D(gl.canvas.width, gl.canvas.height);

        const quad1 = new QuadObject(gl);
        quad1.Size = vec2.fromValues(100, 100);
        quad1.Position = vec2.fromValues(0, 0);
        Texture.loadImage(gl, '/test.png').then(result => {
            quad1.Texture = result.texture;
        });

        const quad2 = new QuadObject(gl);
        quad2.Size = vec2.fromValues(100, 100);
        quad2.Position = vec2.fromValues(100, 100);

        this.canvasObj = new CanvasObject(gl);
        this.canvasObj.Size = vec2.fromValues(800, 600);
        this.canvasObj.Position = vec2.fromValues(gl.canvas.width / 2 - this.canvasObj.Size[0] / 2, gl.canvas.height / 2 - this.canvasObj.Size[1] / 2);
        this.canvasObj.SetDebug(true);

        this.tool = new Pen(gl, this.canvasObj);

        this.scene.Add([this.canvasObj, quad1, quad2]);

        this.app.onResize = (width, height) => {
            this.camera2d.updateProjectionMatrix(width, height);
        };
        this.app.onUpdate = () => {
        };
        this.app.onRender = () => {
            this.scene.Render(this.camera2d);
        };
        this.app.Run();
    }

    public GetCanvasImage() {
        return create_png(this.canvasObj.GetCanvasImage());
    }

    public async LoadImage(url: string) {
        const gl = this.app.GetGLContext();
        const { texture, imgSize } = await Texture.loadImage(gl, url);
        this.canvasObj.Size = imgSize;
        this.canvasObj.DrawFullscreenTextureOnCanvas(texture);
    }

    public GetCanvasMousePosition(): [number, number] {
        const glCanvas = this.app.GetGLCanvas();
        const mousePos = this.app.GetMousePos();
        const worldMousePos = this.camera2d.mouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
        const canvasPos = this.canvasObj.MouseToCanvasCoordinates(worldMousePos[0], worldMousePos[1]);
        return [Math.floor(canvasPos[0]), Math.floor(canvasPos[1])]; // remove decimals
    }

    public GetCanvasImageSize() {
        return [this.canvasObj.Size[0], this.canvasObj.Size[1]];
    }

    public GetToolColour() {
        return this.tool.Colour;
    }

    public SetPrimaryToolColour(colour: RGB) {
        this.tool.Colour.Primary = colour;
    }

    public SetSecondaryToolColour(colour: RGB) {
        this.tool.Colour.Secondary = colour;
    }

    public GetTool() {
        return this.tool;
    }

    public SetTool(tool: Tool) {
        tool.Colour = this.tool.Colour; // keep colour selection
        this.tool = tool;
        console.log("Now using tool: ", tool.constructor.name);
    }

    public HelperCreateTool<T extends Tool>(func: (gl: WebGL2RenderingContext, canvasObject: CanvasObject) => T) {
        return func(this.app.GetGLContext(), this.canvasObj);
    }

    public static Init(canvas: HTMLCanvasElement) {
        if (!this._instance) {
            this._instance = new PaintApp(canvas);
        } else {
            throw new Error("PaintApp already initialized");
        }
    }

    public static Get() {
        if (!this._instance) throw new Error("Trying to get PaintApp before initialization");
        return this._instance;
    }
}
