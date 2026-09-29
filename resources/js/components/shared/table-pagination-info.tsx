import { cn } from '@/lib/utils';

type TablePaginationInfoProps = {
    from: number;
    to: number;
    total: number;

    label?: string;

    className?: string;
};

export function TablePaginationInfo({
    from,
    to,
    total,
    label = 'Records',
    className,
}: TablePaginationInfoProps) {
    return (
        <div
            className={cn(
                'f-light',
                className,
            )}
        >
            Showing{' '}
            <strong>{from}</strong>{' '}
            to{' '}
            <strong>{to}</strong>{' '}
            of{' '}
            <strong>{total}</strong>{' '}
            {label}
        </div>
    );
}
