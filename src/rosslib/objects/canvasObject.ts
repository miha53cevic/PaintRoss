import { vec2 } from "gl-matrix";
import Camera2D from "../camera2d";
import FrameBuffer from "../glo/framebuffer";
import Texture from "../glo/texture";
import ImageEffect, { ImageEffectType } from "../util/imageEffect";
import ImageKernel, { KernelOperation } from "../util/imageKernel";
import ImageOperation from "../util/imageOperation";
import Logger from "../util/logger";
import Object2D from "./object2d";
import QuadObject from "./quadObject";

export interface CanvasImage {
    Width: number,
    Height: number,
    Pixels: Uint8Array,
}

export default class CanvasObject extends Object2D {
    private _quadCanvas: QuadObject;
    private _frameBuffer: FrameBuffer;
    private _previewFrameBuffer: FrameBuffer;
    private _texture: Texture;
    private _previewTexture: Texture;

    public DebugMode = false;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this._frameBuffer = new FrameBuffer(gl);
        this._previewFrameBuffer = new FrameBuffer(gl);
        this._texture = Texture.CreateTexture(gl, super.Size[0], super.Size[1], null);
        this._previewTexture = Texture.CreateTexture(gl, super.Size[0], super.Size[1], null);
        this.BindAttachemntsToFrameBuffers(this._texture, this._previewTexture);


