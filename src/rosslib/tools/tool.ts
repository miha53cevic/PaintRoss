import CanvasObject from "../objects/canvasObject";
import { ColourSelection } from "../util/colour";
import ToolOptions from "./toolOptions";

type OptionalNumber = number | undefined;

export default abstract class Tool {
    constructor(protected readonly _gl: WebGL2RenderingContext, protected readonly _canvasObj: CanvasObject) { }

    public ColourSelection: ColourSelection = new ColourSelection();

    public abstract GetOptions(): ToolOptions;

    public abstract OnMouseDown(canvasX: OptionalNumber, canvasY: OptionalNumber, mouseButton: number): void;
    public abstract OnMouseUp(canvasX: OptionalNumber, canvasY: OptionalNumber, mouseButton: number): void;
    public abstract OnMouseMove(canvasX: OptionalNumber, canvasY: OptionalNumber): void;
    public abstract OnKeyPress(key: string): void;
    public abstract OnExit(): void; // on tool change

    public abstract GetID(): string;
}