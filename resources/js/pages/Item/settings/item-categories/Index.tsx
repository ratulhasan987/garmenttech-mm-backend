import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Edit, Trash } from 'react-feather';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import CreateItemCategoryModal from '@/components/pages/item-category/CreateItemCategoryModal';
import EditItemCategoryModal from '@/components/pages/item-category/EditItemCategoryModal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ItemCategoryIndexPage({ data, itemTypes, parentCategories }: any) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedItemCategory, setSelectedItemCategory] = useState<any | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handlePageChange = (page: number) => {
        router.get(window.location.pathname, { page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const confirmDelete = () => {
        if (!selectedItemCategory) return;
        router.delete(`/item-category/${selectedItemCategory.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteOpen(false);
                setSelectedItemCategory(null);
            },
        });
    };

    return (
        <>
            <Head title="Item Categories" />
            <PageTitle title="Item Categories" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">Item Categories</h5>
                                <p className="mb-0 text-muted">Manage item categories and sub-categories.</p>
                            </div>
                            <Button onClick={() => { setSelectedItemCategory(null); setCreateOpen(true); }}>
                                Add Item Category
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table wrapperClassName="overflow-auto" wrapperStyle={{ maxHeight: 'calc(100vh - 350px)' }}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>Sl</TableHead>
                                    <TableHead sticky>Name</TableHead>
                                    <TableHead sticky>Code</TableHead>
                                    <TableHead sticky>Item Type</TableHead>
                                    <TableHead sticky>Parent Category</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((category: any, index: number) => (
                                        <TableRow key={category.id}>
                                            <TableCell>{(data.current_page - 1) * data.per_page + index + 1}</TableCell>
                                            <TableCell>{category.name}</TableCell>
                                            <TableCell>{category.code || '-'}</TableCell>
                                            <TableCell>{category.item_type?.name || '-'}</TableCell>
                                            <TableCell>{category.parent?.name || 'Root'}</TableCell>
                                            <TableCell>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0"
                                                        onClick={() => { setSelectedItemCategory(category); setEditOpen(true); }}
                                                    >
                                                        <Edit size={22} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0 text-danger"
                                                        onClick={() => { setSelectedItemCategory(category); setDeleteOpen(true); }}
                                                    >
                                                        <Trash size={22} />
                                                    </button>
                                                </div>
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
                        <div className="d-flex w-100 flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
                            <TablePaginationInfo from={data.from ?? 0} to={data.to ?? 0} total={data.total} />
                            <Pagination currentPage={data.current_page} lastPage={data.last_page} onPageChange={handlePageChange} />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <CreateItemCategoryModal 
                open={createOpen} 
                onOpenChange={setCreateOpen} 
                itemTypes={itemTypes}
                parentCategories={parentCategories}
            />
            
            <EditItemCategoryModal 
                open={editOpen} 
                onOpenChange={setEditOpen} 
                itemCategory={selectedItemCategory}
                itemTypes={itemTypes}
                parentCategories={parentCategories}
            />

            <DeleteConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                processing={deleting}
                title="Delete Item Category?"
                description={selectedItemCategory ? `Are you sure you want to delete "${selectedItemCategory.name}"?` : 'Delete this item category?'}
                onConfirm={confirmDelete}
            />
        </>
    );
}