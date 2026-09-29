import { useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';

import {
    Edit,
    Eye,
    Trash2,
} from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';

import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

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
    SalesPayment,
    SalesPaymentIndexProps,
} from '@/types/sales';

export default function SalesPaymentIndexPage({
    data,
}: SalesPaymentIndexProps) {
    const [
        selectedPayment,
        setSelectedPayment,
    ] = useState<SalesPayment | null>(
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

    const handlePageChange = (
        page: number,
    ) => {
        router.get(
            window.location.pathname,
            {
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleDelete = (
        payment: SalesPayment,
    ) => {
        setSelectedPayment(payment);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedPayment) {
            return;
        }

        router.delete(
            `/operations/sales/payments/${selectedPayment.id}`,
            {
                preserveScroll: true,

                onStart: () => {
                    setDeleting(true);
                },

                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setSelectedPayment(null);
                },

                onFinish: () => {
                    setDeleting(false);
                },
            },
        );
    };

    const getStatusClass = (
        status?: string,
    ) => {
        switch (status) {
            case 'Approved':
                return 'badge bg-success';

            case 'Rejected':
                return 'badge bg-danger';

            default:
                return 'badge bg-warning text-dark';
        }
    };

    return (
        <>
            <Head title="Sales Payments" />

            <PageTitle title="Sales Payment" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">
                                    Sales Payments
                                </h5>

                                <p className="text-muted mb-0">
                                    Record and manage invoice payments.
                                </p>
                            </div>

                            <Link
                                href="/operations/sales/payments/create"
                                className="btn btn-primary"
                            >
                                Add Payment
                            </Link>
                        </div>
                    </CardHeader>

                    <CardBody>
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
                                        Sl
                                    </TableHead>

                                    <TableHead sticky>
                                        Payment
                                    </TableHead>

                                    <TableHead sticky>
                                        Invoice
                                    </TableHead>

                                    <TableHead sticky>
                                        Client
                                    </TableHead>

                                    <TableHead sticky>
                                        Date
                                    </TableHead>

                                    <TableHead sticky>
                                        Amount
                                    </TableHead>

                                    <TableHead sticky>
                                        Method
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
                                            payment,
                                            index,
                                        ) => {
                                            const status =
                                                payment.status ??
                                                'Pending';

                                            const isPending =
                                                status ===
                                                'Pending';

                                            return (
                                                <TableRow
                                                    key={
                                                        payment.id
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
                                                                payment.payment_no
                                                            }
                                                        </strong>
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            payment
                                                                .invoice
                                                                ?.invoice_no ??
                                                            '-'
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            payment
                                                                .invoice
                                                                ?.client
                                                                ?.name ??
                                                            '-'
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {payment.payment_date
                                                            ? payment.payment_date.slice(
                                                                  0,
                                                                  10,
                                                              )
                                                            : '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        {Number(
                                                            payment.amount,
                                                        ).toLocaleString(
                                                            'en-US',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-capitalize">
                                                        {payment.payment_method
                                                            ?.replaceAll(
                                                                '_',
                                                                ' ',
                                                            ) ??
                                                            '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        <span
                                                            className={getStatusClass(
                                                                status,
                                                            )}
                                                        >
                                                            {
                                                                status
                                                            }
                                                        </span>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Link
                                                                href={`/operations/sales/payments/${payment.id}`}
                                                                className="btn btn-sm btn-outline-primary"
                                                                title="View"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </Link>

                                                            {isPending && (
                                                                <>
                                                                    <Link
                                                                        href={`/operations/sales/payments/${payment.id}/edit`}
                                                                        className="btn btn-sm btn-outline-warning"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </Link>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        title="Delete"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                payment,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        },
                                    )
                                ) : (
                                    <TableEmpty
                                        colSpan={9}
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 justify-content-between align-items-center">
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
                        setSelectedPayment(
                            null,
                        );
                    }
                }}
                processing={
                    deleting
                }
                title="Delete Payment?"
                description={
                    selectedPayment
                        ? `Delete payment "${selectedPayment.payment_no}"? Invoice paid and due amounts will be recalculated.`
                        : 'Are you sure you want to delete this payment?'
                }
                onConfirm={
                    confirmDelete
                }
            />
        </>
    );
}