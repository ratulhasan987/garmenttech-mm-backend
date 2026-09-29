import {
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

export type ProgressVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'light'
    | 'dark';

export type ProgressSize =
    | 'sm'
    | 'md'
    | 'lg';

export type ProgressBarClassNames = {
    root?: string;
    bar?: string;
    label?: string;
};

export interface ProgressBarProps
    extends Omit<
        HTMLAttributes<HTMLDivElement>,
        'children'
    > {
    /**
     * Current progress value.
     *
     * Example:
     * 75
     */
    value: number;

    /**
     * Minimum progress value.
     */
    min?: number;

    /**
     * Maximum progress value.
     */
    max?: number;

    variant?: ProgressVariant;

    size?: ProgressSize;

    /**
     * Add Bootstrap striped style.
     */
    striped?: boolean;

    /**
     * Animate the stripe.
     *
     * `striped` will automatically
     * be enabled when animated=true.
     */
    animated?: boolean;

    /**
     * Show percentage inside the bar.
     */
    showValue?: boolean;

    /**
     * Custom label instead of percentage.
     */
    label?: ReactNode;

    /**
     * Custom progress height.
     *
     * Example:
     * 5
     * "8px"
     */
    height?: number | string;

    /**
     * Rounded progress bar.
     */
    rounded?: boolean;

    /**
     * Classes for individual parts.
     */
    classNames?: ProgressBarClassNames;

    /**
     * Optional style for inner bar.
     */
    barStyle?: CSSProperties;
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function clamp(
    value: number,
    min: number,
    max: number,
) {
    return Math.min(
        Math.max(
            value,
            min,
        ),
        max,
    );
}

function getPercentage(
    value: number,
    min: number,
    max: number,
) {
    if (
        max <= min
    ) {
        return 0;
    }

    const percentage =
        ((value - min) /
            (max - min)) *
        100;

    return clamp(
        percentage,
        0,
        100,
    );
}

function getSizeClass(
    size: ProgressSize,
) {
    switch (size) {
        case 'sm':
            return 'sm-progress-bar';

        case 'lg':
            return 'lg-progress-bar';

        default:
            return undefined;
    }
}

function resolveHeight(
    height?: number | string,
): string | undefined {
    if (
        height === undefined
    ) {
        return undefined;
    }

    if (
        typeof height ===
        'number'
    ) {
        return `${height}px`;
    }

    return height;
}

/*
|--------------------------------------------------------------------------
| ProgressBar
|--------------------------------------------------------------------------
*/

export function ProgressBar({
    value,

    min = 0,

    max = 100,

    variant = 'primary',

    size = 'md',

    striped = false,

    animated = false,

    showValue = false,

    label,

    height,

    rounded = false,

    className,

    classNames,

    barStyle,

    ...props
}: ProgressBarProps) {
    const safeValue =
        clamp(
            value,
            min,
            max,
        );

    const percentage =
        getPercentage(
            safeValue,
            min,
            max,
        );

    const displayPercentage =
        Math.round(
            percentage,
        );

    const resolvedHeight =
        resolveHeight(
            height,
        );

    return (
        <div
            className={cn(
                'progress',

                getSizeClass(
                    size,
                ),

                rounded &&
                'rounded-pill',

                className,

                classNames?.root,
            )}
            style={{
                ...(resolvedHeight
                    ? {
                        height:
                            resolvedHeight,
                    }
                    : {}),
            }}
            {...props}
        >
            <div
                className={cn(
                    'progress-bar',

                    `bg-${variant}`,

                    (
                        striped ||
                        animated
                    ) &&
                    'progress-bar-striped',

                    animated &&
                    'progress-bar-animated',

                    rounded &&
                    'rounded-pill',

                    classNames?.bar,
                )}
                role="progressbar"
                aria-valuenow={
                    safeValue
                }
                aria-valuemin={
                    min
                }
                aria-valuemax={
                    max
                }
                style={{
                    width: `${percentage}%`,

                    ...barStyle,
                }}
            >
                {(label ||
                    showValue) && (
                        <span
                            className={cn(
                                'text-center',

                                classNames?.label,
                            )}
                        >
                            {label ??
                                `${displayPercentage}%`}
                        </span>
                    )}
            </div>
        </div>
    );
}
