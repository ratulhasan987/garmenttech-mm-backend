import type { SharedData } from '@/types';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    interface InertiaConfig {
        sharedPageProps: SharedData;
    }
}

declare global {
    interface Window {
        appConfig: {
            name: string;
        };
    }
}

export {};
