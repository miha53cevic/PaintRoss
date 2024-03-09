import glm from 'gl-matrix';

export default class Shader {
    private readonly _handle: WebGLProgram = -1;

    constructor(private readonly gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
        const { vertexShader, fragmentShader } = this.CompileShader(vertexShaderSource, fragmentShaderSource);
        this._handle = this.CreateProgram(vertexShader, fragmentShader);
    }

    private CompileShader(vertexShaderSource: string, fragmentShaderSource: string) {
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        if (!vertexShader) throw Error("Error creating vertex shader");
        this.gl.shaderSource(vertexShader, vertexShaderSource);

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if (!fragmentShader) throw Error("Error creating fragment shader");
        this.gl.shaderSource(fragmentShader, fragmentShaderSource);

        this.gl.compileShader(vertexShader);
        const successVertex = this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS);
        if (!successVertex) {
            throw ("Could not compile vertex shader:" + this.gl.getShaderInfoLog(vertexShader));
        }

        this.gl.compileShader(fragmentShader);
        const successFragment = this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS);
        if (!successFragment) {
            throw ("Could not compile fragment shader:" + this.gl.getShaderInfoLog(fragmentShader));
        }

        return {
            vertexShader,
            fragmentShader,
        };
    }

    private CreateProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = this.gl.createProgram();
        if (!program) throw new Error("Error when creating shader program");

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!success) {
            throw ("Shader Program failed to link:" + this.gl.getProgramInfoLog(program));
        }

        // Cleanup, since they are linked now to the shader program
        this.gl.detachShader(program, vertexShader);
        this.gl.detachShader(program, fragmentShader);
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);

        const count = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
        console.log(`[Shader]: Loaded ${count} uniforms`);

        return program;
    }

    public Use() {
        this.gl.useProgram(this._handle);
    }

    public GetUniformLocation(name: string) {
        if (this._handle == -1) {
            throw new Error("[Shader]: _handle is -1");
        }

        const location = this.gl.getUniformLocation(this._handle, name);
        if (!location || location == -1) {
            throw new Error(`[Shader]: Found no location for the uniform: ${name}`);
        }
        return location;
    }

    public SetMatrix4(location: WebGLUniformLocation, mat: glm.mat4) {
        this.Use();
        this.gl.uniformMatrix4fv(location, false, mat);
    }

    public SetInt(location: WebGLUniformLocation, data: number) {
        this.Use();
        this.gl.uniform1i(location, data);
    }

    public SetFloat(location: WebGLUniformLocation, data: number) {
        this.Use();
        this.gl.uniform1f(location, data);
    }

    public SetVector3(location: WebGLUniformLocation, data: [number, number, number]) {
        this.Use();
        this.gl.uniform3f(location, data[0], data[1], data[2]);
    }

    public SetVector2(location: WebGLUniformLocation, data: [number, number]) {
        this.Use();
        this.gl.uniform2f(location, data[0], data[1]);
    }
}