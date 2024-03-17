import { vec2, vec4 } from "gl-matrix";
import Camera2D from "../camera2d";
import Object2D from "./object2d";
import QuadObject from "./quadObject";
import Texture from "../glo/texture";

export default class CanvasObject extends Object2D {
    private quadCanvas: QuadObject;
    private frameBuffer: WebGLFramebuffer;
    private texture: Texture;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        const frameBuffer = gl.createFramebuffer();
        if (!frameBuffer) throw new Error("Error creating framebuffer in canvas");
        this.frameBuffer = frameBuffer;

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        this.texture = Texture.createTexture(gl, this.Size[0], this.Size[1], null); // create texture to write into, will be the size of the canvas so use glViewport of 0,0,size,size before rendering to framebuffer!
        gl.bindTexture(gl.TEXTURE_2D, this.texture.handle); // bind texture so we can set properties for it
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.handle, 0); // add the texture as an attachment to framebuffer
        gl.bindTexture(gl.TEXTURE_2D, null); // bitno jer inace ostaje bound
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // vrati na default framebuffer

        this.quadCanvas = new QuadObject(gl); // canvasQuad u global space
        this.quadCanvas.Size = vec2.fromValues(this.Size[0], this.Size[1]);
        this.quadCanvas.Position = vec2.fromValues(this.Position[0], this.Position[1]);
        this.quadCanvas.Texture = this.texture; // postavi framebuffer texture za kasnije renderiranje
    }

    private updateCanvasPositionRotationSize() {
        if (this.quadCanvas.Size !== this.Size) {
            console.log("Updating canvas size");
            this.quadCanvas.Size = this.Size;
            // Resize texture to new canvas size
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.handle);
            // TODO kaj kad je slika stara nutri, moram kopirat staru i napraviti veci canvas nekak
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.Size[0], this.Size[1], 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
            this.ClearCanvas();
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
        if (this.quadCanvas.Position !== this.Position) {
            console.log("Updating canvas position");
            this.quadCanvas.Position = this.Position;
        }
        if (this.quadCanvas.Rotation !== this.Rotation) {
            console.log("Updating canvas rotation");
            this.quadCanvas.Rotation = this.Rotation;
        }
    }

    public MouseToCanvasCoordinates(x: number, y: number): [number, number] {
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

    public GetCanvasImage() {
        const imgWidth = this.Size[0];
        const imgHeight = this.Size[1];
        const pixels = new Uint8Array(imgWidth * imgHeight * 4); // width * height * pixel_components (rgba is 4)
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.readPixels(0, 0, imgWidth, imgHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        // TODO FLIP TEXTURE ON Y COORDINATE
        return {
            width: imgWidth,
            height: imgHeight,
            pixels: pixels,
        };
    }

    public GetCanvasCamera() {
        // divide left,right,bottom,top with zoom (since top and left are 0, 0/zoom is always zero)
        return new Camera2D(this.Size[0], this.Size[1]);
    }

    public ClearCanvas() {
        // Clear framebuffer which clears the texture then
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    public DrawOnCanvas(object: Object2D | { Render: (camera: Camera2D) => void }) {
        const canvasCamera = this.GetCanvasCamera();
        // Bind framebuffer to render into it
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        // Clear framebuffer (no need since the canvas should keep everything drawn to it)
        // Set viewport to canvas size because we're rendering to texture of canvas size
        this.gl.viewport(0, 0, this.Size[0], this.Size[1]);
        // Draw on canvas
        object.Render(canvasCamera);
        // Switch back to normal framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    public Render(camera: Camera2D): void {
        this.updateCanvasPositionRotationSize();
        const quad = new QuadObject(this.gl);
        quad.Size = vec2.fromValues(100, 100);
        quad.Colour = vec4.fromValues(0, 1, 0, 1);
        this.DrawOnCanvas(quad);
        // Render to normal viewport (global space)
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.quadCanvas.Render(camera);
    }
}