import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import { Shift } from '@/types/shift';
import { Badge } from '@/components/ui/badge';
import CreateShiftModal from '@/components/pages/shift/create-shift-modal';
import EditShiftModal from '@/components/pages/shift/edit-shift-modal';

type Props = {
    shifts: Shift[] | null;
};

export default function DesignationIndexPage({ shifts }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedDepartment, setSelectedDepartment] = useState<Shift | null>(
        null,
    );

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

    const handleEdit = (department: Shift) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (department: Shift) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(`/shift/${selectedDepartment.id}`, {
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

    return (
        <>
        <Head title="Work Shift" />
            <PageTitle title="Work Shift" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Shift
                            </Button>
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
                                        <TableHead sticky>Sl</TableHead>

                                        <TableHead sticky>shift Name</TableHead>
                                        <TableHead sticky>
                                            Shift Start Time
                                        </TableHead>
                                        <TableHead sticky>
                                            Shift End Time
                                        </TableHead>
                                        <TableHead sticky>
                                            First Half Shift End Time
                                        </TableHead>
                                        <TableHead sticky>
                                            First Half Shift End Time
                                        </TableHead>
                                        <TableHead sticky>Weekend</TableHead>

                                        <TableHead sticky>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="">
                                    {shifts?.length && shifts?.length > 0 ? (
                                        shifts.map((shift, idx) => (
                                            <TableRow key={shift.id}>
                                                <TableCell>{idx + 1}</TableCell>

                                                <TableCell>
                                                    {shift?.name}
                                                </TableCell>
                                                <TableCell>
                                                    {shift?.shift_start_time}
                                                </TableCell>
                                                <TableCell>
                                                    {shift?.shift_end_time}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        shift?.first_half_shift_end_time
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        shift?.second_half_shift_start_time
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {shift?.weekends
                                                        .split(',')
                                                        .map((weekend) => (
                                                            <Badge>
                                                                {weekend}
                                                            </Badge>
                                                        ))}
                                                </TableCell>

                                                <TableCell>
                                                    <ActionCell
                                                        onEdit={() =>
                                                            handleEdit(shift)
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(shift)
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
                </Card>
            </div>

            {/* Create */}
            <CreateShiftModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {/* Edit */}
            <EditShiftModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(null);
                    }
                }}
                shift={selectedDepartment}
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
