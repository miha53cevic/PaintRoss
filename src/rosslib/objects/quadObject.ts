import Camera2D from "../camera2d";
import GLMath from "../glmath";
import Shader from "../glo/shader";
import Texture from "../glo/texture";
import VAO from "../glo/vao";
import VBO from "../glo/vbo";
import { NormalizeRGB, RGB } from "../util/colour";
import ImageEffect from "../util/ImageEffect";
import ImageKernel, { Kernel } from "../util/imageKernel";
import Object2D from "./object2d";

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

uniform vec3 u_colour;
uniform sampler2D textureSampler;
uniform int u_usingTexture;
uniform float u_kernel[9];
uniform float u_kernelWeight;
uniform int u_effect;
 
void main() {
  if (u_usingTexture == 1) {
    vec2 onePixel = vec2(1) / vec2(textureSize(textureSampler, 0));

    vec4 colorSum =
      texture(textureSampler, textureCoords + onePixel * vec2(-1, -1)) * u_kernel[0] +
      texture(textureSampler, textureCoords + onePixel * vec2( 0, -1)) * u_kernel[1] +
      texture(textureSampler, textureCoords + onePixel * vec2( 1, -1)) * u_kernel[2] +
      texture(textureSampler, textureCoords + onePixel * vec2(-1,  0)) * u_kernel[3] +
      texture(textureSampler, textureCoords + onePixel * vec2( 0,  0)) * u_kernel[4] +
      texture(textureSampler, textureCoords + onePixel * vec2( 1,  0)) * u_kernel[5] +
      texture(textureSampler, textureCoords + onePixel * vec2(-1,  1)) * u_kernel[6] +
      texture(textureSampler, textureCoords + onePixel * vec2( 0,  1)) * u_kernel[7] +
      texture(textureSampler, textureCoords + onePixel * vec2( 1,  1)) * u_kernel[8];
    colorSum /= u_kernelWeight;

    // grayscale
    if (u_effect == 1) {
        float average = 0.2126 * colorSum.r + 0.7152 * colorSum.g + 0.0722 * colorSum.b;
        colorSum = vec4(average, average, average, 1.0);
    }
    // invert colors
    if (u_effect == 2) colorSum = vec4(1.0) - colorSum;

    FragColor = vec4((colorSum).rgb, 1);
  }
  else {
    FragColor = vec4(u_colour, 1.0);
  }
}
`;

export default class QuadObject extends Object2D {
    private static _verticies = [
        0.0, 1.0, 0.0, 0.0,
        1.0, 1.0, 1.0, 0.0,
        1.0, 0.0, 1.0, 1.0,

        1.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0, 0, 0.0,
    ];
    private static _shader: Shader;
    private static _vao: VAO;
    private static _vbo: VBO;

    public Colour: RGB = [255, 0, 0];
    public Texture: Texture | null = null;
    public Kernel: Kernel = ImageKernel.GetKernel('Normal');
    public Effect: number = ImageEffect.GetImageEffect('None');

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        if (!QuadObject._shader && !QuadObject._vao && !QuadObject._vbo) {
            QuadObject._shader = new Shader(gl, vertexShader, fragShader);
            QuadObject._vao = new VAO(gl);
            QuadObject._vbo = new VBO(gl);


            QuadObject._vao.Bind();
            QuadObject._vbo.SetBufferData(QuadObject._verticies);
            QuadObject._vao.DefineVertexAttribPointer(QuadObject._vbo, 0, 2, 4 * 4, 0);
            QuadObject._vao.DefineVertexAttribPointer(QuadObject._vbo, 1, 2, 4 * 4, 4 * 2);
        }
    }

    public Render(camera: Camera2D) {
        const modelMat = GLMath.CreateTransformationMatrix2D(this.Position, this.Rotation, this.Size);

        const shader = QuadObject._shader;
        shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMat);
        shader.SetMatrix4(shader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        shader.SetVector3(shader.GetUniformLocation('u_colour'), NormalizeRGB(this.Colour));
        shader.SetFloatArray(shader.GetUniformLocation('u_kernel'), this.Kernel);
        shader.SetFloat(shader.GetUniformLocation('u_kernelWeight'), ImageKernel.ComputeKernelWeight(this.Kernel));
        shader.SetInt(shader.GetUniformLocation('u_effect'), this.Effect);

        // Check if there is a texture
        if (this.Texture) {
            this.Texture.Use();
            shader.SetInt(shader.GetUniformLocation('textureSampler'), 1);
            shader.SetInt(shader.GetUniformLocation('u_usingTexture'), 1);
        }
        else {
            shader.SetInt(shader.GetUniformLocation('textureSampler'), 0); // use placeholder texture
            shader.SetInt(shader.GetUniformLocation('u_usingTexture'), 0);
        }

        shader.Use();
        QuadObject._vao.Bind();
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
    }
}