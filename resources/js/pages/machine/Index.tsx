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
import { useEffect, useState } from 'react';
import { Download, Edit, Trash } from 'react-feather';
import type { Machine, MachineModelOption, FloorOption } from '@/types/machine';
import type { PaginatedData } from '@/types/pagination';
import CreateMachineModal from '@/components/pages/machine/create-machine-modal';
import EditMachineModal from '@/components/pages/machine/edit-machine-modal';

type Props = {
    data: PaginatedData<Machine>;
    models: MachineModelOption[];
    floors: FloorOption[];
};

export default function MachineIndexPage({ data, models, floors }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteKey, setDeleteKey] = useState(0);

    // Initialize filters from URL query parameters
    const initialParams = new URLSearchParams(window.location.search);
    const [filters, setFilters] = useState({
        search: initialParams.get('search') || '',
        status: initialParams.get('status') || '',
        model_id: initialParams.get('model_id') || '',
        floor_id: initialParams.get('floor_id') || '',
    });
    const [searchTerm, setSearchTerm] = useState(filters.search);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                applyFilters({ search: searchTerm });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const applyFilters = (newFilters: Record<string, string>) => {
        const currentFilters = { ...filters, ...newFilters };
        setFilters(currentFilters);

        const queryParams: Record<string, string> = {};
        Object.keys(currentFilters).forEach((key) => {
            if (currentFilters[key]) {
                queryParams[key] = currentFilters[key];
            }
        });

        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            { ...filters, page },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleEdit = (machine: Machine) => {
        setSelectedMachine(machine);
        setEditModalOpen(true);
    };

    const handleDelete = (machine: Machine) => {
        setSelectedMachine(machine);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedMachine) return;

        router.delete(`/machine/${selectedMachine.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedMachine(null);
            },
        });
    };

    const renderStatusBadge = (status: string) => {
        const variant = 
            status === 'active' ? 'success' :
            status === 'maintenance' ? 'warning' :
            status === 'retired' ? 'dark' : 'danger';
        
        return <Badge variant={variant} className="text-capitalize">{status}</Badge>;
    };

    return (
        <>
            <Head title="Machine Setup" />
            <PageTitle title="Machine Setup" />

            <div className="container-fluid">
                <Card>
         <CardHeader>
    <div className="d-flex flex-wrap gap-2 align-items-center">
        {/* Filters */}
        <input
            type="text"
            placeholder="Search..."
            className="form-control"
            style={{ minWidth: '180px', maxWidth: '200px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
            className="form-select"
            style={{ maxWidth: '150px' }}
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
        >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
        </select>
        <select
            className="form-select"
            style={{ maxWidth: '180px' }}
            value={filters.model_id}
            onChange={(e) => applyFilters({ model_id: e.target.value })}
        >
            <option value="">All Models</option>
            {models.map((model) => (
                <option key={model.id} value={model.id}>
                    {model.name}
                </option>
            ))}
        </select>
        <select
            className="form-select"
            style={{ maxWidth: '180px' }}
            value={filters.floor_id}
            onChange={(e) => applyFilters({ floor_id: e.target.value })}
        >
            <option value="">All Floors</option>
            {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                    {floor.building?.name} - Floor {floor.floor_number}
                </option>
            ))}
        </select>

        {/* Right Side: Add Button - ms-auto pushes it to the right */}
        <Button className="ms-auto" onClick={() => setCreateModalOpen(true)}>
            Add New Machine
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
                                    <TableHead sticky>Machine ID</TableHead>
                                    <TableHead sticky>Code</TableHead>
                                    <TableHead sticky>Model</TableHead>
                                    <TableHead sticky>Location</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((machine, idx) => (
                                        <TableRow key={machine.id}>
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell className="fw-medium">{machine.machine_id}</TableCell>
                                            <TableCell>{machine.code || 'N/A'}</TableCell>
                                            <TableCell>
                                                {machine.model?.name ? (
                                                    <Badge variant="info">{machine.model.name}</Badge>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {machine.current_location ? (
                                                    <span>
                                                        {machine.current_location.floor?.building?.name} - Floor {machine.current_location.floor?.floor_number}
                                                        <small className="d-block text-muted">SL: {machine.current_location.sl_no}</small>
                                                    </span>
                                                ) : (
                                                    <Badge variant="secondary">Unassigned</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{renderStatusBadge(machine.status)}</TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    qrUrl={`/machine/${machine.id}/qr-code`}
                                                    onEdit={() => handleEdit(machine)}
                                                    onDelete={() => handleDelete(machine)}
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

            <CreateMachineModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                models={models}
                floors={floors}
            />

            <EditMachineModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedMachine(null);
                }}
                machine={selectedMachine}
                models={models}
                floors={floors}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedMachine(null);
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}

type ActionCellProps = {
    qrUrl: string;
    onEdit: () => void;
    onDelete: () => void;
};

function ActionCell({ qrUrl, onEdit, onDelete }: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            <li>
                <a 
                    href={qrUrl} 
                    download 
                    title="Download QR Code" 
                    className="btn btn-link p-0 border-0 text-success"
                >
                    <Download size={24} />
                </a>
            </li>
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








// import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
// import PageTitle from '@/components/page-title';
// import { TableEmpty } from '@/components/shared/table-empty';
// import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
// import { Button } from '@/components/ui/button';
// import {
//     Card,
//     CardBody,
//     CardFooter,
//     CardHeader,
// } from '@/components/ui/card';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Pagination } from '@/components/ui/pagination';
// import { Head, router } from '@inertiajs/react';
// import { useState } from 'react';
// import { Download, Edit, Trash } from 'react-feather';
// import type { Machine, MachineModelOption, FloorOption } from '@/types/machine';
// import type { PaginatedData } from '@/types/pagination';
// import CreateMachineModal from '@/components/pages/machine/create-machine-modal';
// import EditMachineModal from '@/components/pages/machine/edit-machine-modal';

// type Props = {
//     data: PaginatedData<Machine>;
//     models: MachineModelOption[];
//     floors: FloorOption[];
// };

// export default function MachineIndexPage({ data, models, floors }: Props) {
//     const [createModalOpen, setCreateModalOpen] = useState(false);
//     const [editModalOpen, setEditModalOpen] = useState(false);
//     const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//     const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
//     const [deleting, setDeleting] = useState(false);
//     const [deleteKey, setDeleteKey] = useState(0);

//     const handlePageChange = (page: number) => {
//         router.get(
//             window.location.pathname,
//             { page },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 replace: true,
//             },
//         );
//     };

//     const handleEdit = (machine: Machine) => {
//         setSelectedMachine(machine);
//         setEditModalOpen(true);
//     };

//     const handleDelete = (machine: Machine) => {
//         setSelectedMachine(machine);
//         setDeleteKey((prev) => prev + 1);
//         setDeleteModalOpen(true);
//     };

//     const confirmDelete = () => {
//         if (!selectedMachine) return;

//         router.delete(`/machine/${selectedMachine.id}`, {
//             preserveScroll: true,
//             onStart: () => setDeleting(true),
//             onFinish: () => setDeleting(false),
//             onSuccess: () => {
//                 setDeleteModalOpen(false);
//                 setSelectedMachine(null);
//             },
//         });
//     };

//     const renderStatusBadge = (status: string) => {
//         const variant = 
//             status === 'active' ? 'success' :
//             status === 'maintenance' ? 'warning' :
//             status === 'retired' ? 'dark' : 'danger';
        
//         return <Badge variant={variant} className="text-capitalize">{status}</Badge>;
//     };

//     return (
//         <>
//             <Head title="Machine Setup" />
//             <PageTitle title="Machine Setup" />

//             <div className="container-fluid">
//                 <Card>
//                     <CardHeader>
//                         <div className="d-flex flex-wrap gap-3 justify-content-between">
//                             <Button onClick={() => setCreateModalOpen(true)}>
//                                 Add New Machine
//                             </Button>
//                         </div>
//                     </CardHeader>

//                     <CardBody>
//                         <Table
//                             wrapperClassName="overflow-auto"
//                             wrapperStyle={{ maxHeight: 'calc(100vh - 350px)' }}
//                         >
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead sticky>Sl</TableHead>
//                                     <TableHead sticky>Machine ID</TableHead>
//                                     <TableHead sticky>Code</TableHead>
//                                     <TableHead sticky>Model</TableHead>
//                                     <TableHead sticky>Location</TableHead>
//                                     <TableHead sticky>Status</TableHead>
//                                     <TableHead sticky>Actions</TableHead>
//                                 </TableRow>
//                             </TableHeader>

//                             <TableBody>
//                                 {data.data.length > 0 ? (
//                                     data.data.map((machine, idx) => (
//                                         <TableRow key={machine.id}>
//                                             <TableCell>
//                                                 {(data.current_page - 1) * data.per_page + idx + 1}
//                                             </TableCell>
//                                             <TableCell className="fw-medium">{machine.machine_id}</TableCell>
//                                             <TableCell>{machine.code || 'N/A'}</TableCell>
//                                             <TableCell>
//                                                 {machine.model?.name ? (
//                                                     <Badge variant="info">{machine.model.name}</Badge>
//                                                 ) : '—'}
//                                             </TableCell>
//                                             <TableCell>
//                                                 {machine.current_location ? (
//                                                     <span>
//                                                         {machine.current_location.floor?.building?.name} - Floor {machine.current_location.floor?.floor_number}
//                                                         <small className="d-block text-muted">SL: {machine.current_location.sl_no}</small>
//                                                     </span>
//                                                 ) : (
//                                                     <Badge variant="secondary">Unassigned</Badge>
//                                                 )}
//                                             </TableCell>
//                                             <TableCell>{renderStatusBadge(machine.status)}</TableCell>
//                                             <TableCell>
//                                                 <ActionCell
//                                                     qrUrl={`/machine/${machine.id}/qr-code`}
//                                                     onEdit={() => handleEdit(machine)}
//                                                     onDelete={() => handleDelete(machine)}
//                                                 />
//                                             </TableCell>
//                                         </TableRow>
//                                     ))
//                                 ) : (
//                                     <TableEmpty colSpan={7} />
//                                 )}
//                             </TableBody>
//                         </Table>
//                     </CardBody>

//                     <CardFooter>
//                         <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
//                             <TablePaginationInfo
//                                 from={data.from ?? 0}
//                                 to={data.to ?? 0}
//                                 total={data.total}
//                             />

//                             <Pagination
//                                 currentPage={data.current_page}
//                                 lastPage={data.last_page}
//                                 onPageChange={handlePageChange}
//                             />
//                         </div>
//                     </CardFooter>
//                 </Card>
//             </div>

//             <CreateMachineModal
//                 open={createModalOpen}
//                 onOpenChange={setCreateModalOpen}
//                 models={models}
//                 floors={floors}
//             />

//             <EditMachineModal
//                 open={editModalOpen}
//                 onOpenChange={(open) => {
//                     setEditModalOpen(open);
//                     if (!open) setSelectedMachine(null);
//                 }}
//                 machine={selectedMachine}
//                 models={models}
//                 floors={floors}
//             />

//             <DeleteConfirmModal
//                 key={deleteKey}
//                 open={deleteModalOpen}
//                 onOpenChange={(open) => {
//                     if (deleting) return;
//                     setDeleteModalOpen(open);
//                     if (!open) setSelectedMachine(null);
//                 }}
//                 processing={deleting}
//                 onConfirm={confirmDelete}
//             />
//         </>
//     );
// }

// type ActionCellProps = {
//     qrUrl: string;
//     onEdit: () => void;
//     onDelete: () => void;
// };

// function ActionCell({ qrUrl, onEdit, onDelete }: ActionCellProps) {
//     return (
//         <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
//             <li>
//                 <a 
//                     href={qrUrl} 
//                     download 
//                     title="Download QR Code" 
//                     className="btn btn-link p-0 border-0 text-success"
//                 >
//                     <Download size={24} />
//                 </a>
//             </li>
//             <li>
//                 <button
//                     type="button"
//                     title="Edit"
//                     className="btn btn-link p-0 border-0"
//                     onClick={onEdit}
//                 >
//                     <Edit size={24} />
//                 </button>
//             </li>
//             <li>
//                 <button
//                     type="button"
//                     title="Delete"
//                     className="btn text-danger btn-link p-0 border-0"
//                     onClick={onDelete}
//                 >
//                     <Trash size={24} />
//                 </button>
//             </li>
//         </ul>
//     );
// }

