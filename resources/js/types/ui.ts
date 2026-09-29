import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import type {
    Notification,
} from '@/types';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';



export type FlashToast =
    Notification;
export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};
