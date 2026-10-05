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
import type { Brand } from '@/types/brand';
import type { PaginatedData } from '@/types/pagination';
import CreateBrandModal from '@/components/pages/brand/create-brand-modal';
import EditBrandModal from '@/components/pages/brand/edit-brand-modal';

type Props = {
    data: PaginatedData<Brand>;
};

export default function BrandIndexPage({ data }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
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

    const handleEdit = (brand: Brand) => {
        setSelectedBrand(brand);
        setEditModalOpen(true);
    };

    const handleDelete = (brand: Brand) => {
        setSelectedBrand(brand);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedBrand) return;

        router.delete(`/brand/${selectedBrand.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedBrand(null);
            },
        });
    };

    return (
        <>
            <Head title="Brand Setup" />
            <PageTitle title="Brand Setup" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Brand
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
                                    <TableHead sticky>Brand Name</TableHead>
                                    <TableHead sticky>Country</TableHead>
                                    <TableHead sticky>Website</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((brand, idx) => (
                                        <TableRow key={brand.id}>
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell className="fw-medium">{brand.name}</TableCell>
                                            <TableCell>{brand.country || '—'}</TableCell>
                                            <TableCell>
                                                {brand.website ? (
                                                    <a 
                                                        href={brand.website} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-primary text-decoration-none"
                                                    >
                                                        {brand.website}
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {brand.is_active ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Badge variant="danger">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(brand)}
                                                    onDelete={() => handleDelete(brand)}
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

            <CreateBrandModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            <EditBrandModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedBrand(null);
                }}
                brand={selectedBrand}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedBrand(null);
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