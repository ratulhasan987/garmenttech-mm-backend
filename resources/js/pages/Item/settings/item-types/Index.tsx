import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Edit, Trash } from 'react-feather';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
// import CreateItemTypeModal from './modals/CreateItemTypeModal';
// import EditItemTypeModal from './modals/EditItemTypeModal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateItemTypeModal from '@/components/pages/item-type/CreateItemTypeModal';
import EditItemTypeModal from '@/components/pages/item-type/EditItemTypeModal';

export default function ItemTypeIndexPage({ data }: any) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedItemType, setSelectedItemType] = useState<any | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handlePageChange = (page: number) => {
        router.get(window.location.pathname, { page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const confirmDelete = () => {
        if (!selectedItemType) return;
        router.delete(`/item-type/${selectedItemType.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteOpen(false);
                setSelectedItemType(null);
            },
        });
    };

    return (
        <>
            <Head title="Item Types" />
            <PageTitle title="Item Types" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">Item Types</h5>
                                <p className="mb-0 text-muted">Manage item categories and types.</p>
                            </div>
                            <Button onClick={() => { setSelectedItemType(null); setCreateOpen(true); }}>
                                Add Item Type
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
                                    <TableHead sticky>Consumable</TableHead>
                                    <TableHead sticky>Serialized</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((itemType: any, index: number) => (
                                        <TableRow key={itemType.id}>
                                            <TableCell>{(data.current_page - 1) * data.per_page + index + 1}</TableCell>
                                            <TableCell>{itemType.name}</TableCell>
                                            <TableCell>{itemType.code || '-'}</TableCell>
                                            <TableCell>{itemType.is_consumable ? 'Yes' : 'No'}</TableCell>
                                            <TableCell>{itemType.is_serialized ? 'Yes' : 'No'}</TableCell>
                                            <TableCell>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0"
                                                        onClick={() => { setSelectedItemType(itemType); setEditOpen(true); }}
                                                    >
                                                        <Edit size={22} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0 text-danger"
                                                        onClick={() => { setSelectedItemType(itemType); setDeleteOpen(true); }}
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

            <CreateItemTypeModal open={createOpen} onOpenChange={setCreateOpen} />
            
            <EditItemTypeModal open={editOpen} onOpenChange={setEditOpen} itemType={selectedItemType} />

            <DeleteConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                processing={deleting}
                title="Delete Item Type?"
                description={selectedItemType ? `Are you sure you want to delete "${selectedItemType.name}"?` : 'Delete this item type?'}
                onConfirm={confirmDelete}
            />
        </>
    );
}