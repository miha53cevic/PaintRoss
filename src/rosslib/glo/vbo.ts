export default class VBO {
    private readonly _vbo: WebGLBuffer = -1;

    constructor(private readonly _gl: WebGL2RenderingContext) {
        const vbo = _gl.createBuffer();
        if (!vbo) throw Error("Error when creating vertex buffer object");
        this._vbo = vbo;
    }

    public SetBufferData(data: number[], usage: number = this._gl.STATIC_DRAW) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(data), usage);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }

    public GetVBO() {
        return this._vbo;
    }
}