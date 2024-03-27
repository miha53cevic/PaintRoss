import styled from "styled-components";
import PaintApp from "../rosslib";
import Fill from "../rosslib/tools/fill";
import Pen from "../rosslib/tools/pen";

const ToolBar = styled.article`
    position: absolute; 
    top: calc(48px + 1rem); 
    left: 1rem; 
    background-color: white; 
    border-radius: 1rem; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    height: 400px; 
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

export default function Toolbar() {
    return (
        <ToolBar>
            <h4>Tools</h4>
            <Tools>
                <button>Line</button>
                <button onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Pen(gl, canvasObj)))}>Pen</button>
                <button>Curve</button>
                <button onClick={() => PaintApp.Get().SetTool(PaintApp.Get().HelperCreateTool((gl, canvasObj) => new Fill(gl, canvasObj)))}>Fill Bucket</button>
            </Tools>
        </ToolBar>
    );
}