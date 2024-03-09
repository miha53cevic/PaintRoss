import VBO from "./vbo";

export default class VAO {
    private readonly _vao: WebGLVertexArrayObject = -1;

    constructor(private readonly gl: WebGL2RenderingContext) {
        const vao = gl.createVertexArray();
        if (!vao) throw Error("Error when creating vertexArray");
        this._vao = vao;
    }

    public Bind() {
        this.gl.bindVertexArray(this._vao);
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
       this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo.GetVBO());
       this.gl.vertexAttribPointer(attributeId, numOfFloatsPerData, this.gl.FLOAT, false, stride, offset);
       this.gl.enableVertexAttribArray(attributeId);
    }
}