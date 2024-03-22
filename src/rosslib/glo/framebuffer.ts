import Texture from "./texture";

export default class FrameBuffer {
    private _frameBuffer: WebGLFramebuffer;

    constructor(private readonly gl: WebGL2RenderingContext) {
        const frameBuffer = gl.createFramebuffer();
        if (!frameBuffer) throw new Error("Error creating framebuffer in canvas");
        this._frameBuffer = frameBuffer;
    }

    public GetFrameBuffer() {
        return this._frameBuffer;
    }

    public Bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._frameBuffer);
    }

    public Unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    public AddTextureAttachment(texture: Texture, attachment = this.gl.COLOR_ATTACHMENT0) {
        this.Bind();
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, texture.handle, 0);
        this.Unbind();
    }
}