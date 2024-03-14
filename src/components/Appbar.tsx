import styled from "styled-components";

const Nav = styled.nav`
    width: 100vw; 
    height: 48px; 
    background-color: white; 
    display: flex; 
    flex-direction: column;
`;

const OptionsHeader = styled.section`
    display: flex; 
    gap: 1rem; 
    margin-left: 1rem; 
    flex: 1; 
    align-items: center;
`;

const ActionsHeader = styled.section`
    display: flex; 
    gap: 1rem; 
    margin-left: 1rem; 
    flex: 1; 
    align-items: center;
`;

export default function AppBar() {
    return (
        <Nav>
            <OptionsHeader>
                <div>File</div>
                <div>View</div>
                <div>Image</div>
            </OptionsHeader>
            <ActionsHeader>
                <div>New Icon</div>
                <div>Save Icon</div>
                <div>Load Icon</div>
            </ActionsHeader>
        </Nav>
    );
}