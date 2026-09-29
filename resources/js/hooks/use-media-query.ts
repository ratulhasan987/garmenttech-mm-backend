import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);

        // modern + fallback
        media.addEventListener?.('change', listener);
        media.addListener?.(listener);

        return () => {
            media.removeEventListener?.('change', listener);
            media.removeListener?.(listener);
        };
    }, [query]);

    return matches;
}
