import {
    forwardRef,
    type InputHTMLAttributes,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type RadioProps =
    Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'type'
    > & {
        label?: ReactNode;
    };

export const Radio =
    forwardRef<
        HTMLInputElement,
        RadioProps
    >(
        (
            {
                id,
                label,
                className,
                ...props
            },
            ref,
        ) => {
            return (
                <div className="form-check">
                    <input
                        ref={ref}
                        id={id}
                        type="radio"
                        className={cn(
                            'form-check-input',
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
                </div>
            );
        },
    );

Radio.displayName = 'Radio';
