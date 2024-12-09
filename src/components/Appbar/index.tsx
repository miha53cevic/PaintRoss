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
    const handleSaveImage = async () => {
        const blobImage = await PaintApp.Get().GetCanvasImage();
        const blobUrl = URL.createObjectURL(blobImage);
        window.open(blobUrl, '_blank');
    };

    const [canvasMousePos, setCanvasMousePos] = useState<[number, number] | [undefined, undefined]>([undefined, undefined]);
    useEffect(() => {
        PaintApp.Get().GetEventManager().Subscribe('ChangeCanvasCoordinates', () => {
            setCanvasMousePos(PaintApp.Get().GetCanvasMousePosition());
        });
    }, []);

    const [currentTool, setCurrentTool] = useState<string>('Pen');
    useEffect(() => {
        PaintApp.Get().GetEventManager().Subscribe('ChangeTool', (toolId) => {
            setCurrentTool(toolId as string);
        });
    }, []);

    return (
        <div>
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
                        <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('Grayscale')}>Grayscale</DropdownItem>
                        <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('InvertColors')}>Invert colours</DropdownItem>
                        <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('GaussianBlur')}>Blur</DropdownItem>
                        <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('BoxBlur')}>Box Blur</DropdownItem>
                        <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('Sharpen')}>Sharpen</DropdownItem>
                        <DropdownItem onClick={() => PaintApp.Get().ApplyImageEffect('EdgeDetect')}>Edge detect</DropdownItem>
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
            <nav className="w-full h-6 bg-slate-900 text-slate-400 flex flex-row" key={currentTool}>
                {PaintApp.Get().GetTool()?.GetOptions().GetAllOptions().map((option) => {
                    return (
                        <div key={option.Name} className="flex flex-row items-center p-2 gap-2">
                            <span className="font-bold">{option.Name}</span>
                            {option.Type === 'number' && <input type="number" defaultValue={option.Value as number} className="w-12" onChange={(e) => PaintApp.Get().GetTool()!.GetOptions().SetOption(option.Name, e.target.valueAsNumber)} />}
                            {option.Type === 'string' && <input type="text" defaultValue={option.Value as string} onChange={(e) => PaintApp.Get().GetTool()!.GetOptions().SetOption(option.Name, e.target.value)} />}
                            {option.Type === 'boolean' && <input type="checkbox" defaultChecked={option.Value as boolean} onChange={(e) => PaintApp.Get().GetTool()!.GetOptions().SetOption(option.Name, e.target.checked)} />}
                            {option.Type === 'select' &&
                                <select defaultValue={option.Value as string} onChange={(e) => PaintApp.Get().GetTool()!.GetOptions().SetOption(option.Name, e.target.value)}>
                                    {option.PossibleValues!.map((possibleValue) => <option key={possibleValue as string} value={possibleValue as string}>{possibleValue as string}</option>)}
                                </select>
                            }
                        </div>
                    )
                })}
            </nav>
        </div>
    );
}