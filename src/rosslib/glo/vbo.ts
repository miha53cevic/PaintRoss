export default class VBO {
    private readonly _vbo: WebGLBuffer = -1;

    constructor(private readonly gl: WebGL2RenderingContext) {
        const vbo = gl.createBuffer();
        if (!vbo) throw Error("Error when creating vertex buffer object");
        this._vbo = vbo;
    }

    public SetBufferData(data: number[], usage: number = this.gl.STATIC_DRAW) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), usage);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public GetVBO() {
        return this._vbo;
    }
}