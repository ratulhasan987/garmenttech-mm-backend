import { type FormEvent, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import { Edit, Eye, Trash } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { DatePicker } from '@/components/ui/form/date-picker';

import { Select } from '@/components/ui/form/select';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type { PaginatedData } from '@/types/pagination';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { usePermission } from '@/hooks/use-permission';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

type PurchaseOrderSuggestion = Record<string, unknown> & {
    id: number;

    order_id: string;
};

async function searchPurchaseOrders(
    query: string,
    signal?: AbortSignal,
): Promise<PurchaseOrderSuggestion[]> {
    const params = new URLSearchParams({
        keyword: query,
    });

    const response = await fetch(`/get-purchase-orders?${params.toString()}`, {
        signal,

        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to load purchase orders.');
    }

    return response.json();
}

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PurchaseOrderStatus =
    'Pending' | 'Approved' | 'Partial' | 'Received' | 'Cancelled';

type PurchaseItem = {
    id: number;

    purchase_order_id: number;

    requisition_item_id: number | null;

    item_id: number;

    unit: string;

    quantity: string;

    unit_price: string;

    tax_id: number | null;

    tax_rate: string | null;

    tax_amount: string | null;

    line_total: string | null;

    warehouse_id: number | null;

    created_at: string;

    updated_at: string;
};

type Vendor = {
    id: number;

    vendor_id: string;

    name: string;
};

type Requisition = {
    id: number;

    requisition_id: string;

    required_date: string | null;

    status: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;

    requisition_id: number | null;

    is_requisition_based: boolean;

    vendor_id: number;

    warehouse_id: number | null;

    sub_total: string;

    order_tax: string | null;

    order_discount: string | null;

    shipping_cost: string | null;

    grand_total: string;

    order_date: string | null;

    expected_delivery: string | null;

    document: string | null;

    note: string | null;

    status: PurchaseOrderStatus;

    created_by: number | null;

    created_at: string;

    updated_at: string;

    purchase_items: PurchaseItem[];

    vendor: Vendor | null;

    requisition: Requisition | null;
};

type PurchaseOrderFilters = {
    order_id?: string | null;

    status?: PurchaseOrderStatus | '';

    sorting?: 'asc' | 'desc' | '';

    start_date?: string | null;

    end_date?: string | null;
};

type ActiveCurrency = {
    id?: number;

    name?: string;

    code?: string;

    symbol?: string;

    exchange_rate?: string | number;
};

type PurchaseOrderIndexPageProps = {
    data: PaginatedData<PurchaseOrder>;

    filters: PurchaseOrderFilters;

    activeCurrency: ActiveCurrency | null;

    numberOfPurchaseOrders: number;

    hasFilters: boolean;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getStatusClass(status: PurchaseOrderStatus) {
    switch (status) {
        case 'Pending':
            return 'bg-warning';

        case 'Approved':
            return 'bg-primary';

        case 'Partial':
            return 'bg-warning text-dark';

        case 'Received':
            return 'bg-success';

        case 'Cancelled':
            return 'bg-secondary';

        default:
            return 'bg-secondary';
    }
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return dayjs(value).format('DD MMM, YYYY');
}

function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return dayjs(value).format('DD MMM, YYYY hh:mm A');
}

function formatAmount(value: string | number | null | undefined) {
    const amount = Number(value ?? 0);

    if (Number.isNaN(amount)) {
        return '0.00';
    }

    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
    });
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function PurchaseOrderIndexPage({
    data,
    filters,
    activeCurrency,
    numberOfPurchaseOrders,
    hasFilters,
}: PurchaseOrderIndexPageProps) {
    const { can, canAny } = usePermission();
    const showActions = canAny([
        'purchase_order.view',
        'purchase_order.edit',
        'purchase_order.delete',
    ]);
    const canCreate = can('purchase_order.create');
    const canEdit = can('purchase_order.edit');
    const canView = can('purchase_order.view');
    const canDelete = can('purchase_order.delete');

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [orderId, setOrderId] = useState(filters?.order_id ?? '');

    const [status, setStatus] = useState<PurchaseOrderStatus | ''>(
        filters?.status ?? '',
    );

    const [sorting, setSorting] = useState<'asc' | 'desc' | ''>(
        filters?.sorting ?? '',
    );

    const [startDate, setStartDate] = useState(filters?.start_date ?? '');

    const [endDate, setEndDate] = useState(filters?.end_date ?? '');

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
        number | null
    >(null);

    const [deleting, setDeleting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const currencySymbol = activeCurrency?.symbol ?? '$';

    const exchangeRate = Number(activeCurrency?.exchange_rate ?? 1) || 1;

    /*
    |--------------------------------------------------------------------------
    | Filter
    |--------------------------------------------------------------------------
    */

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/purchase-order',
            {
                ...(orderId.trim()
                    ? {
                          order_id: orderId.trim(),
                      }
                    : {}),

                ...(status
                    ? {
                          status,
                      }
                    : {}),

                ...(sorting
                    ? {
                          sorting,
                      }
                    : {}),

                ...(startDate
                    ? {
                          start_date: startDate,
                      }
                    : {}),

                ...(endDate
                    ? {
                          end_date: endDate,
                      }
                    : {}),
            },
            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            {
                page,

                ...(orderId.trim()
                    ? {
                          order_id: orderId.trim(),
                      }
                    : {}),

                ...(status
                    ? {
                          status,
                      }
                    : {}),

                ...(sorting
                    ? {
                          sorting,
                      }
                    : {}),

                ...(startDate
                    ? {
                          start_date: startDate,
                      }
                    : {}),

                ...(endDate
                    ? {
                          end_date: endDate,
                      }
                    : {}),
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
    | Reset
    |--------------------------------------------------------------------------
    */

    const handleReset = () => {
        setOrderId('');

        setStatus('');

        setSorting('');

        setStartDate('');

        setEndDate('');

        router.get(
            '/purchase-order',
            {},
            {
                preserveState: false,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = (id: number) => {
        setSelectedPurchaseOrderId(id);

        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedPurchaseOrderId === null) {
            return;
        }

        router.delete(`/purchase-order/${selectedPurchaseOrderId}/destroy`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onFinish: () => {
                setDeleting(false);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);

                setSelectedPurchaseOrderId(null);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const visitPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.visit(url, {
            preserveState: true,

            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Purchases" />

            <PageTitle title="Purchases" />

            <div className="container-fluid">
                <Card>
                    {/*
                    |--------------------------------------------------------------------------
                    | Header / Filters
                    |--------------------------------------------------------------------------
                    */}

                    <CardHeader>
                        <form
                            onSubmit={handleFilter}
                            className="d-flex gap-2 flex-wrap justify-content-start align-items-center"
                        >
                            {/*
                            |--------------------------------------------------------------------------
                            | Add Purchase
                            |--------------------------------------------------------------------------
                            */}

                            {canCreate && (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.visit('/purchase-order/create')
                                    }
                                >
                                    Add Purchase
                                </Button>
                            )}

                            {/*
                            |--------------------------------------------------------------------------
                            | PO Number
                            |--------------------------------------------------------------------------
                            */}

                            <div
                                style={{
                                    position: 'relative',

                                    flex: 1,

                                    flexBasis: '180px',
                                }}
                            >
                                <SuggestionSearchInput<PurchaseOrderSuggestion>
                                    key={`purchase-order-${orderId}`}
                                    searchFn={searchPurchaseOrders}
                                    idKey="id"
                                    labelKey="order_id"
                                    defaultValue={orderId}
                                    placeholder="Search PO..."
                                    showSearchIcon={false}
                                    clearOnFocus={false}
                                    emptyLabel="No purchase order found."
                                    onSelect={(purchaseOrder) => {
                                        setOrderId(purchaseOrder.order_id);
                                    }}
                                    onClear={() => {
                                        setOrderId('');
                                    }}
                                />
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Status
                            |--------------------------------------------------------------------------
                            */}

                            <div
                                style={{
                                    flex: 1,

                                    flexBasis: '140px',
                                }}
                            >
                                <Select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value as
                                                PurchaseOrderStatus | '',
                                        )
                                    }
                                >
                                    <option value="">-- Status --</option>

                                    <option value="Pending">Pending</option>

                                    <option value="Approved">Approved</option>

                                    <option value="Partial">Partial</option>

                                    <option value="Received">Received</option>

                                    <option value="Cancelled">Cancelled</option>
                                </Select>
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Sorting
                            |--------------------------------------------------------------------------
                            */}

                            <div
                                style={{
                                    flex: 1,

                                    flexBasis: '140px',
                                }}
                            >
                                <Select
                                    value={sorting}
                                    onChange={(event) =>
                                        setSorting(
                                            event.target.value as
                                                'asc' | 'desc' | '',
                                        )
                                    }
                                >
                                    <option value="">-- Sort By Date --</option>

                                    <option value="asc">Oldest First</option>

                                    <option value="desc">Newest First</option>
                                </Select>
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | From Date
                            |--------------------------------------------------------------------------
                            */}

                            <div
                                style={{
                                    flex: 1,

                                    flexBasis: '140px',
                                }}
                            >
                                <DatePicker
                                    value={startDate}
                                    onChange={setStartDate}
                                    placeholder="From"
                                    maxDate={endDate || undefined}
                                />
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | To Date
                            |--------------------------------------------------------------------------
                            */}

                            <div
                                style={{
                                    flex: 1,

                                    flexBasis: '140px',
                                }}
                            >
                                <DatePicker
                                    value={endDate}
                                    onChange={setEndDate}
                                    placeholder="To"
                                    minDate={startDate || undefined}
                                />
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Filter
                            |--------------------------------------------------------------------------
                            */}

                            <Button type="submit">Filter</Button>

                            {/*
                            |--------------------------------------------------------------------------
                            | Reset
                            |--------------------------------------------------------------------------
                            */}

                            {hasFilters && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                            )}
                        </form>
                    </CardHeader>

                    {/*
                    |--------------------------------------------------------------------------
                    | Body
                    |--------------------------------------------------------------------------
                    */}

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto text-nowrap"
                            wrapperStyle={{
                                height: 'calc(100vh - 280px)',

                                position: 'relative',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        sticky
                                        style={{
                                            width: '40px',
                                        }}
                                    >
                                        SL
                                    </TableHead>

                                    <TableHead sticky>PO / Created</TableHead>

                                    <TableHead sticky>Order Date</TableHead>

                                    <TableHead sticky>
                                        Mode / Requisition
                                    </TableHead>

                                    <TableHead sticky>Vendor</TableHead>

                                    <TableHead sticky>Grand Total</TableHead>

                                    <TableHead sticky>Status</TableHead>

                                    {showActions && (
                                        <TableHead
                                            sticky
                                            style={{
                                                width: '90px',
                                            }}
                                        >
                                            Action
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data?.data?.length > 0 ? (
                                    data.data.map((order, index) => {
                                        const isPending =
                                            order.status === 'Pending';

                                        return (
                                            <TableRow key={order.id}>
                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | SL
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {(data.current_page - 1) *
                                                        data.per_page +
                                                        index +
                                                        1}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | PO / Created
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    <strong>
                                                        #{order.order_id}
                                                    </strong>

                                                    <br />

                                                    <small className="text-muted">
                                                        {formatDateTime(
                                                            order.created_at,
                                                        )}
                                                    </small>
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Order Date
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {formatDate(
                                                        order.order_date,
                                                    )}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Mode / Requisition
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {order.is_requisition_based ? (
                                                        <>
                                                            <span
                                                                className="badge bg-success"
                                                                style={{
                                                                    fontSize:
                                                                        '11px',

                                                                    padding:
                                                                        '4px 8px',
                                                                }}
                                                            >
                                                                Requisition
                                                            </span>

                                                            <br />

                                                            <small>
                                                                {order
                                                                    .requisition
                                                                    ?.requisition_id ??
                                                                    '—'}
                                                            </small>
                                                        </>
                                                    ) : (
                                                        <span
                                                            className="badge bg-secondary"
                                                            style={{
                                                                fontSize:
                                                                    '11px',

                                                                padding:
                                                                    '4px 8px',
                                                            }}
                                                        >
                                                            Free
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Vendor
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {order.vendor?.name ??
                                                        'N/A'}

                                                    <br />

                                                    <small className="text-muted">
                                                        #
                                                        {order.vendor
                                                            ?.vendor_id ?? ''}
                                                    </small>
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Grand Total
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    <span className="text-nowrap">
                                                        {currencySymbol}{' '}
                                                        {formatAmount(
                                                            Number(
                                                                order.grand_total ??
                                                                    0,
                                                            ) * exchangeRate,
                                                        )}
                                                    </span>
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Status
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    <span
                                                        className={`badge ${getStatusClass(
                                                            order.status,
                                                        )}`}
                                                        style={{
                                                            padding: '4px 10px',

                                                            borderRadius: '4px',

                                                            fontSize: '12px',

                                                            fontWeight: 600,

                                                            textTransform:
                                                                'uppercase',
                                                        }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Actions
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                {showActions && (
                                                    <TableCell>
                                                        <ActionCell
                                                            isPending={
                                                                isPending
                                                            }
                                                            onView={() =>
                                                                router.visit(
                                                                    `/purchase-order/${order.id}/show`,
                                                                )
                                                            }
                                                            onEdit={() =>
                                                                router.visit(
                                                                    `/purchase-order/${order.id}/edit`,
                                                                )
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(
                                                                    order.id,
                                                                )
                                                            }
                                                            canView={canView}
                                                            canEdit={canEdit}
                                                            canDelete={
                                                                canDelete
                                                            }
                                                        />
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableEmpty colSpan={8} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                    <CardFooter>
                        <div className="d-flex justify-content-between gap-3">
                            <TablePaginationInfo
                                from={data?.from ?? 0}
                                to={data?.to ?? 0}
                                total={data?.total}
                            />

                            <Pagination
                                currentPage={data?.current_page}
                                lastPage={data?.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | Delete Confirmation
            |--------------------------------------------------------------------------
            */}

            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedPurchaseOrderId(null);
                    }
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Action Cell
|--------------------------------------------------------------------------
*/

type ActionCellProps = {
    isPending: boolean;

    onView: () => void;

    onEdit: () => void;

    onDelete: () => void;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
};

function ActionCell({
    isPending,
    onView,
    onEdit,
    onDelete,
    canView,
    canEdit,
    canDelete,
}: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            {/*
            |--------------------------------------------------------------------------
            | View
            |--------------------------------------------------------------------------
            */}

            {canView && (
                <li>
                    <button
                        type="button"
                        className="btn btn-link p-0 border-0"
                        title="Show Purchase"
                        onClick={onView}
                    >
                        <Eye size={20} />
                    </button>
                </li>
            )}

            {/*
            |--------------------------------------------------------------------------
            | Edit + Delete
            |--------------------------------------------------------------------------
            |
            | Same as Blade:
            | only Pending purchase orders can be edited/deleted.
            |
            */}

            {isPending && (
                <>
                    {canEdit && (
                        <li>
                            <button
                                type="button"
                                className="btn btn-link p-0 border-0"
                                title="Edit Purchase"
                                onClick={onEdit}
                            >
                                <Edit size={20} />
                            </button>
                        </li>
                    )}

                    {canDelete && (
                        <li>
                            <button
                                type="button"
                                className="btn btn-link text-danger p-0 border-0"
                                title="Delete"
                                onClick={onDelete}
                            >
                                <Trash size={20} />
                            </button>
                        </li>
                    )}
                </>
            )}
        </ul>
    );
}
