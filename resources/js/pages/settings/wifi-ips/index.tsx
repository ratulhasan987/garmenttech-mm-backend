import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
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
import type { PaginatedData } from '@/types/pagination';

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import { WifiIPAddress } from '@/types/wifi-ips';
import CreateWifiIPModal from '@/components/pages/wifi-ips/create-wifi-ips-modal';
import EditWifiIPModal from '@/components/pages/wifi-ips/edit-wifi-ips-modal';

type Props = {
    data: PaginatedData<WifiIPAddress>;
};

export default function DesignationIndexPage({ data }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState<WifiIPAddress | null>(null);

    const [deleting, setDeleting] = useState(false);

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            {
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleEdit = (department: WifiIPAddress) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (department: WifiIPAddress) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(`/wifi-ips/${selectedDepartment.id}`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onFinish: () => {
                setDeleting(false);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedDepartment(null);
            },
        });
    };

    return (
        <>
        <Head title="Wifi IP" />
            <PageTitle title="Wifi IP" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New IP
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div>
                            <Table
                                wrapperClassName="overflow-auto"
                                wrapperStyle={{
                                    maxHeight: 'calc(100vh - 350px)',
                                }}
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead sticky>Sl</TableHead>

                                        <TableHead sticky>IP Address</TableHead>

                                        <TableHead sticky>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="">
                                    {data.data.length > 0 ? (
                                        data.data.map((ipAddress, idx) => (
                                            <TableRow key={ipAddress.id}>
                                                <TableCell
                                                    style={{
                                                        width: '120px',
                                                    }}
                                                >
                                                    {(data.current_page - 1) *
                                                        data.per_page +
                                                        idx +
                                                        1}
                                                </TableCell>

                                                <TableCell
                                                    style={{
                                                        width: 'auto',
                                                    }}
                                                >
                                                    {ipAddress.ip_address}
                                                </TableCell>

                                                <TableCell
                                                    style={{
                                                        width: '140px',
                                                    }}
                                                >
                                                    <ActionCell
                                                        onEdit={() =>
                                                            handleEdit(
                                                                ipAddress,
                                                            )
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(
                                                                ipAddress,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableEmpty colSpan={4} />
                                    )}
                                </TableBody>
                            </Table>
                        </div>
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

            {/* Create */}
            <CreateWifiIPModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {/* Edit */}
            <EditWifiIPModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(null);
                    }
                }}
                wifiIP={selectedDepartment}
            />

            {/* Delete */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(null);
                    }
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
