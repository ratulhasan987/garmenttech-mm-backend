import { useState } from 'react';

import { Head, Link, router, useForm } from '@inertiajs/react';

import {
    ArrowLeft,
    Download,
    Edit,
    Printer,
    Trash2,
} from 'lucide-react';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { ConfirmModal } from '@/components/modals/confirm-modal';

type Status =
    | 'Pending'
    | 'Approved'
    | 'Rejected';

type Client = {
    id: number;
    client_id?: string | null;
    name: string;
    company_name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
};

type Warehouse = {
    id: number;
    code?: string | null;
    name: string;
};

type Invoice = {
    id: number;
    invoice_no: string;
    invoice_date?: string | null;
    client_id?: number;
    warehouse_id?: number;
    grand_total: number | string;
    paid_amount: number | string;
    due_amount: number | string;
    payment_status?: string | null;
    status?: string | null;
    client?: Client | null;
    warehouse?: Warehouse | null;
};

type ApprovedBy = {
    id: number;
    name: string;
    employee_id?: string | null;
};

type SalesPayment = {
    id: number;
    payment_no: string;
    sales_invoice_id: number;
    payment_date: string;
    amount: number | string;
    payment_method: string;
    reference?: string | null;
    remarks?: string | null;
    status: Status;
    approved_by?: ApprovedBy | null;
    approved_at?: string | null;
    invoice?: Invoice | null;
};

type Props = {
    payment: SalesPayment;
};

function money(
    value:
        | number
        | string
        | null
        | undefined,
) {
    return Number(value || 0).toLocaleString(
        'en-US',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );
}

function formatDate(
    value: string | null | undefined,
) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    );
}

function formatDateTime(
    value: string | null | undefined,
) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(
        'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    );
}

function paymentMethodLabel(
    value: string,
) {
    const labels: Record<string, string> = {
        cash: 'Cash',
        bank: 'Bank',
        card: 'Card',
        mobile_banking: 'Mobile Banking',
        cheque: 'Cheque',
        other: 'Other',
    };

    return (
        labels[value] ??
        value
            .replaceAll('_', ' ')
            .replace(/\b\w/g, (char) =>
                char.toUpperCase(),
            )
    );
}

function statusClass(
    status: Status,
) {
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
    status?: string | null,
) {
    switch (status?.toLowerCase()) {
        case 'paid':
            return 'bg-success';

        case 'partial':
        case 'partial-paid':
            return 'bg-info';

        case 'unpaid':
            return 'bg-secondary';

        default:
            return 'bg-secondary';
    }
}

