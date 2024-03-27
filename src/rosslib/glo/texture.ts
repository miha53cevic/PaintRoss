export default class Texture {
    private constructor(private readonly gl: WebGL2RenderingContext, public readonly handle: WebGLTexture) {
    }

    public static loadImage(gl: WebGL2RenderingContext, url: string) {
        return new Promise<{ texture: Texture, imgSize: [number, number] }>((resolve, reject) => {
            try {
                const handle = gl.createTexture();
                if (!handle) throw new Error("Error creating texture");

                gl.bindTexture(gl.TEXTURE_2D, handle);
                // Fill the texture with a 1x1 blue pixel whilst it loads in
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
                gl.bindTexture(gl.TEXTURE_2D, null);
                const image = new Image();
                image.src = url;
                image.addEventListener('load', () => {
                    const imgWidth = image.width;
                    const imgHeight = image.height;
                    gl.bindTexture(gl.TEXTURE_2D, handle);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imgWidth, imgHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    gl.generateMipmap(gl.TEXTURE_2D);
                    
                    gl.bindTexture(gl.TEXTURE_2D, null);

                    image.remove();
                    resolve({ texture: new Texture(gl, handle), imgSize: [imgWidth, imgHeight]});
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public static createTexture(gl: WebGL2RenderingContext, imageWidth: number, imageHeight: number, imageData: Uint8Array | null) {
        const handle = gl.createTexture();
        if (!handle) throw new Error("Error creating texture");

        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageWidth, imageHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return new Texture(gl, handle);
    }

    // texture_unit must be from gl.TEXTURE0
    public Use(texture_unit: number = this.gl.TEXTURE0) {
        this.gl.activeTexture(texture_unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
    }

}