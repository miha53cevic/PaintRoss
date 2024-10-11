import { useEffect, useRef } from "react";
import ColourPicker from "../rosslib/util/colourPicker";

export default function CPicker() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const picker = new ColourPicker(ctx);
        picker.DrawPicker();
    }, []);

    return (
        <div className="absolute bottom-4 left-4 bg-slate-950 text-slate-400 rounded-2xl flex flex-col items-center justify-center w-[300px] h-[200px] p-4 gap-4">
            <h4 className="font-bold">Colour Picker</h4>
            <div>
                <canvas width='100%' height='100%' ref={canvasRef}></canvas>
            </div>
        </div>
    );
}