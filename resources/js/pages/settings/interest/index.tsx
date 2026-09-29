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
import type { Interest } from '@/types/interest';
import type { PaginatedData } from '@/types/pagination';

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import CreateInterestModal from '@/components/pages/interest/create-interest-modal';
import UpdateInterestModal from '@/components/pages/interest/update-interest-modal';
import { Badge } from '@/components/ui/badge';

type Props = {
    data: PaginatedData<Interest>;
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
    ] = useState<Interest | null>(null);

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
        department: Interest,
    ) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (
        department: Interest,
    ) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(
            `/loan-interest/${selectedDepartment.id}`,
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
        <Head title="Interest Setup" />
            <PageTitle title="Interest Setup" />

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
                                Add New
                            </Button>

                            {/* <Input
                                className="d-inline w-auto"
                                placeholder="Quick Search..."
                            /> */}
                            {/* <SuggestionSearchInput<DesignationSuggestion>
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

                            /> */}
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
                                            Designation
                                        </TableHead>

                                        <TableHead sticky>
                                            Interest Rate
                                        </TableHead>

                                        <TableHead sticky>
                                            Status
                                        </TableHead>

                                        <TableHead sticky>
                                            Created By
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
                                                interest,
                                                idx,
                                            ) => (
                                                <TableRow
                                                    key={
                                                        interest.id
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
                                                            interest?.designation?.name
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            interest?.rate
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            interest?.status === 'active' ? <Badge variant='success'>Active</Badge> : <Badge variant="warning">Inactive</Badge>
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='d-flex flex-column'>
                                                            <span className='mb-0'>
                                                                {
                                                                    interest?.created_by?.name
                                                                }
                                                            </span>
                                                            <span>
                                                                #{
                                                                    interest?.created_by?.employee_id
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ActionCell
                                                            onEdit={() =>
                                                                handleEdit(
                                                                    interest,
                                                                )
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(
                                                                    interest,
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
                                                6
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
                                    data?.from ??
                                    0
                                }
                                to={
                                    data?.to ??
                                    0
                                }
                                total={
                                    data?.total ?? 0
                                }
                            />

                            <Pagination
                                currentPage={
                                    data?.current_page
                                }
                                lastPage={
                                    data?.last_page
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
            <CreateInterestModal
                open={createModalOpen}
                onOpenChange={
                    setCreateModalOpen
                }
            />

            {/* Edit */}
            <UpdateInterestModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(
                            null,
                        );
                    }
                }}
                interest={
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
