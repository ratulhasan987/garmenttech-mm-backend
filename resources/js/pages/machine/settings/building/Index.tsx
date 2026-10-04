import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
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
import { Edit, Trash } from 'react-feather';
import type { Building } from '@/types/building';
import type { PaginatedData } from '@/types/pagination';
import CreateBuildingModal from '@/components/pages/building/create-building-modal';
import EditBuildingModal from '@/components/pages/building/edit-building-modal';

type Props = {
    data: PaginatedData<Building>;
};

export default function BuildingIndexPage({ data }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteKey, setDeleteKey] = useState(0);

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

    const handleEdit = (building: Building) => {
        setSelectedBuilding(building);
        setEditModalOpen(true);
    };

    const handleDelete = (building: Building) => {
        setSelectedBuilding(building);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedBuilding) return;

        router.delete(`/building/${selectedBuilding.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedBuilding(null);
            },
        });
    };

    return (
        <>
            <Head title="Building Setup" />
            <PageTitle title="Building Setup" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Building
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
                                    <TableHead sticky>Building Code</TableHead>
                                    <TableHead sticky>Building Name</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((building, idx) => (
                                        <TableRow key={building.id}>
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell>{building.code || 'N/A'}</TableCell>
                                            <TableCell>{building.name}</TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(building)}
                                                    onDelete={() => handleDelete(building)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={4} />
                                )}
                            </TableBody>
                        </Table>
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

            <CreateBuildingModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            <EditBuildingModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedBuilding(null);
                }}
                building={selectedBuilding}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedBuilding(null);
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