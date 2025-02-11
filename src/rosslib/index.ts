import { vec2 } from 'gl-matrix';
import App from './app';
import Camera2D from './camera2d';
import Texture from './glo/texture';
import CanvasObject, { CanvasAnchor } from './objects/canvasObject';
import LineObject from './objects/lineObject';
import QuadObject from './objects/quadObject';
import SelectionObject from './objects/selectionObject';
import Scene2D from './scene2d';
import EraserTool from './tools/eraser';
import FillTool from './tools/fill';
import PenTool from './tools/pen';
import PickerTool from './tools/picker';
import SelectTool from './tools/select';
import ShapeTool from './tools/shape';
import SplineTool from './tools/spline';
import ToolManager from './tools/toolManager';
import BrushCursor from './util/brushCursor';
import CanvasClipboard from './util/canvasClipboard';
import { ColourSelection, RGBA } from './util/colour';
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
    private _selectionObj: SelectionObject;
    private _toolManager: ToolManager;
    private _colourSelection: ColourSelection;
    private _canvasClipboard: CanvasClipboard;

    private constructor(private readonly _htmlCanvas: HTMLCanvasElement) {
        Logger.Enable();

        this._app = new App(this._htmlCanvas);
        const gl = this._app.GetGLContext();
        const glCanvas = this._app.GetGLCanvas();

        this._toolManager = new ToolManager();
        this._colourSelection = new ColourSelection();

        BrushCursor.Init(gl);

        let panning = false;
        let panningStartPos: [number, number] = [0, 0];

        glCanvas.addEventListener('mousedown', (ev) => {
            const mousePos = this._app.GetMousePos();
            const mouseWorld = this._mainCamera2d.MouseToWorld2D(
                mousePos[0],
                mousePos[1],
                glCanvas.width,
                glCanvas.height
            );
            const canvasPos = this._canvasObj.WorldToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
            this._toolManager.GetSelectedTool()?.OnMouseDown(canvasPos[0], canvasPos[1], ev.button);
            if (ev.button === 1) {
                panningStartPos = this._app.GetMousePos();
                panning = true;
            }
        });

        glCanvas.addEventListener('mousemove', () => {
            const mousePos = this._app.GetMousePos();
            const mouseWorld = this._mainCamera2d.MouseToWorld2D(
                mousePos[0],
                mousePos[1],
                glCanvas.width,
                glCanvas.height
            );
            const canvasPos = this._canvasObj.WorldToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
            this._toolManager.GetSelectedTool()?.OnMouseMove(canvasPos[0], canvasPos[1]);
            if (canvasPos[0] && canvasPos[1]) BrushCursor.Get().SetBrushCursorPosition(mouseWorld[0], mouseWorld[1]);
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
            const mouseWorld = this._mainCamera2d.MouseToWorld2D(
                mousePos[0],
                mousePos[1],
                glCanvas.width,
                glCanvas.height
            );
            const canvasPos = this._canvasObj.WorldToCanvasCoordinates(mouseWorld[0], mouseWorld[1]);
            this._toolManager.GetSelectedTool()?.OnMouseUp(canvasPos[0], canvasPos[1], ev.button);
            if (ev.button === 1) {
                panning = false;
            }
        });

        const ZoomBy = (zoomAmount: number) => {
            const [x, y] = this._app.GetMousePos();
            this._mainCamera2d.ZoomBy(zoomAmount, [x, y]);
        };

        glCanvas.addEventListener('wheel', (evt) => {
            const zoomSensitivity = 0.1;
            const wheelDelta = Math.sign(-evt.deltaY);
            const zoomAmount = wheelDelta * zoomSensitivity;
            ZoomBy(zoomAmount);
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
                    ZoomBy(zoomAmount);
                    break;
                case '-':
                    ZoomBy(-zoomAmount);
                    break;
                case '.':
                    this._mainCamera2d.ResetZoom();
                    break;
                default:
                    Logger.Log('KeyPress', `Pressed ${evt.key}`);
            }
        });

        this._mainScene = new Scene2D();
        this._mainCamera2d = new Camera2D(gl.canvas.width, gl.canvas.height);
        this._mainCamera2d.SetZoom(1.0001); // fix for linear filtering on base non zoomed in image

        const quad1 = new QuadObject(gl);
        quad1.Size = vec2.fromValues(100, 100);
        quad1.Position = vec2.fromValues(0, 0);
        Texture.LoadImage(gl, '/test.png').then((texture) => {
            quad1.Texture = texture;
        });

        const quad2 = new QuadObject(gl);
        quad2.Size = vec2.fromValues(100, 100);
        quad2.Position = vec2.fromValues(100, 100);
        quad2.Colour = [0, 255, 0, 0];

        this._canvasObj = new CanvasObject(gl);
        this._canvasObj.Size = vec2.fromValues(800, 600);
        this._canvasObj.Position = vec2.fromValues(
            // Floor to whole values so that each pixel location is a whole number
            Math.floor(gl.canvas.width / 2 - this._canvasObj.Size[0] / 2),
            Math.floor(gl.canvas.height / 2 - this._canvasObj.Size[1] / 2)
        );
        this._canvasObj.DebugMode = false;

        this._canvasClipboard = new CanvasClipboard();

        this._selectionObj = new SelectionObject(gl);
        this._selectionObj.Size = [200, 200];
        this._selectionObj.Visible = false;

        this._toolManager.RegisterTools([
            new PenTool(gl, this._canvasObj, this._colourSelection),
            new SplineTool(gl, this._canvasObj, this._colourSelection),
            new FillTool(gl, this._canvasObj, this._colourSelection),
            new ShapeTool(gl, this._canvasObj, this._colourSelection),
            new PickerTool(gl, this._canvasObj, this._colourSelection),
            new EraserTool(gl, this._canvasObj, this._colourSelection),
            new SelectTool(gl, this._canvasObj, this._colourSelection, this._selectionObj),
        ]);

        const lineObject = new LineObject(gl);
        lineObject.SetPoints([
            [0, 0],
            [200, 600],
            [400, 200],
            [600, 400],
            [700, 300],
            [800, 0],
        ]);
        lineObject.Colour = [255, 0, 0, 255];
        lineObject.Thickness = 10;
        this._canvasObj.DrawOnCanvas(lineObject);

        this._toolManager.SetSelectedTool('Pen');

        this._mainScene.Add([this._canvasObj, quad1, quad2, BrushCursor.Get().GetObject2D(), this._selectionObj]);

        this._canvasObj.Subscribe('SizeChanged', () => {
            this._app.GetEventManager().Notify('CanvasObjResize', [this._canvasObj.Size[0], this._canvasObj.Size[1]]);
        });

        this._app.OnResize = (width, height) => {
            this._mainCamera2d.UpdateProjectionMatrix(width, height);
        };
        this._app.OnUpdate = (_, timeSinceRun, __) => {
            this._selectionObj.SetUniformTime(timeSinceRun);
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
        this._selectionObj.Visible = false;
        const gl = this._app.GetGLContext();
        const imageTexture = await Texture.LoadImage(gl, url);
        this._canvasObj.Size = imageTexture.Size;
        this._canvasObj.DrawFullscreenTextureOnCanvas(imageTexture);
        this._canvasObj.MergePreviewCanvas();
        this.GetEventManager().Notify('OpenImage');
    }

    public GetCanvasMousePosition(): [number, number] | [undefined, undefined] {
        const glCanvas = this._app.GetGLCanvas();
        const mousePos = this._app.GetMousePos();
        const worldMousePos = this._mainCamera2d.MouseToWorld2D(
            mousePos[0],
            mousePos[1],
            glCanvas.width,
            glCanvas.height
        );
        const canvasPos = this._canvasObj.WorldToCanvasCoordinates(worldMousePos[0], worldMousePos[1]);
        if (!canvasPos[0] && !canvasPos[1]) return [undefined, undefined];
        else return [Math.floor(canvasPos[0]), Math.floor(canvasPos[1])]; // remove decimals
    }

    public GetCanvasImageSize(): [number, number] {
        return [this._canvasObj.Size[0], this._canvasObj.Size[1]];
    }

    public GetToolColour() {
        return this._colourSelection;
    }

    public SetPrimaryToolColour(colour: RGBA) {
        this._colourSelection.Primary = colour;
        this.GetEventManager().Notify('ChangePrimaryColour', colour);
    }

    public SetSecondaryToolColour(colour: RGBA) {
        this._colourSelection.Secondary = colour;
        this.GetEventManager().Notify('ChangeSecondaryColour', colour);
    }

    public GetTool() {
        return this._toolManager.GetSelectedTool();
    }

    public SetTool(toolId: string) {
        this._toolManager.SetSelectedTool(toolId);
        this.GetEventManager().Notify('ChangeTool', toolId);
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

    public ResizeCanvasImage(newSizeX: number, newSizeY: number) {
        this._canvasObj.ResizeCanvasImage(newSizeX, newSizeY);
        this._selectionObj.Visible = false;
    }

    public ResizeCanvasWithAnchor(anchor: CanvasAnchor, newSizeX: number, newSizeY: number) {
        this._canvasObj.ResizeCanvasOnAnchor(anchor, newSizeX, newSizeY);
        this._selectionObj.Visible = false;
    }

    public CropCanvasImage() {
        if (!this._selectionObj.Visible) return;
        this.FinishCanvasImage();
        this._canvasObj.CropCanvasImage(this._selectionObj.GetCanvasSelectionRect(this._canvasObj));
        this._selectionObj.Visible = false;
    }

    public CopyFromCanvasImage() {
        if (!this._selectionObj.Visible) return;
        this.FinishCanvasImage();
        this._canvasClipboard.SaveTexture(
            this._canvasObj.CopyFromCanvasImage(this._selectionObj.GetCanvasSelectionRect(this._canvasObj))
        );
        this._selectionObj.Visible = false;
    }

    public CutFromCanvasImage() {
        if (!this._selectionObj.Visible) return;
        this.FinishCanvasImage();
        this._canvasClipboard.SaveTexture(
            this._canvasObj.CutFromCanvasImage(this._selectionObj.GetCanvasSelectionRect(this._canvasObj))
        );
        this._selectionObj.Visible = false;
    }

    public PasteOntoCanvasImage(canvasPositionX: number, canvasPositionY: number) {
        const clipboardTexture = this._canvasClipboard.GetTexture();
        if (!clipboardTexture) return;

        this._selectionObj.Visible = false;
        this.FinishCanvasImage();
        this._canvasObj.PasteOntoCanvasImage(canvasPositionX, canvasPositionY, clipboardTexture);
    }

    public FinishCanvasImage() {
        this._toolManager.GetSelectedTool()?.OnExit();
        this._canvasObj.MergePreviewCanvas();
    }

    public GetToolManager() {
        return this._toolManager;
    }

    public GetApp() {
        return this._app;
    }

    public static Init(canvas: HTMLCanvasElement) {
        if (!this._instance) {
            this._instance = new PaintApp(canvas);
        } else {
            throw new Error('PaintApp already initialized');
        }
    }

    public static Get() {
        if (!this._instance) throw new Error('Trying to get PaintApp before initialization');
        return this._instance;
    }
}
