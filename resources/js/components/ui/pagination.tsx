import { cn } from '@/lib/utils';

type PaginationVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'dark';

type PaginationSize =
    | 'sm'
    | 'md'
    | 'lg';

type PaginationProps = {
    currentPage: number;
    lastPage: number;

    onPageChange: (page: number) => void;

    variant?: PaginationVariant;
    size?: PaginationSize;
    className?: string;
};

export function Pagination({
    currentPage,
    lastPage,
    onPageChange,
    variant = 'primary',
    size = 'md',
    className,
}: PaginationProps) {
    if (lastPage <= 1) {
        return null;
    }

    const getPageNumbers = (): Array<number | '...'> => {
        const pages: Array<number | '...'> = [];

        if (lastPage <= 7) {
            for (let page = 1; page <= lastPage; page++) {
                pages.push(page);
            }

            return pages;
        }

        pages.push(1);

        if (currentPage > 3) {
            pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(lastPage - 1, currentPage + 1);

        for (let page = start; page <= end; page++) {
            pages.push(page);
        }

        if (currentPage < lastPage - 2) {
            pages.push('...');
        }

        pages.push(lastPage);

        return pages;
    };

    const goToPage = (page: number) => {
        if (
            page < 1 ||
            page > lastPage ||
            page === currentPage
        ) {
            return;
        }

        onPageChange(page);
    };

    return (
        <nav
            aria-label="Pagination"
            className={className}
        >
            <ul
                className={cn(
                    'pagination mb-0',
                    `pagination-${variant}`,
                    `pagin-border-${variant}`,
                    size !== 'md' &&
                        `pagination-${size}`,
                )}
            >
                <li
                    className={cn(
                        'page-item',
                        currentPage === 1 &&
                            'disabled',
                    )}
                >
                    <button
                        type="button"
                        className="page-link"
                        disabled={currentPage === 1}
                        onClick={() =>
                            goToPage(currentPage - 1)
                        }
                    >
                        «
                    </button>
                </li>

                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <li
                                key={`ellipsis-${index}`}
                                className="page-item disabled"
                            >
                                <span className="page-link">
                                    ...
                                </span>
                            </li>
                        );
                    }

                    const isActive =
                        currentPage === page;

                    return (
                        <li
                            key={page}
                            className={cn(
                                'page-item',
                                isActive && 'active',
                            )}
                        >
                            <button
                                type="button"
                                className="page-link"
                                aria-current={
                                    isActive
                                        ? 'page'
                                        : undefined
                                }
                                onClick={() =>
                                    goToPage(page)
                                }
                            >
                                {page}
                            </button>
                        </li>
                    );
                })}

                <li
                    className={cn(
                        'page-item',
                        currentPage === lastPage &&
                            'disabled',
                    )}
                >
                    <button
                        type="button"
                        className="page-link"
                        disabled={
                            currentPage === lastPage
                        }
                        onClick={() =>
                            goToPage(currentPage + 1)
                        }
                    >
                        »
                    </button>
                </li>
            </ul>
        </nav>
    );
}
