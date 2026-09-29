import { useState } from 'react';

import { Head, router } from '@inertiajs/react';

import { Edit, Eye, Trash } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { Select } from '@/components/ui/form/select';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type { PaginatedData } from '@/types/pagination';
import dayjs from 'dayjs';
import { usePermission } from '@/hooks/use-permission';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type User = {
    id: number;
    name: string;
    employee_id: string | null;
};

type RequisitionStatus = 'Pending' | 'Approved' | 'Rejected';

type Requisition = {
    id: number;

    requisition_id: string;

    required_date: string | null;

    requested_by: User | null;

    approved_by: User | null;

    status: RequisitionStatus;

    created_at: string;

    updated_at: string;
};

type RequisitionSuggestion = {
    id: number;

    requisition_id: string;

    purpose: string | null;

    status: RequisitionStatus;
};

type RequisitionFilters = {
    requisition_id?: string | null;

    status?: RequisitionStatus | '';

    sort?: 'latest' | 'oldest';
};

type RequisitionIndexPageProps = {
    data: PaginatedData<Requisition>;

    filters: RequisitionFilters;
};

/*
|--------------------------------------------------------------------------
| Search Requisition
|--------------------------------------------------------------------------
*/

async function searchRequisitions(
    query: string,
    signal?: AbortSignal,
): Promise<RequisitionSuggestion[]> {
    const response = await fetch(
        `/get-requisitions?keyword=${encodeURIComponent(query)}`,
        {
            signal,

            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search requisitions.');
    }

    return response.json();
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getStatusClass(status: RequisitionStatus) {
    switch (status) {
        case 'Approved':
            return 'bg-success';

        case 'Rejected':
            return 'bg-danger';

        default:
            return 'bg-warning text-dark';
    }
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return '-';
    }

    const date = new Date(`${value.substring(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',

        month: 'short',

        year: 'numeric',
    }).format(date);
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function RequisitionIndexPage({
    data,
    filters,
}: RequisitionIndexPageProps) {
    const { can, canAny } = usePermission();

    const showActions = canAny([
        'requisition.edit',
        'requisition.view',
        'requisition.delete',
    ]);
    const canView = can('requisition.view');
    const canEdit = can('requisition.edit');
    const canDelete = can('requisition.delete');
    const canCreate = can('requisition.create');

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [requisitionId, setRequisitionId] = useState<string | null>(
        filters?.requisition_id ?? null,
    );

    const [status, setStatus] = useState<RequisitionStatus | ''>(
        filters?.status ?? '',
    );

    const [sortBy, setSortBy] = useState<'latest' | 'oldest'>(
        filters?.sort ?? 'latest',
    );

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedRequisitionId, setSelectedRequisitionId] = useState<
        number | null
    >(null);

    const [deleting, setDeleting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Apply Filters
    |--------------------------------------------------------------------------
    */

    const applyFilters = (
        nextRequisitionId: string | null,

        nextStatus: RequisitionStatus | '',

        nextSort: 'latest' | 'oldest',
    ) => {
        router.get(
            window.location.pathname,
            {
                ...(nextRequisitionId
                    ? {
                          requisition_id: nextRequisitionId,
                      }
                    : {}),

                ...(nextStatus
                    ? {
                          status: nextStatus,
                      }
                    : {}),

                sort: nextSort,
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

                ...(requisitionId
                    ? {
                          requisition_id: requisitionId,
                      }
                    : {}),

                ...(status
                    ? {
                          status,
                      }
                    : {}),

                sort: sortBy,
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
    | Requisition Filter
    |--------------------------------------------------------------------------
    */

    const handleRequisitionSelect = (requisition: RequisitionSuggestion) => {
        setRequisitionId(requisition.requisition_id);

        applyFilters(requisition.requisition_id, status, sortBy);
    };

    const handleRequisitionClear = () => {
        setRequisitionId(null);

        applyFilters(null, status, sortBy);
    };

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = (value: RequisitionStatus | '') => {
        setStatus(value);

        applyFilters(requisitionId, value, sortBy);
    };

    /*
    |--------------------------------------------------------------------------
    | Sort
    |--------------------------------------------------------------------------
    */

    const handleSortChange = (value: 'latest' | 'oldest') => {
        setSortBy(value);

        applyFilters(requisitionId, status, value);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = (id: number) => {
        setSelectedRequisitionId(id);

        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedRequisitionId) {
            return;
        }

        router.delete(`/requisition/${selectedRequisitionId}`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onFinish: () => {
                setDeleting(false);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);

                setSelectedRequisitionId(null);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Requisitions" />

            <PageTitle title="Requisition List" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2">
                            {/*
                            |--------------------------------------------------------------------------
                            | Create
                            |--------------------------------------------------------------------------
                            */}

                            {canCreate && (
                                <div className="flex-shrink-0">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            router.visit('/requisition/create')
                                        }
                                    >
                                        Add New
                                    </Button>
                                </div>
                            )}

                            {/*
                            |--------------------------------------------------------------------------
                            | Filters
                            |--------------------------------------------------------------------------
                            */}

                            <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2">
                                {/* Search */}

                                <div
                                    className="flex-grow-1"
                                    style={{
                                        minWidth: '260px',
                                    }}
                                >
                                    <SuggestionSearchInput<RequisitionSuggestion>
                                        searchFn={searchRequisitions}
                                        idKey="id"
                                        labelKey="requisition_id"
                                        secondaryLabelKey="purpose"
                                        placeholder="Search requisition..."
                                        showSearchIcon
                                        clearOnFocus={false}
                                        defaultValue={
                                            filters?.requisition_id ?? ''
                                        }
                                        onSelect={handleRequisitionSelect}
                                        onClear={handleRequisitionClear}
                                        emptyLabel="No requisitions found."
                                    />
                                </div>

                                {/* Status */}

                                <div
                                    className="flex-shrink-0"
                                    style={{
                                        minWidth: '150px',
                                    }}
                                >
                                    <Select
                                        value={status}
                                        onChange={(event) =>
                                            handleStatusChange(
                                                event.target.value as
                                                    RequisitionStatus | '',
                                            )
                                        }
                                    >
                                        <option value="">All Status</option>

                                        <option value="Pending">Pending</option>

                                        <option value="Approved">
                                            Approved
                                        </option>

                                        <option value="Rejected">
                                            Rejected
                                        </option>
                                    </Select>
                                </div>

                                {/* Sorting */}

                                <div
                                    className="flex-shrink-0"
                                    style={{
                                        minWidth: '160px',
                                    }}
                                >
                                    <Select
                                        value={sortBy}
                                        onChange={(event) =>
                                            handleSortChange(
                                                event.target.value as
                                                    'latest' | 'oldest',
                                            )
                                        }
                                    >
                                        <option value="latest">
                                            Newest First
                                        </option>

                                        <option value="oldest">
                                            Oldest First
                                        </option>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{
                                maxHeight: 'calc(100vh - 350px)',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>SL</TableHead>

                                    <TableHead sticky>Requisition</TableHead>

                                    <TableHead sticky>Requested By</TableHead>

                                    <TableHead sticky>Required Date</TableHead>

                                    <TableHead sticky>Approved By</TableHead>

                                    <TableHead sticky>Status</TableHead>

                                    {showActions && (
                                        <TableHead sticky>Action</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data?.data?.length > 0 ? (
                                    data.data.map((requisition, index) => (
                                        <TableRow key={requisition.id}>
                                            {/* SL */}

                                            <TableCell>
                                                {(data?.from ?? 1) + index}
                                            </TableCell>

                                            {/* Requisition */}

                                            <TableCell>
                                                <div className="d-flex flex-column">
                                                    <span className="text-muted">
                                                        {dayjs(
                                                            requisition.created_at,
                                                        ).format(
                                                            'DD MMM, YYYY hh:mm A',
                                                        )}
                                                    </span>
                                                    <span className="fs-6 fw-semibold">
                                                        #
                                                        {
                                                            requisition.requisition_id
                                                        }
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Requested By */}

                                            <TableCell>
                                                <div className="d-flex flex-column">
                                                    <span className="fs-6">
                                                        {requisition
                                                            .requested_by
                                                            ?.name ?? '-'}
                                                    </span>
                                                    <span className="text-muted">
                                                        {requisition
                                                            .requested_by
                                                            ?.employee_id ??
                                                            '-'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Required Date */}

                                            <TableCell>
                                                {formatDate(
                                                    requisition.required_date,
                                                )}
                                            </TableCell>

                                            {/* Items */}

                                            <TableCell>
                                                {requisition.approved_by
                                                    ?.name ?? '-'}
                                            </TableCell>

                                            {/* Status */}

                                            <TableCell>
                                                <span
                                                    className={`badge ${getStatusClass(
                                                        requisition.status,
                                                    )}`}
                                                >
                                                    {requisition.status}
                                                </span>
                                            </TableCell>

                                            {/* Action */}

                                            {showActions && (
                                                <TableCell>
                                                    <ActionCell
                                                        onView={() =>
                                                            router.visit(
                                                                `/requisition/${requisition.id}`,
                                                            )
                                                        }
                                                        onEdit={() =>
                                                            router.visit(
                                                                `/requisition/${requisition.id}/edit`,
                                                            )
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(
                                                                requisition.id,
                                                            )
                                                        }

                                                        canView={canView}
                                                        canEdit={canEdit}
                                                        canDelete={canDelete}
                                                    />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={9} />
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
                        setSelectedRequisitionId(null);
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
    onView: () => void;

    onEdit: () => void;

    onDelete: () => void;

    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
};

function ActionCell({
    onView,
    onEdit,
    onDelete,
    canView,
    canEdit,
    canDelete,
}: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            {/* View */}

            {canView && (
                <li>
                    <button
                        type="button"
                        className="btn btn-link p-0 border-0"
                        title="View"
                        onClick={onView}
                    >
                        <Eye size={22} />
                    </button>
                </li>
            )}

            {/* Edit */}

            {canEdit && (
                <li>
                    <button
                        type="button"
                        className="btn btn-link p-0 border-0"
                        title="Edit"
                        onClick={onEdit}
                    >
                        <Edit size={22} />
                    </button>
                </li>
            )}

            {/* Delete */}

            {canDelete && (
                <li>
                    <button
                        type="button"
                        className="btn btn-link text-danger p-0 border-0"
                        title="Delete"
                        onClick={onDelete}
                    >
                        <Trash size={22} />
                    </button>
                </li>
            )}
        </ul>
    );
}
