import { vec2 } from "gl-matrix";
import Camera2D from "../camera2d";
import FrameBuffer from "../glo/framebuffer";
import Texture from "../glo/texture";
import ImageEffect, { ImageEffectType } from "../util/ImageEffect";
import ImageKernel, { KernelOperation } from "../util/imageKernel";
import ImageOperation from "../util/imageOperation";
import Logger from "../util/logger";
import Object2D from "./object2d";
import QuadObject from "./quadObject";

export interface CanvasImage {
    width: number,
    height: number,
    pixels: Uint8Array,
}

export default class CanvasObject extends Object2D {
    private quadCanvas: QuadObject;
    private frameBuffer: FrameBuffer;
    private preview_frameBuffer: FrameBuffer;
    private texture: Texture;
    private preview_texture: Texture;

    public DEBUG_MODE = false;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this.frameBuffer = new FrameBuffer(gl);
        this.preview_frameBuffer = new FrameBuffer(gl);
        this.texture = Texture.createTexture(gl, super.Size[0], super.Size[1], null);
        this.preview_texture = Texture.createTexture(gl, super.Size[0], super.Size[1], null);
        this.BindAttachemntsToFrameBuffers(this.texture, this.preview_texture);


        // Setup quad to render the framebuffer textures into
        this.quadCanvas = new QuadObject(gl); // canvasQuad u global space
        this.quadCanvas.Texture = this.preview_texture; // postavi framebuffer texture za kasnije renderiranje
    }

    private BindAttachemntsToFrameBuffers(texture: Texture, previewTexture: Texture) {
        // textures to write into will be the size of the canvas so use glViewport of 0,0,size,size before rendering to framebuffer!
        // all attachment in FBO MUST be the same size!!!
        this.frameBuffer.Bind();
        this.frameBuffer.AddTextureAttachment(texture);
        this.frameBuffer.Unbind();

        this.preview_frameBuffer.Bind();
        this.preview_frameBuffer.AddTextureAttachment(previewTexture);
        this.preview_frameBuffer.Unbind();
    }

    protected CheckFrameBufferCompletness() {
        const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
            console.error('ERROR: Framebuffer is not complete:', status);
        }
    }

    public ApplyImageKernel(kernel: KernelOperation) {
        this.MergePreviewCanvas(); // spremi trenutno stanje iz preview u texture
        const quad = new QuadObject(this.gl);
        quad.Texture = this.texture;
        quad.Size = this.Size;
        quad.Kernel = ImageKernel.GetKernel(kernel);
        this.DrawOnCanvas(quad); // nacrtaj texture nadodan kernel na preview
        this.MergePreviewCanvas(); // spremi texture s nadodanim kernelom koji je sad na preview nacrtan opet na texture tako da texture ima istu
    }
    public ApplyImageEffect(effect: ImageEffectType) {
        this.MergePreviewCanvas();
        const quad = new QuadObject(this.gl);
        quad.Texture = this.texture;
        quad.Size = this.Size;
        quad.Effect = ImageEffect.GetImageEffect(effect);
        this.DrawOnCanvas(quad);
        this.MergePreviewCanvas();
    }

    public MouseToCanvasCoordinates(x: number, y: number): [number, number] {
        if (!this.IsMouseInCanvas(x, y)) return [NaN, NaN];
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
        this.frameBuffer.Bind();
        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0); // read from texture in COLOR_ATTACHMENT0
        this.gl.readPixels(0, 0, imgWidth, imgHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        this.frameBuffer.Unbind();
        const flipped_pixels = ImageOperation.FlipImage(imgWidth, imgHeight, pixels);
        return {
            width: imgWidth,
            height: imgHeight,
            pixels: flipped_pixels,
        };
    }

    public GetCanvasCamera() {
        // divide left,right,bottom,top with zoom (since top and left are 0, 0/zoom is always zero)
        return new Camera2D(this.Size[0], this.Size[1]);
    }

    public ClearCanvas() {
        // Clear framebuffer which clears the texture then
        this.preview_frameBuffer.Bind();
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.preview_frameBuffer.Unbind();
    }

    private BlitFrameBuffers(srcFrameBuffer: FrameBuffer, destFrameBuffer: FrameBuffer) {
        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, srcFrameBuffer.GetFrameBuffer());
        this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, destFrameBuffer.GetFrameBuffer());

        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0); // source color attachment to copy
        this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0]); // destination to copy into

        this.gl.blitFramebuffer(0, 0, this.Size[0], this.Size[1], 0, 0, this.Size[0], this.Size[1], this.gl.COLOR_BUFFER_BIT, this.gl.NEAREST);

        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);
        this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);
    }

    public MergePreviewCanvas() {
        this.BlitFrameBuffers(this.preview_frameBuffer, this.frameBuffer);
    }

    public CancelPreviewCanvas() {
        this.BlitFrameBuffers(this.frameBuffer, this.preview_frameBuffer);
    }

    public DrawFullscreenTextureOnCanvas(texture: Texture) {
        const fullscreenQuad = new QuadObject(this.gl);
        fullscreenQuad.Texture = texture;
        fullscreenQuad.Size = this.Size;
        this.DrawOnCanvas(fullscreenQuad);
    }

    public DrawOnCanvas(object: Object2D | { Render: (camera: Camera2D) => void }) {
        const canvasCamera = this.GetCanvasCamera();
        // Bind framebuffer to render into it
        this.preview_frameBuffer.Bind();
        // Clear framebuffer (no need since the canvas should keep everything drawn to it)
        // Set viewport to canvas size because we're rendering to texture of canvas size
        this.gl.viewport(0, 0, this.Size[0], this.Size[1]);
        // Draw on canvas
        object.Render(canvasCamera);
        // Switch back to normal framebuffer
        this.preview_frameBuffer.Unbind();
    }

    private RenderActualCanvasTexture(camera: Camera2D) {
        const quad = new QuadObject(this.gl);
        quad.Size = vec2.fromValues(this.Size[0], this.Size[1]);
        quad.Position = vec2.fromValues(this.Position[0] + this.Size[0] + 32, this.Position[1]);
        quad.Texture = this.texture;
        quad.Render(camera);
    }

    public Render(camera: Camera2D): void {
        // Render to normal viewport (global space)
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.quadCanvas.Render(camera);

        // Draw actual canvas texture side by side if in debug
        if (this.DEBUG_MODE) {
            this.RenderActualCanvasTexture(camera);
        }
    }

    get Position() {
        return this.quadCanvas.Position;
    }

    set Position(value) {
        this.quadCanvas.Position = value;
        Logger.log("Event", "Updating canvas position");
    }

    get Rotation(): number {
        return this.quadCanvas.Rotation;
    }

    set Rotation(value: number) {
        this.quadCanvas.Rotation = value;
        Logger.log("Event", "Updating canvas rotation");
    }

    get Size() {
        return this.quadCanvas.Size;
    }

    set Size(value) {
        this.quadCanvas.Size = value;
        Logger.log("Event", "Updating canvas size");
        // Resize textures to new canvas size
        // TODO kaj kad je slika stara nutri, moram kopirat staru i napraviti veci canvas nekak
        this.gl.deleteTexture(this.texture.handle);
        this.gl.deleteTexture(this.preview_texture.handle);
        this.texture = Texture.createTexture(this.gl, this.Size[0], this.Size[1], null);
        this.preview_texture = Texture.createTexture(this.gl, this.Size[0], this.Size[1], null);
        this.BindAttachemntsToFrameBuffers(this.texture, this.preview_texture);

        this.quadCanvas.Texture = this.preview_texture;
        this.ClearCanvas();
        this.MergePreviewCanvas();
    }
}