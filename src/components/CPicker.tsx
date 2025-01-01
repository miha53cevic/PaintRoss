import { useEffect, useRef, useState } from "react";
import PaintApp from "../rosslib";
import CircleColourPicker from "../rosslib/pickers/circleColourPicker";
import ColourPicker from "../rosslib/pickers/colourPicker";
import TriangularColourPicker from "../rosslib/pickers/triangleColourPicker";

type PickerType = "circular" | "triangular";
let picker: ColourPicker | null = null;

export default function CPicker() {
    const [pickerType, setPickerType] = useState<PickerType>("triangular");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        picker?.OnExit(); // unbind event listeners otherwise they will stack

        switch (pickerType) {
            case "circular":
                picker = new CircleColourPicker(ctx);
                break;
            case "triangular":
                picker = new TriangularColourPicker(ctx);
                break;
        }
        picker.DrawPicker();
        picker.SetPick(PaintApp.Get().GetToolColour().Primary);

        PaintApp.Get().GetToolColour().Subscribe((colourSelection) => {
            picker?.SetPick(colourSelection.Primary);
        });
    }, [pickerType]);

    const handlePickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPickerType(e.target.value as PickerType);
    };

    return (
        <div className="absolute bottom-4 left-4 bg-slate-950 text-slate-400 rounded-2xl flex flex-col items-center justify-center w-[300px] h-[300px] p-4 gap-4">
            <canvas className="w-full h-full" ref={canvasRef}></canvas>
            <div className="absolute -top-12">
                <select className="bg-slate-950 text-slate-400 rounded-2xl p-2" onChange={handlePickerChange}>
                    <option value={"triangular" as PickerType}>Triangular</option>
                    <option value={"circular" as PickerType}>Circular</option>
                </select>
            </div>
        </div>
    );
}