export function rihoAsset(path: string): string {
    return `/riho/assets/${path.replace(/^\/+/, '')}`;
}
