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
import type { MachineCategory, MachineCategoryOption } from '@/types/machine-category';
import type { PaginatedData } from '@/types/pagination';
import CreateMachineCategoryModal from '@/components/pages/machine-category/create-machine-category-modal';
import EditMachineCategoryModal from '@/components/pages/machine-category/edit-machine-category-modal';

type Props = {
    data: PaginatedData<MachineCategory>;
    parentOptions: MachineCategoryOption[];
};

export default function MachineCategoryIndexPage({ data, parentOptions }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<MachineCategory | null>(null);
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

    const handleEdit = (category: MachineCategory) => {
        setSelectedCategory(category);
        setEditModalOpen(true);
    };

    const handleDelete = (category: MachineCategory) => {
        setSelectedCategory(category);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedCategory) return;

        router.delete(`/machine-category/${selectedCategory.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedCategory(null);
            },
        });
    };

    return (
        <>
            <Head title="Machine Category Setup" />
            <PageTitle title="Machine Category Setup" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Category
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
                                    <TableHead sticky>Category Name</TableHead>
                                    <TableHead sticky>Parent Category</TableHead>
                                    <TableHead sticky>Description</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((category, idx) => (
                                        <TableRow key={category.id}>
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell className="fw-medium">{category.name}</TableCell>
                                            <TableCell>
                                                {category.parent?.name ? (
                                                    <Badge variant="info">{category.parent.name}</Badge>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {category.description ? (
                                                    <span
                                                        title={category.description}
                                                        style={{
                                                            maxWidth: '250px',
                                                            display: 'inline-block',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {category.description}
                                                    </span>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {category.is_active ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Badge variant="danger">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(category)}
                                                    onDelete={() => handleDelete(category)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={6} />
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

            <CreateMachineCategoryModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                parentOptions={parentOptions}
            />

            <EditMachineCategoryModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedCategory(null);
                }}
                category={selectedCategory}
                parentOptions={parentOptions}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedCategory(null);
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