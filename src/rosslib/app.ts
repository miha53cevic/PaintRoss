import Texture from './glo/texture';
import Clock from './util/clock';
import EventManager from './util/eventManager';

export type SetupFunction = (glCanvas: HTMLCanvasElement, gl: WebGL2RenderingContext) => void;
export type UpdateFunction = (elapsedTime: number, timeSinceRun: number, app: App) => void;
export type RenderFunction = (app: App) => void;
export type ResizeFunction = (width: number, height: number) => void;

export default class App {
    private readonly _glCanvas: HTMLCanvasElement;
    private readonly _gl: WebGL2RenderingContext;
    private _mousePos: [number, number] = [0, 0];
    private _clock: Clock = new Clock();
    private _eventManager: EventManager = new EventManager();
    private _appStartTime: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        // Get opengl context
        const gl = canvas.getContext('webgl2');
        if (!gl) throw new Error('Error creating webgl2 context');
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip image data for opengl's bottom to top, only for dom loaded images

        // enable blending for transparency
        // https://learnopengl.com/Advanced-OpenGL/Blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this._glCanvas = canvas;
        this._gl = gl;

        this.Setup(); // resize canvas to fullscreen & setup events
    }

    public OnSetup: SetupFunction = () => {};
    public OnUpdate: UpdateFunction = () => {};
    public OnRender: RenderFunction = () => {};
    public OnResize: ResizeFunction = () => {};

    public AppbarHeight = 48 + 24;

    public Run() {
        this.OnSetup(this._glCanvas, this._gl); // user extra setup
        this._appStartTime = Date.now();
        requestAnimationFrame(() => this.Loop());
    }

    public GetMousePos() {
        return this._mousePos;
    }

    public GetGLContext() {
        return this._gl;
    }

    public GetGLCanvas() {
        return this._glCanvas;
    }

    public GetEventManager() {
        return this._eventManager;
    }

    public Clear(red = 30, green = 41, blue = 59, alpha = 255) {
        const r = red / 255;
        const g = green / 255;
        const b = blue / 255;
        const a = alpha / 255;
        this._gl.clearColor(r, g, b, a);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    }

    public GetTimeSinceRun() {
        return Date.now() - this._appStartTime;
    }

    public GetElapsedTime() {
        return this._clock.Restart();
    }

    private Setup() {
        // Event for finding mouse position on click
        this._glCanvas.addEventListener(
            'mousemove',
            (evt) => {
                const { X, Y } = this.CalculateMousePos(this._glCanvas, evt);
                this._mousePos = [X, Y];
            },
            false
        );

        // Disable right click context menu
        this._glCanvas.addEventListener('contextmenu', (ev) => {
            ev.preventDefault();
        });

        // Event for canvas resize
        window.addEventListener('resize', () => {
            this.ResizeToFit();
            // Call user code on resize
            this.OnResize(this._glCanvas.width, this._glCanvas.height);
        });
        this.ResizeToFit();

        this._clock.Restart(); // reset jer inace cuva od stvaranja kao start time

        // Stvori placeholder teksturu na TEXTURE0
        const placeholderTexture = Texture.CreateTexture(this._gl, 1, 1, new Uint8Array([255, 192, 203, 255]));
        placeholderTexture.Use(this._gl.TEXTURE0, false); // nema warnninga jer se treba koristit prvi put
    }

    private Loop() {
        this.Clear();

        // Update / rendering code
        const elapsedTime = this.GetElapsedTime();
        const timeSinceRun = this.GetTimeSinceRun();
        this.OnUpdate(elapsedTime, timeSinceRun, this);
        this.OnRender(this);

        requestAnimationFrame(() => this.Loop());
    }

    private CalculateMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        return {
            X: evt.clientX - rect.left,
            Y: evt.clientY - rect.top,
        };
    }

    private ResizeToFit() {
        const canvas = this._glCanvas;
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight - this.AppbarHeight; // appbar

        // Check if the canvas is not the same size.
        if (canvas.width != displayWidth || canvas.height != displayHeight) {
            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        // Update opengl viewport size
        this._gl.viewport(0, 0, canvas.width, canvas.height);
    }
}
