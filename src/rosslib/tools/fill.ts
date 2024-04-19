import Texture from "../glo/texture";
import Tool from "./tool";
import FloodFill from 'q-floodfill';

export default class Fill extends Tool {
    public onDestroy(): void {
    }
    public GetID(): string {
        return "Fill";
    }

    public onMouseDown(x: number, y: number, mouseButton: number): void {
        x = Math.floor(x);
        y = Math.floor(y);

        const image = this.canvasObj.GetCanvasImage();
        const imageData = new ImageData(new Uint8ClampedArray(image.pixels.buffer), image.width, image.height);
        const floodFill = new FloodFill(imageData);
        floodFill.fill(`rgb(${this.Colour.Primary[0]}, ${this.Colour.Primary[1]}, ${this.Colour.Primary[2]})`, x, y, 0);
        const texture = Texture.createTexture(this.gl, image.width, image.height, floodFill.imageData.data);
        this.canvasObj.DrawFullscreenTextureOnCanvas(texture);
    }
    public onMouseUp(x: number, y: number, mouseButton: number): void {
    }
    public onMouseMove(x: number, y: number): void {
    }

}