import { useEffect, useRef } from "react";

export interface Props {
    open: boolean,
    handleClose: () => void,
    title?: string,
    content?: string,
    submitButtonText?: string,
    forForm?: string,
    children?: React.ReactNode,
}

export default function Modal({ open, handleClose, title, content, submitButtonText, forForm, children }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) openDialog();
    }, [open]);

    const openDialog = () => {
        dialogRef.current?.showModal();
    };

    const closeDialog = () => {
        dialogRef.current?.close();
        handleClose();
    };

    return (
        <dialog
            ref={dialogRef}
            className="w-1/3 p-6 bg-slate-950 rounded shadow-lg text-gray-100"
        >
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-gray-400">{content}</p>
            {children}
            <div className="mt-4 flex justify-end gap-3">
                {submitButtonText &&
                    <button
                        className="px-4 py-2 bg-slate-900 rounded hover:bg-slate-800"
                        type="submit"
                        form={forForm}
                        onClick={closeDialog}
                    >
                        {submitButtonText}
                    </button>
                }
                <button
                    onClick={closeDialog}
                    className="px-4 py-2 bg-slate-900 rounded hover:bg-slate-800"
                >
                    Close
                </button>
            </div>
        </dialog>
    );
}
