import { CanvasImage } from "../objects/canvasObject";

export default class ImageFormat {
    private constructor() { }

    static CreatePNG(canvasImage: CanvasImage): Promise<Blob> {
        const img = canvasImage;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.canvas.width = img.Width;
        ctx.canvas.height = img.Height;
        const imageData = ctx.createImageData(img.Width, img.Height);
        for (let i = 0; i < img.Pixels.length; i++) {
            imageData.data[i] = img.Pixels[i];
        }
        ctx.putImageData(imageData, 0, 0);
        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                canvas.remove();
                if (blob) {
                    resolve(blob);
                } else {
                    reject("Failed to create Blob from canvas");
                }
            }, "image/png");
        });
    }
}
