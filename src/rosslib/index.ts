import { vec2 } from 'gl-matrix';
import App from './app';
import Camera2D from './camera2d';
import Texture from './glo/texture';
import BrushObject from './objects/brushObject';
import CanvasObject from './objects/canvasObject';
import CircleObject from './objects/circleObject';
import QuadObject from './objects/quadObject';
import RectangleObject from './objects/rectangleObject';
import Scene2D from './scene2d';
import Pen from './tools/pen';
import Tool from './tools/tool';
import { RGBA } from './util/colour';
import { ImageEffectType } from './util/imageEffect';
import ImageFormat from './util/imageFormat';
import { KernelOperation } from './util/imageKernel';
import Logger from './util/logger';

export default class PaintApp {
    private static _instance: PaintApp | null = null;
    private _app: App;

    private _mainScene: Scene2D;
    private _mainCamera2d: Camera2D;
    private _canvasObj: CanvasObject;
    private _selectedTool: Tool;

    private constructor(private readonly _htmlCanvas: HTMLCanvasElement) {
        Logger.Enable();

        this._app = new App(this._htmlCanvas);
        const gl = this._app.GetGLContext();
        const glCanvas = this._app.GetGLCanvas();

        let panning = false;
        let panningStartPos: [number, number] = [0, 0];

        glCanvas.addEventListener('mousedown', (ev) => {
            const mousePos = this._app.GetMousePos();
            const mouseWorld = this._mainCamera2d.MouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            const canvasPos = this._canvasObj.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
            this._selectedTool.OnMouseDown(canvasPos[0], canvasPos[1], ev.button);
            if (ev.button === 1) {
                panningStartPos = this._app.GetMousePos();
                panning = true;
            }
        });

        glCanvas.addEventListener('mousemove', () => {
            const mousePos = this._app.GetMousePos();
            const mouseWorld = this._mainCamera2d.MouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            const canvasPos = this._canvasObj.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
            this._selectedTool.OnMouseMove(canvasPos[0], canvasPos[1]);
            if (panning) {
                const [x, y] = this._app.GetMousePos();
                const dx = x - panningStartPos[0];
                const dy = y - panningStartPos[1];
                this._mainCamera2d.PanBy(dx, dy);
                panningStartPos = [x, y]; // after panning set new starting pos
            }
            this.GetEventManager().Notify('ChangeCanvasCoordinates', canvasPos);
        });

        glCanvas.addEventListener('mouseup', (ev) => {
            const mousePos = this._app.GetMousePos();
            const mouseWorld = this._mainCamera2d.MouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
            const canvasPos = this._canvasObj.MouseToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
            this._selectedTool.OnMouseUp(canvasPos[0], canvasPos[1], ev.button);
            if (ev.button === 1) {
                panning = false;
            }
        });

        const Zoom = (zoomAmount: number) => {
            const [x, y] = this._app.GetMousePos();
            this._mainCamera2d.ZoomBy(zoomAmount, [x, y]);
        }

        glCanvas.addEventListener('wheel', (evt) => {
            const zoomSensitivity = 0.1;
            const wheelDelta = Math.sign(-evt.deltaY);
            const zoomAmount = wheelDelta * zoomSensitivity;
            Zoom(zoomAmount);
        });

        document.addEventListener('keypress', (evt) => {
            const zoomAmount = 0.1;
            switch (evt.key) {
                case ' ':
                    this._canvasObj.MergePreviewCanvas();
                    break;
                case 'd':
                    this._canvasObj.DebugMode = !this._canvasObj.DebugMode;
                    break;
                case '+':
                    Zoom(zoomAmount);
                    break;
                case '-':
                    Zoom(-zoomAmount);
                    break;
                default:
                    Logger.Log("KeyPress", `Pressed ${evt.key}`);
            }
        });

        this._mainScene = new Scene2D();
        this._mainCamera2d = new Camera2D(gl.canvas.width, gl.canvas.height);

        const quad1 = new QuadObject(gl);
        quad1.Size = vec2.fromValues(100, 100);
        quad1.Position = vec2.fromValues(0, 0);
        Texture.LoadImage(gl, '/test.png').then(result => {
            quad1.Texture = result.Texture;
        });

        const quad2 = new QuadObject(gl);
        quad2.Size = vec2.fromValues(100, 100);
        quad2.Position = vec2.fromValues(100, 100);

        this._canvasObj = new CanvasObject(gl);
        this._canvasObj.Size = vec2.fromValues(800, 600);
        this._canvasObj.Position = vec2.fromValues(gl.canvas.width / 2 - this._canvasObj.Size[0] / 2, gl.canvas.height / 2 - this._canvasObj.Size[1] / 2);
        this._canvasObj.DebugMode = false;

        const circleElipse = new CircleObject(gl, 100);
        circleElipse.Position = vec2.fromValues(0, 0);
        circleElipse.Size = vec2.fromValues(20, 10);
        circleElipse.SetColour([255, 255, 120, 255]);

        const brushObject = new BrushObject(gl);
        brushObject.Position = vec2.fromValues(100, 0);
        brushObject.Size = vec2.fromValues(10, 10);

        const rectangleObject = new RectangleObject(gl);
        rectangleObject.Position = vec2.fromValues(150, 150);
        rectangleObject.Size = vec2.fromValues(100, 100);

        this._selectedTool = new Pen(gl, this._canvasObj);

        this._mainScene.Add([this._canvasObj, quad1, quad2, circleElipse, brushObject, rectangleObject]);

        this._app.OnResize = (width, height) => {
            this._mainCamera2d.UpdateProjectionMatrix(width, height);
        };
        this._app.OnUpdate = () => {
        };
        this._app.OnRender = () => {
            this._mainScene.Render(this._mainCamera2d);
        };
        this._app.Run();
    }

