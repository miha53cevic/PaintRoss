import { vec4 } from "gl-matrix";
import Shader from "./glo/shader";
import VAO from "./glo/vao";
import VBO from "./glo/vbo";
import GLMath from "./glmath";
import Object2D from "./object2d";
import Camera2D from "./camera2d";
import Texture from "./glo/texture";

const vertexShader = 
`#version 300 es
in vec2 a_position;
in vec2 a_textureCoords;
out vec2 textureCoords;

uniform mat4 u_modelMat;
uniform mat4 u_projMat;
uniform mat4 u_viewMat;
 
void main() {
  vec4 pos = u_projMat * u_viewMat * u_modelMat * vec4(a_position, 1.0, 1.0);
  gl_Position = pos;
  textureCoords = a_textureCoords;
}
`;
const fragShader =  
`#version 300 es
precision highp float;

in vec2 textureCoords;
out vec4 FragColor;

uniform vec4 u_colour;
uniform sampler2D textureSampler;
uniform int u_usingTexture;
 
void main() {
  if (u_usingTexture == 1) {
    FragColor = texture(textureSampler, textureCoords);
  }
  else {
    FragColor = u_colour;
  }
}
`;

export default class Quad extends Object2D {
    private static _verticies = [
        -0.5, -0.5, 0.0, 1.0,
         0.5, -0.5, 1.0, 1.0,
         0.5,  0.5, 1.0, 0.0,

         0.5,  0.5, 1.0, 0.0,
        -0.5,  0.5, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0,
    ];
    private static _shader: Shader;
    private static _vao: VAO;
    private static _vbo: VBO;

    public Colour: vec4 = vec4.fromValues(1, 0, 0, 1);
    public Texture: Texture | null = null;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        if (!Quad._shader && !Quad._vao && !Quad._vbo) {
            Quad._shader = new Shader(gl, vertexShader, fragShader);
            Quad._vao = new VAO(gl);
            Quad._vbo = new VBO(gl);


            Quad._vao.Bind();
            Quad._vbo.SetBufferData(Quad._verticies);
            Quad._vao.DefineVertexAttribPointer(Quad._vbo, 0, 2, 4 * 4, 0);
            Quad._vao.DefineVertexAttribPointer(Quad._vbo, 1, 2, 4 * 4, 4 * 2);
        }
    }

    public Render(camera: Camera2D) {
        const modelMat = GLMath.createTransformationMatrix2D(this.Position, this.Rotation, this.Scale);

        const shader = Quad._shader;
        shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMat);
        shader.SetMatrix4(shader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        shader.SetVector4(shader.GetUniformLocation('u_colour'), this.Colour);

        // Check if there is a texture
        if (this.Texture) {
            this.Texture.Use();
            shader.SetInt(shader.GetUniformLocation('u_usingTexture'), 1);
        }
        else shader.SetInt(shader.GetUniformLocation('u_usingTexture'), 0);

        shader.Use();
        Quad._vao.Bind();
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}