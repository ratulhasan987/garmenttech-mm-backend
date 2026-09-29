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
import { usePermission } from '@/hooks/use-permission';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type GrnStatus = 'Pending' | 'Approved' | 'Rejected';

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

type Requisition = {
    id: number;

    requisition_id: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;

    requisition_id: number | null;

    status: string;

    vendor: Vendor | null;

    requisition: Requisition | null;
};

type GoodsReceivedNote = {
    id: number;

    grn_no: string;

    purchase_order_id: number;

    warehouse_id: number | null;

    received_date: string | null;

    status: GrnStatus;

    document: string | null;

    note: string | null;

    created_at: string;

    purchase_order: PurchaseOrder | null;

    received_by: User | null;

    approved_by: User | null;
};

type GrnFilters = {
    grn_no?: string | null;

    status?: GrnStatus | '';

    sorting?: 'asc' | 'desc' | '';

    start_date?: string | null;

    end_date?: string | null;
};

type GrnIndexPageProps = {
    grns: PaginatedData<GoodsReceivedNote>;

    filters: GrnFilters;

    numberOfGrns: number;

    hasFilters: boolean;
};

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| These follow the same route structure as the Purchase Order module.
|
*/

const GRN_INDEX_URL = '/grn';

const GRN_CREATE_URL = '/grn/create';

const grnShowUrl = (id: number) => `/grn/${id}/show`;

const grnEditUrl = (id: number) => `/grn/edit/${id}`;

