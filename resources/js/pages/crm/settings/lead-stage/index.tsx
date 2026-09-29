import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
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
import CreateLeadStageModal from '@/components/pages/lead-stage/create-lead-stage-modal';
import EditLeadStageModal from '@/components/pages/lead-stage/edit-lead-stage-modal';
import { Switch } from '@/components/ui/form/switch';

type LeadStage = {
    id: number;
    name: string;
    probability_percent: number;
    order: number;
    color: string;
    is_active: boolean;
    is_default: boolean;
    is_convert_to_customer: boolean;
    created_at: string;
    updated_at: string;
};

type Props = {
    data: PaginatedData<LeadStage>;
    filters: {
        source_id?: number | string | null;
    };
};

type LeadSourceSuggestion = {
    id: number;
    name: string;
};

async function searchDepartments(
    query: string,
    signal?: AbortSignal,
): Promise<LeadSourceSuggestion[]> {
    const response = await fetch(
        `/get-lead-stages?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search departments.');
    }

    return response.json();
}

export default function DepartmentIndexPage({ data, filters }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState<LeadStage | null>(null);

    const [deleting, setDeleting] = useState(false);

    const handlePageChange = (page: number) => {
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

    const handleEdit = (department: LeadStage) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (department: LeadStage) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(`/lead-stage/${selectedDepartment.id}`, {
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
        });
    };

    const handleDepartmentSelect = (
        department: LeadSourceSuggestion | null,
    ) => {
        router.get(
            window.location.pathname,
            department
                ? {
                      stage_id: department.id,
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
            <Head title="Lead Stages" />

            <PageTitle title="Lead Stages" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Source
                            </Button>

                            <SuggestionSearchInput<LeadSourceSuggestion>
                                searchFn={searchDepartments}
                                idKey="id"
                                labelKey="name"
                                placeholder="Quick Search..."
                                showSearchIcon
                                onSelect={(department) => {
                                    handleDepartmentSelect(department);
                                }}
                                onClear={() => {
                                    handleDepartmentSelect(null);
                                }}
                                clearOnFocus
                            />
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div>
                            <Table
                            // wrapperClassName="overflow-auto"
                            // wrapperStyle={{
                            //     maxHeight: 'calc(100vh - 350px)',
                            // }}
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sl</TableHead>

                                        <TableHead>Stage</TableHead>
                                        <TableHead>
                                            Probability Percent
                                        </TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Color</TableHead>

                                        <TableHead>Is Active</TableHead>
                                        <TableHead>Is Default</TableHead>
                                        <TableHead>Customer</TableHead>

                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="">
                                    {data.data.length > 0 ? (
                                        data.data
                                            .sort(
                                                (first, second) =>
                                                    first.order - second.order,
                                            )
                                            .map((stage, idx) => (
                                                <TableRow key={stage.id}>
                                                    <TableCell>
                                                        {(data.current_page -
                                                            1) *
                                                            data.per_page +
                                                            idx +
                                                            1}
                                                    </TableCell>

                                                    <TableCell
                                                        style={{
                                                            minWidth: '160px',
                                                        }}
                                                    >
                                                        {stage.name}
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            stage.probability_percent
                                                        }
                                                        %
                                                    </TableCell>

                                                    <TableCell>
                                                        {stage.order}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    stage.color,
                                                                width: '50px',
                                                                height: '20px',
                                                                borderRadius:
                                                                    '3px',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <Switch
                                                            defaultChecked={
                                                                stage?.is_active
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <Switch
                                                            defaultChecked={
                                                                stage?.is_default
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <Switch
                                                            defaultChecked={
                                                                stage?.is_convert_to_customer
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <ActionCell
                                                            onEdit={() =>
                                                                handleEdit(
                                                                    stage,
                                                                )
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(
                                                                    stage,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    ) : (
                                        <TableEmpty colSpan={8} />
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={data.from ?? 0}
                                to={data.to ?? 0}
                                total={data.total}
                            />

                            <Pagination
                                currentPage={data.current_page}
                                lastPage={data.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Create */}
            <CreateLeadStageModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {/* Edit */}
            <EditLeadStageModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(null);
                    }
                }}
                stage={selectedDepartment}
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
                        setSelectedDepartment(null);
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

function ActionCell({ onEdit, onDelete }: ActionCellProps) {
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
