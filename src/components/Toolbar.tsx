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
                <button className={`border-none rounded ${IsSelectedTool('Pen') ? 'bg-slate-600' : ''}`} onClick={() => PaintApp.Get().SetTool("Pen")}>Pen</button>
                <button className={`border-none rounded ${IsSelectedTool('Spline') ? 'bg-slate-600' : ''}`} onClick={() => PaintApp.Get().SetTool("Spline")}>Curve</button>
                <button className={`border-none rounded ${IsSelectedTool('Fill') ? 'bg-slate-600' : ''}`} onClick={() => PaintApp.Get().SetTool("Fill")}>Fill Bucket</button>
            </div>
        </div>
    );
}