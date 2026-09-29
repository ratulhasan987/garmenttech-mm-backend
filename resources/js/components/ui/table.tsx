import {
    type ComponentPropsWithoutRef,
    CSSProperties,
    forwardRef,
} from 'react';

import { cn } from '@/lib/utils';

type TableProps =
    ComponentPropsWithoutRef<'table'> & {
        wrapperClassName?: string;
        wrapperStyle?: CSSProperties;

        /**
         * Prevent table cell content from wrapping.
         *
         * Default: true
         */
        nowrap?: boolean;
    };

export const Table = forwardRef<
    HTMLTableElement,
    TableProps
>(
    (
        {
            className,
            wrapperClassName,
            wrapperStyle,
            children,
            nowrap = true,
            ...props
        },
        ref,
    ) => {
        return (
            <div
                className={cn(
                    'table-responsive',
                    wrapperClassName,
                )}
                style={wrapperStyle}
            >
                <table
                    ref={ref}
                    className={cn(
                        'table',
                        nowrap && 'text-nowrap',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </table>
            </div>
        );
    },
);

Table.displayName = 'Table';

export function TableHeader({
    className,
    ...props
}: ComponentPropsWithoutRef<'thead'>) {
    return (
        <thead
            className={cn(
                'text-gray',
                className,
            )}
            {...props}
        />
    );
}

export function TableBody({
    className,
    ...props
}: ComponentPropsWithoutRef<'tbody'>) {
    return (
        <tbody
            className={cn(
                className,
            )}
            {...props}
        />
    );
}

export function TableRow({
    className,
    ...props
}: ComponentPropsWithoutRef<'tr'>) {
    return (
        <tr
            className={cn(
                className,
            )}
            {...props}
        />
    );
}


type TableHeadProps =
    ComponentPropsWithoutRef<'th'> & {
        sticky?: boolean;
    };

export function TableHead({
    className,
    sticky = false,
    ...props
}: TableHeadProps) {
    return (
        <th
            className={cn(
                sticky &&
                'position-sticky top-0 z-1 table-sticky-head',
                className,
            )}
            {...props}
        />
    );
}

export function TableCell({
    className,
    ...props
}: ComponentPropsWithoutRef<'td'>) {
    return (
        <td
            className={cn(
                className,
            )}
            {...props}
        />
    );
}
