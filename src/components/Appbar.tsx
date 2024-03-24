import styled from "styled-components";
import PaintApp from "../rosslib";
import { useEffect, useRef } from "react";

const appBarHeight = "48px";

const Nav = styled.nav`
    width: 100%; 
    height: ${appBarHeight}; 
    background-color: #212121; 
    display: flex;
    flex-direction: row;
    gap: 1rem;
`;

const DropdownTitle = styled.div`
    border: none;
    background: inherit;
    color: inherit;
`;

const DropdownContent = styled.div`
    display: none;
    position: absolute;
    top: ${appBarHeight};
    left: 0;
    z-index: 999;
`;

const Dropdown = styled.div`
    position: relative;
    color: #aaa;
    padding: 1rem;
    cursor: pointer;
    &:hover {
        background-color: #515151;
    }
    &:hover ${DropdownContent} {
        display: block;
    }
`;

const DropdownItem = styled.button`
    border: none;
    background-color: #212121;
    color: inherit;
    cursor: inherit;
    padding: 1rem;
    &:hover {
        background-color: #515151;
    }
    min-width: 150px;
`;

const FileInput = styled.input`
    display: none;
`;

export default function AppBar() {
    const openImageRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!openImageRef.current) return;
        openImageRef.current.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const result = e.target?.result as string;
                    PaintApp.Get().LoadImage(result);
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }, []);

    const handleOpenImage = () => {
        if (!openImageRef.current) return;
        openImageRef.current.click();
    };
    const handleSaveImage = () => {
        const source = PaintApp.Get().GetCanvasImage();
        window.open(source);
    };


    return (
        <Nav>
            <Dropdown>
                <DropdownTitle>File</DropdownTitle>
                <DropdownContent>
                    <DropdownItem onClick={handleOpenImage}>
                        Open Image
                        <FileInput type="file" accept="image/*" ref={openImageRef} />
                    </DropdownItem>
                    <DropdownItem onClick={handleSaveImage}>Save Image</DropdownItem>
                </DropdownContent>
            </Dropdown>
            <Dropdown>
                <DropdownTitle>Edit</DropdownTitle>
                <DropdownContent>
                    <DropdownItem>Option1</DropdownItem>
                    <DropdownItem>Option2</DropdownItem>
                </DropdownContent>
            </Dropdown>
            <Dropdown>
                <DropdownTitle>Image</DropdownTitle>
                <DropdownContent>
                    <DropdownItem>Option1</DropdownItem>
                    <DropdownItem>Option2</DropdownItem>
                </DropdownContent>
            </Dropdown>
            <Dropdown>
                <DropdownTitle>Help</DropdownTitle>
                <DropdownContent>
                    <DropdownItem>About</DropdownItem>
                </DropdownContent>
            </Dropdown>
        </Nav>
    );
}