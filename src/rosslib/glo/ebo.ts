export default class EBO {
    private readonly _ebo: WebGLBuffer = -1;

    public Count: number = 0;

    constructor(private readonly _gl: WebGL2RenderingContext) {
        const vbo = _gl.createBuffer();
        if (!vbo) throw Error('Error when creating element buffer object');
        this._ebo = vbo;
    }

    public SetElementBufferData(data: number[], usage: number = this._gl.STATIC_DRAW) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._ebo);
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), usage);
        // this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null); // Never unbind the EBO, it will be unbound when the VAO is unbound

        this.Count = data.length;
    }

    public GetEBO() {
        return this._ebo;
    }
}
