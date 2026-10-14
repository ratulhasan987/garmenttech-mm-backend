import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Edit, Trash } from 'react-feather';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import CreateItemModal from '@/components/pages/item/CreateItemModal';
import EditItemModal from '@/components/pages/item/EditItemModal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ItemIndexPage({ data, itemTypes, itemCategories, brands, units }: any) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    console.log("item data",data)

    const handlePageChange = (page: number) => {
        router.get(window.location.pathname, { page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const confirmDelete = () => {
        if (!selectedItem) return;
        router.delete(`/item/${selectedItem.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteOpen(false);
                setSelectedItem(null);
            },
        });
    };

    return (
        <>
            <Head title="Items" />
            <PageTitle title="Items" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">Items</h5>
                                <p className="mb-0 text-muted">Manage your inventory items.</p>
                            </div>
                            <Button onClick={() => { setSelectedItem(null); setCreateOpen(true); }}>
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table wrapperClassName="overflow-auto" wrapperStyle={{ maxHeight: 'calc(100vh - 350px)' }}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>Sl</TableHead>
                                    <TableHead sticky>Item Code</TableHead>
                                    <TableHead sticky>Name</TableHead>
                                    <TableHead sticky>Type</TableHead>
                                    <TableHead sticky>Category</TableHead>
                                    <TableHead sticky>Brand</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((item: any, index: number) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{(data.current_page - 1) * data.per_page + index + 1}</TableCell>
                                            <TableCell>{item.item_code}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.item_type?.name || '-'}</TableCell>
                                            <TableCell>{item.category?.name || '-'}</TableCell>
                                            <TableCell>{item.brand?.name || '-'}</TableCell>
                                            <TableCell>
                                                <span className={`badge ${item.status ? 'bg-success' : 'bg-danger'}`}>
                                                    {item.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0"
                                                        onClick={() => { setSelectedItem(item); setEditOpen(true); }}
                                                    >
                                                        <Edit size={22} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0 text-danger"
                                                        onClick={() => { setSelectedItem(item); setDeleteOpen(true); }}
                                                    >
                                                        <Trash size={22} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={8} />
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

            <CreateItemModal 
                open={createOpen} 
                onOpenChange={setCreateOpen} 
                itemTypes={itemTypes}
                itemCategories={itemCategories}
                brands={brands}
                units={units}
            />
            
            <EditItemModal 
                open={editOpen} 
                onOpenChange={setEditOpen} 
                item={selectedItem}
                itemTypes={itemTypes}
                itemCategories={itemCategories}
                brands={brands}
                units={units}
            />

            <DeleteConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                processing={deleting}
                title="Delete Item?"
                description={selectedItem ? `Are you sure you want to delete "${selectedItem.name}"?` : 'Delete this item?'}
                onConfirm={confirmDelete}
            />
        </>
    );
}