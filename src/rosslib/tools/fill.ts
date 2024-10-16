import FloodFill from 'q-floodfill';
import Texture from "../glo/texture";
import Tool from "./tool";

export default class Fill extends Tool {

    public OnMouseDown(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (!canvasX || !canvasY) return;
        this.ExecuteFloodFill(canvasX, canvasY);
    }

    public OnMouseUp(x: number | undefined, y: number | undefined, mouseButton: number): void {
    }

    public OnMouseMove(x: number | undefined, y: number | undefined): void {
    }

    public OnKeyPress(key: string): void {
    }

    public OnDestroy(): void {
        this._canvasObj.MergePreviewCanvas();
    }

    public GetID(): string {
        return "Fill";
    }

    private ExecuteFloodFill(canvasStartX: number, canvasStartY: number): void {
        canvasStartX = Math.floor(canvasStartX);
        canvasStartY = Math.floor(canvasStartY);

        const image = this._canvasObj.GetCanvasImage();
        const imageData = new ImageData(new Uint8ClampedArray(image.Pixels.buffer), image.Width, image.Height);
        const floodFill = new FloodFill(imageData);
        floodFill.fill(`rgb(${this.ColourSelection.Primary[0]}, ${this.ColourSelection.Primary[1]}, ${this.ColourSelection.Primary[2]})`, canvasStartX, canvasStartY, 0);
        const texture = Texture.CreateTexture(this._gl, image.Width, image.Height, floodFill.imageData.data);
        this._canvasObj.DrawFullscreenTextureOnCanvas(texture);
    }
}