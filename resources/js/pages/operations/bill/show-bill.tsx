import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import { Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Download, Printer } from 'react-feather';

import { ConfirmModal } from '@/components/modals/confirm-modal';
import PageTitle from '@/components/page-title';
import BillPaymentModal from '@/components/pages/bill/bill-payment-modal';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PaymentStatus = 'Paid' | 'Due' | 'Partial-paid';

type TaxSnapshot = {
    tax_id: number | null;

    name: string;

    rate: number;

    tax_amount: number;
};

type BillItem = {
    id: number;

    goods_received_note_item_id: number;

    purchase_item_id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string | null;

    quantity: number;

    unit_price: number;

    discount: number;

    taxes: TaxSnapshot[];

    total_tax: number;

    total_amount: number;
};

type Vendor = {
    id: number;

    vendor_id: string | null;

    name: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;

    status: string | null;
};

type GoodsReceivedNote = {
    id: number;

    grn_no: string;

    status: string | null;
};

type User = {
    id: number;

    name: string;

    employee_id?: string | null;
};

type Payment = {
    id: number;

    date: string | null;

    pay_amount: number;

    account_id: number | null;

    reference: string | null;

    transaction_no: string | null;

    description: string | null;

    attachment: string | null;

    created_at: string | null;

    created_by_user: User | null;
};

type Bill = {
    id: number;

    bill_no: string;

    sub_total: number;

    total_tax: number;

    total_discount: number;

    shipping_cost: number;

    grand_total: number;

    paid_amount: number;

    due_amount: number;

    payment_status: PaymentStatus;

    bill_date: string | null;

    due_date: string | null;

    created_at: string | null;

    attachments: string | null;

    vendor: Vendor | null;

    purchase_order: PurchaseOrder | null;

    goods_received_note: GoodsReceivedNote | null;

    created_by_user: User | null;

    items: BillItem[];

    payments: Payment[];
};

type Currency = {
    symbol?: string | null;

    exchange_rate?: string | number | null;
};

