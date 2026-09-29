import { useState } from 'react';

import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import dayjs from 'dayjs';

import {
    Edit,
    Eye,
    Plus,
    Trash2,
} from 'react-feather';

import {
    DeleteConfirmModal,
} from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import {
    TableEmpty,
} from '@/components/shared/table-empty';

import {
    TablePaginationInfo,
} from '@/components/shared/table-pagination-info';

import {
    Button,
} from '@/components/ui/button';

import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

import {
    Input,
} from '@/components/ui/form/input';

import {
    Select,
} from '@/components/ui/form/select';

import {
    Pagination,
} from '@/components/ui/pagination';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type {
    SalesInvoiceStatus,
    SalesReturn,
    SalesReturnIndexProps,
} from '@/types/sales';

function money(
    value: string | number,
): string {
    return Number(value || 0).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );
}

function statusClass(
    status: SalesInvoiceStatus,
): string {
    switch (status) {
        case 'Approved':
            return 'bg-success';

        case 'Rejected':
            return 'bg-danger';

        default:
            return 'bg-warning text-dark';
    }
}

export default function SalesReturnIndexPage({
    data,
    filters,
}: SalesReturnIndexProps) {
    const [
        search,
        setSearch,
    ] = useState(
        filters.search ?? '',
    );

    const [
        status,
        setStatus,
    ] = useState<
        SalesInvoiceStatus | ''
    >(
        filters.status ?? '',
    );

    const [
        deleteReturn,
        setDeleteReturn,
    ] = useState<
        SalesReturn | null
    >(null);

    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const hasFilters =
        Boolean(
            filters.search ||
            filters.status,
        );

    const applyFilters = () => {
        router.get(
            '/operations/sales/returns',
            {
                search:
                    search || undefined,

                status:
                    status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');

        router.get(
            '/operations/sales/returns',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (
        page: number,
    ) => {
        router.get(
            '/operations/sales/returns',
            {
                page,

                search:
                    filters.search ??
                    undefined,

                status:
                    filters.status ??
                    undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const confirmDelete = () => {
        if (!deleteReturn) {
            return;
        }

        router.delete(
            `/operations/sales/returns/${deleteReturn.id}`,
            {
                preserveScroll: true,

                onStart: () =>
                    setDeleting(true),

                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setDeleteReturn(null);
                },

                onFinish: () =>
                    setDeleting(false),
            },
        );
    };

    return (
        <>
            <Head title="Sales Returns" />

            <PageTitle title="Sales Returns" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                            <div>
                                <h5 className="mb-1">
                                    Sales Returns
                                </h5>

                                <p className="text-muted mb-0">
                                    Manage customer
                                    returns against
                                    sales invoices.
                                </p>
                            </div>

                            <Link
                                href="/operations/sales/returns/create"
                                className="btn btn-primary"
                            >
                                <Plus
                                    size={17}
                                    className="me-2"
                                />

                                Create Return
                            </Link>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="row g-2 mb-3">
                            <div className="col-md-5 col-lg-4">
                                <Input
                                    value={search}
                                    placeholder="Search return, invoice or customer..."
                                    onChange={(
                                        event,
                                    ) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    onKeyDown={(
                                        event,
                                    ) => {
                                        if (
                                            event.key ===
                                            'Enter'
                                        ) {
                                            applyFilters();
                                        }
                                    }}
                                />
                            </div>

                            <div className="col-md-3 col-lg-2">
                                <Select
                                    value={status}
                                    onChange={(
                                        event,
                                    ) =>
                                        setStatus(
                                            event.target
                                                .value as
                                                | SalesInvoiceStatus
                                                | '',
                                        )
                                    }
                                >
                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Approved">
                                        Approved
                                    </option>

                                    <option value="Rejected">
                                        Rejected
                                    </option>
                                </Select>
                            </div>

                            <div className="col-auto">
                                <Button
                                    type="button"
                                    onClick={
                                        applyFilters
                                    }
                                >
                                    Filter
                                </Button>
                            </div>

                            {hasFilters && (
                                <div className="col-auto">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        appearance="outline"
                                        onClick={
                                            resetFilters
                                        }
                                    >
                                        Reset
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{
                                maxHeight:
                                    'calc(100vh - 350px)',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>
                                        SL
                                    </TableHead>

                                    <TableHead sticky>
                                        Return
                                    </TableHead>

                                    <TableHead sticky>
                                        Date
                                    </TableHead>

                                    <TableHead sticky>
                                        Invoice
                                    </TableHead>

                                    <TableHead sticky>
                                        Customer
                                    </TableHead>

                                    <TableHead sticky>
                                        Warehouse
                                    </TableHead>

                                    <TableHead sticky>
                                        Items
                                    </TableHead>

                                    <TableHead sticky>
                                        Amount
                                    </TableHead>

                                    <TableHead sticky>
                                        Status
                                    </TableHead>

                                    <TableHead sticky>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map(
                                        (
                                            salesReturn,
                                            index,
                                        ) => (
                                            <TableRow
                                                key={
                                                    salesReturn.id
                                                }
                                            >
                                                <TableCell>
                                                    {(data.current_page -
                                                        1) *
                                                        data.per_page +
                                                        index +
                                                        1}
                                                </TableCell>

                                                <TableCell>
                                                    <strong>
                                                        {
                                                            salesReturn.return_no
                                                        }
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    {dayjs(
                                                        salesReturn.return_date,
                                                    ).format(
                                                        'DD MMM, YYYY',
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {salesReturn
                                                        .invoice
                                                        ?.invoice_no ??
                                                        '-'}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="f-w-500">
                                                        {salesReturn
                                                            .invoice
                                                            ?.client
                                                            ?.name ??
                                                            '-'}
                                                    </div>

                                                    {salesReturn
                                                        .invoice
                                                        ?.client
                                                        ?.client_id && (
                                                        <small className="text-muted">
                                                            {
                                                                salesReturn
                                                                    .invoice
                                                                    .client
                                                                    .client_id
                                                            }
                                                        </small>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {salesReturn
                                                        .warehouse
                                                        ?.name ??
                                                        '-'}
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        salesReturn
                                                            .items
                                                            .length
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <strong>
                                                        {money(
                                                            salesReturn.total_amount,
                                                        )}
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`badge ${statusClass(
                                                            salesReturn.status,
                                                        )}`}
                                                    >
                                                        {
                                                            salesReturn.status
                                                        }
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <Link
                                                            href={`/operations/sales/returns/${salesReturn.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="View"
                                                        >
                                                            <Eye
                                                                size={15}
                                                            />
                                                        </Link>

                                                        {salesReturn.status ===
                                                            'Pending' && (
                                                            <>
                                                                <Link
                                                                    href={`/operations/sales/returns/${salesReturn.id}/edit`}
                                                                    className="btn btn-sm btn-outline-warning"
                                                                    title="Edit"
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </Link>

                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="danger"
                                                                    appearance="outline"
                                                                    title="Delete"
                                                                    onClick={() => {
                                                                        setDeleteReturn(
                                                                            salesReturn,
                                                                        );

                                                                        setDeleteModalOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                ) : (
                                    <TableEmpty
                                        colSpan={10}
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <TablePaginationInfo
                                from={
                                    data.from ?? 0
                                }
                                to={
                                    data.to ?? 0
                                }
                                total={
                                    data.total
                                }
                            />

                            <Pagination
                                currentPage={
                                    data.current_page
                                }
                                lastPage={
                                    data.last_page
                                }
                                onPageChange={
                                    handlePageChange
                                }
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <DeleteConfirmModal
                open={
                    deleteModalOpen
                }
                onOpenChange={(
                    open,
                ) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(
                        open,
                    );

                    if (!open) {
                        setDeleteReturn(
                            null,
                        );
                    }
                }}
                processing={
                    deleting
                }
                title="Delete Sales Return?"
                description={
                    deleteReturn
                        ? `Are you sure you want to delete "${deleteReturn.return_no}"?`
                        : 'Are you sure you want to delete this sales return?'
                }
                onConfirm={
                    confirmDelete
                }
            />
        </>
    );
}