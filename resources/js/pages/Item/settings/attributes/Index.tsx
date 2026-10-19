import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Edit, Trash } from 'react-feather';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import CreateAttributeModal from '@/components/pages/attribute/CreateAttributeModal';
import EditAttributeModal from '@/components/pages/attribute/EditAttributeModal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AttributeIndexPage({ data }: any) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handlePageChange = (page: number) => {
        router.get(window.location.pathname, { page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const confirmDelete = () => {
        if (!selectedAttribute) return;
        router.delete(`/attribute/${selectedAttribute.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteOpen(false);
                setSelectedAttribute(null);
            },
        });
    };

    return (
        <>
            <Head title="Attributes" />
            <PageTitle title="Attributes" />
            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">Item Attributes</h5>
                                <p className="mb-0 text-muted">Define custom properties for items.</p>
                            </div>
                            <Button onClick={() => { setSelectedAttribute(null); setCreateOpen(true); }}>
                                Add Attribute
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table wrapperClassName="overflow-auto" wrapperStyle={{ maxHeight: 'calc(100vh - 350px)' }}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>Sl</TableHead>
                                    <TableHead sticky>Name</TableHead>
                                    <TableHead sticky>Type</TableHead>
                                    <TableHead sticky>Options</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((attr: any, index: number) => (
                                        <TableRow key={attr.id}>
                                            <TableCell>{(data.current_page - 1) * data.per_page + index + 1}</TableCell>
                                            <TableCell>{attr.name}</TableCell>
                                            <TableCell><span className="badge bg-primary">{attr.type}</span></TableCell>
                                            <TableCell>{attr.options ? attr.options.join(', ') : '-'}</TableCell>
                                            <TableCell>
                                                <div className="d-flex gap-2">
                                                    <button type="button" className="btn btn-link p-0 border-0" onClick={() => { setSelectedAttribute(attr); setEditOpen(true); }}>
                                                        <Edit size={22} />
                                                    </button>
                                                    <button type="button" className="btn btn-link p-0 border-0 text-danger" onClick={() => { setSelectedAttribute(attr); setDeleteOpen(true); }}>
                                                        <Trash size={22} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={5} />
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

            <CreateAttributeModal open={createOpen} onOpenChange={setCreateOpen} />
            <EditAttributeModal open={editOpen} onOpenChange={setEditOpen} attribute={selectedAttribute} />

            <DeleteConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                processing={deleting}
                title="Delete Attribute?"
                description={selectedAttribute ? `Are you sure you want to delete "${selectedAttribute.name}"?` : 'Delete this attribute?'}
                onConfirm={confirmDelete}
            />
        </>
    );
}