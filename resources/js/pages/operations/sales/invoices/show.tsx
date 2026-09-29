import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';
import { useState } from 'react';

import { Printer, Download, CreditCard } from 'react-feather';

import { ConfirmModal } from '@/components/modals/confirm-modal';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

type InvoiceStatus = 'Pending' | 'Approved' | 'Rejected';

type Tax = {
    id?: number | null;
    name: string;
    rate: number;
    tax_amount?: number;
};

type InvoiceItem = {
    id: number;
    product_id: number;
    code: string | null;
    name: string | null;
    unit: string | null;
    quantity: number;
    unit_price: number;
    discount: number;
    tax: number;
    tax_ids?: number[] | null;
    taxes?: Tax[];
    line_total: number;
};

type SalesInvoice = {
    id: number;
    invoice_no: string;
    invoice_date: string | null;

    created_at: string | null;

    status: InvoiceStatus;

    payment_status: string;

    subtotal: number;
    discount: number;
    tax: number;
    adjustment_amount: number;
    grand_total: number;
    paid_amount: number;
    due_amount: number;
    receivable_id: number | null;

    remarks: string | null;

    warehouse: {
        id: number;
        code: string;
        name: string;
    } | null;

    client: {
        id: number;
        client_no: string | null;
        name: string;
        company_name: string | null;
        email: string | null;
        phone: string | null;
        present_address: string | null;
    } | null;

    items: InvoiceItem[];
    transactions: Array<{
        id: number;
        transaction_no: string;
        transaction_date: string;
        amount: number;
        payment_method: string | null;
        reference: string | null;
    }>;
};

type Props = {
    salesInvoice: SalesInvoice;
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
    Pending: '#6f42c1',

    Approved: '#198754',

    Rejected: '#dc3545',
};

function money(value: number): string {
    return Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
    });
}

