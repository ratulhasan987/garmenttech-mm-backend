import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx, type ClassValue } from 'clsx';

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

