import CanvasObject from "../objects/canvasObject";
import { ColourSelection } from "../util/colour";
import ToolOptions, { ToolOption } from "./toolOptions";

type OptionalNumber = number | undefined;

export default abstract class Tool {
    constructor(protected readonly _gl: WebGL2RenderingContext, protected readonly _canvasObj: CanvasObject, protected readonly _toolOptions: ToolOptions) {
        _toolOptions.Subscribe(this.OnToolOptionChange.bind(this)); // bez bind(this) funkcija nema pristup varijablama klase
    }

    public ColourSelection: ColourSelection = new ColourSelection();

    public GetOptions(): ToolOptions {
        return this._toolOptions;
    }

    public abstract OnMouseDown(canvasX: OptionalNumber, canvasY: OptionalNumber, mouseButton: number): void;
    public abstract OnMouseUp(canvasX: OptionalNumber, canvasY: OptionalNumber, mouseButton: number): void;
    public abstract OnMouseMove(canvasX: OptionalNumber, canvasY: OptionalNumber): void;
    public abstract OnKeyPress(key: string): void;
    public abstract OnToolOptionChange(option: ToolOption): void;
    public abstract OnExit(): void; // on tool change

    public abstract GetID(): string;
}