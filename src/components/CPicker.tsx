import { useEffect, useRef } from "react";
import styled from "styled-components";
import ColourPicker from "../rosslib/util/colourPicker";

const ColourPickerArea = styled.article`
    position: absolute; 
    bottom: 1rem; 
    left: 1rem; 
    background-color: #212121; 
    color: #aaa;
    border-radius: 1rem; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    height: 200px; 
    width: 300px; 
`;

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
        <ColourPickerArea>
            <h4>Colour Picker</h4>
            <canvas width='100%' height='100%' ref={canvasRef}></canvas>
        </ColourPickerArea>
    );
}