import Camera2D from "../camera2d";
import CanvasObject from "../objects/canvasObject";
import Shader from "../glo/shader";
import VAO from "../glo/vao";
import VBO from "../glo/vbo";
import Tool from "./tool";

const lineVertexShader =
    `#version 300 es
in vec2 a_position;

uniform mat4 u_projMat;
uniform mat4 u_viewMat;
 
void main() {
  vec4 pos = u_projMat * u_viewMat * vec4(a_position, 0.0, 1.0);
  gl_Position = pos;
  gl_PointSize = 0.0;
}
`;
const lineFragShader =
    `#version 300 es
precision highp float;

out vec4 FragColor;

void main() {
  FragColor = vec4(0, 0, 0, 1);
}
`;

export default class Pen extends Tool {
    private readonly lineShader: Shader;
    private points: [number, number][] = [];
    private drawing = false;

    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        super(gl, canvasObj);
        this.lineShader = new Shader(gl, lineVertexShader, lineFragShader);
    }

    onMouseDown(x: number, y: number, mouseButton: number): void {
        if (mouseButton === 0) {
            this.drawing = true;
            this.points = [[x, y]]; // add initial click point
        }
        if (mouseButton === 2) {
            this.canvasObj.MergePreviewCanvas(); // copy preview texture data onto canvas texture
            const img = this.canvasObj.GetCanvasImage();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            ctx.canvas.width = img.width;
            ctx.canvas.height = img.height;
            const imageData = ctx.createImageData(img.width, img.height);
            for (let i = 0; i < img.pixels.length; i++) {
                imageData.data[i] = img.pixels[i];
            }
            ctx.putImageData(imageData, 0, 0);
            window.open(canvas.toDataURL("image/png"));
            canvas.remove();
        }
    }

    onMouseUp(x: number, y: number, mouseButton: number): void {
        if (mouseButton === 0) {
            this.drawing = false;
            this.canvasObj.DrawOnCanvas({ Render: (camera: Camera2D) => this.RenderLines(camera) });
            this.points = [];
        }
    }

    onMouseMove(x: number, y: number): void {
        if (this.drawing) {
            this.points.push([x, y]);
            this.canvasObj.DrawOnCanvas({ Render: (camera: Camera2D) => this.RenderLines(camera) });
        }
    }

    RenderLines(camera: Camera2D) {
        if (!this.points.length) return;

        this.lineShader.Use();
        this.lineShader.SetMatrix4(this.lineShader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        this.lineShader.SetMatrix4(this.lineShader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        const vao = new VAO(this.gl);
        const vbo = new VBO(this.gl);
        vao.Bind();
        vbo.SetBufferData(this.points.flat());
        vao.DefineVertexAttribPointer(vbo, 0, 2, 0, 0);
        // If it's only 1 point draw it instead of a line
        if (this.points.length > 1) this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.points.length);
        else this.gl.drawArrays(this.gl.POINTS, 0, 1);
    }
}