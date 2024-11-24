import CanvasObject from "../objects/canvasObject";
import { ColourSelection } from "../util/colour";
import ToolOptions from "./toolOptions";

type OptionalNumber = number | undefined;

export default abstract class Tool {
    constructor(protected readonly _gl: WebGL2RenderingContext, protected readonly _canvasObj: CanvasObject) { }

    public ColourSelection: ColourSelection = new ColourSelection();

    public abstract GetOptions(): ToolOptions;

    public abstract OnMouseDown(canvasX: OptionalNumber, canvasY: OptionalNumber, mouseButton: number): void;
    public abstract OnMouseUp(x: OptionalNumber, y: OptionalNumber, mouseButton: number): void;
    public abstract OnMouseMove(x: OptionalNumber, y: OptionalNumber): void;
    public abstract OnKeyPress(key: string): void;
    public abstract OnDestroy(): void;

    public abstract GetID(): string;
}