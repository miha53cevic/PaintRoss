import Logger from "../util/logger";

export default class Texture {
    private constructor(private readonly _gl: WebGL2RenderingContext, public readonly Handle: WebGLTexture) {
    }

    public static LoadImage(gl: WebGL2RenderingContext, url: string) {
        return new Promise<{ Texture: Texture, ImgSize: [number, number] }>((resolve, reject) => {
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

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // use LINEAR for zoom out for fixing the texture bleeding issue
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    gl.generateMipmap(gl.TEXTURE_2D);

                    gl.bindTexture(gl.TEXTURE_2D, null);

                    image.remove();
                    resolve({ Texture: new Texture(gl, handle), ImgSize: [imgWidth, imgHeight] });
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public static CreateTexture(gl: WebGL2RenderingContext, imageWidth: number, imageHeight: number, imageData: Uint8Array | Uint8ClampedArray | null) {
        const handle = gl.createTexture();
        if (!handle) throw new Error("Error creating texture");

        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageWidth, imageHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // use LINEAR for zoom out for fixing the texture bleeding issue
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return new Texture(gl, handle);
    }

    // texture_unit must be from gl.TEXTURE1, gl.TEXTURE2...
    // gl.TEXTURE0 is used as placeholder
    public Use(texture_unit: number = this._gl.TEXTURE1, warnning = true) {
        if (texture_unit === this._gl.TEXTURE0 && warnning) Logger.Warn("[Texture]: Using placeholder texture!");
        this._gl.activeTexture(texture_unit);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this.Handle);
    }

}