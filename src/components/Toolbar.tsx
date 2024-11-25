import { useEffect, useState } from "react";
import PaintApp from "../rosslib";

export default function Toolbar() {
    const [currentTool, setCurrentTool] = useState<string>('Pen');
    useEffect(() => {
        PaintApp.Get().GetEventManager().Subscribe('ChangeTool', (tool) => {
            setCurrentTool(tool as string);
        });
    }, []);

    function IsSelectedTool(toolName: string) {
        return currentTool === toolName;
    }

    return (
        <div className="absolute top-[88px] left-4 bg-slate-950 rounded-2xl flex flex-col items-center p-4 gap-4 text-slate-400">
            <h4 className="font-bold">Tools</h4>
            <div className="flex flex-col gap-4">
                {PaintApp.Get().GetToolManager().GetTools().map((tool) => (
                    <button key={tool.GetID()} className={`border-none rounded ${IsSelectedTool(tool.GetID()) ? 'bg-slate-600' : ''}`} onClick={() => PaintApp.Get().SetTool(tool.GetID())}>{tool.GetID()}</button>
                ))}
            </div>
        </div>
    );
}