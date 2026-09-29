import {
    forwardRef,
    type InputHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

export type InputSize =
    | 'sm'
    | 'md'
    | 'lg';

export type InputAppearance =
    | 'default'
    | 'flat'
    | 'pill'
    | 'raised';

export type InputProps =
    Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'size'
    > & {
        error?: string;

        size?: InputSize;

        appearance?: InputAppearance;
    };

function getSizeClass(
    size: InputSize,
) {
    switch (size) {
        case 'sm':
            return 'form-control-sm';

        case 'lg':
            return 'form-control-lg';

        default:
            return undefined;
    }
}

function getAppearanceClass(
    appearance: InputAppearance,
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

export const Input =
    forwardRef<HTMLInputElement, InputProps>(
        (
            {
                error,
                size = 'md',
                appearance = 'default',
                className,
                ...props
            },
            ref,
        ) => {
            return (
                <input
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
                />
            );
        },
    );

Input.displayName = 'Input';
