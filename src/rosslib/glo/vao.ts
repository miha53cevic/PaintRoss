import VBO from "./vbo";

export default class VAO {
    private readonly _vao: WebGLVertexArrayObject = -1;

    constructor(private readonly _gl: WebGL2RenderingContext) {
        const vao = _gl.createVertexArray();
        if (!vao) throw Error("Error when creating vertexArray");
        this._vao = vao;
    }

    public Bind() {
        this._gl.bindVertexArray(this._vao);
    }

    public Unbind() {
        this._gl.bindVertexArray(null);
    }

    public GetVAO() {
        return this._vao;
    }

    // One VAO has multiple VertexAttribPointers which all point to some VBOs
    // Binds and describes VBO data to VAO
    public DefineVertexAttribPointer(vbo: VBO, attributeId: number, numOfFloatsPerData: number, stride: number, offset: number) {
        /*  Generate VAO
            BindVAO
            Generate VBO's
            BindVBO's
            Specify vertex attributes which are then stored in the VAO vector, and used when binding later
        */
       this.Bind();
       this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo.GetVBO());
       this._gl.vertexAttribPointer(attributeId, numOfFloatsPerData, this._gl.FLOAT, false, stride, offset);
       this._gl.enableVertexAttribArray(attributeId);
       this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
}