type Props = {
    bill: Bill;

    canEdit: boolean;

    activeCurrency: Currency | null;
};

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const STATUS_COLORS: Record<PaymentStatus, string> = {
    Due: '#fd7e14',

    'Partial-paid': '#0dcaf0',

    Paid: '#198754',
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ShowBillPage({ bill, canEdit, activeCurrency }: Props) {
    const { can, canAny } = usePermission();

    const canCreatePayment = can('bill_payment.create');
    const canEditPayment = can('bill_payment.edit');
    const canDeletePayment = can('bill_payment.delete');
    const showPaymentActions = canAny([
        'bill_payment.edit',
        'bill_payment.delete',
    ]);
    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const symbol = activeCurrency?.symbol ?? '$';

    const exchangeRate = Number(activeCurrency?.exchange_rate ?? 1) || 1;

    const formatMoney = (amount: number) =>
        `${symbol} ${(Number(amount ?? 0) * exchangeRate).toLocaleString(
            'en-US',
            {
                minimumFractionDigits: 2,

                maximumFractionDigits: 2,
            },
        )}`;

    /*
    |--------------------------------------------------------------------------
    | Attachment
    |--------------------------------------------------------------------------
    */

    const attachmentUrl = useMemo(() => {
        if (!bill.attachments) {
            return null;
        }

        if (
            bill.attachments.startsWith('http://') ||
            bill.attachments.startsWith('https://')
        ) {
            return bill.attachments;
        }

        return `/${bill.attachments.replace(/^\/+/, '')}`;
    }, [bill.attachments]);

    /*
    |--------------------------------------------------------------------------
    | Payment Attachment URL
    |--------------------------------------------------------------------------
    */

    const getPaymentAttachmentUrl = (attachment: string | null) => {
        if (!attachment) {
            return null;
        }

        if (
            attachment.startsWith('http://') ||
            attachment.startsWith('https://')
        ) {
            return attachment;
        }

        return `/${attachment.replace(/^\/+/, '')}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Downloading
    |--------------------------------------------------------------------------
    */

    const [billsDownloading, setBillsDownloading] = useState(false);

    const [paymentsDownloading, setPaymentsDownloading] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Payment Modal
    |--------------------------------------------------------------------------
    */

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Delete Payment
    |--------------------------------------------------------------------------
    */

    const [deletePayment, setDeletePayment] = useState<Payment | null>(null);

    const [deletingPayment, setDeletingPayment] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Add Payment
    |--------------------------------------------------------------------------
    */

    const handleAddPayment = () => {
        setEditingPayment(null);

        setPaymentModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Edit Payment
    |--------------------------------------------------------------------------
    */

    const handleEditPayment = (payment: Payment) => {
        setEditingPayment(payment);

        setPaymentModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Payment
    |--------------------------------------------------------------------------
    */

    const handleDeletePayment = (payment: Payment) => {
        setDeletePayment(payment);
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Delete Payment
    |--------------------------------------------------------------------------
    */

    const confirmDeletePayment = () => {
        if (!deletePayment || deletingPayment) {
            return;
        }

        setDeletingPayment(true);

        router.delete(`/bill/${bill.id}/payments/${deletePayment.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setDeletePayment(null);
            },

            onFinish: () => {
                setDeletingPayment(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Print
    |--------------------------------------------------------------------------
    */

    const handlePrintBills = () => {
        const iframe = document.createElement('iframe');

        iframe.style.display = 'none';

        iframe.src = `/bill/${bill.id}/stream-pdf`;

        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();

                iframe.contentWindow?.print();
            } catch (error) {
                console.error(error);

                window.alert(
                    'Failed to print the PDF. Please download the PDF instead.',
                );
            }
        };

        iframe.onerror = () => {
            window.alert('Failed to load the PDF for printing.');

            iframe.remove();
        };
    };

    /*
    |--------------------------------------------------------------------------
    | Download PDF
    |--------------------------------------------------------------------------
    */

    const handleDownloadBills = async () => {
        setBillsDownloading(true);

        try {
            const response = await fetch(`/bill/${bill.id}/download-pdf`, {
                method: 'POST',

                credentials: 'same-origin',

                headers: {
                    Accept: 'application/pdf',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF.');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');

            anchor.href = url;

            anchor.download = `grn_${bill.bill_no}.pdf`;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);

            window.alert('Failed to download PDF.');
        } finally {
            setBillsDownloading(false);
        }
    };

    /*

    /*
    |--------------------------------------------------------------------------
    | Print
    |--------------------------------------------------------------------------
    */

    const handlePrintPayments = () => {
        const iframe = document.createElement('iframe');

        iframe.style.display = 'none';

        iframe.src = `/bill-payment/${bill.id}/stream-pdf`;

        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();

                iframe.contentWindow?.print();
            } catch (error) {
                console.error(error);

                window.alert(
                    'Failed to print the PDF. Please download the PDF instead.',
                );
            }
        };

        iframe.onerror = () => {
            window.alert('Failed to load the PDF for printing.');

            iframe.remove();
        };
    };

    /*
    |--------------------------------------------------------------------------
    | Download PDF
    |--------------------------------------------------------------------------
    */

    const handleDownloadPayments = async () => {
        setPaymentsDownloading(true);

        try {
            const response = await fetch(
                `/bill-payment/${bill.id}/download-pdf`,
                {
                    method: 'POST',

                    credentials: 'same-origin',

                    headers: {
                        Accept: 'application/pdf',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to download PDF.');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');

            anchor.href = url;

            anchor.download = `grn_${bill.bill_no}.pdf`;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);

            window.alert('Failed to download PDF.');
        } finally {
            setPaymentsDownloading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Bill Details" />

            <PageTitle title="Bill Details" />

            <style>
                {`
                    .bill-status-badge {
                        display: inline-block;
                        padding: 4px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                        color: #fff;
                        text-transform: uppercase;
                    }

                    .bill-info-label {
                        font-weight: 600;
                        margin-bottom: 2px;
                        color: #495057;
                    }

                    .bill-info-value {
                        margin: 0 0 12px 0;
                    }

                    .bill-action-bar {
                        border-top: 1px solid #e9ecef;
                        padding-top: 1rem;
                        margin-top: 1.5rem;
                    }

                    .bill-summary-box {
                        background: #f8f9fa;
                        border-radius: 6px;
                        padding: 16px;
                    }

                    .bill-summary-line {
                        display: flex;
                        justify-content: space-between;
                        gap: 15px;
                        margin-bottom: 7px;
                    }

                    .bill-summary-net {
                        font-weight: 700;
                        font-size: 1.1rem;
                        border-top: 1px solid #dee2e6;
                        padding-top: 9px;
                        margin-top: 7px;
                    }

                    .bill-items-table th,
                    .bill-items-table td {
                        vertical-align: middle;
                    }
                `}
            </style>

            <div className="container-fluid">
                <div className="card">
                    {/*
                    |--------------------------------------------------------------------------
                    | Header
                    |--------------------------------------------------------------------------
                    */}

                    <div className="card-header d-flex justify-content-between flex-wrap gap-2">
                        <div>
                            <h4 className="mb-1">{bill.bill_no}</h4>

                            <span
                                className="bill-status-badge"
                                style={{
                                    backgroundColor:
                                        STATUS_COLORS[bill.payment_status],
                                }}
                            >
                                {bill.payment_status}
                            </span>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            appearance="outline"
                            onClick={() => router.visit('/bill')}
                        >
                            Back
                        </Button>
                    </div>

                    <div className="card-body">
                        {/*
                        |--------------------------------------------------------------------------
                        | Details
                        |--------------------------------------------------------------------------
                        */}

                        <div className="row mb-4">
                            <div className="col-md-6">
                                <p className="bill-info-label">
                                    Purchase Order
                                </p>

                                <p className="bill-info-value">
                                    {bill.purchase_order?.order_id ?? '—'}
                                </p>

                                <p className="bill-info-label">GRN</p>

                                <p className="bill-info-value">
                                    {bill.goods_received_note?.grn_no ?? '—'}
                                </p>

                                <p className="bill-info-label">Vendor</p>

                                <p className="bill-info-value">
                                    {bill.vendor?.name ?? '—'}

                                    {bill.vendor?.vendor_id && (
                                        <>
                                            {' '}
                                            <small className="text-muted">
                                                (#
                                                {bill.vendor.vendor_id})
                                            </small>
                                        </>
                                    )}
                                </p>

                                {attachmentUrl && (
                                    <>
                                        <p className="bill-info-label">
                                            Attachment
                                        </p>

                                        <p className="bill-info-value">
                                            <a
                                                href={attachmentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View Attachment
                                            </a>
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="col-md-6">
                                <p className="bill-info-label">Bill Date</p>

                                <p className="bill-info-value">
                                    {bill.bill_date
                                        ? dayjs(bill.bill_date).format(
                                              'DD MMM, YYYY',
                                          )
                                        : '—'}
                                </p>

                                <p className="bill-info-label">Due Date</p>

                                <p className="bill-info-value">
                                    {bill.due_date
                                        ? dayjs(bill.due_date).format(
                                              'DD MMM, YYYY',
                                          )
                                        : '—'}
                                </p>

                                <p className="bill-info-label">Created By</p>

                                <p className="bill-info-value">
                                    {bill.created_by_user?.name ?? '—'}

                                    {bill.created_by_user?.employee_id && (
                                        <small className="text-muted ms-1">
                                            (#
                                            {bill.created_by_user.employee_id})
                                        </small>
                                    )}
                                </p>

                                <p className="bill-info-label">Created At</p>

                                <p className="bill-info-value">
                                    {bill.created_at
                                        ? dayjs(bill.created_at).format(
                                              'DD MMM, YYYY hh:mm A',
                                          )
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Items
                        |--------------------------------------------------------------------------
                        */}

                        <h5 className="mb-2">Items</h5>

                        <div className="table-responsive mb-3">
                            <table className="table table-bordered bill-items-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>SL</th>

                                        <th>Product</th>

                                        <th>Unit</th>

                                        <th className="text-end">Qty</th>

                                        <th className="text-end">Unit Price</th>

                                        <th>Tax</th>

                                        <th className="text-end">Discount</th>

                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {bill.items.length > 0 ? (
                                        bill.items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    <strong>{item.name}</strong>

                                                    {item.code && (
                                                        <small className="d-block text-muted">
                                                            {item.code}
                                                        </small>
                                                    )}
                                                </td>

                                                <td>{item.unit ?? '—'}</td>

                                                <td className="text-end">
                                                    {Number(
                                                        item.quantity,
                                                    ).toFixed(2)}
                                                </td>

                                                <td className="text-end">
                                                    {formatMoney(
                                                        item.unit_price,
                                                    )}
                                                </td>

                                                <td>
                                                    {item.taxes.length > 0 ? (
                                                        item.taxes.map(
                                                            (tax, taxIndex) => (
                                                                <div
                                                                    key={`${item.id}-${tax.tax_id ?? taxIndex}`}
                                                                >
                                                                    {tax.name}{' '}
                                                                    <small className="text-muted">
                                                                        (
                                                                        {Number(
                                                                            tax.rate,
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                        %)
                                                                    </small>
                                                                </div>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-muted">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="text-end">
                                                    {formatMoney(item.discount)}
                                                </td>

                                                <td className="text-end">
                                                    <strong>
                                                        {formatMoney(
                                                            item.total_amount,
                                                        )}
                                                    </strong>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-center text-muted py-3"
                                            >
                                                No bill items
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Summary
                        |--------------------------------------------------------------------------
                        */}

                        <div className="row justify-content-end">
                            <div className="col-md-5">
                                <div className="bill-summary-box">
                                    <div className="bill-summary-line">
                                        <span>Sub Total</span>

                                        <strong>
                                            {formatMoney(bill.sub_total)}
                                        </strong>
                                    </div>

                                    <div className="bill-summary-line text-muted">
                                        <span>+ Tax</span>

                                        <span>
                                            {formatMoney(bill.total_tax)}
                                        </span>
                                    </div>

                                    <div className="bill-summary-line text-muted">
                                        <span>− Discount</span>

                                        <span>
                                            {formatMoney(bill.total_discount)}
                                        </span>
                                    </div>

                                    <div className="bill-summary-line text-muted">
                                        <span>+ Shipping</span>

                                        <span>
                                            {formatMoney(bill.shipping_cost)}
                                        </span>
                                    </div>

                                    <div className="bill-summary-line bill-summary-net">
                                        <span>Grand Total</span>

                                        <span>
                                            {formatMoney(bill.grand_total)}
                                        </span>
                                    </div>

                                    <div className="bill-summary-line mt-3 text-success">
                                        <span>Paid</span>

                                        <strong>
                                            {formatMoney(bill.paid_amount)}
                                        </strong>
                                    </div>

                                    <div className="bill-summary-line text-danger">
                                        <span>Due</span>

                                        <strong>
                                            {formatMoney(bill.due_amount)}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Actions
                        |--------------------------------------------------------------------------
                        */}

                        <div className="bill-action-bar d-flex justify-content-between flex-wrap gap-2">
                            <div className="d-flex gap-2">
                                {canEdit && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        appearance="outline"
                                        onClick={() =>
                                            router.visit(
                                                `/bill/${bill.id}/edit`,
                                            )
                                        }
                                    >
                                        <Edit size={16} className="me-1" />
                                        Edit
                                    </Button>
                                )}
                            </div>

                            <div className="d-flex gap-3">
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handlePrintBills}
                                >
                                    <Printer size={16} />

                                    <span className="ms-1">Print</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="success"
                                    disabled={billsDownloading}
                                    onClick={() => void handleDownloadBills()}
                                >
                                    <Download size={16} />

                                    <span className="ms-1">
                                        {billsDownloading
                                            ? 'Downloading...'
                                            : 'Download PDF'}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-body">
                        {/*
                        |--------------------------------------------------------------------------
                        | Payment History
                        |--------------------------------------------------------------------------
                        */}

                        <div className="">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                <h5 className="mb-0">Payment History</h5>

                                {Number(bill.due_amount) > 0 &&
                                    canCreatePayment && (
                                        <Button
                                            type="button"
                                            variant="success"
                                            onClick={handleAddPayment}
                                        >
                                            <Plus size={16} className="me-1" />
                                            Add Payment
                                        </Button>
                                    )}
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>

                                            <th>Reference</th>

                                            <th>Description</th>

                                            <th>Created By</th>

                                            <th>Attachment</th>

                                            <th className="text-end">Amount</th>

                                            {showPaymentActions && (
                                                <th className="text-center">
                                                    Action
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bill.payments.length > 0 ? (
                                            bill.payments.map((payment) => {
                                                const paymentAttachmentUrl =
                                                    getPaymentAttachmentUrl(
                                                        payment.attachment,
                                                    );

                                                return (
                                                    <tr key={payment.id}>
                                                        <td>
                                                            {payment.date
                                                                ? dayjs(
                                                                      payment.date,
                                                                  ).format(
                                                                      'DD MMM, YYYY',
                                                                  )
                                                                : '—'}
                                                        </td>

                                                        <td>
                                                            {payment.transaction_no && (
                                                                <small className="d-block text-muted">
                                                                    {
                                                                        payment.transaction_no
                                                                    }
                                                                </small>
                                                            )}
                                                            {payment.reference ??
                                                                '—'}
                                                        </td>

                                                        <td>
                                                            {payment.description ??
                                                                '—'}
                                                        </td>

                                                        <td>
                                                            {payment
                                                                .created_by_user
                                                                ?.name ?? '—'}
                                                        </td>

                                                        <td>
                                                            {paymentAttachmentUrl ? (
                                                                <a
                                                                    href={
                                                                        paymentAttachmentUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    View
                                                                </a>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </td>

                                                        <td className="text-end">
                                                            <strong>
                                                                {formatMoney(
                                                                    payment.pay_amount,
                                                                )}
                                                            </strong>
                                                        </td>

                                                        {showPaymentActions && (
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center gap-2">
                                                                    {canEditPayment && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="primary"
                                                                            appearance="outline"
                                                                            onClick={() =>
                                                                                handleEditPayment(
                                                                                    payment,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                        </Button>
                                                                    )}

                                                                    {canDeletePayment && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="danger"
                                                                            appearance="outline"
                                                                            onClick={() =>
                                                                                handleDeletePayment(
                                                                                    payment,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="text-center text-muted py-4"
                                                >
                                                    No payments found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <div className="d-flex gap-3 justify-content-end">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handlePrintPayments}
                            >
                                <Printer size={16} />

                                <span className="ms-1">Print</span>
                            </Button>

                            <Button
                                type="button"
                                variant="success"
                                disabled={paymentsDownloading}
                                onClick={() => void handleDownloadPayments()}
                            >
                                <Download size={16} />

                                <span className="ms-1">
                                    {paymentsDownloading
                                        ? 'Downloading...'
                                        : 'Download PDF'}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | Add / Edit Bill Payment Modal
            |--------------------------------------------------------------------------
            */}

            <BillPaymentModal
                open={paymentModalOpen}
                onOpenChange={(open) => {
                    setPaymentModalOpen(open);

                    if (!open) {
                        setEditingPayment(null);
                    }
                }}
                billId={bill.id}
                dueAmount={Number(bill.due_amount)}
                payment={editingPayment}
                currencySymbol={symbol}
            />

            {/*
            |--------------------------------------------------------------------------
            | Delete Bill Payment Confirm Modal
            |--------------------------------------------------------------------------
            */}

            <ConfirmModal
                open={Boolean(deletePayment)}
                onOpenChange={(open) => {
                    if (deletingPayment) {
                        return;
                    }

                    if (!open) {
                        setDeletePayment(null);
                    }
                }}
                onConfirm={confirmDeletePayment}
                title="Delete Bill Payment?"
                description={
                    deletePayment
                        ? `Are you sure you want to delete this payment of ${formatMoney(
                              deletePayment.pay_amount,
                          )}? Paid amount, due amount and payment status will be recalculated automatically.`
                        : ''
                }
                confirmText="Delete Payment"
                cancelText="Cancel"
                confirmVariant="danger"
                processing={deletingPayment}
                processingText="Deleting..."
            />
        </>
    );
}
