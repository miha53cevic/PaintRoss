import styled from "styled-components";

const ColorPickerArea = styled.article`
    position: absolute; bottom: calc(1rem); left: 1rem; background-color: white; border-radius: 1rem; display: flex; flex-direction: column; align-items: center; height: 200px; width: 300px; padding: 1rem; gap: 1rem;
`;

export default function ColorPicker() {
    return (
        <ColorPickerArea>
            <h4>Colors</h4>
        </ColorPickerArea>
    );
}