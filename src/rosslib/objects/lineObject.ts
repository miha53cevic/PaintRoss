import polyline_normals from 'polyline-normals';
import Camera2D from '../camera2d';
import GLMath from '../glmath';
import EBO from '../glo/ebo';
import Shader from '../glo/shader';
import VAO from '../glo/vao';
import VBO from '../glo/vbo';
import { NormalizeRGBA, RGBA } from '../util/colour';
import Object2D from './object2d';

// Resource for triangular line drawing used: https://mattdesl.svbtle.com/drawing-lines-is-hard
const lineVertexShader = `#version 300 es
in vec2 a_position;
in vec2 a_normal;
in float a_miter;

uniform mat4 u_modelMat;
uniform mat4 u_projMat;
uniform mat4 u_viewMat;
uniform float u_thickness;
 
void main() {
  vec2 pos = a_position.xy + vec2(a_normal * u_thickness / 2.0 * a_miter);
  gl_Position = u_projMat * u_viewMat * u_modelMat * vec4(pos, 0.0, 1.0);
}
`;
const lineFragShader = `#version 300 es
precision highp float;

uniform vec4 colour;

out vec4 FragColor;

void main() {
  FragColor = vec4(colour);
}
`;

export default class LineObject extends Object2D {
    private static _shader: Shader;
    private _vao: VAO;
    private _vbo: VBO;
    private _ebo: EBO;
    private _normals: [[number, number], number][] = [];

    public Colour: RGBA = [0, 0, 0, 255];
    public Thickness: number = 1;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        if (!LineObject._shader) LineObject._shader = new Shader(gl, lineVertexShader, lineFragShader);

        this._vao = new VAO(gl);
        this._vbo = new VBO(gl);
        this._ebo = new EBO(gl);
    }

    public SetPoints(points: [number, number][], closedLoop: boolean = false) {
        // If it's only 1 point, we need a path for normals so duplicate it and move it from the original mouse position up and down
        if (points.length == 1) {
            const copy: [number, number] = [...points[0]];
            points.push(copy);
            points[0][0] += this.Thickness / 2;
            points[1][0] -= this.Thickness / 2;
        }

        this._normals = polyline_normals(points, closedLoop);

        // If a closed loop add the first point to the end
        // (must be done after normals are calculated, otherwise the first normal has infinity mitter)
        if (closedLoop) {
            points.push(points[0]);
            this._normals.push(this._normals[0]);
        }

        /**
         * Each poinnt has [x, y, normal_x, normal_y, miter] data or 5 floats
         */
        const pathData = points.map((point, i) => {
            const normal = this._normals[i][0];
            const miter = this._normals[i][1];
            return [point[0], point[1], normal[0], normal[1], miter];
        });

        /**
         * For each point we need to create 2 points, where the left point has the miter flipped and the right point has the miter as is
         * Because we want a point to the left and right of the original point to be able to have thickness with quads
         */
        const renderData: Array<number[]> = [];
        pathData.forEach((renderDataPoint) => {
            const flippedMiter = renderDataPoint[4] * -1;
            const copy = [...renderDataPoint];
            copy[4] = flippedMiter;
            renderData.push(copy);
            renderData.push(renderDataPoint);
        });

        /**
         * For each 2 original path points there is a quad
         * The triangles that make up a quad are in counter-clockwise order
         * Render data has all the points so for each path point there are 2 render data points
         * For each 4 points in renderData create a quad, but 2 quads always have to share 2 renderData points in between them so 2 quads actually have
         * 6 renderData points (3 path points)
         */
        const indicies: number[] = [];
        let index = 0;
        // For each pair of points connect with it's neighbour, so we have to stop at the second last pair (n-1 pairs, n path points)
        for (let i = 0; i < renderData.length / 2 - 1; i++) {
            indicies.push(index + 0);
            indicies.push(index + 1);
            indicies.push(index + 3);
            indicies.push(index + 3);
            indicies.push(index + 2);
            indicies.push(index + 0); // 6 indicies per quad
            index += 2;
        }

        this._vao.Bind();
        this._vbo.SetBufferData(renderData.flat(), this._gl.DYNAMIC_DRAW);
        this._vao.DefineVertexAttribPointer(this._vbo, 0, 2, 4 * 5, 0); // each vertex has 5 floats of data
        this._vao.DefineVertexAttribPointer(this._vbo, 1, 2, 4 * 5, 4 * 2); // normals start at offset size_of(float) * 2
        this._vao.DefineVertexAttribPointer(this._vbo, 2, 1, 4 * 5, 4 * 4); // miter starts at offset size_of(float) * 4
        this._ebo.SetElementBufferData(indicies, this._gl.DYNAMIC_DRAW);
        this._vao.Unbind();
    }

    public Render(camera: Camera2D) {
        if (this._ebo.Count === 0) return; // No points to render (empty path)

        const modelMat = GLMath.CreateTransformationMatrix2D(this.Position, this.Rotation, this.Size);

        const shader = LineObject._shader;
        shader.SetMatrix4(shader.GetUniformLocation('u_modelMat'), modelMat);
        shader.SetMatrix4(shader.GetUniformLocation('u_projMat'), camera.GetProjMatrix());
        shader.SetMatrix4(shader.GetUniformLocation('u_viewMat'), camera.GetViewMatrix());
        shader.SetVector4(shader.GetUniformLocation('colour'), NormalizeRGBA(this.Colour));
        shader.SetFloat(shader.GetUniformLocation('u_thickness'), this.Thickness);

        shader.Use();
        this._vao.Bind();

        this._gl.drawElements(this._gl.TRIANGLES, this._ebo.Count, this._gl.UNSIGNED_INT, 0);
    }
}
