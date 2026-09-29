import { useEffect, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import { Download, File, FileText, Printer } from 'react-feather';

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

type RequisitionStatus = 'Pending' | 'Approved' | 'Rejected';

type ItemStatus = 'Pending' | 'Approved' | 'Procured' | 'Rejected';

type Priority = 'Low' | 'Medium' | 'High';

type User = {
    id: number;

    name: string;

    employee_id: string | null;
};

type Attachment = {
    path: string;

    url: string;

    extension: string;

    size: number | null;
};

type RequisitionItem = {
    id: number;

    product_id: number;

    product_name: string | null;

    product_code: string | null;

    quantity: number;

    unit: string | null;

    priority: Priority;

    required_date: string | null;

    status: ItemStatus;
};

type Requisition = {
    id: number;

    requisition_id: string;

    required_date: string | null;

    status: RequisitionStatus;

    created_at: string;

    /*
    |--------------------------------------------------------------------------
    | Attachments
    |--------------------------------------------------------------------------
    */

    attachments: Attachment[];

    requested_by_user: User | null;

    approved_by_user: User | null;

    items: RequisitionItem[];
};

type ShowRequisitionPageProps = {
    requisition: Requisition;
};

/*
|--------------------------------------------------------------------------
| Status Response
|--------------------------------------------------------------------------
*/

type StatusResponse = {
    message?: string;

    status: RequisitionStatus;

    old_status?: RequisitionStatus;

    updated_count?: number;

    item_statuses?: Record<string, ItemStatus>;
};

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function statusClass(status: RequisitionStatus | ItemStatus) {
    switch (status) {
        case 'Approved':
            return 'bg-success';

        case 'Rejected':
            return 'bg-danger';

        case 'Procured':
            return 'bg-info text-dark';

        default:
            return 'bg-warning text-dark';
    }
}

/*
|--------------------------------------------------------------------------
| Priority Badge
|--------------------------------------------------------------------------
*/

function priorityClass(priority: Priority) {
    switch (priority) {
        case 'High':
            return 'bg-danger';

        case 'Low':
            return 'bg-secondary';

        default:
            return 'bg-warning text-dark';
    }
}

/*
|--------------------------------------------------------------------------
| Format File Size
|--------------------------------------------------------------------------
*/

function formatFileSizeMB(bytes: number | null): string | null {
    if (bytes === null) {
        return null;
    }

    const size = bytes / (1024 * 1024);

    return `${parseFloat(size.toFixed(2))} MB`;
}

/*
|--------------------------------------------------------------------------
| Attachment Image
|--------------------------------------------------------------------------
*/

function isImageAttachment(attachment: Attachment) {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(
        attachment.extension.toLowerCase(),
    );
}

/*
|--------------------------------------------------------------------------
| CSRF Token
|--------------------------------------------------------------------------
*/

function getCsrfToken() {
    return (
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ShowRequisitionPage({
    requisition,
}: ShowRequisitionPageProps) {
    const { can } = usePermission();
    const canUpdateStatus = can('requisition.status');

    /*
    |--------------------------------------------------------------------------
    | Requisition Status
    |--------------------------------------------------------------------------
    */

    const [currentStatus, setCurrentStatus] = useState<RequisitionStatus>(
        requisition.status,
    );

    /*
    |--------------------------------------------------------------------------
    | Item Statuses
    |--------------------------------------------------------------------------
    */

    const [itemStatuses, setItemStatuses] = useState<
        Record<number, ItemStatus>
    >(() =>
        Object.fromEntries(
            requisition.items.map((item) => [item.id, item.status]),
        ),
    );

    /*
    |--------------------------------------------------------------------------
    | Pending Status Change
    |--------------------------------------------------------------------------
    */

    const [nextStatus, setNextStatus] = useState<RequisitionStatus | null>(
        null,
    );

    /*
    |--------------------------------------------------------------------------
    | Modal
    |--------------------------------------------------------------------------
    */

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Processing
    |--------------------------------------------------------------------------
    */

    const [updatingStatus, setUpdatingStatus] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    const [statusError, setStatusError] = useState<string | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Synchronize Inertia Props
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setCurrentStatus(requisition.status);

        setItemStatuses(
            Object.fromEntries(
                requisition.items.map((item) => [item.id, item.status]),
            ),
        );
    }, [requisition]);

    /*
    |--------------------------------------------------------------------------
    | Can Change Status
    |--------------------------------------------------------------------------
    */

    const canChangeStatus = currentStatus === 'Pending';

    /*
    |--------------------------------------------------------------------------
    | Status Change
    |--------------------------------------------------------------------------
    */

    const handleRequisitionStatusChange = (status: RequisitionStatus) => {
        if (currentStatus !== 'Pending') {
            return;
        }

        if (status === currentStatus) {
            return;
        }

        if (!['Approved', 'Rejected'].includes(status)) {
            return;
        }

        setStatusError(null);

        setNextStatus(status);

        setConfirmModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Status Update
    |--------------------------------------------------------------------------
    */

    const confirmStatusUpdate = async () => {
        if (!nextStatus || currentStatus !== 'Pending') {
            return;
        }

        setUpdatingStatus(true);

        setStatusError(null);

        try {
            const response = await fetch('/requisition-status', {
                method: 'POST',

                credentials: 'same-origin',

                headers: {
                    Accept: 'application/json',

                    'Content-Type': 'application/json',

                    'X-CSRF-TOKEN': getCsrfToken(),
                },

                body: JSON.stringify({
                    id: requisition.id,

                    status: nextStatus,
                }),
            });

            const result = (await response.json()) as StatusResponse;

            if (!response.ok) {
                throw new Error(
                    result.message ?? 'Failed to update requisition status.',
                );
            }

            setCurrentStatus(result.status);

            if (result.item_statuses) {
                const statuses: Record<number, ItemStatus> = {};

                Object.entries(result.item_statuses).forEach(
                    ([itemId, status]) => {
                        statuses[Number(itemId)] = status;
                    },
                );

                setItemStatuses(statuses);
            }

            setConfirmModalOpen(false);

            setNextStatus(null);

            setStatusError(null);

            router.reload({
                only: ['requisition'],
            });
        } catch (error) {
            setStatusError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update requisition status.',
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Print PDF
    |--------------------------------------------------------------------------
    */

    const handlePrint = () => {
        const iframe = document.createElement('iframe');

        iframe.style.display = 'none';

        iframe.src = `/requisition/${requisition.id}/stream-pdf`;

        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();

                iframe.contentWindow?.print();
            } catch {
                window.open(
                    `/requisition/${requisition.id}/stream-pdf`,
                    '_blank',
                );
            }
        };

        iframe.onerror = () => {
            iframe.remove();

            window.open(`/requisition/${requisition.id}/stream-pdf`, '_blank');
        };
    };

    /*
    |--------------------------------------------------------------------------
    | Download PDF
    |--------------------------------------------------------------------------
    */

    const handleDownload = () => {
        window.location.href = `/requisition/${requisition.id}/download-pdf`;
    };

    /*
    |--------------------------------------------------------------------------
    | Confirmation Text
    |--------------------------------------------------------------------------
    */

    const confirmationDescription = statusError
        ? statusError
        : nextStatus === 'Approved'
          ? `Are you sure you want to approve requisition #${requisition.requisition_id}? Once approved, its status cannot be changed again.`
          : nextStatus === 'Rejected'
            ? `Are you sure you want to reject requisition #${requisition.requisition_id}? Once rejected, its status cannot be changed again.`
            : '';

    const confirmText =
        nextStatus === 'Approved'
            ? 'Approve'
            : nextStatus === 'Rejected'
              ? 'Reject'
              : 'Confirm';

    const confirmVariant:
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'light'
        | 'dark' =
        nextStatus === 'Approved'
            ? 'success'
            : nextStatus === 'Rejected'
              ? 'danger'
              : 'primary';

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title={`Requisition ${requisition.requisition_id}`} />

            <PageTitle title="Requisition Details" />

            <div className="container-fluid">
                <Card>
                    <CardBody>
                        {/*
                        |--------------------------------------------------------------------------
                        | Requisition Information
                        |--------------------------------------------------------------------------
                        */}

                        <div className="row">
                            <div className="col-12 col-xl-6">
                                <div className="row">
                                    <div className="col-12 fw-bold mb-1">
                                        Requisiton For:
                                    </div>

                                    <div className="col-12">
                                        Requistion ID:{' '}
                                        {requisition.requisition_id}
                                    </div>

                                    <div className="col-12">
                                        Date:{' '}
                                        {dayjs(requisition.created_at).format(
                                            'D MMM, YYYY',
                                        )}
                                    </div>

                                    <div className="col-12">
                                        Required Date:{' '}
                                        {dayjs(
                                            requisition.required_date,
                                        ).format('D MMM, YYYY')}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-xl-6 text-end">
                                <div className="row">
                                    <div className="col-12 fw-bold mb-1">
                                        Requested By:
                                    </div>

                                    <div className="col-12">
                                        Name:{' '}
                                        {requisition.requested_by_user?.name}
                                    </div>

                                    <div className="col-12">
                                        Employee ID:{' '}
                                        {
                                            requisition.requested_by_user
                                                ?.employee_id
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/*
                        |--------------------------------------------------------------------------
                        | Requisition Items Header
                        |--------------------------------------------------------------------------
                        */}

                        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
                            <div>
                                <h5 className="mb-1">Requisition Items</h5>

                                <small className="text-muted">
                                    {requisition.items.length} item
                                    {requisition.items.length !== 1 ? 's' : ''}
                                </small>
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Main Requisition Status
                            |--------------------------------------------------------------------------
                            */}

                            {canUpdateStatus && (
                                <div
                                    style={{
                                        width: '200px',
                                    }}
                                >
                                    <Select
                                        id="requisition_status"
                                        value={currentStatus}
                                        disabled={
                                            updatingStatus || !canChangeStatus
                                        }
                                        onChange={(event) =>
                                            handleRequisitionStatusChange(
                                                event.target
                                                    .value as RequisitionStatus,
                                            )
                                        }
                                    >
                                        {currentStatus === 'Pending' ? (
                                            <>
                                                <option value="Pending">
                                                    Pending
                                                </option>

                                                <option value="Approved">
                                                    Approved
                                                </option>

                                                <option value="Rejected">
                                                    Rejected
                                                </option>
                                            </>
                                        ) : (
                                            <option value={currentStatus}>
                                                {currentStatus}
                                            </option>
                                        )}
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Requisition Items
                        |--------------------------------------------------------------------------
                        */}

                        <Table wrapperClassName="overflow-auto">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SL</TableHead>

                                    <TableHead>Product</TableHead>

                                    <TableHead>Quantity</TableHead>

                                    <TableHead>Priority</TableHead>

                                    <TableHead>Required Date</TableHead>

                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {requisition.items.length > 0 ? (
                                    requisition.items.map((item, index) => {
                                        const itemStatus =
                                            itemStatuses[item.id] ??
                                            item.status;

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-medium">
                                                            {item.product_name ??
                                                                '-'}
                                                        </span>

                                                        <small className="text-muted">
                                                            {item.product_code ??
                                                                '-'}

                                                            {item.unit
                                                                ? ` • ${item.unit}`
                                                                : ''}
                                                        </small>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <strong>
                                                        {Number(
                                                            item.quantity,
                                                        ).toFixed(2)}
                                                    </strong>

                                                    {item.unit && (
                                                        <span className="text-muted ms-1">
                                                            {item.unit}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`badge ${priorityClass(
                                                            item.priority,
                                                        )}`}
                                                    >
                                                        {item.priority}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    {dayjs(
                                                        item.required_date ??
                                                            requisition.required_date,
                                                    ).format('D MMM, YYYY')}
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`badge ${statusClass(
                                                            itemStatus,
                                                        )}`}
                                                    >
                                                        {itemStatus}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted py-5"
                                        >
                                            No requisition items found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="mt-4 d-flex justify-content-end">
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    onClick={() => router.visit('/requisition')}
                                >
                                    Back
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    onClick={handlePrint}
                                >
                                    <Printer size={16} />

                                    <span className="ms-1">Print</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="success"
                                    onClick={handleDownload}
                                >
                                    <Download size={16} />

                                    <span className="ms-1">Download PDF</span>
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/*
                |--------------------------------------------------------------------------
                | Attachments
                |--------------------------------------------------------------------------
                */}

                <Card>
                    <CardHeader>
                        <p className="mb-0">Attachments</p>
                    </CardHeader>

                    <CardBody>
                        {requisition.attachments?.length > 0 ? (
                            <div className="d-flex flex-wrap gap-3">
                                {requisition.attachments.map((attachment) => {
                                    const extension =
                                        attachment.extension?.toLowerCase() ??
                                        '';

                                    const isImage =
                                        isImageAttachment(attachment);

                                    const isPdf = extension === 'pdf';

                                    const isExcel = ['xls', 'xlsx'].includes(
                                        extension,
                                    );

                                    const size = formatFileSizeMB(
                                        attachment.size,
                                    );

                                    return (
                                        <a
                                            key={attachment.path}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-decoration-none"
                                            title="Open attachment"
                                        >
                                            <div
                                                className="text-center"
                                                style={{
                                                    width: '140px',
                                                }}
                                            >
                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Preview
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <div
                                                    className="border rounded bg-light overflow-hidden d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '140px',

                                                        height: '120px',
                                                    }}
                                                >
                                                    {isImage ? (
                                                        <img
                                                            src={attachment.url}
                                                            alt="Attachment"
                                                            style={{
                                                                width: '100%',

                                                                height: '100%',

                                                                objectFit:
                                                                    'contain',

                                                                display:
                                                                    'block',
                                                            }}
                                                        />
                                                    ) : isPdf ? (
                                                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                                                            <FileText
                                                                size={54}
                                                                className="text-danger mb-2"
                                                            />

                                                            <span className="badge bg-danger">
                                                                PDF
                                                            </span>
                                                        </div>
                                                    ) : isExcel ? (
                                                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                                                            <FileText
                                                                size={54}
                                                                className="text-success mb-2"
                                                            />

                                                            <span className="badge bg-success">
                                                                {extension.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                                                            <File
                                                                size={54}
                                                                className="text-secondary mb-2"
                                                            />

                                                            <span className="badge bg-secondary">
                                                                {extension
                                                                    ? extension.toUpperCase()
                                                                    : 'FILE'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-muted">
                                No attachments found.
                            </div>
                        )}
                    </CardBody>
                </Card>
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
                        setNextStatus(null);

                        setStatusError(null);
                    }
                }}
                onConfirm={confirmStatusUpdate}
                title={
                    nextStatus === 'Approved'
                        ? 'Approve Requisition'
                        : nextStatus === 'Rejected'
                          ? 'Reject Requisition'
                          : 'Update Requisition Status'
                }
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