export default function ShowSalesPayment({
    payment,
}: Props) {
    const [status, setStatus] =
        useState<Status>(
            payment.status,
        );

    const [
        selectedStatus,
        setSelectedStatus,
    ] = useState<
        '' | 'Approved' | 'Rejected'
    >('');

    const [
        confirmModalOpen,
        setConfirmModalOpen,
    ] = useState(false);

    const [
        updatingStatus,
        setUpdatingStatus,
    ] = useState(false);

    const [
        downloading,
        setDownloading,
    ] = useState(false);

    const statusForm = useForm<{
        status:
            | 'Approved'
            | 'Rejected'
            | '';
    }>({
        status: '',
    });

    const deleteForm = useForm({});

    const requestStatusChange = (
        value:
            | ''
            | 'Approved'
            | 'Rejected',
    ) => {
        if (
            !value ||
            status !== 'Pending'
        ) {
            return;
        }

        setSelectedStatus(value);

        setConfirmModalOpen(true);
    };

    const confirmStatusChange =
        () => {
            if (
                !selectedStatus ||
                status !== 'Pending'
            ) {
                return;
            }

            setUpdatingStatus(true);

            statusForm.setData(
                'status',
                selectedStatus,
            );

            statusForm.patch(
                `/operations/sales/payments/${payment.id}/status`,
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        setStatus(
                            selectedStatus,
                        );

                        setSelectedStatus(
                            '',
                        );

                        setConfirmModalOpen(
                            false,
                        );
                    },

                    onFinish: () => {
                        setUpdatingStatus(
                            false,
                        );
                    },
                },
            );
        };

    const handleDelete = () => {
        if (status !== 'Pending') {
            return;
        }

        deleteForm.delete(
            `/operations/sales/payments/${payment.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    const handlePrint = () => {
        const iframe =
            document.createElement(
                'iframe',
            );

        iframe.style.display =
            'none';

        iframe.src =
            `/operations/sales/payments/${payment.id}/print`;

        document.body.appendChild(
            iframe,
        );

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();

                iframe.contentWindow?.print();
            } catch (error) {
                console.error(
                    error,
                );

                window.alert(
                    'Failed to print. Please download the PDF instead.',
                );
            }
        };
    };

    const handleDownload =
        async () => {
            setDownloading(true);

            try {
                const response =
                    await fetch(
                        `/operations/sales/payments/${payment.id}/download`,
                        {
                            method: 'GET',

                            headers: {
                                Accept:
                                    'application/pdf',
                            },

                            credentials:
                                'same-origin',
                        },
                    );

                if (
                    !response.ok
                ) {
                    throw new Error(
                        'Failed to download PDF.',
                    );
                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob,
                    );

                const anchor =
                    document.createElement(
                        'a',
                    );

                anchor.href = url;

                anchor.download =
                    `sales_payment_${payment.payment_no}.pdf`;

                document.body.appendChild(
                    anchor,
                );

                anchor.click();

                anchor.remove();

                window.URL.revokeObjectURL(
                    url,
                );
            } catch (error) {
                console.error(
                    error,
                );

                window.alert(
                    'Failed to download PDF.',
                );
            } finally {
                setDownloading(
                    false,
                );
            }
        };

    const invoice =
        payment.invoice;

    return (
        <>
            <Head
                title={`Sales Payment ${payment.payment_no}`}
            />

            <PageTitle title="Sales Payment Details" />

            <style>
                {`
                    .payment-info p {
                        margin-bottom: 7px;
                        font-size: 14px;
                    }

                    .payment-info strong {
                        font-weight: 600;
                    }

                    .payment-status {
                        display: inline-block;
                        padding: 5px 12px;
                        border-radius: 5px;
                        font-size: 12px;
                        font-weight: 600;
                    }

                    .payment-summary {
                        max-width: 420px;
                        margin-left: auto;
                    }

                    .payment-summary td {
                        padding: 8px 10px;
                    }
                `}
            </style>

            <div className="container-fluid">

                <div className="card">

                    <div className="card-body p-4">

                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

                            <div>
                                <h4 className="mb-2">
                                    #
                                    {
                                        payment.payment_no
                                    }
                                </h4>

                                <span
                                    className={`payment-status ${statusClass(
                                        status,
                                    )}`}
                                >
                                    {status}
                                </span>
                            </div>

                            {status ===
                                'Pending' && (
                                <div>

                                    <select
                                        className="form-select form-select-sm"
                                        style={{
                                            minWidth:
                                                '160px',
                                        }}
                                        value={
                                            selectedStatus
                                        }
                                        disabled={
                                            updatingStatus
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            const value =
                                                event
                                                    .target
                                                    .value as
                                                    | ''
                                                    | 'Approved'
                                                    | 'Rejected';

                                            requestStatusChange(
                                                value,
                                            );
                                        }}
                                    >
                                        <option value="">
                                            {updatingStatus
                                                ? 'Updating...'
                                                : 'Change Status'}
                                        </option>

                                        <option value="Approved">
                                            Approve
                                        </option>

                                        <option value="Rejected">
                                            Reject
                                        </option>
                                    </select>

                                </div>
                            )}

                        </div>

                        <div className="row g-4">

                            <div className="col-md-6">

                                <div className="border rounded p-3 h-100 payment-info">

                                    <h5 className="mb-3">
                                        Payment Information
                                    </h5>

                                    <p>
                                        <strong>
                                            Payment No:
                                        </strong>{' '}
                                        {
                                            payment.payment_no
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Payment Date:
                                        </strong>{' '}
                                        {formatDate(
                                            payment.payment_date,
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Amount:
                                        </strong>{' '}
                                        <span className="fw-semibold">
                                            {money(
                                                payment.amount,
                                            )}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>
                                            Payment Method:
                                        </strong>{' '}
                                        {paymentMethodLabel(
                                            payment.payment_method,
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Reference:
                                        </strong>{' '}
                                        {
                                            payment.reference ??
                                            '-'
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{' '}

                                        <span
                                            className={`badge ${statusClass(
                                                status,
                                            )}`}
                                        >
                                            {status}
                                        </span>
                                    </p>

                                    {payment.approved_by && (
                                        <p>
                                            <strong>
                                                Approved By:
                                            </strong>{' '}
                                            {
                                                payment
                                                    .approved_by
                                                    .name
                                            }

                                            {payment
                                                .approved_by
                                                .employee_id &&
                                                ` (${payment.approved_by.employee_id})`}
                                        </p>
                                    )}

                                    {payment.approved_at && (
                                        <p>
                                            <strong>
                                                Approved At:
                                            </strong>{' '}
                                            {formatDateTime(
                                                payment.approved_at,
                                            )}
                                        </p>
                                    )}

                                </div>

                            </div>

                            <div className="col-md-6">

                                <div className="border rounded p-3 h-100 payment-info">

                                    <h5 className="mb-3">
                                        Invoice Information
                                    </h5>

                                    <p>
                                        <strong>
                                            Invoice No:
                                        </strong>{' '}

                                        {invoice?.id ? (
                                            <Link
                                                href={`/operations/sales/invoices/${invoice.id}`}
                                                className="text-primary fw-medium"
                                            >
                                                {
                                                    invoice.invoice_no
                                                }
                                            </Link>
                                        ) : (
                                            '-'
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Invoice Date:
                                        </strong>{' '}
                                        {formatDate(
                                            invoice?.invoice_date,
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Grand Total:
                                        </strong>{' '}
                                        {money(
                                            invoice?.grand_total,
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Paid Amount:
                                        </strong>{' '}
                                        <span className="text-success">
                                            {money(
                                                invoice?.paid_amount,
                                            )}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>
                                            Due Amount:
                                        </strong>{' '}
                                        <span className="text-danger">
                                            {money(
                                                invoice?.due_amount,
                                            )}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>
                                            Payment Status:
                                        </strong>{' '}

                                        <span
                                            className={`badge ${paymentStatusClass(
                                                invoice?.payment_status,
                                            )}`}
                                        >
                                            {
                                                invoice?.payment_status ??
                                                '-'
                                            }
                                        </span>
                                    </p>

                                    <p>
                                        <strong>
                                            Warehouse:
                                        </strong>{' '}
                                        {
                                            invoice
                                                ?.warehouse
                                                ?.name ??
                                            '-'
                                        }
                                    </p>

                                </div>

                            </div>

                            <div className="col-md-6">

                                <div className="border rounded p-3 h-100 payment-info">

                                    <h5 className="mb-3">
                                        Customer Information
                                    </h5>

                                    <p>
                                        <strong>
                                            Customer:
                                        </strong>{' '}
                                        {
                                            invoice
                                                ?.client
                                                ?.name ??
                                            '-'
                                        }
                                    </p>

                                    {invoice
                                        ?.client
                                        ?.client_id && (
                                        <p>
                                            <strong>
                                                Customer ID:
                                            </strong>{' '}
                                            {
                                                invoice
                                                    .client
                                                    .client_id
                                            }
                                        </p>
                                    )}

                                    {invoice
                                        ?.client
                                        ?.company_name && (
                                        <p>
                                            <strong>
                                                Company:
                                            </strong>{' '}
                                            {
                                                invoice
                                                    .client
                                                    .company_name
                                            }
                                        </p>
                                    )}

                                    <p>
                                        <strong>
                                            Phone:
                                        </strong>{' '}
                                        {
                                            invoice
                                                ?.client
                                                ?.phone ??
                                            '-'
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Email:
                                        </strong>{' '}
                                        {
                                            invoice
                                                ?.client
                                                ?.email ??
                                            '-'
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Address:
                                        </strong>{' '}
                                        {
                                            invoice
                                                ?.client
                                                ?.address ??
                                            '-'
                                        }
                                    </p>

                                </div>

                            </div>

                            <div className="col-md-6">

                                <div className="border rounded p-3 h-100 payment-info">

                                    <h5 className="mb-3">
                                        Remarks
                                    </h5>

                                    <p className="mb-0">
                                        {
                                            payment.remarks ??
                                            'No remarks'
                                        }
                                    </p>

                                </div>

                            </div>

                            <div className="col-12">

                                <div className="border rounded p-3">

                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                                        <div>
                                            <small className="text-muted d-block">
                                                Payment Amount
                                            </small>

                                            <h4 className="mb-0">
                                                {money(
                                                    payment.amount,
                                                )}
                                            </h4>
                                        </div>

                                        <div className="d-flex justify-content-end align-items-center flex-wrap gap-2">

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                appearance="outline"
                                                onClick={() =>
                                                    router.visit(
                                                        '/operations/sales/payments',
                                                    )
                                                }
                                            >
                                                <ArrowLeft
                                                    size={
                                                        16
                                                    }
                                                    className="me-1"
                                                />

                                                Back
                                            </Button>

                                            {status ===
                                                'Pending' && (
                                                <>
                                                    <Link
                                                        href={`/operations/sales/payments/${payment.id}/edit`}
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="warning"
                                                            appearance="outline"
                                                        >
                                                            <Edit
                                                                size={
                                                                    16
                                                                }
                                                                className="me-1"
                                                            />

                                                            Edit
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        appearance="outline"
                                                        disabled={
                                                            deleteForm.processing
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    'Are you sure you want to delete this payment?',
                                                                )
                                                            ) {
                                                                handleDelete();
                                                            }
                                                        }}
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                            className="me-1"
                                                        />

                                                        Delete
                                                    </Button>
                                                </>
                                            )}

                                            <Button
                                                type="button"
                                                variant="info"
                                                appearance="outline"
                                                onClick={
                                                    handlePrint
                                                }
                                            >
                                                <Printer
                                                    size={
                                                        16
                                                    }
                                                    className="me-1"
                                                />

                                                Print
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="success"
                                                appearance="outline"
                                                disabled={
                                                    downloading
                                                }
                                                onClick={() =>
                                                    void handleDownload()
                                                }
                                            >
                                                <Download
                                                    size={
                                                        16
                                                    }
                                                    className="me-1"
                                                />

                                                {downloading
                                                    ? 'Downloading...'
                                                    : 'Download'}
                                            </Button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <ConfirmModal
                open={
                    confirmModalOpen
                }
                onOpenChange={(
                    open,
                ) => {
                    if (
                        updatingStatus
                    ) {
                        return;
                    }

                    setConfirmModalOpen(
                        open,
                    );

                    if (!open) {
                        setSelectedStatus(
                            '',
                        );
                    }
                }}
                title={
                    selectedStatus ===
                    'Approved'
                        ? 'Approve Sales Payment?'
                        : 'Reject Sales Payment?'
                }
                description={
                    selectedStatus ===
                    'Approved'
                        ? `Are you sure you want to approve payment "${payment.payment_no}"?`
                        : `Are you sure you want to reject payment "${payment.payment_no}"?`
                }
                confirmText={
                    selectedStatus ===
                    'Approved'
                        ? 'Approve'
                        : 'Reject'
                }
                cancelText="Cancel"
                confirmVariant={
                    selectedStatus ===
                    'Approved'
                        ? 'success'
                        : 'danger'
                }
                processing={
                    updatingStatus
                }
                processingText="Updating..."
                onConfirm={
                    confirmStatusChange
                }
            />
        </>
    );
}