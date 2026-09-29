import {
    forwardRef,
    type SelectHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

export type SelectSize =
    | 'sm'
    | 'md'
    | 'lg';

export type SelectAppearance =
    | 'default'
    | 'flat'
    | 'pill'
    | 'raised';

export type SelectProps =
    Omit<
        SelectHTMLAttributes<HTMLSelectElement>,
        'size'
    > & {
        error?: string;

        size?: SelectSize;

        appearance?: SelectAppearance;
    };

function getSizeClass(
    size: SelectSize,
) {
    switch (size) {
        case 'sm':
            return 'form-select-sm';

        case 'lg':
            return 'form-select-lg';

        default:
            return undefined;
    }
}

function getAppearanceClass(
    appearance: SelectAppearance,
) {
    switch (appearance) {
        case 'flat':
            return 'btn-square';

        case 'pill':
            return 'btn-pill';

        case 'raised':
            return 'input-air-primary';

        default:
            return undefined;
    }
}

export const Select =
    forwardRef<
        HTMLSelectElement,
        SelectProps
    >(
        (
            {
                error,
                size = 'md',
                appearance = 'default',
                className,
                children,
                ...props
            },
            ref,
        ) => {
            return (
                <select
                    ref={ref}
                    className={cn(
                        'form-control',

                        getSizeClass(
                            size,
                        ),

                        getAppearanceClass(
                            appearance,
                        ),

                        error &&
                        'is-invalid',

                        className,
                    )}
                    aria-invalid={
                        error
                            ? true
                            : undefined
                    }
                    {...props}
                >
                    {children}
                </select>
            );
        },
    );

Select.displayName = 'Select';
