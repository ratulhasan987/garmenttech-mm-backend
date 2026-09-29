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
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import type { Holiday } from '@/types/holiday';
import type { PaginatedData } from '@/types/pagination';
import CreateHolidayModal from '@/components/pages/holiday/create-holiday-modal';
import EditHolidayModal from '@/components/pages/holiday/edit-holiday-modal';

// [Biztek] CHANGED - PaginatedData instead of plain array
type Props = {
    data: PaginatedData<Holiday>;
};

export default function HolidayIndexPage({ data }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
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

    const handleEdit = (holiday: Holiday) => {
        setSelectedHoliday(holiday);
        setEditModalOpen(true);
    };

    const handleDelete = (holiday: Holiday) => {
        setSelectedHoliday(holiday);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedHoliday) return;

        router.delete(`/holiday/${selectedHoliday.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedHoliday(null);
            },
        });
    };

    const formatDate = (dateStr: string, isRecurring: boolean) => {
        const date = new Date(dateStr);
        if (isRecurring) {
            return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        }
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <>
         <Head title="Holiday Setup" />
            <PageTitle title="Holiday Setup" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Holiday
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
                                    <TableHead sticky>Holiday Name</TableHead>
                                    <TableHead sticky>Date</TableHead>
                                    <TableHead sticky>Recurring</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {/* [Biztek] CHANGED - data.data instead of holidays */}
                                {data.data.length > 0 ? (
                                    data.data.map((holiday, idx) => (
                                        <TableRow key={holiday.id}>
                                            {/* [Biztek] CHANGED - pagination offset for serial */}
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell>{holiday.name}</TableCell>
                                            <TableCell>
                                                {formatDate(holiday.display_date, holiday.is_recurring)}
                                            </TableCell>
                                            <TableCell>
                                                {holiday.is_recurring ? (
                                                    <Badge variant="success">Recurring</Badge>
                                                ) : (
                                                    <Badge variant="warning">One-Time</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(holiday)}
                                                    onDelete={() => handleDelete(holiday)}
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

            <CreateHolidayModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            <EditHolidayModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedHoliday(null);
                }}
                holiday={selectedHoliday}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedHoliday(null);
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

