import $ from 'jquery';
import Clock from './util/clock';

export type UpdateFunction = (elapsedTime: number, app: App) => void;
export type RenderFunction = (app: App) => void;
export type OnResizeFunction = (width: number, height: number) => void;

export default class App {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGL2RenderingContext;
    private MOUSE_POS: [number, number] = [0, 0];
    private clock: Clock = new Clock();

    constructor(canvasParent: string = '#app', private readonly updateFunc: UpdateFunction, private readonly renderFunc: RenderFunction, private readonly onResize?: OnResizeFunction) {
        $(canvasParent).append('<canvas width="640px" height="480px" id="appCanvas"></canvas>');
        $(canvasParent).css('display', 'flex');

        // Get opengl context
        const canvas = document.getElementById('appCanvas') as HTMLCanvasElement;
        const gl = canvas.getContext('webgl2');
        if (!gl) throw new Error("Error creating webgl2 context");
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip image data for opengl's bottom to top, only for dom loaded images

        this.canvas = canvas;
        this.gl = gl;
    }

    public Run() {
        this.Setup();
        requestAnimationFrame(() => this.Loop());
    }

    public GetMousePos() {
        return this.MOUSE_POS;
    }

    public GetGLContext() {
        return this.gl;
    }

    private Setup() {
        // Event for finding mouse position on click
        this.canvas.addEventListener("mousemove", (evt) => {
            const { x, y } = this.MousePos(this.canvas, evt);
            this.MOUSE_POS = [x, y];
        }, false);

        // Event for canvas resize
        window.addEventListener("resize", () => {
            this.ResizeToFit();
        });
        this.ResizeToFit();

        this.clock.Restart(); // reset jer inace cuva od stvaranja kao start time
    }

    private Loop() {
        this.Clear();

        // Update / rendering code
        const elapsedTime = this.clock.Restart();
        this.updateFunc(elapsedTime, this);
        this.renderFunc(this);

        requestAnimationFrame(() => this.Loop());
    }

    private MousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    private Clear(red = 51, green = 51, blue = 51, alpha = 255) {
        const r = red / 255;
        const g = green / 255;
        const b = blue / 255;
        const a = alpha / 255;
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    private ResizeToFit() {
        const canvas = this.gl.canvas as HTMLCanvasElement;
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        // Check if the canvas is not the same size.
        if (canvas.width != displayWidth ||
            canvas.height != displayHeight) {

            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        // Update opengl viewport size
        this.gl.viewport(0, 0, canvas.width, canvas.height);

        // Call user code on resize
        this.onResize ? this.onResize(canvas.width, canvas.height) : null;
    }
}