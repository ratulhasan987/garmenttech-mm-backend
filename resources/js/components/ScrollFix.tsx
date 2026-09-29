import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function ScrollFix() {
    const { url } = usePage();

    useEffect(() => {
        const cleanup = () => {
            /*
            |--------------------------------------------------------------------------
            | Bootstrap modal / offcanvas cleanup
            |--------------------------------------------------------------------------
            */

            document.body.classList.remove(
                'modal-open',
                'offcanvas-open',
            );

            document.documentElement.classList.remove(
                'modal-open',
                'offcanvas-open',
            );

            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');

            document.documentElement.style.removeProperty('overflow');

            /*
            |--------------------------------------------------------------------------
            | Remove stale Bootstrap backdrops
            |--------------------------------------------------------------------------
            */

            document
                .querySelectorAll(
                    '.modal-backdrop, .offcanvas-backdrop',
                )
                .forEach((element) => {
                    element.remove();
                });

            /*
            |--------------------------------------------------------------------------
            | Restore scroll
            |--------------------------------------------------------------------------
            */

            if (
                document.body.style.overflow === 'hidden'
            ) {
                document.body.style.overflow = '';
            }

            if (
                document.documentElement.style.overflow ===
                'hidden'
            ) {
                document.documentElement.style.overflow = '';
            }
        };

        cleanup();

        const timer = window.setTimeout(
            cleanup,
            100,
        );

        return () => {
            window.clearTimeout(timer);
        };
    }, [url]);

    return null;
}
