import { useState } from 'react';

import { Head, router } from '@inertiajs/react';

import { Edit, Trash } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import WarehouseModal from '@/components/pages/inventory/warehouse-modal';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { Pagination } from '@/components/ui/pagination';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type { Warehouse, WarehouseIndexProps } from '@/types/inventory';

export default function WarehouseIndexPage({ data }: WarehouseIndexProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const [selectedWarehouse, setSelectedWarehouse] =
        useState<Warehouse | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);

    const [deleting, setDeleting] = useState(false);

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

    const confirmDelete = () => {
        if (!selectedWarehouse) {
            return;
        }

        router.delete(`/operations/warehouses/${selectedWarehouse.id}`, {
            preserveScroll: true,

            onStart: () => setDeleting(true),

            onFinish: () => setDeleting(false),

            onSuccess: () => {
                setDeleteOpen(false);

                setSelectedWarehouse(null);
            },
        });
    };

    return (
        <>
        <Head title="Warehouses" />
            <PageTitle title="Warehouses" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">Warehouses</h5>

                                <p className="mb-0 text-muted">
                                    Manage inventory storage locations.
                                </p>
                            </div>

                            <Button
                                onClick={() => {
                                    setSelectedWarehouse(null);

                                    setModalOpen(true);
                                }}
                            >
                                Add Warehouse
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{
                                maxHeight: 'calc(100vh - 350px)',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>Sl</TableHead>

                                    <TableHead sticky>Code</TableHead>

                                    <TableHead sticky>Warehouse</TableHead>

                                    <TableHead sticky>Phone</TableHead>

                                    <TableHead sticky>Address</TableHead>

                                    <TableHead sticky>Status</TableHead>

                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((warehouse, index) => (
                                        <TableRow key={warehouse.id}>
                                            <TableCell>
                                                {(data.current_page - 1) *
                                                    data.per_page +
                                                    index +
                                                    1}
                                            </TableCell>

                                            <TableCell>
                                                <strong>
                                                    {warehouse.code}
                                                </strong>
                                            </TableCell>

                                            <TableCell>
                                                {warehouse.name}{" "}{warehouse.is_default && (
                                                <span className="badge bg-primary mt-2">
                                                    Default
                                                </span>
                                            )}
                                            </TableCell>

                                            <TableCell className="text-nowrap">
                                                {warehouse.phone ?? '-'}
                                            </TableCell>

                                            <TableCell>
                                                <div
                                                    className="text-truncate"
                                                    style={{
                                                        maxWidth: 260,
                                                    }}
                                                    title={
                                                        warehouse.address ?? ''
                                                    }
                                                >
                                                    {warehouse.address ?? '-'}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`badge ${
                                                        warehouse.status
                                                            ? 'bg-success'
                                                            : 'bg-danger'
                                                    }`}
                                                >
                                                    {warehouse.status
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0"
                                                        onClick={() => {
                                                            setSelectedWarehouse(
                                                                warehouse,
                                                            );

                                                            setModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit size={22} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 border-0 text-danger"
                                                        onClick={() => {
                                                            setSelectedWarehouse(
                                                                warehouse,
                                                            );

                                                            setDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash size={22} />
                                                    </button>
                                                </div>
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
                        <div className="d-flex w-100 flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
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

            <WarehouseModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);

                    if (!open) {
                        setSelectedWarehouse(null);
                    }
                }}
                warehouse={selectedWarehouse}
            />

            <DeleteConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                processing={deleting}
                title="Delete Warehouse?"
                description={
                    selectedWarehouse
                        ? `Are you sure you want to delete "${selectedWarehouse.name}"?`
                        : 'Delete this warehouse?'
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}
