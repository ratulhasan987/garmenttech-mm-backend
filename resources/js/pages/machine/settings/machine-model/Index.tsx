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
import type { MachineModel, SimpleOption } from '@/types/machine-model';
import type { PaginatedData } from '@/types/pagination';
import CreateMachineModelModal from '@/components/pages/machine-model/create-machine-model-modal';
import EditMachineModelModal from '@/components/pages/machine-model/edit-machine-model-modal';

type Props = {
    data: PaginatedData<MachineModel>;
    categories: SimpleOption[];
    brands: SimpleOption[];
};

export default function MachineModelIndexPage({ data, categories, brands }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<MachineModel | null>(null);
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

    const handleEdit = (model: MachineModel) => {
        setSelectedModel(model);
        setEditModalOpen(true);
    };

    const handleDelete = (model: MachineModel) => {
        setSelectedModel(model);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedModel) return;

        router.delete(`/machine-model/${selectedModel.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedModel(null);
            },
        });
    };

    return (
        <>
            <Head title="Machine Model Setup" />
            <PageTitle title="Machine Model Setup" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Model
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
                                    <TableHead sticky>Model Code</TableHead>
                                    <TableHead sticky>Model Name</TableHead>
                                    <TableHead sticky>Category</TableHead>
                                    <TableHead sticky>Brand</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((model, idx) => (
                                        <TableRow key={model.id}>
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell>{model.code || 'N/A'}</TableCell>
                                            <TableCell className="fw-medium">{model.name}</TableCell>
                                            <TableCell>
                                                {model.machine_category?.name ? (
                                                    <Badge variant="info">{model.machine_category.name}</Badge>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {model.machine_brand?.name ? (
                                                    <Badge variant="secondary">{model.machine_brand.name}</Badge>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {model.is_active ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Badge variant="danger">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(model)}
                                                    onDelete={() => handleDelete(model)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={7} />
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

            <CreateMachineModelModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                categories={categories}
                brands={brands}
            />

            <EditMachineModelModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedModel(null);
                }}
                model={selectedModel}
                categories={categories}
                brands={brands}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedModel(null);
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