        // Setup quad to render the framebuffer textures into
        this._quadCanvas = new QuadObject(gl); // canvasQuad u global space
        this._quadCanvas.Texture = this._previewTexture; // postavi framebuffer texture za kasnije renderiranje
    }

    private BindAttachemntsToFrameBuffers(texture: Texture, previewTexture: Texture) {
        // textures to write into will be the size of the canvas so use glViewport of 0,0,size,size before rendering to framebuffer!
        // all attachment in FBO MUST be the same size!!!
        this._frameBuffer.Bind();
        this._frameBuffer.AddTextureAttachment(texture);
        this._frameBuffer.Unbind();

        this._previewFrameBuffer.Bind();
        this._previewFrameBuffer.AddTextureAttachment(previewTexture);
        this._previewFrameBuffer.Unbind();
    }

    protected CheckFrameBufferCompletness() {
        const status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
        if (status !== this._gl.FRAMEBUFFER_COMPLETE) {
            console.error('ERROR: Framebuffer is not complete:', status);
        }
    }

    public ApplyImageKernel(kernel: KernelOperation) {
        this.MergePreviewCanvas(); // spremi trenutno stanje iz preview u texture
        const quad = new QuadObject(this._gl);
        quad.Texture = this._texture;
        quad.Size = this.Size;
        quad.Kernel = ImageKernel.GetKernel(kernel);
        this.DrawOnCanvas(quad); // nacrtaj texture nadodan kernel na preview
        this.MergePreviewCanvas(); // spremi texture s nadodanim kernelom koji je sad na preview nacrtan opet na texture tako da texture ima istu
    }
    public ApplyImageEffect(effect: ImageEffectType) {
        this.MergePreviewCanvas();
        const quad = new QuadObject(this._gl);
        quad.Texture = this._texture;
        quad.Size = this.Size;
        quad.Effect = ImageEffect.GetImageEffect(effect);
        this.DrawOnCanvas(quad);
        this.MergePreviewCanvas();
    }

    public MouseToCanvasCoordinates(x: number, y: number): [number, number] | [undefined, undefined] {
        if (!this.IsMouseInCanvas(x, y)) return [undefined, undefined];
        // If the mouse is in the canvas
        const normalizedX = x - this.Position[0];
        const normalizedY = y - this.Position[1];
        return [
            normalizedX,
            normalizedY,
        ];
    }

    public IsMouseInCanvas(x: number, y: number) {
        const dx = x - this.Position[0];
        const dy = y - this.Position[1];

        // If dx or dy are negative the mouse in on the left or above the canvas
        if (dx < 0 || dy < 0) return false;
        // If dx or dy are greater then canvasPos+canvasSize then mouse is right or bottom of canvas
        if (dx > this.Size[0] || dy > this.Size[1]) return false;
        // Otherwise mouse is in canvas
        return true;
    }

    public GetCanvasImage(): CanvasImage {
        this.MergePreviewCanvas(); // get final canvas image
        const imgWidth = this.Size[0];
        const imgHeight = this.Size[1];
        const pixels = new Uint8Array(imgWidth * imgHeight * 4); // width * height * pixel_components (rgba is 4)
        this._frameBuffer.Bind();
        this._gl.readBuffer(this._gl.COLOR_ATTACHMENT0); // read from texture in COLOR_ATTACHMENT0
        this._gl.readPixels(0, 0, imgWidth, imgHeight, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
        this._frameBuffer.Unbind();
        const flipped_pixels = ImageOperation.FlipImage(imgWidth, imgHeight, pixels);
        return {
            Width: imgWidth,
            Height: imgHeight,
            Pixels: flipped_pixels,
        };
    }

    public GetCanvasCamera() {
        // divide left,right,bottom,top with zoom (since top and left are 0, 0/zoom is always zero)
        return new Camera2D(this.Size[0], this.Size[1]);
    }

    public ClearCanvas() {
        // Clear framebuffer which clears the texture then
        this._previewFrameBuffer.Bind();
        this._gl.clearColor(1, 1, 1, 1);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
        this._previewFrameBuffer.Unbind();
    }

    private BlitFrameBuffers(srcFrameBuffer: FrameBuffer, destFrameBuffer: FrameBuffer) {
        this._gl.bindFramebuffer(this._gl.READ_FRAMEBUFFER, srcFrameBuffer.GetFrameBuffer());
        this._gl.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, destFrameBuffer.GetFrameBuffer());

        this._gl.readBuffer(this._gl.COLOR_ATTACHMENT0); // source color attachment to copy
        this._gl.drawBuffers([this._gl.COLOR_ATTACHMENT0]); // destination to copy into

        this._gl.blitFramebuffer(0, 0, this.Size[0], this.Size[1], 0, 0, this.Size[0], this.Size[1], this._gl.COLOR_BUFFER_BIT, this._gl.NEAREST);

        this._gl.bindFramebuffer(this._gl.READ_FRAMEBUFFER, null);
        this._gl.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, null);
    }

    public MergePreviewCanvas() {
        this.BlitFrameBuffers(this._previewFrameBuffer, this._frameBuffer);
    }

    public CancelPreviewCanvas() {
        this.BlitFrameBuffers(this._frameBuffer, this._previewFrameBuffer);
    }

    public DrawFullscreenTextureOnCanvas(texture: Texture) {
        const fullscreenQuad = new QuadObject(this._gl);
        fullscreenQuad.Texture = texture;
        fullscreenQuad.Size = this.Size;
        this.DrawOnCanvas(fullscreenQuad);
    }

    public DrawOnCanvas(object: Object2D | { Render: (camera: Camera2D) => void }) {
        const canvasCamera = this.GetCanvasCamera();
        // Bind framebuffer to render into it
        this._previewFrameBuffer.Bind();
        // Clear framebuffer (no need since the canvas should keep everything drawn to it)
        // Set viewport to canvas size because we're rendering to texture of canvas size
        this._gl.viewport(0, 0, this.Size[0], this.Size[1]);
        // Draw on canvas
        object.Render(canvasCamera);
        // Switch back to normal framebuffer
        this._previewFrameBuffer.Unbind();
    }

    private RenderActualCanvasTexture(camera: Camera2D) {
        const quad = new QuadObject(this._gl);
        quad.Size = vec2.fromValues(this.Size[0], this.Size[1]);
        quad.Position = vec2.fromValues(this.Position[0] + this.Size[0] + 32, this.Position[1]);
        quad.Texture = this._texture;
        quad.Render(camera);
    }

    public Render(camera: Camera2D): void {
        // Render to normal viewport (global space)
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._quadCanvas.Render(camera);

        // Draw actual canvas texture side by side if in debug
        if (this.DebugMode) {
            this.RenderActualCanvasTexture(camera);
        }
    }

    get Position() {
        return this._quadCanvas.Position;
    }

    set Position(value) {
        this._quadCanvas.Position = value;
        Logger.Log("Event", "Updating canvas position");
    }

    get Rotation(): number {
        return this._quadCanvas.Rotation;
    }

    set Rotation(value: number) {
        this._quadCanvas.Rotation = value;
        Logger.Log("Event", "Updating canvas rotation");
    }

    get Size() {
        return this._quadCanvas.Size;
    }

    set Size(value) {
        this._quadCanvas.Size = value;
        Logger.Log("Event", "Updating canvas size");
        // Resize textures to new canvas size
        // TODO kaj kad je slika stara nutri, moram kopirat staru i napraviti veci canvas nekak
        this._gl.deleteTexture(this._texture.Handle);
        this._gl.deleteTexture(this._previewTexture.Handle);
        this._texture = Texture.CreateTexture(this._gl, this.Size[0], this.Size[1], null);
        this._previewTexture = Texture.CreateTexture(this._gl, this.Size[0], this.Size[1], null);
        this.BindAttachemntsToFrameBuffers(this._texture, this._previewTexture);

        this._quadCanvas.Texture = this._previewTexture;
        this.ClearCanvas();
        this.MergePreviewCanvas();
    }
}