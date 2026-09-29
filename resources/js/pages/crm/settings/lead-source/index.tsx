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
import CreateLeadSourceModal from '@/components/pages/lead-source/create-lead-source-modal';
import EditLeadSourceModal from '@/components/pages/lead-source/edit-lead-source-modal';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Switch } from '@/components/ui/form/switch';

type LeadSource = {
    id: number;
    name: string;
    cost_per_lead: number;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
};

type Props = {
    data: PaginatedData<LeadSource>;
    filters: {
        source?: LeadSourceSuggestion | null;
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
        `/get-lead-sources?keyword=${encodeURIComponent(query)}`,
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
        useState<LeadSource | null>(null);

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

    const handleEdit = (department: LeadSource) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (department: LeadSource) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(`/lead-source/${selectedDepartment.id}`, {
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
                      source_id: department.id,
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
            <Head title="Lead Sources" />

            <PageTitle title="Lead Sources" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Source
                            </Button>

                            {/* <Input
                                className="d-inline w-auto"
                                placeholder="Quick Search..."
                            /> */}
                            <SuggestionSearchInput<LeadSourceSuggestion>
                                searchFn={searchDepartments}
                                idKey="id"
                                labelKey="name"
                                placeholder="Quick Search..."
                                showSearchIcon
                                defaultSelectedItem={filters?.source}
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
                                wrapperClassName="overflow-auto"
                                wrapperStyle={{
                                    maxHeight: 'calc(100vh - 350px)',
                                }}
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            sticky
                                            style={{
                                                width: '70px',
                                            }}
                                        >
                                            Sl
                                        </TableHead>

                                        <TableHead sticky>Source</TableHead>

                                        <TableHead sticky>
                                            Cost Per Lead
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{
                                                width: '140px',
                                            }}
                                        >
                                            Is Active
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{
                                                width: '140px',
                                            }}
                                        >
                                            Is Default
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{
                                                width: '120px',
                                            }}
                                        >
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="">
                                    {data.data.length > 0 ? (
                                        data.data.map((source, idx) => (
                                            <TableRow key={source.id}>
                                                <TableCell>
                                                    {(data.current_page - 1) *
                                                        data.per_page +
                                                        idx +
                                                        1}
                                                </TableCell>

                                                <TableCell>
                                                    {source.name}
                                                </TableCell>

                                                <TableCell>
                                                    {source.cost_per_lead}
                                                </TableCell>

                                                <TableCell>
                                                    <Switch
                                                        defaultChecked={
                                                            source.is_active
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Switch
                                                        defaultChecked={
                                                            source.is_default
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <ActionCell
                                                        onEdit={() =>
                                                            handleEdit(source)
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(source)
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableEmpty colSpan={5} />
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
            <CreateLeadSourceModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {/* Edit */}
            <EditLeadSourceModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(null);
                    }
                }}
                source={selectedDepartment}
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
