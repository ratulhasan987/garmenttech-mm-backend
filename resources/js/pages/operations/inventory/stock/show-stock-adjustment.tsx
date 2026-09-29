import { Head, router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

import PageTitle from '@/components/page-title';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

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

type AdjustedBy = {
    id: number;
    name: string;
    employee_id: string | null;
};

type AdjustmentItem = {
    id: number;
    item_id: number;
    unit: string | null;
    adjustment_type: 'increase' | 'decrease';
    quantity: number;
    product: Product | null;
};

type StockAdjustment = {
    id: number;
    adjustment_id: string;
    warehouse_id: number;
    adjusted_by: number | null;
    adjustment_date: string;
    reason: string | null;
    note: string | null;
    status: 'draft' | 'posted';

    warehouse: Warehouse;
    adjusted_by_user: AdjustedBy | null;
    items: AdjustmentItem[];
};

type Props = {
    stockAdjustment: StockAdjustment;
};

type ConfirmAction = 'post' | 'delete';

export default function ShowStockAdjustment({ stockAdjustment }: Props) {
    const [selectedAdjustment, setSelectedAdjustment] =
        useState<StockAdjustment | null>(null);

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

    const requestDelete = (adjustment: StockAdjustment) => {
        if (adjustment.status !== 'draft') {
            return;
        }

        setSelectedAdjustment(adjustment);
        setConfirmAction('delete');
        setActionError(null);
        setConfirmOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Post Confirmation
    |--------------------------------------------------------------------------
    */

    const requestPost = (adjustment: StockAdjustment) => {
        if (adjustment.status !== 'draft') {
            return;
        }

        setSelectedAdjustment(adjustment);
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
        if (!selectedAdjustment || !confirmAction) {
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
                `/inventory/stock-adjustments/${selectedAdjustment.id}/post`,
                {},
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        setConfirmOpen(false);
                        setSelectedAdjustment(null);
                        setConfirmAction(null);
                    },

                    onError: (errors) => {
                        setActionError(
                            String(
                                errors.stock_adjustment ??
                                    errors.items ??
                                    'Failed to post Stock Adjustment.',
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

        router.delete(`/inventory/stock-adjustments/${selectedAdjustment.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setConfirmOpen(false);
                setSelectedAdjustment(null);
                setConfirmAction(null);
            },

            onError: (errors) => {
                setActionError(
                    String(
                        errors.stock_adjustment ??
                            'Failed to delete Stock Adjustment.',
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
            ? 'Post Stock Adjustment?'
            : 'Delete Stock Adjustment?';

    const confirmationDescription = actionError
        ? actionError
        : confirmAction === 'post'
          ? `Are you sure you want to post ${selectedAdjustment?.adjustment_id ?? 'this Stock Adjustment'}? The stock quantity will be updated according to the adjustment.`
          : `Are you sure you want to delete ${selectedAdjustment?.adjustment_id ?? 'this Stock Adjustment'}?`;

    /*
    |--------------------------------------------------------------------------
    | Back
    |--------------------------------------------------------------------------
    */

    const handleBack = () => {
        router.visit('/inventory/stock-adjustments');
    };

    return (
        <>
            <Head title="Stock Adjustment - Details" />

            <PageTitle title="Stock Adjustment Details" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">
                                    Stock Adjustment Details
                                </h5>

                                <p className="text-muted mb-0">
                                    Review the stock adjustment before posting
                                    it.
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
                        {/* Adjustment Information */}
                        <div className="border rounded-2 mb-4">
                            <div className="card-header">
                                <h6 className="mb-0">Adjustment Information</h6>
                            </div>

                            <div className="card-body">
                                <div className="row g-4">
                                    {/* Reference */}
                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Reference
                                        </div>

                                        <div className="fw-semibold">
                                            {stockAdjustment.adjustment_id}
                                        </div>
                                    </div>

                                    {/* Adjustment Date */}
                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Adjustment Date
                                        </div>

                                        <div className="fw-semibold">
                                            {stockAdjustment.adjustment_date}
                                        </div>
                                    </div>

                                    {/* Warehouse */}
                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Warehouse
                                        </div>

                                        <div className="fw-semibold">
                                            {stockAdjustment.warehouse?.name}
                                        </div>

                                        <div className="text-muted small">
                                            {stockAdjustment.warehouse?.code}
                                        </div>
                                    </div>

                                    {/* Adjusted By */}
                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Adjusted By
                                        </div>

                                        <div className="fw-semibold">
                                            {
                                                stockAdjustment.adjusted_by_user
                                                    ?.name
                                            }
                                        </div>

                                        {stockAdjustment.adjusted_by_user
                                            ?.employee_id && (
                                            <div className="text-muted small">
                                                {
                                                    stockAdjustment
                                                        .adjusted_by_user
                                                        .employee_id
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* Reason */}
                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Reason
                                        </div>

                                        <div className="fw-semibold">
                                            {stockAdjustment.reason || '-'}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-md-3">
                                        <div className="text-muted small">
                                            Status
                                        </div>

                                        <span
                                            className={`badge ${
                                                stockAdjustment.status ===
                                                'posted'
                                                    ? 'bg-success'
                                                    : 'bg-warning text-dark'
                                            }`}
                                        >
                                            {stockAdjustment.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                stockAdjustment.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Note */}
                                {stockAdjustment.note && (
                                    <div className="mt-4">
                                        <div className="text-muted small">
                                            Note
                                        </div>

                                        <div>{stockAdjustment.note}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Adjustment Items */}
                        <div className="border rounded-2 border-bottom-0">
                            <div className="card-header">
                                <h6 className="mb-0">Adjustment Items</h6>
                            </div>

                            <div className="p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>Product</th>
                                                <th>Code</th>
                                                <th>Adjustment Type</th>
                                                <th>Quantity</th>
                                                <th>Unit</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {stockAdjustment.items.length >
                                            0 ? (
                                                stockAdjustment.items.map(
                                                    (item, index) => (
                                                        <tr key={item.id}>
                                                            <td>{index + 1}</td>

                                                            <td>
                                                                <strong>
                                                                    {
                                                                        item
                                                                            .product
                                                                            ?.name
                                                                    }
                                                                </strong>
                                                            </td>

                                                            <td>
                                                                {
                                                                    item.product
                                                                        ?.code
                                                                }
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={`badge ${
                                                                        item.adjustment_type ===
                                                                        'increase'
                                                                            ? 'bg-success'
                                                                            : 'bg-danger'
                                                                    }`}
                                                                >
                                                                    {item.adjustment_type
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                        item.adjustment_type.slice(
                                                                            1,
                                                                        )}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {Number(
                                                                    item.quantity,
                                                                ).toFixed(2)}
                                                            </td>

                                                            <td>
                                                                {item.unit ||
                                                                    '-'}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="text-center text-muted py-4"
                                                    >
                                                        No adjustment items
                                                        found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardBody>

                    {/* Actions */}
                    {stockAdjustment.status === 'draft' && (
                        <CardFooter>
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    type="button"
                                    variant="danger"
                                    appearance="outline"
                                    disabled={processing}
                                    onClick={() =>
                                        requestDelete(stockAdjustment)
                                    }
                                >
                                    Delete
                                </Button>

                                <Button
                                    type="button"
                                    variant="success"
                                    disabled={processing}
                                    onClick={() => requestPost(stockAdjustment)}
                                    leftIcon={<Check size={16} />}
                                >
                                    Post Adjustment
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (processing) {
                        return;
                    }

                    setConfirmOpen(open);

                    if (!open) {
                        setSelectedAdjustment(null);
                        setConfirmAction(null);
                        setActionError(null);
                    }
                }}
                onConfirm={handleConfirm}
                title={confirmationTitle}
                description={confirmationDescription}
                confirmText={
                    confirmAction === 'post' ? 'Post Adjustment' : 'Delete'
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
