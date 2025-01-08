import CanvasObject from '../../objects/canvasObject';
import { ColourSelection } from '../../util/colour';
import Tool from '../tool';
import { ToolOption } from '../toolOptions';
import PickerToolOptions from './pickerToolOptions';

export default class PickerTool extends Tool {
    constructor(gl: WebGL2RenderingContext, canvasObj: CanvasObject, colourSelection: ColourSelection) {
        super(gl, canvasObj, new PickerToolOptions(), colourSelection);
    }

    public OnMouseDown(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {
        if (!canvasX || !canvasY) return;
        if (mouseButton === 0) {
            const colour = this._canvasObj.GetColourAt(Math.floor(canvasX), Math.floor(canvasY));
            this.ColourSelection.Primary = colour;
        }
    }

    public OnMouseUp(canvasX: number | undefined, canvasY: number | undefined, mouseButton: number): void {}

    public OnMouseMove(canvasX: number | undefined, canvasY: number | undefined): void {}

    public OnKeyPress(key: string): void {}

    public OnToolOptionChange(option: ToolOption): void {}

    public OnColourSelectionChange(colourSelection: ColourSelection): void {
        if (!this.IsActive) return;
    }

    public OnEnter(): void {}

    public OnExit(): void {}

    public GetID(): string {
        return 'Picker';
    }
}
