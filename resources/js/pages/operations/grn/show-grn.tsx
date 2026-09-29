import { useMemo, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import { Download, Edit, ExternalLink, FileText, Printer } from 'lucide-react';

import { ConfirmModal } from '@/components/modals/confirm-modal';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import { Select } from '@/components/ui/form/select';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type GrnStatus = 'Pending' | 'Approved' | 'Rejected';

type UpdatableGrnStatus = 'Approved' | 'Rejected';

type User = {
    id: number;

    name: string;

    employee_id: string | null;
};

type Vendor = {
    id: number;

    vendor_id: string | null;

    name: string;
};

type Warehouse = {
    id: number;

    name: string;
};

type Requisition = {
    id: number;

    requisition_id: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;

    status: string;

    requisition: Requisition | null;

    vendor: Vendor | null;

    warehouse: Warehouse | null;
};

type TaxSnapshot = {
    tax_id: number | null;

    name: string;

    rate: number;

    tax_amount?: number;
};

type GrnItem = {
    id: number;

    purchase_item_id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    quantity: number;

    unit_price: number;

    taxes: TaxSnapshot[];

    tax_amount: number;
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

    payment_status: string;
};

type GoodsReceivedNote = {
    id: number;

    grn_no: string;

    purchase_order_id: number;

    warehouse_id: number | null;

    received_date: string | null;

    status: GrnStatus;

    attachments: string[];

    note: string | null;

    created_at: string | null;

    purchase_order: PurchaseOrder | null;

    warehouse: Warehouse | null;

    received_by: User | null;

    approved_by: User | null;

    items: GrnItem[];

    bill: Bill | null;
};

type Currency = {
    id?: number;

    symbol?: string | null;

    exchange_rate?: string | number | null;
};

type Props = {
    grn: GoodsReceivedNote;

    activeCurrency: Currency | null;
};

/*
|--------------------------------------------------------------------------
| Status Colors
|--------------------------------------------------------------------------
*/

const STATUS_COLORS: Record<GrnStatus, string> = {
    Pending: '#6f42c1',

    Approved: '#28a745',

    Rejected: '#dc3545',
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
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

/*
|--------------------------------------------------------------------------
| Attachment URL
|--------------------------------------------------------------------------
*/

function getAttachmentUrl(path: string) {
    if (!path) {
        return '#';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `/${path.replace(/^\/+/, '')}`;
}

/*
|--------------------------------------------------------------------------
| Attachment Name
|--------------------------------------------------------------------------
*/

function getAttachmentName(path: string) {
    const parts = path.split('/');

    return parts[parts.length - 1] || 'Attachment';
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ShowGrnPage({ grn }: Props) {
    const { can } = usePermission();
    const canUpdateStatus = can('grn.status');
    const canEdit = can('grn.edit');

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    const [status, setStatus] = useState<GrnStatus>(grn.status ?? 'Pending');

    const [selectedStatus, setSelectedStatus] = useState<
        '' | UpdatableGrnStatus
    >('');

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const [statusError, setStatusError] = useState<string | null>(null);

    const [updatingStatus, setUpdatingStatus] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Download State
    |--------------------------------------------------------------------------
    */

    const [downloading, setDownloading] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Attachments
    |--------------------------------------------------------------------------
    */

    const attachments = useMemo(
        () =>
            Array.isArray(grn.attachments)
                ? grn.attachments.filter(Boolean)
                : [],
        [grn.attachments],
    );

    /*
    |--------------------------------------------------------------------------
    | Status Change Request
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = (newStatus: '' | UpdatableGrnStatus) => {
        if (!newStatus || status !== 'Pending') {
            return;
        }

        setStatusError(null);

        setSelectedStatus(newStatus);

        setConfirmModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Status
    |--------------------------------------------------------------------------
    |
    | Controller:
    |
    | Pending -> Approved
    | Pending -> Rejected
    |
    | Approved:
    | stock + stock movement + bill + PO status
    |
    */

    const confirmStatusUpdate = async () => {
        if (!selectedStatus || status !== 'Pending') {
            return;
        }

        setUpdatingStatus(true);

        setStatusError(null);

        try {
            const response = await fetch('/grn/status', {
                method: 'POST',

                credentials: 'same-origin',

                headers: {
                    Accept: 'application/json',

                    'Content-Type': 'application/json',

                    'X-CSRF-TOKEN': getCsrfToken(),
                },

                body: JSON.stringify({
                    id: grn.id,

                    status: selectedStatus,
                }),
            });

            const result = (await response.json()) as {
                message?: string;

                status?: GrnStatus;

                bill?: {
                    id: number;

                    bill_no: string;
                } | null;
            };

            if (!response.ok) {
                throw new Error(
                    result.message ?? 'Failed to update GRN status.',
                );
            }

            setStatus(result.status ?? selectedStatus);

            setConfirmModalOpen(false);

            setSelectedStatus('');

            setStatusError(null);

            /*
                |--------------------------------------------------------------------------
                | Refresh GRN
                |--------------------------------------------------------------------------
                |
                | Important after approval because:
                |
                | - approved_by changes
                | - bill gets generated
                | - PO status can become Partial / Received
                |
                */

            router.reload();
        } catch (error) {
            setStatusError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update GRN status.',
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Confirmation Modal
    |--------------------------------------------------------------------------
    */

    const confirmationTitle =
        selectedStatus === 'Approved'
            ? 'Approve GRN?'
            : selectedStatus === 'Rejected'
              ? 'Reject GRN?'
              : 'Update GRN Status';

    const confirmationDescription = statusError
        ? statusError
        : selectedStatus === 'Approved'
          ? `Are you sure you want to approve GRN #${grn.grn_no}? Stock will be added to the warehouse and a bill will be generated. This action cannot be changed afterward.`
          : selectedStatus === 'Rejected'
            ? `Are you sure you want to reject GRN #${grn.grn_no}? No stock will be added and this GRN can no longer be edited.`
            : '';

    const confirmText =
        selectedStatus === 'Approved'
            ? 'Approve GRN'
            : selectedStatus === 'Rejected'
              ? 'Reject GRN'
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

        iframe.src = `/grn/${grn.id}/stream-pdf`;

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

    const handleDownload = async () => {
        setDownloading(true);

        try {
            const response = await fetch(`/grn/${grn.id}/download-pdf`, {
                method: 'POST',

                credentials: 'same-origin',

                headers: {
                    Accept: 'application/pdf',

                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF.');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');

            anchor.href = url;

            anchor.download = `grn_${grn.grn_no}.pdf`;

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
            <Head title="GRN Details" />

            <PageTitle title="GRN Details" />

            {/*
            |--------------------------------------------------------------------------
            | Blade UI Styles
            |--------------------------------------------------------------------------
            */}

            <style>
                {`
                    .grn-status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 13px;
                        font-weight: 500;
                        color: #fff;
                    }

                    .grn-details p,
                    .grn-received-by p {
                        margin-bottom: 0.4rem;
                        font-size: 14px;
                    }

                    .grn-items-table th,
                    .grn-items-table td {
                        vertical-align: middle;
                    }

                    .grn-attachment-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        text-decoration: none;
                        color: inherit;
                        background: #fff;
                        transition: background-color 0.15s ease-in-out;
                    }

                    .grn-attachment-item:hover {
                        background: #f8f9fa;
                    }

                    .grn-attachment-name {
                        flex: 1;
                        min-width: 0;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }

                    @media print {
                        .grn-status-action,
                        .grn-action-buttons,
                        .grn-attachments {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <div className="container-fluid">
                <Card>
                    <CardBody>
                        {/*
                        |--------------------------------------------------------------------------
                        | GRN Header Details
                        |--------------------------------------------------------------------------
                        */}

                        <div className="row">
                            {/*
                            |--------------------------------------------------------------------------
                            | Left
                            |--------------------------------------------------------------------------
                            */}

                            <div className="col-md-6 grn-details">
                                <p className="mb-1">
                                    <b>GRN Details</b>
                                </p>

                                <p>
                                    GRN No.: <strong>{grn.grn_no}</strong>
                                </p>

                                {/*
                                |--------------------------------------------------------------------------
                                | Requisition
                                |--------------------------------------------------------------------------
                                */}

                                {grn.purchase_order?.requisition && (
                                    <p>
                                        Requisition No.:{' '}
                                        {
                                            grn.purchase_order.requisition
                                                .requisition_id
                                        }
                                    </p>
                                )}

                                {/*
                                |--------------------------------------------------------------------------
                                | PO
                                |--------------------------------------------------------------------------
                                */}

                                <p>
                                    PO No.:{' '}
                                    {grn.purchase_order?.order_id ?? 'N/A'}
                                </p>

                                {/*
                                |--------------------------------------------------------------------------
                                | Vendor
                                |--------------------------------------------------------------------------
                                */}

                                <p>
                                    Vendor:{' '}
                                    {grn.purchase_order?.vendor?.name ?? 'N/A'}
                                    {grn.purchase_order?.vendor?.vendor_id && (
                                        <>
                                            {' '}
                                            (
                                            {
                                                grn.purchase_order.vendor
                                                    .vendor_id
                                            }
                                            )
                                        </>
                                    )}
                                </p>

                                {/*
                                |--------------------------------------------------------------------------
                                | Warehouse
                                |--------------------------------------------------------------------------
                                */}

                                <p>
                                    Warehouse:{' '}
                                    {grn.warehouse?.name ??
                                        grn.purchase_order?.warehouse?.name ??
                                        '—'}
                                </p>

                                {/*
                                |--------------------------------------------------------------------------
                                | Created
                                |--------------------------------------------------------------------------
                                */}

                                <p>
                                    Created:{' '}
                                    {grn.created_at
                                        ? dayjs(grn.created_at).format(
                                              'DD MMM, YYYY hh:mm A',
                                          )
                                        : '—'}
                                </p>

                                {/*
                                |--------------------------------------------------------------------------
                                | Received Date
                                |--------------------------------------------------------------------------
                                */}

                                <p>
                                    Received Date:{' '}
                                    {grn.received_date
                                        ? dayjs(grn.received_date).format(
                                              'DD MMM, YYYY',
                                          )
                                        : '—'}
                                </p>

                                {/*
                                |--------------------------------------------------------------------------
                                | Note
                                |--------------------------------------------------------------------------
                                */}

                                {grn.note && <p>Note: {grn.note}</p>}
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Right
                            |--------------------------------------------------------------------------
                            */}

                            <div className="col-md-6 text-md-end grn-received-by">
                                <p className="mb-1">
                                    <b>Received By</b>
                                </p>

                                <p>Name: {grn.received_by?.name ?? 'N/A'}</p>

                                <p>
                                    Employee ID:{' '}
                                    {grn.received_by?.employee_id ?? 'N/A'}
                                </p>

                                <p className="mt-2">
                                    Status:{' '}
                                    <span
                                        className="grn-status-badge"
                                        style={{
                                            backgroundColor:
                                                STATUS_COLORS[status],
                                        }}
                                    >
                                        {status}
                                    </span>
                                </p>

                                {grn.approved_by && status !== 'Pending' && (
                                    <p>
                                        {status === 'Rejected'
                                            ? 'Rejected'
                                            : 'Approved'}{' '}
                                        By: {grn.approved_by.name}
                                        {grn.approved_by.employee_id && (
                                            <>
                                                {' '}
                                                (#
                                                {grn.approved_by.employee_id})
                                            </>
                                        )}
                                    </p>
                                )}

                                {/*
                                |--------------------------------------------------------------------------
                                | Generated Bill
                                |--------------------------------------------------------------------------
                                */}

                                {grn.bill && (
                                    <p>
                                        Bill No.:{' '}
                                        <strong>{grn.bill.bill_no}</strong>
                                    </p>
                                )}
                            </div>
                        </div>

                        <hr />

                        {/*
                        |--------------------------------------------------------------------------
                        | Items Header / Status
                        |--------------------------------------------------------------------------
                        */}

                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
                                <h5 className="mb-0">GRN Items</h5>

                                {canUpdateStatus && (
                                    <div className="grn-status-action d-flex align-items-center gap-2">
                                        <label className="mb-0 text-muted small">
                                            Update Status
                                        </label>

                                        <Select
                                            value={selectedStatus || status}
                                            style={{
                                                width: '220px',
                                            }}
                                            disabled={
                                                status !== 'Pending' ||
                                                updatingStatus
                                            }
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    event.target.value as
                                                        '' | UpdatableGrnStatus,
                                                )
                                            }
                                        >
                                            <option value="Pending" disabled>
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
                                )}
                            </div>

                            {statusError && (
                                <div className="alert alert-danger py-2">
                                    {statusError}
                                </div>
                            )}

                            {/*
                            |--------------------------------------------------------------------------
                            | Items Table
                            |--------------------------------------------------------------------------
                            */}

                            <Table
                                wrapperClassName="table-responsive"
                                className="grn-items-table"
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            style={{
                                                width: '5%',
                                            }}
                                        >
                                            SL
                                        </TableHead>

                                        <TableHead>Item Name</TableHead>

                                        <TableHead
                                            style={{
                                                width: '15%',
                                            }}
                                        >
                                            Unit
                                        </TableHead>

                                        <TableHead
                                            className="text-end"
                                            style={{
                                                width: '18%',
                                            }}
                                        >
                                            Quantity
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {grn.items.length > 0 ? (
                                        grn.items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="fw-semibold">
                                                        {item.name}
                                                    </div>

                                                    {item.code && (
                                                        <small className="text-muted">
                                                            #{item.code}
                                                        </small>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {item.unit || 'N/A'}
                                                </TableCell>

                                                <TableCell className="text-end">
                                                    <strong>
                                                        {Number(
                                                            item.quantity,
                                                        ).toLocaleString(
                                                            undefined,
                                                            {
                                                                minimumFractionDigits: 2,

                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </strong>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted py-5"
                                            >
                                                No items found for this GRN.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Action Buttons
                        |--------------------------------------------------------------------------
                        */}

                        <div className="grn-action-buttons mt-4 d-flex flex-wrap gap-2 justify-content-end">
                            <Button
                                type="button"
                                variant="secondary"
                                appearance="outline"
                                onClick={() => router.visit('/grn')}
                            >
                                Back
                            </Button>

                            {status === 'Pending' && canEdit && (
                                <Button
                                    type="button"
                                    variant="warning"
                                    onClick={() =>
                                        router.visit(`/grn/edit/${grn.id}`)
                                    }
                                >
                                    <Edit size={16} />

                                    <span className="ms-1">Edit</span>
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="primary"
                                onClick={handlePrint}
                            >
                                <Printer size={16} />

                                <span className="ms-1">Print</span>
                            </Button>

                            <Button
                                type="button"
                                variant="success"
                                disabled={downloading}
                                onClick={() => void handleDownload()}
                            >
                                <Download size={16} />

                                <span className="ms-1">
                                    {downloading
                                        ? 'Downloading...'
                                        : 'Download PDF'}
                                </span>
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/*
                |--------------------------------------------------------------------------
                | Attachments
                |--------------------------------------------------------------------------
                */}

                {attachments.length > 0 && (
                    <Card className="mt-3 grn-attachments">
                        <CardHeader>
                            <h5 className="mb-0">Attachments</h5>
                        </CardHeader>

                        <CardBody>
                            <div className="row g-2">
                                {attachments.map((attachment, index) => (
                                    <div
                                        key={`${attachment}-${index}`}
                                        className="col-md-6 col-lg-4"
                                    >
                                        <a
                                            href={getAttachmentUrl(attachment)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="grn-attachment-item"
                                        >
                                            <FileText size={20} />

                                            <span className="grn-attachment-name">
                                                {getAttachmentName(attachment)}
                                            </span>

                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/*
            |--------------------------------------------------------------------------
            | Confirm Status Modal
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
