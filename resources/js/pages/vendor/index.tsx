import { useState } from 'react';

import { Head, router } from '@inertiajs/react';

import { Edit, Eye, Trash } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import CreateVendorModal from '@/components/pages/vendor/create-vendor-modal';
import EditVendorModal from '@/components/pages/vendor/edit-vendor-modal';
import ShowVendorModal from '@/components/pages/vendor/show-vendor-modal';

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

import { rihoAsset } from '@/lib/riho';

import type { PaginatedData } from '@/types/pagination';
import type { Vendor } from '@/types/vendor';
import { usePermission } from '@/hooks/use-permission';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type VendorSuggestion = {
    id: number;
    vendor_id: string;
    name: string;
    company_name: string | null;
    email: string | null;
};

type VendorFilters = {
    vendor_id?: number | string | null;
    vendor_name?: string | null;
    sort?: 'latest' | 'oldest';
};

type VendorIndexPageProps = {
    data: PaginatedData<Vendor>;
    filters: VendorFilters;
};

/*
|--------------------------------------------------------------------------
| Vendor Search
|--------------------------------------------------------------------------
*/

async function searchVendors(
    query: string,
    signal?: AbortSignal,
): Promise<VendorSuggestion[]> {
    const response = await fetch(
        `/get-vendors?keyword=${encodeURIComponent(query)}`,
        {
            signal,

            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search vendors.');
    }

    return response.json();
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function VendorIndexPage({
    data,
    filters,
}: VendorIndexPageProps) {
    const { can, canAny } = usePermission();
    const canCreate = can('vendor.create');
    const canEdit = can('vendor.edit');
    const canDelete = can('vendor.delete');
    const canView = can('vendor.view');
    const showActions = canAny(['vendor.view', 'vendor.edit', 'vendor.delete']);

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    const [createModalOpen, setCreateModalOpen] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | View
    |--------------------------------------------------------------------------
    */

    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    const [showVendorModal, setShowVendorModal] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const [editVendor, setEditVendor] = useState<Vendor | null>(null);

    const [editVendorOpen, setEditVendorOpen] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(
        null,
    );

    const [deleting, setDeleting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [filterVendorId, setFilterVendorId] = useState<number | null>(
        filters?.vendor_id ? Number(filters?.vendor_id) : null,
    );

    const [sortBy, setSortBy] = useState<'latest' | 'oldest'>(
        filters?.sort ?? 'latest',
    );

    /*
    |--------------------------------------------------------------------------
    | Apply Filters
    |--------------------------------------------------------------------------
    */

    const applyFilters = (
        vendorId: number | null,
        sort: 'latest' | 'oldest',
    ) => {
        router.get(
            window.location.pathname,
            {
                ...(vendorId
                    ? {
                          vendor_id: vendorId,
                      }
                    : {}),

                sort,
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
    | Vendor Filter
    |--------------------------------------------------------------------------
    */

    const handleVendorSelect = (vendor: VendorSuggestion) => {
        setFilterVendorId(vendor.id);

        applyFilters(vendor.id, sortBy);
    };

    const handleVendorClear = () => {
        setFilterVendorId(null);

        applyFilters(null, sortBy);
    };

    /*
    |--------------------------------------------------------------------------
    | Sort
    |--------------------------------------------------------------------------
    */

    const handleSortChange = (value: 'latest' | 'oldest') => {
        setSortBy(value);

        applyFilters(filterVendorId, value);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = (id: number) => {
        setSelectedVendorId(id);

        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedVendorId) {
            return;
        }

        router.delete(`/vendor/${selectedVendorId}`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onFinish: () => {
                setDeleting(false);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);

                setSelectedVendorId(null);
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
            <Head title="Vendor" />

            <PageTitle title="Vendor List" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2">
                            {/* Add Vendor */}

                            {canCreate && (
                                <div className="flex-shrink-0">
                                    <Button
                                        onClick={() => setCreateModalOpen(true)}
                                    >
                                        Add New
                                    </Button>
                                </div>
                            )}

                            {/* Filters */}

                            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                {/* Vendor Search */}

                                <div className="flex-grow-1">
                                    <SuggestionSearchInput<VendorSuggestion>
                                        searchFn={searchVendors}
                                        idKey="id"
                                        labelKey="name"
                                        secondaryLabelKey="vendor_id"
                                        placeholder="Search vendor..."
                                        showSearchIcon
                                        clearOnFocus={false}
                                        defaultValue={
                                            filters?.vendor_name ?? ''
                                        }
                                        onSelect={handleVendorSelect}
                                        onClear={handleVendorClear}
                                        emptyLabel="No vendors found."
                                    />
                                </div>

                                {/* Sort */}

                                <div className="flex-shrink-0">
                                    <Select
                                        id="sort"
                                        name="sort"
                                        value={sortBy}
                                        onChange={(event) =>
                                            handleSortChange(
                                                event.target.value as
                                                    'latest' | 'oldest',
                                            )
                                        }
                                        className="w-100"
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

                                    <TableHead sticky>Image</TableHead>

                                    <TableHead sticky>Name</TableHead>

                                    <TableHead sticky>Company</TableHead>

                                    <TableHead sticky>Email</TableHead>

                                    <TableHead sticky>Phone</TableHead>

                                    {showActions && (
                                        <TableHead sticky>Action</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data?.data?.length > 0 ? (
                                    data.data.map((vendor, index) => (
                                        <TableRow key={vendor.id}>
                                            {/* SL */}

                                            <TableCell>{index + 1}</TableCell>

                                            {/* Image */}

                                            <TableCell>
                                                <img
                                                    src={
                                                        vendor.image
                                                            ? `/${vendor.image}`
                                                            : rihoAsset(
                                                                  '/images/avtar/3.jpg',
                                                              )
                                                    }
                                                    alt={vendor.name}
                                                    style={{
                                                        width: '40px',

                                                        height: '40px',

                                                        borderRadius: '100%',

                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Name */}

                                            <TableCell>
                                                <div className="d-flex flex-column">
                                                    <span>{vendor.name}</span>

                                                    <small className="text-muted">
                                                        #{vendor.vendor_id}
                                                    </small>
                                                </div>
                                            </TableCell>

                                            {/* Company */}

                                            <TableCell>
                                                {vendor.company_name ?? '-'}
                                            </TableCell>

                                            {/* Email */}

                                            <TableCell>
                                                {vendor.email ?? '-'}
                                            </TableCell>

                                            {/* Phone */}

                                            <TableCell>
                                                {vendor.phone ?? '-'}
                                            </TableCell>

                                            {/* Action */}

                                            {showActions && (
                                                <TableCell>
                                                    <ActionCell
                                                        onDelete={() =>
                                                            handleDelete(
                                                                vendor.id,
                                                            )
                                                        }
                                                        onView={() => {
                                                            setSelectedVendor(
                                                                vendor,
                                                            );

                                                            setShowVendorModal(
                                                                true,
                                                            );
                                                        }}
                                                        onEdit={() => {
                                                            setEditVendor(
                                                                vendor,
                                                            );

                                                            setEditVendorOpen(
                                                                true,
                                                            );
                                                        }}

                                                        canView={canView}
                                                        canEdit={canEdit}
                                                        canDelete={canDelete}
                                                    />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={7} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>{/* Pagination can stay here */}</CardFooter>
                </Card>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | Create Modal
            |--------------------------------------------------------------------------
            */}

            <CreateVendorModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {/*
            |--------------------------------------------------------------------------
            | Delete Modal
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
                        setSelectedVendorId(null);
                    }
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />

            {/*
            |--------------------------------------------------------------------------
            | Show Modal
            |--------------------------------------------------------------------------
            */}

            <ShowVendorModal
                open={showVendorModal}
                onOpenChange={setShowVendorModal}
                vendor={selectedVendor}
            />

            {/*
            |--------------------------------------------------------------------------
            | Edit Modal
            |--------------------------------------------------------------------------
            */}

            <EditVendorModal
                open={editVendorOpen}
                onOpenChange={setEditVendorOpen}
                vendor={editVendor}
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
    onDelete: () => void;
    onView: () => void;
    onEdit: () => void;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
};

function ActionCell({
    onDelete,
    onView,
    onEdit,
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
                        <Eye size={24} />
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
                        <Edit size={24} />
                    </button>
                </li>
            )}

            {/* Delete */}

            {canDelete && (
                <li>
                    <button
                        type="button"
                        title="Delete"
                        className="btn text-danger btn-link p-0 border-0"
                        onClick={onDelete}
                    >
                        <Trash size={24} />
                    </button>
                </li>
            )}
        </ul>
    );
}
