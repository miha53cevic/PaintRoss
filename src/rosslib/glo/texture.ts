export default class Texture {
    private constructor(private readonly gl: WebGL2RenderingContext, private readonly handle: WebGLTexture) {
    }

    public static loadTexture(gl: WebGL2RenderingContext, image: HTMLImageElement) {
        const handle = gl.createTexture();
        if (!handle) throw new Error("Error creating texture");
        
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.generateMipmap(gl.TEXTURE_2D);

        return new Texture(gl, handle);
    }

    public Use(texture_unit: number) {
        this.gl.activeTexture(texture_unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
    }

}