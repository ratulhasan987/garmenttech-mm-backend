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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import type { Leave } from '@/types/leave';
import type { PaginatedData } from '@/types/pagination';
import CreateLeaveModal from '@/components/pages/leave/create-leave-modal';
import EditLeaveModal from '@/components/pages/leave/edit-leave-modal';

// [Biztek] CHANGED - PaginatedData instead of plain array
type Props = {
    data: PaginatedData<Leave>;
};

export default function LeaveIndexPage({ data }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteKey, setDeleteKey] = useState(0);

    // [Biztek] ADDED - pagination handler
    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleEdit = (leave: Leave) => {
        setSelectedLeave(leave);
        setEditModalOpen(true);
    };

    const handleDelete = (leave: Leave) => {
        setSelectedLeave(leave);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedLeave) return;

        router.delete(`/leave/${selectedLeave.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedLeave(null);
            },
        });
    };

    return (
        <>
        <Head title="Leave Setup" />
            <PageTitle title="Leave Setup" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Leave
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{ maxHeight: 'calc(100vh - 350px)' }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>Sl</TableHead>
                                    <TableHead sticky>Leave Name</TableHead>
                                    <TableHead sticky>Quantity</TableHead>
                                    <TableHead sticky>Default</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {/* [Biztek] CHANGED - data.data instead of leaves */}
                                {data.data.length > 0 ? (
                                    data.data.map((leave, idx) => (
                                        <TableRow key={leave.id}>
                                            {/* [Biztek] CHANGED - pagination offset for serial */}
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell>{leave.name}</TableCell>
                                            <TableCell>{leave.qty}</TableCell>
                                            <TableCell>
                                                {leave.is_default ? (
                                                    <span className="badge bg-success">Default</span>
                                                ) : (
                                                    <span className="badge bg-light text-muted border">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(leave)}
                                                    onDelete={() => handleDelete(leave)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={5} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    {/* [Biztek] ADDED - pagination footer */}
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

            <CreateLeaveModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            <EditLeaveModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedLeave(null);
                }}
                leave={selectedLeave}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedLeave(null);
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


