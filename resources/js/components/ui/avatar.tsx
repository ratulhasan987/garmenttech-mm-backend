// resources/js/components/ui/avatar.tsx

import {
    type ImgHTMLAttributes,
    type ReactNode,
    useEffect,
    useState,
} from 'react';

import { cn } from '@/lib/utils';

export type AvatarSize =
    | 30
    | 40
    | 50
    | 60
    | 70
    | 80
    | 90
    | 100;

export type AvatarShape =
    | 'circle'
    | 'square'
    | 'rounded'
    | 'rounded-lg';

export type AvatarStatus =
    | 'online'
    | 'away'
    | 'busy'
    | 'offline';

type ImageStatus =
    | 'loading'
    | 'loaded'
    | 'error';

type AvatarClassNames = {
    root?: string;
    image?: string;
    fallback?: string;
    status?: string;
};

export type AvatarProps = Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'size'
> & {
    /**
     * Avatar image URL.
     */
    src?: string | null;

    /**
     * Used for alt text and automatic initials.
     */
    name?: string;

    /**
     * Riho avatar size.
     *
     * Default: 40
     */
    size?: AvatarSize;

    /**
     * Avatar shape.
     *
     * Default: circle
     */
    shape?: AvatarShape;

    /**
     * Optional status indicator.
     */
    status?: AvatarStatus;

    /**
     * Custom fallback.
     *
     * If omitted, initials from name are shown.
     */
    fallback?: ReactNode;

    /**
     * Enable Riho ratio class.
     */
    ratio?: boolean;

    classNames?: AvatarClassNames;
};

function getShapeClass(
    shape: AvatarShape,
) {
    switch (shape) {
        case 'circle':
            return 'rounded-circle';

        case 'rounded':
            return 'b-r-8';

        case 'rounded-lg':
            return 'b-r-30';

        case 'square':
        default:
            return undefined;
    }
}

function getStatusClass(
    status: AvatarStatus,
) {
    switch (status) {
        case 'online':
            return 'bg-success';

        case 'away':
            return 'bg-warning';

        case 'busy':
            return 'bg-danger';

        case 'offline':
            return 'bg-secondary';
    }
}

function getInitials(
    name?: string,
) {
    if (!name?.trim()) {
        return '?';
    }

    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`
        .toUpperCase();
}

export function Avatar({
    src,
    name,
    alt,

    size = 40,

    shape = 'circle',

    status,

    fallback,

    ratio = false,

    className,

    classNames,

    onLoad,
    onError,

    ...props
}: AvatarProps) {
    const [imageStatus, setImageStatus] =
        useState<ImageStatus>(
            src ? 'loading' : 'error',
        );

    useEffect(() => {
        setImageStatus(
            src ? 'loading' : 'error',
        );
    }, [src]);

    const shapeClass =
        getShapeClass(shape);

    const showImage =
        Boolean(src) &&
        imageStatus === 'loaded';

    return (
        <div className="avatars d-inline">
            <div
                className={cn(
                    'avatar position-relative d-inline-flex flex-shrink-0',
                    ratio && 'ratio',
                    classNames?.root,
                )}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                }}
            >
                {/* Fallback */}
                {!showImage && (
                    <div
                        className={cn(
                            'w-100 h-100',
                            'd-flex align-items-center justify-content-center',
                            'overflow-hidden',
                            'bg-light text-dark f-w-600',
                            shapeClass,
                            classNames?.fallback,
                        )}
                        role="img"
                        aria-label={
                            alt ??
                            name ??
                            'Avatar'
                        }
                    >
                        {fallback ??
                            getInitials(name)}
                    </div>
                )}

                {/* Image */}
                {src &&
                    imageStatus !==
                    'error' && (
                        <img
                            src={src}
                            alt={
                                alt ??
                                name ??
                                'Avatar'
                            }
                            width={size}
                            height={size}
                            className={cn(
                                'w-100 h-100',
                                'object-fit-cover',
                                shapeClass,

                                !showImage &&
                                'd-none',

                                classNames?.image,
                                className,
                            )}
                            onLoad={(event) => {
                                setImageStatus(
                                    'loaded',
                                );

                                onLoad?.(
                                    event,
                                );
                            }}
                            onError={(event) => {
                                setImageStatus(
                                    'error',
                                );

                                onError?.(
                                    event,
                                );
                            }}
                            {...props}
                        />
                    )}

                {status && (
                    <span
                        className={cn(
                            'status',
                            getStatusClass(
                                status,
                            ),
                            classNames?.status,
                        )}
                        aria-label={
                            status
                        }
                    />
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Avatar Group
|--------------------------------------------------------------------------
*/

type AvatarGroupProps = {
    children: ReactNode;

    className?: string;
};

export function AvatarGroup({
    children,
    className,
}: AvatarGroupProps) {
    return (
        <div
            className={cn(
                'customers d-inline-block avatar-group',
                className,
            )}
        >
            <ul className="mb-0 p-0">
                {children}
            </ul>
        </div>
    );
}

type AvatarGroupItemProps = {
    children: ReactNode;

    className?: string;
};

export function AvatarGroupItem({
    children,
    className,
}: AvatarGroupItemProps) {
    return (
        <li
            className={cn(
                'd-inline-block',
                className,
            )}
        >
            {children}
        </li>
    );
}
