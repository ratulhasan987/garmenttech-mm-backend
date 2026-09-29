import '../css/app.css';
import 'flatpickr/dist/flatpickr.min.css';

import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from 'sonner';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from './layouts/app-layout';
import { configureEcho } from '@laravel/echo-react';

configureEcho({
    broadcaster: 'reverb',

    key: import.meta.env.VITE_REVERB_APP_KEY,

    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT),

    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',

    enabledTransports: ['ws'],
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        const appName = window.appConfig?.name || 'Biztech';

        return title ? `${title} | ${appName}` : appName;
    },
    layout: (name) => {
        switch (true) {
            case name === 'login':
                return null;
            case name.startsWith('auth/'):
                return null;
            case name.startsWith('errors/'):
                return null;
            case name.startsWith('dashboard/'):
                return AppLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <>
                {app}

                <Toaster position="top-right" richColors closeButton />
            </>
        );
    },
    progress: {
        color: '#006666',
    },
});

// This will set light / dark mode on load...
initializeTheme();
