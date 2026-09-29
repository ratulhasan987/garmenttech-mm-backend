import {
    forwardRef,
    type ComponentPropsWithoutRef,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

export type BadgeVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'light'
    | 'dark';

type BadgeProps =
    ComponentPropsWithoutRef<'span'> & {
        variant?: BadgeVariant;

        /**
         * Makes the badge pill-shaped.
         */
        pill?: boolean;

        /**
         * Content before the label.
         */
        leftIcon?: ReactNode;

        /**
         * Content after the label.
         */
        rightIcon?: ReactNode;
    };

export const Badge = forwardRef<
    HTMLSpanElement,
    BadgeProps
>(
    (
        {
            variant = 'primary',
            pill = false,
            leftIcon,
            rightIcon,
            children,
            className,
            ...props
        },
        ref,
    ) => {
        return (
            <span
                ref={ref}
                className={cn(
                    'badge',
                    `badge-${variant}`,

                    pill &&
                    'rounded-pill',

                    (
                        variant ===
                        'warning' ||
                        variant ===
                        'light'
                    ) &&
                    'text-dark',

                    (leftIcon ||
                        rightIcon) &&
                    'd-inline-flex align-items-center gap-1',

                    className,
                )}
                {...props}
            >
                {leftIcon}

                {children}

                {rightIcon}
            </span>
        );
    },
);

Badge.displayName = 'Badge';

/*
|--------------------------------------------------------------------------
| Pill
|--------------------------------------------------------------------------
*/

type PillProps = Omit<
    BadgeProps,
    'pill'
>;

export const Pill = forwardRef<
    HTMLSpanElement,
    PillProps
>(
    (
        {
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <Badge
                ref={ref}
                pill
                {...props}
            >
                {children}
            </Badge>
        );
    },
);

Pill.displayName = 'Pill';
