import '@inertiajs/core';

import type { SharedData } from '@/types';

declare module '@inertiajs/core' {
    interface PageProps extends SharedData {}
}
