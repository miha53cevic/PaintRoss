import styled from "styled-components";
import PaintApp from "../rosslib";
import Fill from "../rosslib/tools/fill";
import Pen from "../rosslib/tools/pen";
import { useEffect, useState } from "react";
import Spline from "../rosslib/tools/spline";

const ToolBar = styled.article`
    position: absolute; 
    top: calc(48px + 1rem); 
    left: 1rem; 
    background-color: white; 
    border-radius: 1rem; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    padding: 1rem; 
    gap: 1rem;
    background-color: #212121;
    color: #aaa;
`;

const Tools = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Tool = styled.button<{ selected?: boolean }>`
    border: none;
    border-radius: 0.25rem;
    background: ${props => props.selected ? 'gray' : ''};
`;

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
        <ToolBar>
            <h4>Tools</h4>
            <Tools>
                <Tool selected={IsSelectedTool('Pen')} onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Pen(gl, canvasObj)))}>Pen</Tool>
                <Tool selected={IsSelectedTool('Spline')} onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Spline(gl, canvasObj)))}>Curve</Tool>
                <Tool selected={IsSelectedTool('Fill')} onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Fill(gl, canvasObj)))}>Fill Bucket</Tool>
            </Tools>
        </ToolBar>
    );
}