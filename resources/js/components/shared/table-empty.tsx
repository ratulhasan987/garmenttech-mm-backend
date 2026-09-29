import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { TableCell, TableRow } from '@/components/ui/table';

type TableEmptyProps = {
    colSpan: number;

    image?: string;

    title?: ReactNode;

    description?: ReactNode;

    action?: ReactNode;

    imageWidth?: number;

    className?: string;
};

export function TableEmpty({
    colSpan,
    image = '/riho/assets/images/empty.png',
    title = 'No Data Found',
    description = 'There is no data available to display.',
    action,
    imageWidth = 200,
    className,
}: TableEmptyProps) {
    return (
        <TableRow>
            <TableCell
                colSpan={colSpan}
                className={cn(
                    'text-center py-5 border-bottom-0',
                    className,
                )}
            >
                <div className="d-flex flex-column align-items-center justify-content-center">
                    {image && (
                        <img
                            src={image}
                            alt=""
                            aria-hidden="true"
                            className="img-fluid mb-3"
                            style={{
                                width: `${imageWidth}px`,
                                maxWidth: '100%',
                            }}
                        />
                    )}

                    {title && (
                        <h5 className="mb-1">
                            {title}
                        </h5>
                    )}

                    {description && (
                        <p className="f-light mb-0">
                            {description}
                        </p>
                    )}

                    {action && (
                        <div className="mt-3">
                            {action}
                        </div>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
