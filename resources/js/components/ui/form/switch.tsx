import {
    forwardRef,
    type InputHTMLAttributes,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type SwitchProps =
    Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'type'
    > & {
        label?: ReactNode;

        error?: string;
    };

export const Switch =
    forwardRef<
        HTMLInputElement,
        SwitchProps
    >(
        (
            {
                id,
                label,
                error,
                className,
                ...props
            },
            ref,
        ) => {
            return (
                <div className="form-check form-switch">
                    <input
                        ref={ref}
                        id={id}
                        type="checkbox"
                        role="switch"
                        className={cn(
                            'form-check-input',

                            error &&
                            'is-invalid',

                            className,
                        )}
                        {...props}
                    />

                    {label && (
                        <label
                            htmlFor={id}
                            className="form-check-label"
                        >
                            {label}
                        </label>
                    )}

                    {error && (
                        <div className="invalid-feedback d-block">
                            {error}
                        </div>
                    )}
                </div>
            );
        },
    );

Switch.displayName = 'Switch';
