import {
    forwardRef,
    type InputHTMLAttributes,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type CheckboxProps =
    Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'type'
    > & {
        label?: ReactNode;

        error?: string;
    };

export const Checkbox =
    forwardRef<
        HTMLInputElement,
        CheckboxProps
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
                <div className="form-check checkbox-checked">
                    <input
                        ref={ref}
                        id={id}
                        type="checkbox"
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
                            className="form-check-label"
                            htmlFor={id}
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

Checkbox.displayName =
    'Checkbox';
