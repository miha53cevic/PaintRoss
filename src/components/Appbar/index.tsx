import { useEffect, useRef, useState } from "react";
import PaintApp from "../../rosslib";
import { Dropdown, DropdownItem, FileInput } from "./Dropdown";
import { Info, InfoItem } from "./Info";

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

    const [canvasMousePos, setCanvasMousePos] = useState<[number, number]>([NaN, NaN]);
    useEffect(() => {
        PaintApp.Get().GetEventManager().Subscribe('change canvas coordinates', () => {
            setCanvasMousePos(PaintApp.Get().GetCanvasMousePosition());
        });
    }, []);

    return (
        <nav className={`w-full h-12 bg-slate-950 text-slate-400 flex flex-row`}>
            <div className="flex-grow flex flex-row">
                <Dropdown
                    title="File"
                >
                    <DropdownItem onClick={handleOpenImage}>
                        Open Image
                        <FileInput className="hidden" type="file" accept="image/*" inputRef={openImageRef} />
                    </DropdownItem>
                    <DropdownItem onClick={handleSaveImage}>Save Image</DropdownItem>
                </Dropdown>
                <Dropdown
                    title="Image Effects"
                >
                    <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('grayscale')}>Grayscale</DropdownItem>
                    <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('invert colors')}>Invert colours</DropdownItem>
                    <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('gaussianBlur')}>Blur</DropdownItem>
                    <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('boxBlur')}>Box Blur</DropdownItem>
                    <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('sharpen')}>Sharpen</DropdownItem>
                    <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('edgeDetect')}>Edge detect</DropdownItem>
                </Dropdown>
                <Dropdown
                    title="Help"
                >
                    <DropdownItem onClick={() => alert('Napravio Mihael Petričević')}>About</DropdownItem>
                </Dropdown>
            </div>
            <Info>
                <InfoItem>
                    {`${canvasMousePos[0]}, ${canvasMousePos[1]}`}
                </InfoItem>
            </Info>
        </nav>
    );
}