import {
    type ComponentPropsWithoutRef,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

export type CardVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'light'
    | 'dark';

type CardProps =
    ComponentPropsWithoutRef<'div'> & {
        /**
         * Remove card border radius.
         */
        flat?: boolean;

        /**
         * Add Bootstrap border.
         */
        bordered?: boolean;

        /**
         * Enable/disable card shadow.
         *
         * Default: true
         */
        shadow?: boolean;
    };

export function Card({
    children,
    flat = false,
    bordered = false,
    shadow = true,
    className,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'card',

                flat && 'b-r-0',

                bordered && 'border',

                !shadow && 'shadow-none',

                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Card Header
|--------------------------------------------------------------------------
*/

type CardHeaderProps =
    ComponentPropsWithoutRef<'div'> & {
        title?: ReactNode;

        description?: ReactNode;

        icon?: ReactNode;

        actions?: ReactNode;

        variant?: CardVariant;
    };

export function CardHeader({
    title,
    description,
    icon,
    actions,
    variant,
    children,
    className,
    ...props
}: CardHeaderProps) {
    const isDarkBackground =
        variant &&
        variant !== 'light' &&
        variant !== 'warning';

    return (
        <div
            className={cn(
                'card-header',

                variant &&
                `bg-${variant}`,

                className,
            )}
            {...props}
        >
            {(title ||
                description ||
                icon ||
                actions) && (
                    <>
                        <div className="d-flex align-items-start justify-content-between gap-3">
                            <div>
                                {title && (
                                    <h4
                                        className={cn(
                                            'mb-0',

                                            isDarkBackground &&
                                            'text-white',
                                        )}
                                    >
                                        {icon && (
                                            <span className="me-2">
                                                {icon}
                                            </span>
                                        )}

                                        {title}
                                    </h4>
                                )}

                                {description && (
                                    <p
                                        className={cn(
                                            'f-m-light mt-1 mb-0',

                                            isDarkBackground &&
                                            'text-white',
                                        )}
                                    >
                                        {
                                            description
                                        }
                                    </p>
                                )}
                            </div>

                            {actions && (
                                <div className="flex-shrink-0">
                                    {
                                        actions
                                    }
                                </div>
                            )}
                        </div>
                    </>
                )}

            {children}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Card Body
|--------------------------------------------------------------------------
*/

type CardBodyProps =
    ComponentPropsWithoutRef<'div'> & {
        variant?: CardVariant;
    };

export function CardBody({
    children,
    variant,
    className,
    ...props
}: CardBodyProps) {
    const isDarkBackground =
        variant &&
        variant !== 'light' &&
        variant !== 'warning';

    return (
        <div
            className={cn(
                'card-body',

                variant &&
                `bg-${variant}`,

                isDarkBackground &&
                'text-white',

                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Card Footer
|--------------------------------------------------------------------------
*/

type CardFooterProps =
    ComponentPropsWithoutRef<'div'> & {
        variant?: CardVariant;
    };

export function CardFooter({
    children,
    variant,
    className,
    ...props
}: CardFooterProps) {
    const isDarkBackground =
        variant &&
        variant !== 'light' &&
        variant !== 'warning';

    return (
        <div
            className={cn(
                'card-footer',

                variant &&
                `bg-${variant}`,

                isDarkBackground &&
                'text-white',

                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
