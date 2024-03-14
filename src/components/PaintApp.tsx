import { useEffect, useRef } from "react"
import { loadPaintApp } from "../rosslib";
import styled from "styled-components";
import AppBar from "./Appbar";
import Toolbar from "./Toolbar";
import ColorPicker from "./ColorPicker";

const Main = styled.main`
    display: flex;
    flex-direction: column;
`;

export default function PaintApp() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        loadPaintApp(canvasRef.current);
    }, []);

    return (
        <Main>
            <AppBar />
            <canvas id="appCanvas" ref={canvasRef} />
            <Toolbar />
            <ColorPicker />
        </Main >
    )
}
