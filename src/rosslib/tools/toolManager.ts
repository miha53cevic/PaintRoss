import Tool from "./tool";

export default class ToolManager {
    private _tools: Map<string, Tool> = new Map();
    private _selectedTool: Tool | null = null;

    public RegisterTool(tool: Tool): void {
        if (this._tools.has(tool.GetID()))
            throw new Error(`Tool with ID ${tool.GetID()} already exists`);
        this._tools.set(tool.GetID(), tool);
    }

    public RegisterTools(tools: Tool[]): void {
        tools.forEach(tool => this.RegisterTool(tool));
    }

    public GetTool(name: string): Tool {
        const tool = this._tools.get(name);
        if (!tool) throw new Error(`Tool with ID ${name} not found`);
        return tool;
    }

    public GetSelectedTool(): Tool {
        if (this._selectedTool === null) throw new Error("No tool selected");
        return this._selectedTool;
    }

    public SetSelectedTool(name: string): void {
        const tool = this.GetTool(name);
        if (tool !== null) {
            this._selectedTool = tool;
        }
    }

    public GetTools(): Tool[] {
        return Array.from(this._tools.values());
    }
}