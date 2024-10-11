import FloodFill from 'q-floodfill';
import Texture from "../glo/texture";
import Tool from "./tool";

export default class Fill extends Tool {

    protected HandleKeyPress(key: string): void {
    }

    protected HandleDestroy(): void {
        this.canvasObj.MergePreviewCanvas();
    }

    public GetID(): string {
        return "Fill";
    }

    protected HandleMouseDown(x: number, y: number, mouseButton: number): void {
        x = Math.floor(x);
        y = Math.floor(y);

        const image = this.canvasObj.GetCanvasImage();
        const imageData = new ImageData(new Uint8ClampedArray(image.pixels.buffer), image.width, image.height);
        const floodFill = new FloodFill(imageData);
        floodFill.fill(`rgb(${this.ColourSelection.Primary[0]}, ${this.ColourSelection.Primary[1]}, ${this.ColourSelection.Primary[2]})`, x, y, 0);
        const texture = Texture.createTexture(this.gl, image.width, image.height, floodFill.imageData.data);
        this.canvasObj.DrawFullscreenTextureOnCanvas(texture);
    }

    protected HandleMouseUp(x: number, y: number, mouseButton: number): void {
    }

    protected HandleMouseMove(x: number, y: number): void {
    }
}