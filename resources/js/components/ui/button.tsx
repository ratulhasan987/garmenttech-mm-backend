import {
    forwardRef,
    type ButtonHTMLAttributes,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'light'
    | 'dark';

export type ButtonAppearance =
    | 'solid'
    | 'outline'
    | 'outline-bold'
    | 'gradient';

export type ButtonSize =
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg';

export type ButtonProps =
    ButtonHTMLAttributes<HTMLButtonElement> & {
        /**
         * Bootstrap / Riho color.
         *
         * Default: primary
         */
        variant?: ButtonVariant;

        /**
         * Button visual style.
         *
         * solid:
         * btn-primary
         *
         * outline:
         * btn-outline-primary
         *
         * outline-bold:
         * btn-outline-primary-2x
         *
         * gradient:
         * btn-primary-gradien
         *
         * Default: solid
         */
        appearance?: ButtonAppearance;

        /**
         * Button size.
         *
         * md = Bootstrap default size.
         */
        size?: ButtonSize;

        /**
         * Displays active Bootstrap state.
         */
        active?: boolean;

        /**
         * Makes the button take full width.
         */
        fullWidth?: boolean;

        /**
         * Async/loading state.
         *
         * Automatically disables the button.
         */
        loading?: boolean;

        /**
         * Optional text displayed while loading.
         */
        loadingText?: ReactNode;

        /**
         * Optional content before button text.
         *
         * Example:
         * <Plus />
         */
        leftIcon?: ReactNode;

        /**
         * Optional content after button text.
         */
        rightIcon?: ReactNode;
    };

function getVariantClass(
    variant: ButtonVariant,
    appearance: ButtonAppearance,
) {
    switch (appearance) {
        case 'outline':
            return `btn-outline-${variant}`;

        case 'outline-bold':
            return `btn-outline-${variant}-2x`;

        case 'gradient':
            return `btn-${variant}-gradien`;

        case 'solid':
        default:
            return `btn-${variant}`;
    }
}

function getSizeClass(size: ButtonSize) {
    switch (size) {
        case 'xs':
            return 'btn-xs';

        case 'sm':
            return 'btn-sm';

        case 'lg':
            return 'btn-lg';

        case 'md':
        default:
            return undefined;
    }
}

export const Button = forwardRef<
    HTMLButtonElement,
    ButtonProps
>(
    (
        {
            children,

            type = 'button',

            variant = 'primary',
            appearance = 'solid',
            size = 'md',

            active = false,
            fullWidth = false,

            loading = false,
            loadingText,

            leftIcon,
            rightIcon,

            disabled,
            className,

            ...props
        },
        ref,
    ) => {
        const isDisabled =
            disabled || loading;

        return (
            <button
                ref={ref}
                type={type}
                disabled={isDisabled}
                aria-disabled={
                    isDisabled || undefined
                }
                aria-busy={
                    loading || undefined
                }
                className={cn(
                    'btn',

                    getVariantClass(
                        variant,
                        appearance,
                    ),

                    getSizeClass(size),

                    active && 'active',

                    fullWidth && 'w-100',

                    (leftIcon || rightIcon) &&
                    'd-inline-flex align-items-center justify-content-center',

                    variant === 'light' &&
                    'txt-dark',

                    className,
                )}
                {...props}
            >
                {loading ? (
                    <>
                        <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                        />

                        {loadingText ??
                            children}
                    </>
                ) : (
                    <>
                        {leftIcon && (
                            <span className="d-inline-flex align-items-center me-2">
                                {leftIcon}
                            </span>
                        )}

                        {children}

                        {rightIcon && (
                            <span className="d-inline-flex align-items-center ms-2">
                                {rightIcon}
                            </span>
                        )}
                    </>
                )}
            </button>
        );
    },
);

Button.displayName = 'Button';
