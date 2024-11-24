import ToolOptions from "../toolOptions";

export default class PenToolOptions extends ToolOptions {
    constructor() {
        super([
            { Name: "BrushSize", Type: 'number', Value: 1 },
        ]);
    }
}
