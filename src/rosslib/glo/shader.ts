import glm from 'gl-matrix';
import Logger from '../util/logger';

export default class Shader {
    private readonly _handle: WebGLProgram = -1;

    constructor(
        private readonly _gl: WebGL2RenderingContext,
        vertexShaderSource: string,
        fragmentShaderSource: string,
    ) {
        const { VertexShader, FragmentShader } = this.CompileShader(vertexShaderSource, fragmentShaderSource);
        this._handle = this.CreateProgram(VertexShader, FragmentShader);
    }

    private CompileShader(vertexShaderSource: string, fragmentShaderSource: string) {
        const vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
        if (!vertexShader) throw Error('Error creating vertex shader');
        this._gl.shaderSource(vertexShader, vertexShaderSource);

        const fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        if (!fragmentShader) throw Error('Error creating fragment shader');
        this._gl.shaderSource(fragmentShader, fragmentShaderSource);

        this._gl.compileShader(vertexShader);
        const successVertex = this._gl.getShaderParameter(vertexShader, this._gl.COMPILE_STATUS);
        if (!successVertex) {
            throw 'Could not compile vertex shader:' + this._gl.getShaderInfoLog(vertexShader);
        }

        this._gl.compileShader(fragmentShader);
        const successFragment = this._gl.getShaderParameter(fragmentShader, this._gl.COMPILE_STATUS);
        if (!successFragment) {
            throw 'Could not compile fragment shader:' + this._gl.getShaderInfoLog(fragmentShader);
        }

        return {
            VertexShader: vertexShader,
            FragmentShader: fragmentShader,
        };
    }

    private CreateProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = this._gl.createProgram();
        if (!program) throw new Error('Error when creating shader program');

        this._gl.attachShader(program, vertexShader);
        this._gl.attachShader(program, fragmentShader);
        this._gl.linkProgram(program);

        const success = this._gl.getProgramParameter(program, this._gl.LINK_STATUS);
        if (!success) {
            throw 'Shader Program failed to link:' + this._gl.getProgramInfoLog(program);
        }

        // Cleanup, since they are linked now to the shader program
        this._gl.detachShader(program, vertexShader);
        this._gl.detachShader(program, fragmentShader);
        this._gl.deleteShader(vertexShader);
        this._gl.deleteShader(fragmentShader);

        const count = this._gl.getProgramParameter(program, this._gl.ACTIVE_UNIFORMS);
        Logger.Log('Shader', `Loaded ${count} uniforms`);

        return program;
    }

    public Use() {
        this._gl.useProgram(this._handle);
    }

    public GetUniformLocation(name: string) {
        if (this._handle == -1) {
            throw new Error('Shader handle is -1');
        }

        const location = this._gl.getUniformLocation(this._handle, name);
        if (!location || location == -1) {
            throw new Error(`Shader found no location for the uniform: ${name}`);
        }
        return location;
    }

    public SetMatrix4(location: WebGLUniformLocation, mat: glm.mat4) {
        this.Use();
        this._gl.uniformMatrix4fv(location, false, mat);
    }

    public SetInt(location: WebGLUniformLocation, data: number) {
        this.Use();
        this._gl.uniform1i(location, data);
    }

    public SetFloat(location: WebGLUniformLocation, data: number) {
        this.Use();
        this._gl.uniform1f(location, data);
    }

    public SetFloatArray(location: WebGLUniformLocation, data: number[]) {
        this.Use();
        this._gl.uniform1fv(location, data);
    }

    public SetVector4(location: WebGLUniformLocation, data: glm.vec4) {
        this.Use();
        this._gl.uniform4f(location, data[0], data[1], data[2], data[3]);
    }

    public SetVector3(location: WebGLUniformLocation, data: glm.vec3) {
        this.Use();
        this._gl.uniform3f(location, data[0], data[1], data[2]);
    }

    public SetVector2(location: WebGLUniformLocation, data: glm.vec2) {
        this.Use();
        this._gl.uniform2f(location, data[0], data[1]);
    }
}
