import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';
import { Eye, Trash2 } from 'react-feather';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { TableEmpty } from '@/components/shared/table-empty';

type Warehouse = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    code: string;
    name: string;
    unit: string;
};

type Adjustment = {
    id: number;
    adjustment_id: string;
    adjustment_date: string;
    reason: string | null;
    status: 'draft' | 'posted';
    warehouse: Warehouse | null;
    items: {
        id: number;
    }[];
};

type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    data: Page<Adjustment>;
    warehouses: Warehouse[];
    products: Product[];
};

export default function StockAdjustments({ data }: Props) {
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [selectedAdjustment, setSelectedAdjustment] =
        useState<Adjustment | null>(null);

    const [deleting, setDeleting] = useState<number | null>(null);

    const requestDelete = (adjustment: Adjustment) => {
        setSelectedAdjustment(adjustment);
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedAdjustment) {
            return;
        }

        router.delete(
            `/inventory/stock-adjustments/${selectedAdjustment.id}`,
            {
                preserveScroll: true,

                onStart: () => setDeleting(selectedAdjustment.id),

                onFinish: () => {
                    setDeleting(null);
                    setOpenDeleteModal(false);
                    setSelectedAdjustment(null);
                },
            },
        );
    };

    const page = (p: number) =>
        router.get(
            '/inventory/stock-adjustments',
            {
                page: p,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );

    const onView = (adjustment: Adjustment) => {
        router.visit(`/inventory/stock-adjustments/${adjustment.id}`);
    };

    return (
        <>
            <Head title="Stock Adjustment" />

            <PageTitle title="Stock Adjustment" />

            <div className="container-fluid">
                <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1">Stock Adjustments</h5>

                            <p className="text-muted mb-0">
                                Correct physical stock differences.
                            </p>
                        </div>

                        <Link href="/inventory/stock-adjustments/create">
                            <button className="btn btn-primary">
                                New Adjustment
                            </button>
                        </Link>
                    </CardHeader>

                    <CardBody>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>SL</th>

                                        <th>Reference</th>

                                        <th>Date</th>

                                        <th>Warehouse</th>

                                        <th>Reason</th>

                                        <th>Items</th>

                                        <th>Status</th>

                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.data.length ? (
                                        data.data.map((adjustment, i) => (
                                            <tr key={adjustment.id}>
                                                <td>
                                                    {(data.current_page - 1) *
                                                        data.per_page +
                                                        i +
                                                        1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            adjustment.adjustment_id
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {adjustment.adjustment_date}
                                                </td>

                                                <td>
                                                    {adjustment.warehouse?.name}
                                                </td>

                                                <td>
                                                    {adjustment.reason ?? '-'}
                                                </td>

                                                <td>
                                                    {adjustment.items.length}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            adjustment.status ===
                                                            'posted'
                                                                ? 'bg-success'
                                                                : 'bg-warning text-dark'
                                                        }`}
                                                    >
                                                        {adjustment.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="d-flex">
                                                        <button
                                                            type="button"
                                                            className="btn btn-link p-0 border-0"
                                                            title="View"
                                                            onClick={() =>
                                                                onView(
                                                                    adjustment,
                                                                )
                                                            }
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        {adjustment.status ===
                                                            'draft' && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-link text-danger p-0 border-0"
                                                                disabled={
                                                                    deleting ===
                                                                    adjustment.id
                                                                }
                                                                title="Delete"
                                                                onClick={() =>
                                                                    requestDelete(
                                                                        adjustment,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                       <TableEmpty colSpan={8}/>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>

                    <CardFooter className="d-flex justify-content-between">
                        <TablePaginationInfo
                            from={data?.from ?? 0}
                            to={data?.to ?? 0}
                            total={data?.total}
                        />

                        <Pagination
                            currentPage={data?.current_page}
                            lastPage={data?.last_page}
                            onPageChange={(page) =>
                                router.get(
                                    '/inventory/stock-adjustments',
                                    {
                                        page,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        />
                    </CardFooter>
                </Card>
            </div>

            <ConfirmModal
                open={openDeleteModal}

                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setOpenDeleteModal(open);

                    if (!open) {
                        setSelectedAdjustment(null);
                    }
                }}

                onConfirm={handleConfirmDelete}

                title="Delete Stock Adjustment"

                description={
                    selectedAdjustment
                        ? `Are you sure you want to delete ${selectedAdjustment.adjustment_id}?`
                        : ''
                }

                confirmText="Delete"

                cancelText="Cancel"

                confirmVariant="danger"

                processing={Boolean(deleting)}

                processingText="Deleting..."
            />
        </>
    );
}
