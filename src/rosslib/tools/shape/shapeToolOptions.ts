import ToolOptions from "../toolOptions";

export default class ShapeToolOptions extends ToolOptions {
    constructor() {
        super([
            { Name: "Type", Type: "select", Value: "Rectangle", PossibleValues: ["Rectangle", "Ellipse"] },
            { Name: "FillMode", Type: "select", Value: "Outline", PossibleValues: ["Outline", "Fill"] },
            { Name: "BrushSize", Type: "number", Value: 1 }
        ]);
    }
}