import Texture from "./texture";

export default class FrameBuffer {
    private _frameBuffer: WebGLFramebuffer;

    constructor(private readonly _gl: WebGL2RenderingContext) {
        const frameBuffer = _gl.createFramebuffer();
        if (!frameBuffer) throw new Error("Error creating framebuffer in canvas");
        this._frameBuffer = frameBuffer;
    }

    public GetFrameBuffer() {
        return this._frameBuffer;
    }

    public Bind() {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
    }

    public Unbind() {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    public AddTextureAttachment(texture: Texture, attachment = this._gl.COLOR_ATTACHMENT0) {
        this.Bind();
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, attachment, this._gl.TEXTURE_2D, texture.Handle, 0);
        this.Unbind();
    }
}