import { vec2, vec4 } from "gl-matrix";
import Camera2D from "./camera2d";
import Object2D from "./object2d";
import Quad from "./quad";
import Texture from "./glo/texture";

export default class Canvas extends Object2D {
    private quad: Quad;
    private frameBuffer: WebGLFramebuffer;
    private texture: Texture;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this.quad = new Quad(gl);
        this.quad.Position = vec2.fromValues(gl.canvas.width / 2, gl.canvas.height / 2);
        this.quad.Scale = vec2.fromValues(200, 200);
        this.quad.Colour = vec4.fromValues(1, 1, 1, 1);

        const frameBuffer = gl.createFramebuffer();
        if (!frameBuffer) throw new Error("Error creating framebuffer in canvas");
        this.frameBuffer = frameBuffer;

        this.texture = Texture.createTexture(gl, gl.canvas.width, gl.canvas.height, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.handle);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.handle, 0);
    }

    public Render(camera: Camera2D): void {
        this.quad.Texture = null;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.quad.Render(camera);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.quad.Texture = this.texture; // crta na manji kvadrat error popravi todo...
        this.quad.Render(camera);
    }
}