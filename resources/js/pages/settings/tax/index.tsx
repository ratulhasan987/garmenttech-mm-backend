import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PaginatedData } from '@/types/pagination';

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { Tax } from '@/types/tax';
import CreateTaxModal from '@/components/pages/tax/create-tax-modal';
import EditTextModal from '@/components/pages/tax/edit-tax-modal';

type Props = {
    data: PaginatedData<Tax>;
    filters: {
        tax_id?: number | string | null;
    };
};

type TaxSuggestion = {
    id: number;
    name: string;
};

async function searchTaxes(
    query: string,
    signal?: AbortSignal,
): Promise<TaxSuggestion[]> {
    const response = await fetch(
        `/get-taxes?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            'Failed to search designations.',
        );
    }

    return response.json();
}

export default function DesignationIndexPage({
    data,
    filters
}: Props) {
    const [
        createModalOpen,
        setCreateModalOpen,
    ] = useState(false);

    const [
        editModalOpen,
        setEditModalOpen,
    ] = useState(false);

    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false);

    const [
        selectedDepartment,
        setSelectedDepartment,
    ] = useState<Tax | null>(null);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const handlePageChange = (
        page: number,
    ) => {
        router.get(
            window.location.pathname,
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

    const handleEdit = (
        department: Tax,
    ) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (
        department: Tax,
    ) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(
            `/tax/${selectedDepartment.id}`,
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
                    setSelectedDepartment(null);
                },
            },
        );
    };

    const handleTaxSelect = (
        tax: TaxSuggestion | null,
    ) => {
        router.get(
            window.location.pathname,
            tax
                ? {
                    tax_id: tax.id,
                }
                : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };



    return (
        <>
        <Head title="Taxes" />
            <PageTitle title="Taxes" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button
                                onClick={() =>
                                    setCreateModalOpen(
                                        true,
                                    )
                                }
                            >
                                Add New Tax
                            </Button>

                            {/* <Input
                                className="d-inline w-auto"
                                placeholder="Quick Search..."
                            /> */}
                            <SuggestionSearchInput<TaxSuggestion>
                                searchFn={searchTaxes}
                                idKey="id"
                                labelKey="name"
                                placeholder="Quick Search..."
                                showSearchIcon
                                onSelect={(designation) => { handleTaxSelect(designation) }}
                                onClear={() => {
                                    handleTaxSelect(null)
                                }}
                                clearOnFocus

                            />
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div>
                            <Table wrapperClassName="overflow-auto"
                                wrapperStyle={{
                                    maxHeight: 'calc(100vh - 350px)',
                                }}>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead sticky>
                                            Sl
                                        </TableHead>



                                        <TableHead sticky>
                                            Tax Name
                                        </TableHead>

                                        <TableHead sticky>
                                            Tax Rate %
                                        </TableHead>

                                        <TableHead sticky>
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className=''>
                                    {data.data.length > 0 ? (
                                        data.data.map(
                                            (
                                                tax,
                                                idx,
                                            ) => (
                                                <TableRow
                                                    key={
                                                        tax.id
                                                    }
                                                >
                                                    <TableCell>
                                                        {(data.current_page -
                                                            1) *
                                                            data.per_page +
                                                            idx +
                                                            1}
                                                    </TableCell>



                                                    <TableCell>
                                                        {
                                                            tax.name
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            tax?.rate ?? 0
                                                        } %
                                                    </TableCell>

                                                    <TableCell>
                                                        <ActionCell
                                                            onEdit={() =>
                                                                handleEdit(
                                                                    tax,
                                                                )
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(
                                                                    tax,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    ) : (
                                        <TableEmpty
                                            colSpan={
                                                4
                                            }
                                        />
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={
                                    data.from ??
                                    0
                                }
                                to={
                                    data.to ??
                                    0
                                }
                                total={
                                    data.total
                                }
                            />

                            <Pagination
                                currentPage={
                                    data.current_page
                                }
                                lastPage={
                                    data.last_page
                                }
                                onPageChange={
                                    handlePageChange
                                }
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Create */}
            <CreateTaxModal
                open={createModalOpen}
                onOpenChange={
                    setCreateModalOpen
                }
            />

            {/* Edit */}
            <EditTextModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(
                            null,
                        );
                    }
                }}
                tax={
                    selectedDepartment
                }
            />

            {/* Delete */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(
                            null,
                        );
                    }
                }}
                processing={deleting}
                title="Delete Department?"
                description={
                    selectedDepartment
                        ? `Are you sure you want to delete "${selectedDepartment.name}"? This action cannot be undone.`
                        : 'Are you sure you want to delete this department?'
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}

type ActionCellProps = {
    onEdit: () => void;
    onDelete: () => void;
};

function ActionCell({
    onEdit,
    onDelete,
}: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            <li>
                <button
                    type="button"
                    title="Edit"
                    className="btn btn-link p-0 border-0"
                    onClick={onEdit}
                >
                    <Edit size={24} />
                </button>
            </li>

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
        </ul>
    );
}
