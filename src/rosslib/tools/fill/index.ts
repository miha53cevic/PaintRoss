import FloodFill from 'q-floodfill';
import Texture from "../../glo/texture";
import CanvasObject from '../../objects/canvasObject';
import { ColourSelection } from '../../util/colour';
import Tool from "../tool";
import { ToolOption } from '../toolOptions';
import FillToolOptions from './fillToolOptions';

export default class FillTool extends Tool {
    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        super(gl, canvasObj, new FillToolOptions());
    }

    public OnToolOptionChange(option: ToolOption): void {
    }

    public OnColourSelectionChange(colourSelection: ColourSelection): void {
    }

    public OnMouseDown(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (!canvasX || !canvasY) return;
        this.ExecuteFloodFill(canvasX, canvasY);
    }

    public OnMouseUp(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
    }

    public OnMouseMove(canvasX: number | undefined, canvasY: number | undefined): void {
    }

    public OnKeyPress(key: string): void {
    }

    public OnExit(): void {
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