export default function ShowSalesInvoicePage({ salesInvoice }: Props) {
    const [status, setStatus] = useState<InvoiceStatus>(salesInvoice.status);

    const [selectedStatus, setSelectedStatus] = useState<
        '' | 'Approved' | 'Rejected'
    >('');

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [processing, setProcessing] = useState(false);

    const requestStatus = (value: '' | 'Approved' | 'Rejected') => {
        if (!value || status !== 'Pending') {
            return;
        }

        setSelectedStatus(value);

        setConfirmOpen(true);
    };

    const confirmStatus = () => {
        if (!selectedStatus) {
            return;
        }

        router.patch(
            `/operations/sales/invoices/${salesInvoice.id}/status`,
            {
                status: selectedStatus,
            },
            {
                preserveScroll: true,

                onStart: () => setProcessing(true),

                onSuccess: () => {
                    setStatus(selectedStatus);

                    setConfirmOpen(false);

                    setSelectedStatus('');
                },

                onFinish: () => setProcessing(false),
            },
        );
    };

    const handlePrint = () => {
        const iframe = document.createElement('iframe');

        iframe.style.display = 'none';

        iframe.src = `/operations/sales/invoices/${salesInvoice.id}/print`;

        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();

                iframe.contentWindow?.print();
            } catch (error) {
                console.error(error);

                window.alert(
                    'Failed to print. Please download the PDF instead.',
                );
            }
        };
    };

    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);

        try {
            const response = await fetch(
                `/operations/sales/invoices/${salesInvoice.id}/download`,
                {
                    method: 'GET',

                    headers: {
                        Accept: 'application/pdf',
                    },

                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Failed to download PDF.');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');

            anchor.href = url;

            anchor.download = `sales_invoice_${salesInvoice.invoice_no}.pdf`;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);

            window.alert('Failed to download PDF.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <Head title={`Sales Invoice ${salesInvoice.invoice_no}`} />

            <PageTitle title="Sales Invoice Details" />

            <style>
                {`
                    .invoice-status-badge {
                        display: inline-block;
                        padding: 5px 12px;
                        border-radius: 5px;
                        font-size: 12px;
                        font-weight: 600;
                    }

                    .invoice-info p {
                        margin-bottom: 7px;
                        font-size: 14px;
                    }

                    .invoice-info strong {
                        font-weight: 600;
                    }

                    .invoice-table th,
                    .invoice-table td {
                        vertical-align: middle;
                        font-size: 13px;
                    }

                    .invoice-tax {
                        margin-bottom: 3px;
                    }

                    .invoice-summary {
                        max-width: 420px;
                        margin-left: auto;
                    }

                    .invoice-summary td {
                        padding: 7px 10px;
                    }
                `}
            </style>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                            <div>
                                <h4 className="mb-1">
                                    #{salesInvoice.invoice_no}
                                </h4>

                                <span
                                    className="badge text-capitalize"
                                    style={{
                                        backgroundColor: STATUS_COLORS[status],
                                    }}
                                >
                                    {status}
                                </span>

                                <span className="badge bg-light text-dark border ms-2 text-capitalize">
                                    {salesInvoice.payment_status}
                                </span>
                            </div>

                            {status === 'Pending' && (
                                <div className="sales-status-actions">
                                    <select
                                        className="form-select form-select-sm"
                                        value={selectedStatus}
                                        disabled={processing}
                                        onChange={(event) =>
                                            requestStatus(
                                                event.target.value as
                                                    | ''
                                                    | 'Approved'
                                                    | 'Rejected',
                                            )
                                        }
                                    >
                                        <option value="">Change status…</option>

                                        <option value="Approved">
                                            Approve
                                        </option>

                                        <option value="Rejected">Reject</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="row mt-4 g-4">
                            <div className="col-12 col-md-6 sales-details">
                                <h5>Invoice Details</h5>

                                <p>
                                    <strong>Invoice Date:</strong>{' '}
                                    {salesInvoice.invoice_date
                                        ? dayjs(
                                              salesInvoice.invoice_date,
                                          ).format('DD MMM, YYYY')
                                        : '-'}
                                </p>

                                <p>
                                    <strong>Created:</strong>{' '}
                                    {salesInvoice.created_at
                                        ? dayjs(salesInvoice.created_at).format(
                                              'DD MMM, YYYY hh:mm A',
                                          )
                                        : '-'}
                                </p>

                                <p>
                                    <strong>Warehouse:</strong>{' '}
                                    {salesInvoice.warehouse
                                        ? `${salesInvoice.warehouse.code} - ${salesInvoice.warehouse.name}`
                                        : '-'}
                                </p>

                                {salesInvoice.remarks && <></>}
                            </div>

                            <div className="col-12 col-md-6 sales-details text-md-end">
                                <h5>Customer</h5>

                                <p>
                                    <strong>Name:</strong>{' '}
                                    {salesInvoice.client?.name ?? '-'}
                                </p>

                                <p>
                                    <strong>Customer ID:</strong>{' '}
                                    {salesInvoice.client?.client_no ?? '-'}
                                </p>

                                <p>
                                    <strong>Phone:</strong>{' '}
                                    {salesInvoice.client?.phone ?? '-'}
                                </p>

                                <p>
                                    <strong>Email:</strong>{' '}
                                    {salesInvoice.client?.email ?? '-'}
                                </p>
                            </div>
                        </div>

                        <hr />

                        {/* Items */}
                        <h5 className="mt-4 mb-3">Sales Invoice Items</h5>

                        <div className="table-responsive">
                            <table className="table sales-items-table">
                                <thead>
                                    <tr>
                                        <th>SL</th>

                                        <th>Product</th>

                                        <th>Qty</th>

                                        <th>Unit Price</th>

                                        <th>Discount</th>

                                        <th>Taxes</th>

                                        <th>Tax</th>

                                        <th>Line Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {salesInvoice.items.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>

                                            <td>
                                                <div className="fw-semibold">
                                                    {item.name}
                                                </div>

                                                <small className="text-muted">
                                                    {item.code}
                                                </small>
                                            </td>

                                            <td>
                                                {item.quantity}

                                                {item.unit && (
                                                    <small className="text-muted ms-1">
                                                        ({item.unit})
                                                    </small>
                                                )}
                                            </td>

                                            <td>{money(item.unit_price)}</td>

                                            <td>{money(item.discount)}</td>

                                            <td>
                                                {item?.taxes?.length &&
                                                item?.taxes?.length > 0 ? (
                                                    item?.taxes?.map((tax) => (
                                                        <div key={tax.id}>
                                                            {tax.name}{' '}
                                                            {tax.rate}%
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td>{money(item.tax)}</td>

                                            <td>
                                                <strong>
                                                    {money(item.line_total)}
                                                </strong>
                                            </td>
                                        </tr>
                                    ))}

                                    <tr>
                                        <td colSpan={7} className="text-end">
                                            <strong>Subtotal</strong>
                                        </td>

                                        <td>{money(salesInvoice.subtotal)}</td>
                                    </tr>

                                    <tr>
                                        <td colSpan={7} className="text-end">
                                            <strong>Discount</strong>
                                        </td>

                                        <td>{money(salesInvoice.discount)}</td>
                                    </tr>

                                    <tr>
                                        <td colSpan={7} className="text-end">
                                            <strong>Additional Tax</strong>
                                        </td>

                                        <td>{money(salesInvoice.tax)}</td>
                                    </tr>

                                    <tr>
                                        <td colSpan={7} className="text-end">
                                            Adjustment
                                        </td>

                                        <td>
                                            {money(
                                                salesInvoice.adjustment_amount,
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td colSpan={7} className="text-end">
                                            <strong>Grand Total</strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {money(
                                                    salesInvoice.grand_total,
                                                )}
                                            </strong>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td colSpan={7} className="text-end">
                                            <strong>Paid</strong>
                                        </td>

                                        <td>
                                            {money(salesInvoice.paid_amount)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td colSpan={7} className="text-end">
                                            <strong>Due</strong>
                                        </td>

                                        <td>
                                            <strong className="text-danger">
                                                {money(salesInvoice.due_amount)}
                                            </strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h5 className="mt-4 mb-3">Collection Transactions</h5>

                        <div className="table-responsive">
                            <table className="table sales-items-table">
                                <thead>
                                    <tr>
                                        <th>Transaction</th>
                                        <th>Date</th>
                                        <th>Method</th>
                                        <th>Reference</th>
                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {salesInvoice.transactions.length ? (
                                        salesInvoice.transactions.map(
                                            (transaction) => (
                                                <tr key={transaction.id}>
                                                    <td>
                                                        {
                                                            transaction.transaction_no
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            transaction.transaction_date
                                                        }
                                                    </td>

                                                    <td>
                                                        {transaction.payment_method ??
                                                            '—'}
                                                    </td>

                                                    <td>
                                                        {transaction.reference ??
                                                            '—'}
                                                    </td>

                                                    <td className="text-end">
                                                        {money(
                                                            transaction.amount,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center text-muted"
                                            >
                                                No collections recorded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Actions */}
                        <div className="sales-actions d-flex flex-wrap justify-content-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                appearance="outline"
                                onClick={() =>
                                    router.visit('/operations/sales/invoices')
                                }
                            >
                                Back
                            </Button>

                            {status === 'Approved' &&
                                salesInvoice.receivable_id &&
                                salesInvoice.due_amount > 0 && (
                                    <Button
                                        type="button"
                                        variant="success"
                                        onClick={() =>
                                            router.visit(
                                                `/finance/receivables/${salesInvoice.receivable_id}`,
                                            )
                                        }
                                        leftIcon={<CreditCard size={16} />}
                                    >
                                        Make Payment
                                    </Button>
                                )}

                            <Button
                                type="button"
                                variant="info"
                                onClick={handlePrint}
                            >
                                <Printer size={16} className="me-1" />
                                Print
                            </Button>

                            <Button
                                type="button"
                                variant="success"
                                disabled={downloading}
                                onClick={() => void handleDownload()}
                            >
                                <Download size={16} className="me-1" />

                                {downloading
                                    ? 'Downloading...'
                                    : 'Download PDF'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (processing) {
                        return;
                    }

                    setConfirmOpen(open);

                    if (!open) {
                        setSelectedStatus('');
                    }
                }}
                title={
                    selectedStatus === 'Approved'
                        ? 'Approve Sales Invoice?'
                        : 'Reject Sales Invoice?'
                }
                description={
                    selectedStatus === 'Approved'
                        ? `Approve ${salesInvoice.invoice_no}? Stock will be deducted and this invoice can no longer be edited.`
                        : `Reject ${salesInvoice.invoice_no}? Reserved stock will be released.`
                }
                confirmText={
                    selectedStatus === 'Approved' ? 'Approve' : 'Reject'
                }
                cancelText="Cancel"
                confirmVariant={
                    selectedStatus === 'Approved' ? 'success' : 'danger'
                }
                processing={processing}
                processingText="Updating..."
                onConfirm={confirmStatus}
            />
        </>
    );
}
