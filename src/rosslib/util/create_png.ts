import { CanvasImage } from "../objects/canvasObject";

export default function (canvasImage: CanvasImage) {
    const img = canvasImage;
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