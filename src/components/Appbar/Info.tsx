import { ReactNode } from 'react';

export function Info({ children }: { children: ReactNode }) {
    return <div className='flex flex-row gap-4'>{children}</div>;
}

export function InfoItem({ children }: { children: ReactNode }) {
    return <div className='p-4'>{children}</div>;
}
