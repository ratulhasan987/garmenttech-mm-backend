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
import type { Designation } from '@/types/designation';
import type { PaginatedData } from '@/types/pagination';

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import CreateDesignationModal from '@/components/pages/designation/create-designation-modal';
import EditDesignationModal from '@/components/pages/designation/edit-designation-modal';

type Props = {
    data: PaginatedData<Designation>;
    filters: {
        designation_id?: number | string | null;
    };
};

type DesignationSuggestion = {
    id: number;
    code: string;
    name: string;
};

async function searchDesignations(
    query: string,
    signal?: AbortSignal,
): Promise<DesignationSuggestion[]> {
    const response = await fetch(
        `/get-designations?keyword=${encodeURIComponent(query)}`,
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
    ] = useState<Designation | null>(null);

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
        department: Designation,
    ) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (
        department: Designation,
    ) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(
            `/designation/${selectedDepartment.id}`,
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

    const handleDepartmentSelect = (
        department: DesignationSuggestion | null,
    ) => {
        router.get(
            window.location.pathname,
            department
                ? {
                    department_id: department.id,
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
         <Head title="Designations" />
            <PageTitle title="Designations" />

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
                                Add New Designation
                            </Button>

                            {/* <Input
                                className="d-inline w-auto"
                                placeholder="Quick Search..."
                            /> */}
                            <SuggestionSearchInput<DesignationSuggestion>
                                searchFn={searchDesignations}
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="code"
                                placeholder="Quick Search..."
                                showSearchIcon
                                onSelect={(designation) => { handleDepartmentSelect(designation) }}
                                onClear={() => {
                                    handleDepartmentSelect(null)
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
                                            Code
                                        </TableHead>

                                        <TableHead sticky>
                                            Designation Name
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
                                                department,
                                                idx,
                                            ) => (
                                                <TableRow
                                                    key={
                                                        department.id
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
                                                            department.code
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            department.name
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {department.status ===
                                                            'default' ? (
                                                            'Default'
                                                        ) : (
                                                            <ActionCell
                                                                onEdit={() =>
                                                                    handleEdit(
                                                                        department,
                                                                    )
                                                                }
                                                                onDelete={() =>
                                                                    handleDelete(
                                                                        department,
                                                                    )
                                                                }
                                                            />
                                                        )}
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
            <CreateDesignationModal
                open={createModalOpen}
                onOpenChange={
                    setCreateModalOpen
                }
            />

            {/* Edit */}
            <EditDesignationModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(
                            null,
                        );
                    }
                }}
                designation={
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
