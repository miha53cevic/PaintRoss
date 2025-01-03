import ToolOptions from '../toolOptions';

export default class EraserToolOptions extends ToolOptions {
    constructor() {
        super([
            {
                Name: 'BrushSize',
                Type: 'number',
                Value: 1,
            },
        ]);
    }
}
