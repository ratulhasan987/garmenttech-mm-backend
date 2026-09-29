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
import { Edit, Trash, Activity } from 'react-feather';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import CreateSalesTeamModal from '@/components/pages/sales-team/create-sales-team-modal';
import EditSalesTeamModal from '@/components/pages/sales-team/edit-sales-team-modal';
import ManageSalesTeamMembersModal from '@/components/pages/sales-team/manage-sales-team-members-modal';

type SalesTeam = {
    id: number;
    name: string;
    code: string;
    description: string;
    status: 'active' | 'inactive';
    members_count: number;
    created_at: string;
    updated_at: string;
};

type Props = {
    data: PaginatedData<SalesTeam>;
    filters: {
        sales_team_id?: number | string | null;
    };
};

type LeadSourceSuggestion = {
    id: number;
    name: string;
    code: string;
};

async function searchDepartments(
    query: string,
    signal?: AbortSignal,
): Promise<LeadSourceSuggestion[]> {
    const response = await fetch(
        `/get-sales-teams?keyword=${encodeURIComponent(query)}`,
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

export default function SalesTeamIndexPage({ data, filters }: Props) {
    const [manageMembersModalOpen, setManageMembersModalOpen] = useState(false);

    const [selectedTeamForMembers, setSelectedTeamForMembers] =
        useState<SalesTeam | null>(null);

    const handleManageMembers = (team: SalesTeam) => {
        setSelectedTeamForMembers(team);
        setManageMembersModalOpen(true);
    };

    const [createModalOpen, setCreateModalOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState<SalesTeam | null>(null);

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

    const handleEdit = (department: SalesTeam) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (department: SalesTeam) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(`/sales-teams/${selectedDepartment.id}`, {
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
                      sales_team_id: department.id,
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
            <Head title="Sales Team" />

            <PageTitle title="Sales Teams" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add Sales Team
                            </Button>

                            <SuggestionSearchInput<LeadSourceSuggestion>
                                searchFn={searchDepartments}
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="code"
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
                                wrapperClassName="overflow-auto"
                                wrapperStyle={{
                                    maxHeight: 'calc(100vh - 350px)',
                                }}
                                // style={{
                                //     tableLayout: 'fixed',
                                //     minWidth: '850px',
                                // }}
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            sticky
                                            style={{ width: '55px' }}
                                        >
                                            Sl
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{ width: '100px' }}
                                        >
                                            Code
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{ width: '170px' }}
                                        >
                                            Team Name
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{
                                                maxWidth: '220px',
                                            }}
                                        >
                                            Description
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{ width: '80px' }}
                                        >
                                            Status
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{ width: '85px' }}
                                        >
                                            Members
                                        </TableHead>

                                        <TableHead
                                            sticky
                                            style={{
                                                width: '110px',
                                            }}
                                        >
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {data.data.length > 0 ? (
                                        data.data.map((team, idx) => (
                                            <TableRow key={team.id}>
                                                <TableCell className="text-nowrap">
                                                    {(data.current_page - 1) *
                                                        data.per_page +
                                                        idx +
                                                        1}
                                                </TableCell>

                                                <TableCell className="text-nowrap">
                                                    {team.code}
                                                </TableCell>

                                                <TableCell className="text-truncate">
                                                    {team.name}
                                                </TableCell>

                                                <TableCell
                                                    style={{
                                                        maxWidth: '220px',
                                                        whiteSpace: 'normal',
                                                        overflowWrap:
                                                            'anywhere',
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    <p className="mb-0">
                                                        {team.description ||
                                                            '-'}
                                                    </p>
                                                </TableCell>

                                                <TableCell className="text-nowrap text-capitalize fw-medium">
                                                    {team.status}
                                                </TableCell>

                                                <TableCell>
                                                    {team.members_count}
                                                </TableCell>

                                                <TableCell className="">
                                                    <ActionCell
                                                        onManage={() =>
                                                            handleManageMembers(
                                                                team,
                                                            )
                                                        }
                                                        onEdit={() =>
                                                            handleEdit(team)
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(team)
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableEmpty colSpan={7} />
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
            <CreateSalesTeamModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {/* Edit */}
            <EditSalesTeamModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(null);
                    }
                }}
                team={selectedDepartment}
            />

            <ManageSalesTeamMembersModal
                open={manageMembersModalOpen}
                onOpenChange={(open) => {
                    setManageMembersModalOpen(open);

                    if (!open) {
                        setSelectedTeamForMembers(null);
                    }
                }}
                team={selectedTeamForMembers}
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
    onManage: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

function ActionCell({ onManage, onEdit, onDelete }: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            <li>
                <button
                    type="button"
                    title="Manage Members"
                    className="btn btn-link p-0 border-0"
                    onClick={onManage}
                >
                    <Activity size={24} />
                </button>
            </li>

            <li>
                <button
                    type="button"
                    title="Edit"
                    className="btn btn-link text-primary p-0 border-0"
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
