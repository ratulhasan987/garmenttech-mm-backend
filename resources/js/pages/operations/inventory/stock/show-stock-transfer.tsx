import { Head, router } from '@inertiajs/react';
import { Check } from 'lucide-react';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { useState } from 'react';

type Warehouse = {
    id: number;
    name: string;
    code: string;
};

type Product = {
    id: number;
    name: string;
    code: string;
};

type TransferItem = {
    id: number;
    item_id: number;
    unit: string;
    quantity: number;
    product: Product | null;
};

type TransferredBy = {
    id: number;
    name: string;
    employee_id: string | null;
};

type StockTransfer = {
    id: number;
    stock_transfer_id: string;
    transfer_date: string;
    transportation_cost: number;
    grand_total: number;
    note: string | null;
    status: 'Pending' | 'Posted';

    from_warehouse: Warehouse;
    to_warehouse: Warehouse;
    transferred_by: TransferredBy;

    items: TransferItem[];
};

type Props = {
    stockTransfer: StockTransfer;
};

type ConfirmAction = 'post' | 'delete';

export default function ShowStockTransfer({ stockTransfer }: Props) {
    const [selectedTransfer, setSelectedTransfer] =
        useState<StockTransfer | null>(null);

    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
        null,
    );

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [processing, setProcessing] = useState(false);

    const [actionError, setActionError] = useState<string | null>(null);

    /*
        |--------------------------------------------------------------------------
        | Delete Confirmation
        |--------------------------------------------------------------------------
        */

    const requestDelete = (transfer: StockTransfer) => {
        if (transfer.status !== 'Pending') {
            return;
        }

        setSelectedTransfer(transfer);

        setConfirmAction('delete');

        setActionError(null);

        setConfirmOpen(true);
    };

    const requestPost = (transfer: StockTransfer) => {
        if (transfer.status !== 'Pending') {
            return;
        }

        setSelectedTransfer(transfer);

        setConfirmAction('post');

        setActionError(null);

        setConfirmOpen(true);
    };

    /*
        |--------------------------------------------------------------------------
        | Execute Confirmation
        |--------------------------------------------------------------------------
        */

    const handleConfirm = () => {
        if (!selectedTransfer || !confirmAction) {
            return;
        }

        setProcessing(true);

        setActionError(null);

        /*
                |--------------------------------------------------------------------------
                | Post
                |--------------------------------------------------------------------------
                */

        if (confirmAction === 'post') {
            router.post(
                `/inventory/stock-transfers/${selectedTransfer.id}/post`,
                {},
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        setConfirmOpen(false);

                        setSelectedTransfer(null);

                        setConfirmAction(null);
                    },

                    onError: (errors) => {
                        setActionError(
                            String(
                                errors.stock_transfer ??
                                    errors.items ??
                                    'Failed to post Stock Transfer.',
                            ),
                        );
                    },

                    onFinish: () => {
                        setProcessing(false);
                    },
                },
            );

            return;
        }

        /*
                |--------------------------------------------------------------------------
                | Delete
                |--------------------------------------------------------------------------
                */

        router.delete(`/inventory/stock-transfers/${selectedTransfer.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setConfirmOpen(false);

                setSelectedTransfer(null);

                setConfirmAction(null);
            },

            onError: (errors) => {
                setActionError(
                    String(
                        errors.stock_transfer ??
                            'Failed to delete Stock Transfer.',
                    ),
                );
            },

            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    /*
        |--------------------------------------------------------------------------
        | Confirmation Content
        |--------------------------------------------------------------------------
        */

    const confirmationTitle =
        confirmAction === 'post'
            ? 'Post Stock Transfer?'
            : 'Delete Stock Transfer?';

    const confirmationDescription = actionError
        ? actionError
        : confirmAction === 'post'
          ? `Are you sure you want to post ${selectedTransfer?.stock_transfer_id ?? 'this Stock Transfer'}? Stock will be deducted from the source warehouse and added to the destination warehouse.`
          : `Are you sure you want to delete ${selectedTransfer?.stock_transfer_id ?? 'this Stock Transfer'}?`;

    const handleBack = () => {
        router.visit('/inventory/stock-transfers');
    };

    return (
        <>
            <Head title="Stock Transfer - Details" />

            <PageTitle title="Stock Transfer Details" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">Stock Transfer Details</h5>

                                <p className="text-muted mb-0">
                                    Review the transfer before posting it.
                                </p>
                            </div>

                            <div className="d-flex gap-2">
                                <Button
                                    type="button"
                                    variant="info"
                                    appearance="outline"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {/* Transfer Information */}
                        <div className="border rounded-2 mb-4">
                            <div className="card-header">
                                <h6 className="mb-0">Transfer Information</h6>
                            </div>

                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Reference
                                        </div>

                                        <div className="fw-semibold">
                                            {stockTransfer.stock_transfer_id}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Transfer Date
                                        </div>

                                        <div className="fw-semibold">
                                            {stockTransfer.transfer_date}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            From Warehouse
                                        </div>

                                        <div className="fw-semibold">
                                            {stockTransfer.from_warehouse?.name}
                                        </div>

                                        <div className="text-muted small">
                                            {stockTransfer.from_warehouse?.code}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            To Warehouse
                                        </div>

                                        <div className="fw-semibold">
                                            {stockTransfer.to_warehouse?.name}
                                        </div>

                                        <div className="text-muted small">
                                            {stockTransfer.to_warehouse?.code}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Created By
                                        </div>

                                        <div className="fw-semibold">
                                            {stockTransfer.transferred_by?.name}
                                        </div>

                                        {stockTransfer.transferred_by
                                            ?.employee_id && (
                                            <div className="text-muted small">
                                                {
                                                    stockTransfer.transferred_by
                                                        .employee_id
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Status
                                        </div>

                                        <span
                                            className={`badge ${
                                                stockTransfer.status ===
                                                'Posted'
                                                    ? 'bg-success'
                                                    : 'bg-warning text-dark'
                                            }`}
                                        >
                                            {stockTransfer.status}
                                        </span>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Transportation Cost
                                        </div>

                                        <div className="fw-semibold">
                                            {Number(
                                                stockTransfer.transportation_cost,
                                            ).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Grand Total
                                        </div>

                                        <div className="fw-semibold">
                                            {Number(
                                                stockTransfer.grand_total,
                                            ).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                {stockTransfer.note && (
                                    <div className="mt-4">
                                        <div className="text-muted small">
                                            Note
                                        </div>

                                        <div>{stockTransfer.note}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transfer Items */}
                        <div className="border rounded-2 border-bottom-0">
                            <div className="card-header">
                                <h6 className="mb-0">Transfer Items</h6>
                            </div>

                            <div className=" p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>Product</th>
                                                <th>Code</th>
                                                <th>Quantity</th>
                                                <th>Unit</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {stockTransfer.items.map(
                                                (item, index) => (
                                                    <tr key={item.id}>
                                                        <td>{index + 1}</td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    item.product
                                                                        ?.name
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {item.product?.code}
                                                        </td>

                                                        <td>
                                                            {Number(
                                                                item.quantity,
                                                            ).toFixed(2)}
                                                        </td>

                                                        <td>{item.unit}</td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    {stockTransfer?.status === 'Pending' && (
                        <CardFooter>
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    type="button"
                                    variant="danger"
                                    appearance="outline"
                                    disabled={processing}
                                    onClick={() => requestDelete(stockTransfer)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    type="button"
                                    variant="success"
                                    onClick={() => {
                                        requestPost(stockTransfer);
                                    }}
                                    leftIcon={<Check size={16} />}
                                >
                                    Post Transfer
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {/*
                        |--------------------------------------------------------------------------
                        | Confirmation Modal
                        |--------------------------------------------------------------------------
                        */}

            <ConfirmModal
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (processing) {
                        return;
                    }

                    setConfirmOpen(open);

                    if (!open) {
                        setSelectedTransfer(null);

                        setConfirmAction(null);

                        setActionError(null);
                    }
                }}
                onConfirm={handleConfirm}
                title={confirmationTitle}
                description={confirmationDescription}
                confirmText={
                    confirmAction === 'post' ? 'Post Transfer' : 'Delete'
                }
                cancelText="Cancel"
                confirmVariant={confirmAction === 'post' ? 'success' : 'danger'}
                processing={processing}
                processingText={
                    confirmAction === 'post' ? 'Posting...' : 'Deleting...'
                }
            />
        </>
    );
}
