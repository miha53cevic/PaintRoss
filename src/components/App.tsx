import { useEffect, useRef } from "react"
import PaintApp from "../rosslib";
import styled from "styled-components";
import AppBar from "./Appbar";
import Toolbar from "./Toolbar";
import ColorPicker from "./ColorPicker";

const Main = styled.main`
    display: flex;
    flex-direction: column;
`;

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        PaintApp.Init(canvasRef.current);
    }, [canvasRef]);

    return (
        <Main>
            <AppBar />
            <canvas id="appCanvas" ref={canvasRef} />
            <Toolbar />
            <ColorPicker />
        </Main >
    );
}
