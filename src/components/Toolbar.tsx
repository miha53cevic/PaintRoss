import { useEffect, useState } from "react";
import PaintApp from "../rosslib";
import Fill from "../rosslib/tools/fill";
import Pen from "../rosslib/tools/pen";
import Spline from "../rosslib/tools/spline";

export default function Toolbar() {
    const [currentTool, setCurrentTool] = useState<string>('Pen');
    useEffect(() => {
        PaintApp.Get().GetEventManager().Subscribe('change tool', (tool) => {
            setCurrentTool(tool as string);
        });
    }, []);

    function IsSelectedTool(toolName: string) {
        return currentTool === toolName;
    }

    return (
        <div className="absolute top-[64px] left-4 bg-slate-950 rounded-2xl flex flex-col items-center p-4 gap-4 text-slate-400">
            <h4 className="font-bold">Tools</h4>
            <div className="flex flex-col gap-4">
                <button className={`border-none rounded ${IsSelectedTool('Pen') ? 'bg-slate-600' : ''}`} onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Pen(gl, canvasObj)))}>Pen</button>
                <button className={`border-none rounded ${IsSelectedTool('Spline') ? 'bg-slate-600' : ''}`} onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Spline(gl, canvasObj)))}>Curve</button>
                <button className={`border-none rounded ${IsSelectedTool('Fill') ? 'bg-slate-600' : ''}`} onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Fill(gl, canvasObj)))}>Fill Bucket</button>
            </div>
        </div>
    );
}