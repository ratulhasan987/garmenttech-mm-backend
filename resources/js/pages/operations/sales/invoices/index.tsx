import { useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import {
    Edit,
    Eye,
    Plus,
    Trash2,
} from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';

import { Button } from '@/components/ui/button';

import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

import { Input } from '@/components/ui/form/input';

import { Select } from '@/components/ui/form/select';

import { Pagination } from '@/components/ui/pagination';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type {
    SalesInvoice,
    SalesInvoiceIndexProps,
    SalesInvoiceStatus,
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

function paymentStatusClass(
    status: string,
): string {
    switch (status) {
        case 'paid':
            return 'bg-success';

        case 'partial':
            return 'bg-info';

        default:
            return 'bg-secondary';
    }
}

export default function SalesInvoiceIndexPage({
    data,
    filters,
}: SalesInvoiceIndexProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] =
        useState<
            SalesInvoiceStatus | ''
        >(
            filters.status ?? '',
        );

    const [
        deleteInvoice,
        setDeleteInvoice,
    ] = useState<SalesInvoice | null>(
        null,
    );

    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const hasFilters = Boolean(
        filters.search ||
            filters.status,
    );

    const applyFilters = () => {
        router.get(
            '/operations/sales/invoices',
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
            '/operations/sales/invoices',
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
            '/operations/sales/invoices',
            {
                page,

                search:
                    filters.search ||
                    undefined,

                status:
                    filters.status ||
                    undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleDelete = (
        invoice: SalesInvoice,
    ) => {
        setDeleteInvoice(invoice);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteInvoice) {
            return;
        }

        router.delete(
            `/operations/sales/invoices/${deleteInvoice.id}`,
            {
                preserveScroll: true,

                onStart: () => {
                    setDeleting(true);
                },

                onSuccess: () => {
                    setDeleteModalOpen(
                        false,
                    );

                    setDeleteInvoice(
                        null,
                    );
                },

                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Sales Invoices" />

            <PageTitle title="Sales Invoices" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                            <div>
                                <h5 className="mb-1">
                                    Sales Invoices
                                </h5>

                                <p className="text-muted mb-0">
                                    Manage sales invoices.
                                </p>
                            </div>

                            <Link
                                href="/operations/sales/invoices/create"
                                className="btn btn-primary"
                            >
                                <Plus
                                    size={17}
                                    className="me-2"
                                />

                                Create Invoice
                            </Link>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="row g-2 mb-3">
                            <div className="col-md-5 col-lg-4">
                                <Input
                                    value={search}
                                    placeholder="Search invoice, customer name or code..."
                                    onChange={(
                                        event,
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value,
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
                                    value={
                                        status
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setStatus(
                                            event
                                                .target
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
                                        Invoice
                                    </TableHead>

                                    <TableHead sticky>
                                        Date
                                    </TableHead>

                                    <TableHead sticky>
                                        Customer
                                    </TableHead>

                                    <TableHead sticky>
                                        Warehouse
                                    </TableHead>

                                    <TableHead sticky>
                                        Total
                                    </TableHead>

                                    <TableHead sticky>
                                        Paid
                                    </TableHead>

                                    <TableHead sticky>
                                        Due
                                    </TableHead>

                                    <TableHead sticky>
                                        Payment
                                    </TableHead>

                                    <TableHead sticky>
                                        Status
                                    </TableHead>

                                    <TableHead sticky>
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map(
                                        (
                                            invoice,
                                            index,
                                        ) => (
                                            <TableRow
                                                key={
                                                    invoice.id
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
                                                    <span className="f-w-500">
                                                        {
                                                            invoice.invoice_no
                                                        }
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    {dayjs(
                                                        invoice.invoice_date,
                                                    ).format(
                                                        'DD MMM, YYYY',
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="f-w-500">
                                                        {
                                                            invoice
                                                                .client
                                                                ?.name ??
                                                            '-'
                                                        }
                                                    </div>

                                                    {invoice
                                                        .client
                                                        ?.client_no && (
                                                        <small className="text-muted">
                                                            {
                                                                invoice
                                                                    .client
                                                                    .client_no
                                                            }
                                                        </small>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        invoice
                                                            .warehouse
                                                            ?.name ??
                                                        '-'
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <span className="f-w-500">
                                                        {money(
                                                            invoice.grand_total,
                                                        )}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    {money(
                                                        invoice.paid_amount,
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={
                                                            Number(
                                                                invoice.due_amount,
                                                            ) > 0
                                                                ? 'text-danger f-w-500'
                                                                : 'text-success f-w-500'
                                                        }
                                                    >
                                                        {money(
                                                            invoice.due_amount,
                                                        )}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`badge ${paymentStatusClass(
                                                            invoice.payment_status,
                                                        )}`}
                                                    >
                                                        {invoice.payment_status
                                                            .charAt(
                                                                0,
                                                            )
                                                            .toUpperCase() +
                                                            invoice.payment_status.slice(
                                                                1,
                                                            )}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`badge ${statusClass(
                                                            invoice.status,
                                                        )}`}
                                                    >
                                                        {
                                                            invoice.status
                                                        }
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <Link
                                                            href={`/operations/sales/invoices/${invoice.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="View"
                                                        >
                                                            <Eye
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </Link>

                                                        {invoice.status ===
                                                            'Pending' && (
                                                            <>
                                                                <Link
                                                                    href={`/operations/sales/invoices/${invoice.id}/edit`}
                                                                    className="btn btn-sm btn-outline-warning"
                                                                    title="Edit"
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    title="Delete"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            invoice,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                ) : (
                                    <TableEmpty
                                        colSpan={11}
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <TablePaginationInfo
                                from={
                                    data.from ??
                                    0
                                }
                                to={
                                    data.to ??
                                    0
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
                        setDeleteInvoice(
                            null,
                        );
                    }
                }}
                processing={
                    deleting
                }
                onConfirm={
                    confirmDelete
                }
            />
        </>
    );
}