const grnDeleteUrl = (id: number) => `/grn/${id}`;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getStatusClass(status: GrnStatus) {
    switch (status) {
        case 'Approved':
            return 'bg-success';

        case 'Rejected':
            return 'bg-danger';

        case 'Pending':
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

type GrnSuggestion = {
    id: number;

    grn_no: string;

    purchase_order_id: number;

    order_id: string | null;

    received_date: string | null;

    status: GrnStatus;
};

async function searchGrns(
    query: string,
    signal?: AbortSignal,
): Promise<GrnSuggestion[]> {
    const response = await fetch(
        `/get-grns?keyword=${encodeURIComponent(query)}`,
        {
            signal,

            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search GRNs.');
    }

    return response.json();
}

export default function GrnIndexPage({
    grns,
    filters,
    numberOfGrns,
    hasFilters,
}: GrnIndexPageProps) {
    const { can, canAny } = usePermission();
    const showActions = canAny(['grn.view', 'grn.edit', 'grn.delete']);
    const canCreate = can('grn.create');
    const canEdit = can('grn.edit');
    const canView = can('grn.view');
    const canDelete = can('grn.delete');

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [grnNo, setGrnNo] = useState(filters?.grn_no ?? '');

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

    const [selectedGrnId, setSelectedGrnId] = useState<number | null>(null);

    const [deleting, setDeleting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Filter
    |--------------------------------------------------------------------------
    */

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            GRN_INDEX_URL,
            {
                ...(grnNo.trim()
                    ? {
                          grn_no: grnNo.trim(),
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

                ...(grnNo.trim()
                    ? {
                          grn_no: grnNo.trim(),
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

    const handleGrnSelect = (grn: GrnSuggestion) => {
        setGrnNo(grn.grn_no);

        router.get(
            GRN_INDEX_URL,
            {
                grn_no: grn.grn_no,

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

    const handleGrnClear = () => {
        setGrnNo('');

        router.get(
            GRN_INDEX_URL,
            {
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
        setGrnNo('');

        setSorting('');

        setStartDate('');

        setEndDate('');

        router.get(
            GRN_INDEX_URL,
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
        setSelectedGrnId(id);

        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedGrnId === null) {
            return;
        }

        router.delete(grnDeleteUrl(selectedGrnId), {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onFinish: () => {
                setDeleting(false);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);

                setSelectedGrnId(null);
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
            <Head title="GRN" />

            <PageTitle title="GRN" />

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
                            | Add GRN
                            |--------------------------------------------------------------------------
                            */}

                            {canCreate && (
                                <Button
                                    type="button"
                                    onClick={() => router.visit(GRN_CREATE_URL)}
                                >
                                    Add GRN
                                </Button>
                            )}

                            {/*
                            |--------------------------------------------------------------------------
                            | GRN Number
                            |--------------------------------------------------------------------------
                            */}

                            <div
                                className="flex-grow-1"
                                style={{
                                    minWidth: '260px',
                                }}
                            >
                                <SuggestionSearchInput<GrnSuggestion>
                                    searchFn={searchGrns}
                                    idKey="id"
                                    labelKey="grn_no"
                                    secondaryLabelKey="order_id"
                                    placeholder="Search GRN..."
                                    showSearchIcon
                                    clearOnFocus={false}
                                    defaultValue={filters?.grn_no ?? ''}
                                    onSelect={handleGrnSelect}
                                    onClear={handleGrnClear}
                                    emptyLabel="No GRNs found."
                                />
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Sorting
                            |--------------------------------------------------------------------------
                            */}

                            <div
                                style={{
                                    flex: 1,

                                    flexBasis: '200px',
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
                            | Start Date
                            |--------------------------------------------------------------------------
                            */}

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

                            {/*
                            |--------------------------------------------------------------------------
                            | End Date
                            |--------------------------------------------------------------------------
                            */}

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

                            {/*
                            |--------------------------------------------------------------------------
                            | Filter Button
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
                    | Table
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

                                    <TableHead sticky>Date</TableHead>

                                    <TableHead sticky>
                                        Requisition No.
                                    </TableHead>

                                    <TableHead sticky>PO No.</TableHead>

                                    <TableHead sticky>Vendor</TableHead>

                                    <TableHead sticky>Received By</TableHead>

                                    <TableHead sticky>Status</TableHead>

                                    <TableHead sticky>Approved By</TableHead>

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
                                {grns?.data?.length > 0 ? (
                                    grns.data.map((grn, index) => {
                                        const isPending =
                                            grn.status === 'Pending';

                                        return (
                                            <TableRow key={grn.id}>
                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | SL
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {(grns.current_page - 1) *
                                                        grns.per_page +
                                                        index +
                                                        1}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Date / GRN
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {formatDate(
                                                        grn.received_date,
                                                    )}

                                                    <br />

                                                    <small className="text-muted">
                                                        #{grn.grn_no}
                                                    </small>
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Requisition
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {grn.purchase_order
                                                        ?.requisition
                                                        ?.requisition_id ?? '—'}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Purchase Order
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {grn.purchase_order
                                                        ?.order_id ? (
                                                        <strong>
                                                            #
                                                            {
                                                                grn
                                                                    .purchase_order
                                                                    .order_id
                                                            }
                                                        </strong>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Vendor
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {grn.purchase_order?.vendor
                                                        ?.name ?? '—'}

                                                    {grn.purchase_order
                                                        ?.vendor && (
                                                        <>
                                                            <br />

                                                            <small className="text-muted">
                                                                #
                                                                {grn
                                                                    .purchase_order
                                                                    .vendor
                                                                    .vendor_id ??
                                                                    ''}
                                                            </small>
                                                        </>
                                                    )}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Received By
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {grn.received_by?.name ??
                                                        '—'}

                                                    {grn.received_by
                                                        ?.employee_id && (
                                                        <>
                                                            <br />

                                                            <small className="text-muted">
                                                                #
                                                                {
                                                                    grn
                                                                        .received_by
                                                                        .employee_id
                                                                }
                                                            </small>
                                                        </>
                                                    )}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Status
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    <span
                                                        className={`badge ${getStatusClass(
                                                            grn.status,
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
                                                        {grn.status}
                                                    </span>
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Approved By
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                <TableCell>
                                                    {grn.approved_by?.name ??
                                                        '—'}

                                                    {grn.approved_by
                                                        ?.employee_id && (
                                                        <>
                                                            <br />

                                                            <small className="text-muted">
                                                                #
                                                                {
                                                                    grn
                                                                        .approved_by
                                                                        .employee_id
                                                                }
                                                            </small>
                                                        </>
                                                    )}
                                                </TableCell>

                                                {/*
                                                    |--------------------------------------------------------------------------
                                                    | Action
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
                                                                    grnShowUrl(
                                                                        grn.id,
                                                                    ),
                                                                )
                                                            }
                                                            onEdit={() =>
                                                                router.visit(
                                                                    grnEditUrl(
                                                                        grn.id,
                                                                    ),
                                                                )
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(
                                                                    grn.id,
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
                                    <TableEmpty colSpan={9} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                    <CardFooter>
                        <div className="d-flex justify-content-between gap-3">
                            <TablePaginationInfo
                                from={grns?.from ?? 0}
                                to={grns?.to ?? 0}
                                total={grns?.total}
                            />

                            <Pagination
                                currentPage={grns?.current_page}
                                lastPage={grns?.last_page}
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
                        setSelectedGrnId(null);
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
                        title="Show GRN"
                        onClick={onView}
                    >
                        <Eye size={20} />
                    </button>
                </li>
            )}

            {/*
            |--------------------------------------------------------------------------
            | Pending Only
            |--------------------------------------------------------------------------
            |
            | Approved / Rejected GRNs are locked.
            |
            */}

            {isPending && (
                <>
                    {canEdit && (
                        <li>
                            <button
                                type="button"
                                className="btn btn-link p-0 border-0"
                                title="Edit GRN"
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
                                title="Delete GRN"
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
