import { type FormEvent, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import { Edit, Eye, Trash } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

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

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PurchaseReturnStatus = 'Draft' | 'Approved' | 'Cancelled';

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

type PurchaseReturn = {
    id: number;

    return_no: string;

    return_date: string | null;

    grand_total: number;

    status: PurchaseReturnStatus;

    created_at: string;

    vendor: Vendor | null;

    warehouse: Warehouse | null;

    created_by: User | null;

    approved_by: User | null;
};

type PurchaseReturnFilters = {
    return_no?: string | null;

    status?: PurchaseReturnStatus | '';

    sorting?: 'asc' | 'desc' | '';

    start_date?: string | null;

    end_date?: string | null;
};

type PurchaseReturnIndexPageProps = {
    returns: PaginatedData<PurchaseReturn>;

    filters: PurchaseReturnFilters;

    numberOfReturns: number;

    hasFilters: boolean;
};

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const PURCHASE_RETURN_INDEX_URL = '/purchase-returns';

const PURCHASE_RETURN_CREATE_URL = '/purchase-returns/create';

const purchaseReturnShowUrl = (id: number) => `/purchase-returns/${id}/show`;

const purchaseReturnEditUrl = (id: number) => `/purchase-returns/${id}/edit`;

const purchaseReturnDeleteUrl = (id: number) => `/purchase-returns/${id}`;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getStatusClass(status: PurchaseReturnStatus) {
    switch (status) {
        case 'Approved':
            return 'bg-success';

        case 'Cancelled':
            return 'bg-danger';

        case 'Draft':
            return 'bg-warning';

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

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function PurchaseReturnIndexPage({
    returns,

    filters,

    numberOfReturns,

    hasFilters,
}: PurchaseReturnIndexPageProps) {
    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [returnNo, setReturnNo] = useState(filters?.return_no ?? '');

    const [sorting, setSorting] = useState<'asc' | 'desc' | ''>(
        filters?.sorting ?? '',
    );

    const [status, setStatus] = useState<PurchaseReturnStatus | ''>(
        filters?.status ?? '',
    );

    const [startDate, setStartDate] = useState(filters?.start_date ?? '');

    const [endDate, setEndDate] = useState(filters?.end_date ?? '');

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedReturnId, setSelectedReturnId] = useState<number | null>(
        null,
    );

    const [deleting, setDeleting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Filter
    |--------------------------------------------------------------------------
    */

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            PURCHASE_RETURN_INDEX_URL,

            {
                ...(returnNo.trim()
                    ? {
                          return_no: returnNo.trim(),
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
        setReturnNo('');

        setStatus('');

        setSorting('');

        setStartDate('');

        setEndDate('');

        router.get(
            PURCHASE_RETURN_INDEX_URL,

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
        setSelectedReturnId(id);

        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedReturnId === null) {
            return;
        }

        router.delete(
            purchaseReturnDeleteUrl(selectedReturnId),

            {
                preserveScroll: true,

                onStart: () => {
                    setDeleting(true);
                },

                onFinish: () => {
                    setDeleting(false);
                },

                onSuccess: () => {
                    setDeleteModalOpen(false);

                    setSelectedReturnId(null);
                },
            },
        );
    };

    const visitPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.visit(
            url,

            {
                preserveState: true,

                preserveScroll: true,
            },
        );
    };
    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Purchase Return" />

            <PageTitle title="Purchase Return" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <form
                            onSubmit={handleFilter}

                            className="
                                d-flex
                                gap-2
                                flex-wrap
                                justify-content-start
                                align-items-center
                            "
                        >
                            <Button
                                type="button"

                                onClick={() =>
                                    router.visit(PURCHASE_RETURN_CREATE_URL)
                                }
                            >
                                Add Purchase Return
                            </Button>

                            <div
                                style={{
                                    flex: 1,
                                    flexBasis: '200px',
                                }}
                            >
                                <input
                                    type="text"

                                    className="form-control"

                                    value={returnNo}

                                    onChange={(e) =>
                                        setReturnNo(e.target.value)
                                    }

                                    placeholder="
                                        Return No.
                                    "
                                />
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    flexBasis: '200px',
                                }}
                            >
                                <Select
                                    value={status}

                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value as
                                                PurchaseReturnStatus | '',
                                        )
                                    }
                                >
                                    <option value="">-- Status --</option>

                                    <option value="Draft">Draft</option>

                                    <option value="Approved">Approved</option>

                                    <option value="Cancelled">Cancelled</option>
                                </Select>
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    flexBasis: '200px',
                                }}
                            >
                                <Select
                                    value={sorting}

                                    onChange={(e) =>
                                        setSorting(
                                            e.target.value as
                                                'asc' | 'desc' | '',
                                        )
                                    }
                                >
                                    <option value="">-- Sort By Date --</option>

                                    <option value="asc">Oldest First</option>

                                    <option value="desc">Newest First</option>
                                </Select>
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    flexBasis: '200px',
                                }}
                            >
                                <DatePicker
                                    value={startDate}

                                    onChange={setStartDate}

                                    placeholder="From"

                                    maxDate={endDate || undefined}
                                />
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    flexBasis: '200px',
                                }}
                            >
                                <DatePicker
                                    value={endDate}

                                    onChange={setEndDate}

                                    placeholder="To"

                                    minDate={startDate || undefined}
                                />
                            </div>

                            <Button type="submit">Filter</Button>

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

                    <CardBody>
                        <Table
                            wrapperClassName="
                                overflow-auto
                                text-nowrap
                            "

                            wrapperStyle={{
                                height: 'calc(100vh - 280px)',

                                position: 'relative',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>SL</TableHead>

                                    <TableHead sticky>Date</TableHead>

                                    <TableHead sticky>Return No.</TableHead>

                                    <TableHead sticky>Vendor</TableHead>

                                    <TableHead sticky>Warehouse</TableHead>

                                    <TableHead sticky>Amount</TableHead>

                                    <TableHead sticky>Status</TableHead>

                                    <TableHead sticky>Created By</TableHead>

                                    <TableHead sticky>Approved By</TableHead>

                                    <TableHead sticky>Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {returns?.data?.length > 0 ? (
                                    returns.data.map((item, index) => {
                                        const isDraft = item.status === 'Draft';

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {(returns.current_page -
                                                        1) *
                                                        returns.per_page +
                                                        index +
                                                        1}
                                                </TableCell>

                                                <TableCell>
                                                    {formatDate(
                                                        item.return_date,
                                                    )}

                                                    <br />

                                                    <small className="text-muted">
                                                        #{item.return_no}
                                                    </small>
                                                </TableCell>

                                                <TableCell>
                                                    <strong>
                                                        #{item.return_no}
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    {item.vendor?.name ?? '—'}

                                                    {item.vendor && (
                                                        <>
                                                            <br />

                                                            <small className="text-muted">
                                                                #
                                                                {
                                                                    item.vendor
                                                                        .vendor_id
                                                                }
                                                            </small>
                                                        </>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {item.warehouse?.name ??
                                                        '—'}
                                                </TableCell>

                                                <TableCell>
                                                    {Number(
                                                        item.grand_total,
                                                    ).toFixed(2)}
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`badge ${getStatusClass(
                                                            item.status,
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
                                                        {item.status}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    {item.created_by?.name ??
                                                        '—'}

                                                    {item.created_by
                                                        ?.employee_id && (
                                                        <>
                                                            <br />

                                                            <small className="text-muted">
                                                                #
                                                                {
                                                                    item
                                                                        .created_by
                                                                        .employee_id
                                                                }
                                                            </small>
                                                        </>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {item.approved_by?.name ??
                                                        '—'}
                                                </TableCell>

                                                <TableCell>
                                                    <ActionCell
                                                        isDraft={isDraft}

                                                        onView={() =>
                                                            router.visit(
                                                                purchaseReturnShowUrl(
                                                                    item.id,
                                                                ),
                                                            )
                                                        }

                                                        onEdit={() =>
                                                            router.visit(
                                                                purchaseReturnEditUrl(
                                                                    item.id,
                                                                ),
                                                            )
                                                        }

                                                        onDelete={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableEmpty colSpan={10} />
                                )}
                            </TableBody>
                        </Table>

                        <div
                            className="
                            mt-2
                            d-flex
                            flex-wrap
                            justify-content-between
                            align-items-center
                            gap-2
                        "
                        >
                            <div>
                                {returns.total > 0 ? (
                                    <>
                                        Showing {returns.from} to {returns.to}{' '}
                                        of {numberOfReturns} Purchase Returns
                                    </>
                                ) : (
                                    <>No Purchase Return found</>
                                )}
                            </div>

                            {returns.last_page > 1 && (
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        {returns.links.map((link, index) => (
                                            <li
                                                key={index}

                                                className={`
                                                                page-item
                                                                ${
                                                                    link.active
                                                                        ? 'active'
                                                                        : ''
                                                                }
                                                                ${
                                                                    !link.url
                                                                        ? 'disabled'
                                                                        : ''
                                                                }
                                                                `}
                                            >
                                                <button
                                                    type="button"

                                                    className="page-link"

                                                    disabled={!link.url}

                                                    onClick={() =>
                                                        visitPage(link.url)
                                                    }

                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            <DeleteConfirmModal
                open={deleteModalOpen}

                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedReturnId(null);
                    }
                }}

                processing={deleting}

                onConfirm={confirmDelete}
            />
        </>
    );
}

type ActionCellProps = {
    isDraft: boolean;

    onView: () => void;

    onEdit: () => void;

    onDelete: () => void;
};

function ActionCell({
    isDraft,

    onView,

    onEdit,

    onDelete,
}: ActionCellProps) {
    return (
        <ul
            className="
            d-flex
            align-items-center
            gap-2
            mb-0
            p-0
            list-unstyled
        "
        >
            <li>
                <button
                    type="button"

                    className="
                        btn
                        btn-link
                        p-0
                        border-0
                    "

                    title="Show Purchase Return"

                    onClick={onView}
                >
                    <Eye size={20} />
                </button>
            </li>

            {isDraft && (
                <>
                    <li>
                        <button
                            type="button"

                            className="
                                    btn
                                    btn-link
                                    p-0
                                    border-0
                                "

                            title="Edit Purchase Return"

                            onClick={onEdit}
                        >
                            <Edit size={20} />
                        </button>
                    </li>

                    <li>
                        <button
                            type="button"

                            className="
                                    btn
                                    btn-link
                                    text-danger
                                    p-0
                                    border-0
                                "

                            title="Delete Purchase Return"

                            onClick={onDelete}
                        >
                            <Trash size={20} />
                        </button>
                    </li>
                </>
            )}
        </ul>
    );
}