    public GetEventManager() {
        return this._app.GetEventManager();
    }

    public GetCanvasImage() {
        return ImageFormat.CreatePNG(this._canvasObj.GetCanvasImage());
    }

    public async LoadImage(url: string) {
        const gl = this._app.GetGLContext();
        const { Texture: texture, ImgSize: imgSize } = await Texture.LoadImage(gl, url);
        this._canvasObj.Size = imgSize;
        this._canvasObj.DrawFullscreenTextureOnCanvas(texture);
        this.GetEventManager().Notify('OpenImage');
    }

    public GetCanvasMousePosition(): [number, number] | [undefined, undefined] {
        const glCanvas = this._app.GetGLCanvas();
        const mousePos = this._app.GetMousePos();
        const worldMousePos = this._mainCamera2d.MouseToWorld2D(mousePos[0], mousePos[1], glCanvas.width, glCanvas.height);
        const canvasPos = this._canvasObj.MouseToCanvasCoordinates(worldMousePos[0], worldMousePos[1]);
        if (!canvasPos[0] && !canvasPos[1]) return [undefined, undefined];
        else return [Math.floor(canvasPos[0]), Math.floor(canvasPos[1])]; // remove decimals
    }

    public GetCanvasImageSize() {
        return [this._canvasObj.Size[0], this._canvasObj.Size[1]];
    }

    public GetToolColour() {
        return this._selectedTool.ColourSelection;
    }

    public SetPrimaryToolColour(colour: RGBA) {
        this._selectedTool.ColourSelection.Primary = colour;
        this.GetEventManager().Notify('ChangePrimaryColour', colour);
    }

    public SetSecondaryToolColour(colour: RGBA) {
        this._selectedTool.ColourSelection.Secondary = colour;
        this.GetEventManager().Notify('ChangeSecondaryColour', colour);
    }

    public GetTool() {
        return this._selectedTool;
    }

    public SetTool(tool: Tool) {
        this._selectedTool.OnDestroy();
        tool.ColourSelection = this._selectedTool.ColourSelection; // keep colour selection
        this._selectedTool = tool;
        this.GetEventManager().Notify('ChangeTool', tool.GetID());
    }

    public ApplyImageEffect(effect: KernelOperation | ImageEffectType) {
        switch (effect) {
            case 'Grayscale':
            case 'InvertColors':
                this._canvasObj.ApplyImageEffect(effect);
                break;
            case 'BoxBlur':
            case 'EdgeDetect':
            case 'GaussianBlur':
            case 'Sharpen':
                this._canvasObj.ApplyImageKernel(effect);
                break;
        }
    }

    public HelperCreateTool<T extends Tool>(func: (gl: WebGL2RenderingContext, canvasObject: CanvasObject) => T) {
        return func(this._app.GetGLContext(), this._canvasObj);
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
