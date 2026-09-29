export function asset(path?: string | null): string | null {
    if (!path) {
        return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}
