import {
    type HTMLAttributes,
    type LabelHTMLAttributes,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type FormFieldProps =
    HTMLAttributes<HTMLDivElement>;

export function FormField({
    className,
    ...props
}: FormFieldProps) {
    return (
        <div
            className={cn(
                'mb-3',
                className,
            )}
            {...props}
        />
    );
}

type FormLabelProps =
    LabelHTMLAttributes<HTMLLabelElement> & {
        required?: boolean;
    };

export function FormLabel({
    children,
    required = false,
    className,
    ...props
}: FormLabelProps) {
    return (
        <label
            className={cn(
                'form-label',
                className,
            )}
            {...props}
        >
            {children}

            {required && (
                <span className="text-danger ms-1">
                    *
                </span>
            )}
        </label>
    );
}

type FormErrorProps = {
    error?: string;

    className?: string;
};

export function FormError({
    error,
    className,
}: FormErrorProps) {
    if (!error) {
        return null;
    }

    return (
        <div
            className={cn(
                'invalid-feedback d-block',
                className,
            )}
        >
            {error}
        </div>
    );
}

type FormHintProps = {
    children?: ReactNode;

    className?: string;
};

export function FormHint({
    children,
    className,
}: FormHintProps) {
    if (!children) {
        return null;
    }

    return (
        <div
            className={cn(
                'form-text',
                className,
            )}
        >
            {children}
        </div>
    );
}
