import { Head, router } from '@inertiajs/react';

import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import { ConfirmModal } from '@/components/modals/confirm-modal';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';
import { Eye } from 'react-feather';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Warehouse = {
    id: number;

    name: string;
};

type TransferStatus = 'Pending' | 'Posted';

type Transfer = {
    id: number;

    stock_transfer_id: string;

    transfer_date: string;

    transportation_cost: number;

    grand_total: number;

    note: string | null;

    status: TransferStatus;

    items_count: number;

    from_warehouse: Warehouse | null;

    to_warehouse: Warehouse | null;

    transferred_by: {
        id: number;

        name: string;

        employee_id: string | null;
    } | null;
};

type Paginated<T> = {
    data: T[];

    current_page: number;

    last_page: number;

    per_page: number;

    total: number;

    from: number | null;

    to: number | null;
};

type Props = {
    data: Paginated<Transfer>;
};

type ConfirmAction = 'post' | 'delete';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function StockTransferPage({ data }: Props) {
    const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
        null,
    );

    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
        null,
    );

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [processing, setProcessing] = useState(false);

    const [actionError, setActionError] = useState<string | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    const handleCreate = () => {
        router.visit('/inventory/stock-transfers/create');
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Confirmation
    |--------------------------------------------------------------------------
    */

    const requestDelete = (transfer: Transfer) => {
        if (transfer.status !== 'Pending') {
            return;
        }

        setSelectedTransfer(transfer);

        setConfirmAction('delete');

        setActionError(null);

        setConfirmOpen(true);
    };

    const onView = (transfer: Transfer) => {
        router.visit(`/inventory/stock-transfers/${transfer.id}`);
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
    | Pagination
    |--------------------------------------------------------------------------
    */

    const handlePageChange = (page: number) => {
        router.get(
            '/inventory/stock-transfers',
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

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Stock Transfer" />

            <PageTitle title="Stock Transfer" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">Stock Transfers</h5>

                                <p className="text-muted mb-0">
                                    Transfer inventory between warehouses.
                                </p>
                            </div>

                            <Button type="button" onClick={handleCreate}>
                                <Plus size={16} className="me-1" />
                                New Transfer
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SL</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Transportation Cost</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((transfer, index) => (
                                        <TableRow key={transfer.id}>
                                            <TableCell>
                                                {(data.current_page - 1) *
                                                    data.per_page +
                                                    index +
                                                    1}
                                            </TableCell>

                                            <TableCell>
                                                <strong>
                                                    {transfer.stock_transfer_id}
                                                </strong>
                                            </TableCell>

                                            <TableCell>
                                                {transfer.transfer_date}
                                            </TableCell>

                                            <TableCell>
                                                {transfer.from_warehouse?.name}
                                            </TableCell>

                                            <TableCell>
                                                {transfer.to_warehouse?.name}
                                            </TableCell>

                                            <TableCell>
                                                {transfer.items_count}
                                            </TableCell>

                                            <TableCell>
                                                {Number(
                                                    transfer.transportation_cost,
                                                ).toFixed(2)}
                                            </TableCell>

                                            <TableCell>
                                                {transfer.transferred_by?.name}

                                                {transfer.transferred_by
                                                    ?.employee_id && (
                                                    <div className="small text-muted">
                                                        {
                                                            transfer
                                                                .transferred_by
                                                                .employee_id
                                                        }
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`badge ${
                                                        transfer.status ===
                                                        'Posted'
                                                            ? 'bg-success'
                                                            : 'bg-warning text-dark'
                                                    }`}
                                                >
                                                    {transfer.status}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <div className="d-flex gap-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0"
                                                        title="Show GRN"
                                                        onClick={() => {
                                                            onView(transfer);
                                                        }}
                                                    >
                                                        <Eye size={20} />
                                                    </button>

                                                    {transfer.status ===
                                                        'Pending' && (
                                                        <div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-link text-danger p-0 border-0"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    requestDelete(
                                                                        transfer,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={20}
                                                                />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={10} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter className="d-flex justify-content-between align-items-center">
                        <TablePaginationInfo
                            from={data?.from ?? 0}
                            to={data?.to ?? 0}
                            total={data?.total}
                        />

                        <Pagination
                            currentPage={data?.current_page}
                            lastPage={data?.last_page}
                            onPageChange={(page) => {
                                handlePageChange(page);
                            }}
                        />
                    </CardFooter>
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
