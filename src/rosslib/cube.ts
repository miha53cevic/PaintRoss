import Shader from "./glo/shader";
import VAO from "./glo/vao";
import VBO from "./glo/vbo";

export default class Cube {
    private readonly _vao: VAO;
    private readonly _vbo: VBO;
    private readonly vertices = [
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,

        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,

        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,

        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,

        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,

        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5
    ];

    constructor(private readonly gl: WebGL2RenderingContext) {

        // Create VAO & bind the VAO
        this._vao = new VAO(gl);
        this._vao.Bind();

        this._vbo = new VBO(gl);
        this._vbo.SetBufferData(this.vertices);
        this._vao.DefineVertexAttribPointer(this._vbo, 0, 3, 0, 0);
    }

    Render(shader: Shader) {
        shader.Use();
        this.gl.bindVertexArray(this._vao);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 12);
    }
}