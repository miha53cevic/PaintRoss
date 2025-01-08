import Tool from './tool';

export default class ToolManager {
    private _tools: Map<string, Tool> = new Map();
    private _selectedTool: Tool | null = null;

    public RegisterTool(tool: Tool): void {
        if (this._tools.has(tool.GetID())) throw new Error(`Tool with ID ${tool.GetID()} already exists`);
        this._tools.set(tool.GetID(), tool);
    }

    public RegisterTools(tools: Tool[]): void {
        tools.forEach((tool) => this.RegisterTool(tool));
    }

    public GetTool(name: string): Tool {
        const tool = this._tools.get(name);
        if (!tool) throw new Error(`Tool with ID ${name} not found`);
        return tool;
    }

    public GetSelectedTool(): Tool | null {
        return this._selectedTool;
    }

    public SetSelectedTool(name: string): void {
        const oldTool = this.GetSelectedTool();
        oldTool?.OnExit();
        if (oldTool) oldTool.IsActive = false;

        const newTool = this.GetTool(name);
        newTool.OnEnter();
        newTool.IsActive = true;
        this._selectedTool = newTool;
    }

    public GetTools(): Tool[] {
        return Array.from(this._tools.values());
    }
}
