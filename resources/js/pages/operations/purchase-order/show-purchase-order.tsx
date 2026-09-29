import { useMemo, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import { Download, Edit, Printer } from 'lucide-react';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { ConfirmModal } from '@/components/modals/confirm-modal';
import { usePermission } from '@/hooks/use-permission';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PurchaseOrderStatus =
    'Pending' | 'Approved' | 'Partial' | 'Received' | 'Cancelled';

type UpdatablePurchaseOrderStatus = 'Approved' | 'Cancelled';

type TaxSnapshot = {
    tax_id: number | null;

    name: string;

    rate: number;

    tax_amount: number;
};

type PurchaseItem = {
    id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    quantity: number;

    unit_price: number;

    taxes: TaxSnapshot[];

    tax_amount: number;

    line_total: number;
};

type Warehouse = {
    id: number;

    name: string;
};

type Vendor = {
    id: number;

    vendor_id: string | null;

    name: string;
};

type Requisition = {
    id: number;

    requisition_id: string;

    required_date: string | null;

    status: string | null;
};

type IssuedBy = {
    id: number;

    name: string;

    employee_id: string | null;
};

type PurchaseOrder = {
    id: number;

    order_id: string;

    is_requisition_based: boolean;

    status: PurchaseOrderStatus;

    order_date: string | null;

    created_at: string | null;

    warehouse: Warehouse | null;

    vendor: Vendor | null;

    requisition: Requisition | null;

    issued_by: IssuedBy | null;

    note: string | null;

    document: string | null;

    purchase_items: PurchaseItem[];

    sub_total: number;

    order_tax: number;

    order_discount: number;

    shipping_cost: number;

    grand_total: number;
};

type Currency = {
    id?: number;

    symbol?: string | null;

    exchange_rate?: number | string | null;
};

type Props = {
    purchaseOrder: PurchaseOrder;

    activeCurrency: Currency | null;
};

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const STATUS_COLORS: Record<string, string> = {
    Pending: '#6f42c1',

    Approved: '#0d6efd',

    Partial: '#fd7e14',

    Received: '#28a745',

    Cancelled: '#6c757d',
};

/*
|--------------------------------------------------------------------------
| CSRF
|--------------------------------------------------------------------------
*/

function getCsrfToken() {
    if (typeof document === 'undefined') {
        return '';
    }

    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ShowPurchaseOrderPage({
    purchaseOrder,
    activeCurrency,
}: Props) {
    const { can } = usePermission();
    const canUpdateStatus = can('purchase_order.status');
    const canEdit = can('purchase_order.edit');

    const [status, setStatus] = useState(purchaseOrder.status || 'Pending');

    const [selectedStatus, setSelectedStatus] = useState<
        '' | UpdatablePurchaseOrderStatus
    >('');

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const [statusError, setStatusError] = useState<string | null>(null);

    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [downloading, setDownloading] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const symbol = activeCurrency?.symbol ?? '$';

    const exchangeRate = Number(activeCurrency?.exchange_rate) || 1;

    /*
    |--------------------------------------------------------------------------
    | Currency Formatter
    |--------------------------------------------------------------------------
    */

    const formatMoney = (value: number) =>
        `${symbol} ${(Number(value) * exchangeRate).toLocaleString(undefined, {
            minimumFractionDigits: 2,

            maximumFractionDigits: 2,
        })}`;

    /*
    |--------------------------------------------------------------------------
    | Document URL
    |--------------------------------------------------------------------------
    */

    const documentUrl = useMemo(() => {
        if (!purchaseOrder.document) {
            return null;
        }

        if (
            purchaseOrder.document.startsWith('http://') ||
            purchaseOrder.document.startsWith('https://')
        ) {
            return purchaseOrder.document;
        }

        return `/${purchaseOrder.document.replace(/^\/+/, '')}`;
    }, [purchaseOrder.document]);

    /*
    |--------------------------------------------------------------------------
    | Request Status Change
    |--------------------------------------------------------------------------
    |
    | Pending Purchase Orders can only move to Approved or Cancelled.
    | Selecting a status opens the project's ConfirmModal first.
    |
    */

    const handleStatusChange = (
        newStatus: '' | UpdatablePurchaseOrderStatus,
    ) => {
        if (!newStatus || status !== 'Pending') {
            return;
        }

        setStatusError(null);

        setSelectedStatus(newStatus);

        setConfirmModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Status Update
    |--------------------------------------------------------------------------
    */

    const confirmStatusUpdate = async () => {
        if (!selectedStatus || status !== 'Pending') {
            return;
        }

        setUpdatingStatus(true);

        setStatusError(null);

        try {
            const response = await fetch('/purchase-order/status', {
                method: 'POST',

                credentials: 'same-origin',

                headers: {
                    Accept: 'application/json',

                    'Content-Type': 'application/json',

                    'X-CSRF-TOKEN': getCsrfToken(),
                },

                body: JSON.stringify({
                    id: purchaseOrder.id,

                    status: selectedStatus,
                }),
            });

            const result = (await response.json()) as {
                message?: string;

                status?: PurchaseOrderStatus;
            };

            if (!response.ok) {
                throw new Error(result.message ?? 'Failed to update status.');
            }

            setStatus(result.status ?? selectedStatus);

            setConfirmModalOpen(false);

            setSelectedStatus('');

            setStatusError(null);
        } catch (error) {
            setStatusError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update status.',
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Confirmation Modal Content
    |--------------------------------------------------------------------------
    */

    const confirmationTitle =
        selectedStatus === 'Approved'
            ? 'Approve Purchase Order?'
            : selectedStatus === 'Cancelled'
              ? 'Cancel Purchase Order?'
              : 'Update Purchase Order Status';

    const confirmationDescription = statusError
        ? statusError
        : selectedStatus === 'Approved'
          ? `Are you sure you want to approve purchase order #${purchaseOrder.order_id}? After approval, it can no longer be edited or have its status changed.`
          : selectedStatus === 'Cancelled'
            ? `Are you sure you want to cancel purchase order #${purchaseOrder.order_id}? After cancellation, it can no longer be edited or have its status changed.`
            : '';

    const confirmText =
        selectedStatus === 'Approved'
            ? 'Approve'
            : selectedStatus === 'Cancelled'
              ? 'Cancel Purchase Order'
              : 'Update';

    const confirmVariant: 'success' | 'danger' =
        selectedStatus === 'Approved' ? 'success' : 'danger';

    /*
    |--------------------------------------------------------------------------
    | Print
    |--------------------------------------------------------------------------
    */

    const handlePrint = () => {
        const iframe = document.createElement('iframe');

        iframe.style.display = 'none';

        iframe.src = `/purchase-order/${purchaseOrder.id}/stream-pdf`;

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

    /*
    |--------------------------------------------------------------------------
    | Download PDF
    |--------------------------------------------------------------------------
    */

    const handleDownload = async () => {
        setDownloading(true);

        try {
            const response = await fetch(
                `/purchase-order/${purchaseOrder.id}/download-pdf`,
                {
                    method: 'POST',

                    headers: {
                        Accept: 'application/pdf',

                        'X-CSRF-TOKEN': getCsrfToken(),
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

            anchor.download = `purchase_order_${purchaseOrder.order_id}.pdf`;

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

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Purchase Order Details" />

            <PageTitle title="Purchase Order Details" />

            <style>
                {`
                    .po-status-badge {
                        display: inline-block;
                        padding: 4px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                        color: #fff;
                        text-transform: uppercase;
                    }

                    .po-mode-badge {
                        display: inline-block;
                        padding: 3px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                        color: #fff;
                    }

                    .po-mode-badge.requisition {
                        background: #198754;
                    }

                    .po-mode-badge.free {
                        background: #6c757d;
                    }

                    .po-requisition-box {
                        background: #f8f9fa;
                        border-left: 4px solid #0d6efd;
                        padding: 10px 14px;
                        border-radius: 4px;
                        font-size: 13px;
                        margin-top: 10px;
                    }

                    .po-details p,
                    .po-issued-by p {
                        margin: 0.4rem 0;
                        font-size: 14px;
                    }

                    .po-items-table {
                        border-collapse: separate;
                        border-spacing: 0;
                        background: #fff;
                        border-radius: 6px;
                        overflow: hidden;
                    }

                    .po-items-table th,
                    .po-items-table td {
                        padding: 10px 12px;
                        vertical-align: middle;
                        font-size: 13px;
                    }

                    .po-items-table thead {
                        background: #f1f3f5;
                    }

                    .po-items-table tbody tr:hover {
                        background: #f8f9fa;
                    }

                    .po-items-table th {
                        font-weight: 600;
                    }

                    .po-tax-item + .po-tax-item {
                        margin-top: 4px;
                    }

                    @media print {
                        .po-action-buttons,
                        .po-status-actions {
                            display: none !important;
                        }

                        .card {
                            border: none !important;
                            box-shadow: none !important;
                        }
                    }
                `}
            </style>

            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body p-4">
                                {/*
                                |--------------------------------------------------------------------------
                                | Header
                                |--------------------------------------------------------------------------
                                */}

                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-2">
                                    <div>
                                        <h4 className="mb-1">
                                            #{purchaseOrder.order_id}
                                        </h4>

                                        <span
                                            className="po-status-badge"
                                            style={{
                                                backgroundColor:
                                                    STATUS_COLORS[status] ??
                                                    '#6c757d',
                                            }}
                                        >
                                            {status}
                                        </span>

                                        <span
                                            className={`po-mode-badge ms-1 ${
                                                purchaseOrder.is_requisition_based
                                                    ? 'requisition'
                                                    : 'free'
                                            }`}
                                        >
                                            {purchaseOrder.is_requisition_based
                                                ? 'Requisition Based'
                                                : 'Free Purchase'}
                                        </span>
                                    </div>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Status Action
                                    |--------------------------------------------------------------------------
                                    */}

                                    {status === 'Pending' &&
                                        canUpdateStatus && (
                                            <div className="po-status-actions d-flex gap-2 align-items-center">
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{
                                                        width: 'auto',

                                                        minWidth: '140px',
                                                    }}
                                                    value={selectedStatus}
                                                    disabled={updatingStatus}
                                                    onChange={(event) =>
                                                        handleStatusChange(
                                                            event.target
                                                                .value as
                                                                | ''
                                                                | UpdatablePurchaseOrderStatus,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        {updatingStatus
                                                            ? 'Updating...'
                                                            : 'Change status…'}
                                                    </option>

                                                    <option value="Approved">
                                                        Approve
                                                    </option>

                                                    <option value="Cancelled">
                                                        Cancel
                                                    </option>
                                                </select>
                                            </div>
                                        )}
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Details
                                |--------------------------------------------------------------------------
                                */}

                                <div className="d-flex justify-content-between flex-wrap gap-3 mt-3">
                                    <div className="po-details flex-fill">
                                        <h5 className="mb-3">PO Details</h5>

                                        <p>
                                            <strong>Order Date:</strong>{' '}
                                            {purchaseOrder.order_date
                                                ? dayjs(
                                                      purchaseOrder.order_date,
                                                  ).format('DD MMM, YYYY')
                                                : 'N/A'}
                                        </p>

                                        <p>
                                            <strong>Created:</strong>{' '}
                                            {purchaseOrder.created_at
                                                ? dayjs(
                                                      purchaseOrder.created_at,
                                                  ).format(
                                                      'DD MMM, YYYY hh:mm A',
                                                  )
                                                : 'N/A'}
                                        </p>

                                        <p>
                                            <strong>Warehouse:</strong>{' '}
                                            {purchaseOrder.warehouse?.name ??
                                                'N/A'}
                                        </p>

                                        <p className="d-flex gap-2">
                                            <span>
                                                <strong>Vendor:</strong>
                                            </span>

                                            <span>
                                                {purchaseOrder.vendor?.name ??
                                                    'N/A'}

                                                {purchaseOrder.vendor && (
                                                    <>
                                                        <br />

                                                        <small className="text-muted">
                                                            #
                                                            {
                                                                purchaseOrder
                                                                    .vendor
                                                                    .vendor_id
                                                            }
                                                        </small>
                                                    </>
                                                )}
                                            </span>
                                        </p>

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Requisition
                                        |--------------------------------------------------------------------------
                                        |
                                        | BOQ intentionally not included.
                                        |
                                        */}

                                        {purchaseOrder.is_requisition_based &&
                                            purchaseOrder.requisition && (
                                                <div className="po-requisition-box">
                                                    <strong>
                                                        Requisition:
                                                    </strong>{' '}
                                                    {
                                                        purchaseOrder
                                                            .requisition
                                                            .requisition_id
                                                    }
                                                </div>
                                            )}

                                        {purchaseOrder.note && (
                                            <p className="mt-2">
                                                <strong>Note:</strong>{' '}
                                                {purchaseOrder.note}
                                            </p>
                                        )}

                                        {documentUrl && (
                                            <p className="mt-1">
                                                <strong>Document:</strong>{' '}
                                                <a
                                                    href={documentUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View Attachment
                                                </a>
                                            </p>
                                        )}
                                    </div>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Issued By
                                    |--------------------------------------------------------------------------
                                    |
                                    | Department intentionally excluded.
                                    |
                                    */}

                                    <div className="po-issued-by flex-fill text-md-end">
                                        <h5 className="mb-3">Issued By</h5>

                                        <p>
                                            <strong>Name:</strong>{' '}
                                            {purchaseOrder.issued_by?.name ??
                                                'N/A'}
                                        </p>

                                        <p>
                                            <strong>Employee ID:</strong>{' '}
                                            {purchaseOrder.issued_by
                                                ?.employee_id ?? 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <hr />

                                {/*
                                |--------------------------------------------------------------------------
                                | Items
                                |--------------------------------------------------------------------------
                                */}

                                <div className="mt-4">
                                    <h5 className="mb-3">
                                        Purchase Order Items
                                    </h5>

                                    <div className="table-responsive">
                                        <table className="table po-items-table">
                                            <thead>
                                                <tr>
                                                    <th
                                                        style={{
                                                            width: '4%',
                                                        }}
                                                    >
                                                        SL
                                                    </th>

                                                    <th>Item Name</th>

                                                    <th
                                                        style={{
                                                            width: '12%',
                                                        }}
                                                    >
                                                        Quantity
                                                    </th>

                                                    <th
                                                        style={{
                                                            width: '14%',
                                                        }}
                                                    >
                                                        Unit Price
                                                    </th>

                                                    <th
                                                        style={{
                                                            width: '22%',
                                                        }}
                                                    >
                                                        Tax
                                                    </th>

                                                    <th
                                                        style={{
                                                            width: '14%',
                                                        }}
                                                    >
                                                        Line Total
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {purchaseOrder.purchase_items
                                                    .length > 0 ? (
                                                    purchaseOrder.purchase_items.map(
                                                        (item, index) => (
                                                            <tr key={item.id}>
                                                                <td>
                                                                    {index + 1}
                                                                </td>

                                                                <td>
                                                                    <div className="fw-semibold">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </div>

                                                                    {item.code && (
                                                                        <small className="text-muted">
                                                                            {
                                                                                item.code
                                                                            }
                                                                        </small>
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {Number(
                                                                        item.quantity,
                                                                    ).toLocaleString(
                                                                        undefined,
                                                                        {
                                                                            minimumFractionDigits: 2,

                                                                            maximumFractionDigits: 2,
                                                                        },
                                                                    )}

                                                                    <small className="text-muted ms-1">
                                                                        (
                                                                        {
                                                                            item.unit
                                                                        }
                                                                        )
                                                                    </small>
                                                                </td>

                                                                <td>
                                                                    {formatMoney(
                                                                        item.unit_price,
                                                                    )}
                                                                </td>

                                                                {/*
                                                                |--------------------------------------------------------------------------
                                                                | Multiple Taxes
                                                                |--------------------------------------------------------------------------
                                                                */}

                                                                <td>
                                                                    {item.taxes
                                                                        .length >
                                                                    0 ? (
                                                                        item.taxes.map(
                                                                            (
                                                                                tax,
                                                                                taxIndex,
                                                                            ) => (
                                                                                <div
                                                                                    key={`${item.id}-${tax.tax_id ?? taxIndex}`}
                                                                                    className="po-tax-item"
                                                                                >
                                                                                    <span className="fw-semibold">
                                                                                        {
                                                                                            tax.name
                                                                                        }
                                                                                    </span>{' '}
                                                                                    <span className="text-muted">
                                                                                        {Number(
                                                                                            tax.rate,
                                                                                        ).toFixed(
                                                                                            2,
                                                                                        )}

                                                                                        %
                                                                                    </span>
                                                                                    <span className="text-muted">
                                                                                        {' '}
                                                                                        (
                                                                                        {formatMoney(
                                                                                            tax.tax_amount,
                                                                                        )}

                                                                                        )
                                                                                    </span>
                                                                                </div>
                                                                            ),
                                                                        )
                                                                    ) : (
                                                                        <span className="text-muted">
                                                                            —
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    <span className="fw-semibold">
                                                                        {formatMoney(
                                                                            item.line_total,
                                                                        )}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="text-center"
                                                        >
                                                            No items found for
                                                            this purchase order.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Totals
                                            |--------------------------------------------------------------------------
                                            */}

                                            <tfoot>
                                                <tr>
                                                    <td colSpan={4} />

                                                    <td>
                                                        <strong>
                                                            Sub Total (excl.
                                                            tax)
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            purchaseOrder.sub_total,
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colSpan={4} />

                                                    <td>
                                                        <strong>
                                                            Total Tax
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            purchaseOrder.order_tax,
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colSpan={4} />

                                                    <td>
                                                        <strong>
                                                            Discount
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            purchaseOrder.order_discount,
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colSpan={4} />

                                                    <td>
                                                        <strong>
                                                            Shipping
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            purchaseOrder.shipping_cost,
                                                        )}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colSpan={4} />

                                                    <td>
                                                        <strong>
                                                            Grand Total
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatMoney(
                                                                purchaseOrder.grand_total,
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Actions
                                |--------------------------------------------------------------------------
                                */}

                                <div className="po-action-buttons mt-4 d-flex flex-wrap gap-2 justify-content-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        appearance="outline"
                                        onClick={() =>
                                            router.visit('/purchase-order')
                                        }
                                    >
                                        Back
                                    </Button>

                                    {status === 'Pending' && canEdit && (
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={() =>
                                                router.visit(
                                                    `/purchase-order/${purchaseOrder.id}/edit`,
                                                )
                                            }
                                        >
                                            <Edit size={16} className="me-1" />
                                            Edit
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handlePrint}
                                    >
                                        <Printer size={16} className="me-1" />
                                        Print
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        disabled={downloading}
                                        onClick={() => void handleDownload()}
                                    >
                                        <Download size={16} className="me-1" />

                                        {downloading
                                            ? 'Downloading...'
                                            : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | Status Confirmation Modal
            |--------------------------------------------------------------------------
            */}

            <ConfirmModal
                open={confirmModalOpen}
                onOpenChange={(open) => {
                    if (updatingStatus) {
                        return;
                    }

                    setConfirmModalOpen(open);

                    if (!open) {
                        setSelectedStatus('');

                        setStatusError(null);
                    }
                }}
                onConfirm={confirmStatusUpdate}
                title={confirmationTitle}
                description={confirmationDescription}
                confirmText={confirmText}
                cancelText="Cancel"
                confirmVariant={confirmVariant}
                processing={updatingStatus}
                processingText="Updating..."
            />
        </>
    );
}
