import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PaintApp from '../../../rosslib';
import Modal from '../../Modal';

interface ResizeImageFormData {
    width: number;
    height: number;
}

export interface Props {
    open: boolean;
    handleClose: () => void;
}

export default function ResizeImageModal({ open, handleClose }: Props) {
    const { handleSubmit, register, setValue } = useForm<ResizeImageFormData>({
        defaultValues: {
            width: PaintApp.Get().GetCanvasImageSize()[0],
            height: PaintApp.Get().GetCanvasImageSize()[1],
        },
    });

    useEffect(() => {
        PaintApp.Get()
            .GetEventManager()
            .Subscribe('CanvasObjResize', (newSize) => {
                setValue('width', newSize[0]);
                setValue('height', newSize[1]);
            });
    }, [setValue]);

    const onResizeImageSubmit = (data: ResizeImageFormData) => {
        PaintApp.Get().ResizeCanvasImage(data.width, data.height);
    };

    return (
        <Modal
            open={open}
            handleClose={handleClose}
            title='Resize Image'
            submitButtonText='Resize'
            forForm='resizeImageForm'
        >
            <form id='resizeImageForm' className='flex flex-col gap-4' onSubmit={handleSubmit(onResizeImageSubmit)}>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <p>Width</p>
                            </td>
                            <td>
                                <input
                                    type='number'
                                    {...register('width', { valueAsNumber: true })}
                                    className='text-slate-800 w-full'
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Height</p>
                            </td>
                            <td>
                                <input
                                    type='number'
                                    {...register('height', { valueAsNumber: true })}
                                    className='text-slate-800 w-full'
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </Modal>
    );
}
