import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

export function DropdownItem({ children, className, ...props }: DropdownItemProps) {
    return (
        <button
            className={
                'border-none bg-slate-950 text-inherit cursor-inherit p-4 hover:bg-slate-600 min-w-[150px] ' + className
            }
            {...props}
        >
            {children}
        </button>
    );
}

export interface FileInputProps extends InputHTMLAttributes<HTMLInputElement> {
    type: 'file';
    inputRef?: React.RefObject<HTMLInputElement>;
}

export function FileInput({ type, inputRef, ...props }: FileInputProps) {
    return <input type={type} {...props} ref={inputRef} />;
}

export interface DropdownProps {
    children?: ReactNode;
    title: string;
}

export function Dropdown({ children, title }: DropdownProps) {
    return (
        <div className='relative p-4 cursor-pointer hover:bg-slate-700 flex items-center group'>
            <h4 className='border-none bg-inherit text-inherit'>{title}</h4>
            <div className={`hidden absolute top-[48px] left-0 z-50 group-hover:block`}>{children}</div>
        </div>
    );
}
