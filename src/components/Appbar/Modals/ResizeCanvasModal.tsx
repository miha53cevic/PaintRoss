import { useEffect } from "react";
import { useForm } from "react-hook-form";
import PaintApp from "../../../rosslib";
import { CanvasAnchor } from "../../../rosslib/objects/canvasObject";
import Modal from "../../Modal";

interface ResizeCanvasFormData {
    width: number,
    height: number,
    anchor: CanvasAnchor,
}

export interface Props {
    open: boolean,
    handleClose: () => void,
}

export default function ResizeCanvasModal({ open, handleClose }: Props) {
    const { handleSubmit, register, setValue } = useForm<ResizeCanvasFormData>({
        defaultValues: {
            width: PaintApp.Get().GetCanvasImageSize()[0],
            height: PaintApp.Get().GetCanvasImageSize()[1],
        }
    });

    useEffect(() => {
        PaintApp.Get().GetCanvasObject().Subscribe('SizeChanged', (canvasObject) => {
            setValue('width', canvasObject.Size[0]);
            setValue('height', canvasObject.Size[1]);
        });
    }, [setValue]);

    const onResizeImageSubmit = (data: ResizeCanvasFormData) => {
        PaintApp.Get().ResizeCanvasWithAnchor(data.anchor, data.width, data.height);
    };

    return (
        <Modal open={open} handleClose={handleClose}
            title="Resize Canvas"
            submitButtonText="Resize"
            forForm="resizeCanvasForm"
        >
            <form id="resizeCanvasForm" className="flex flex-col gap-4" onSubmit={handleSubmit(onResizeImageSubmit)}>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <p>Width</p>
                            </td>
                            <td>
                                <input type="number" {...register('width', { valueAsNumber: true })} className="text-slate-800 w-full" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Height</p>
                            </td>
                            <td>
                                <input type="number" {...register('height', { valueAsNumber: true })} className="text-slate-800 w-full" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Anchor</p>
                            </td>
                            <td>
                                <select {...register('anchor')} className="text-slate-800 w-full">
                                    {Object.keys(CanvasAnchor).map(option => (
                                        <option key={option}>{option}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </Modal>
    );
}