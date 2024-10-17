import { useEffect, useRef } from "react";
import ColourPicker from "../rosslib/pickers/colourPicker";
import TriangularColourPicker from "../rosslib/pickers/triangleColourPicker";

export default function CPicker() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const picker: ColourPicker = new TriangularColourPicker(ctx);
        picker.DrawPicker();
    }, []);

    return (
        <div className="absolute bottom-4 left-4 bg-slate-950 text-slate-400 rounded-2xl flex flex-col items-center justify-center w-[300px] h-[300px] p-4 gap-4">
            <canvas className="w-full h-full" ref={canvasRef}></canvas>
        </div >
    );
}