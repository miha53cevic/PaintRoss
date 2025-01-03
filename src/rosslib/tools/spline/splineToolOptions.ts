import ToolOptions from '../toolOptions';

export default class SplineToolOptions extends ToolOptions {
    constructor() {
        super([{ Name: 'BrushSize', Type: 'number', Value: 1 }]);
    }
}
