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
import type { Floor, BuildingOption } from '@/types/floor';
import type { PaginatedData } from '@/types/pagination';
import CreateFloorModal from '@/components/pages/floor/create-floor-modal';
import EditFloorModal from '@/components/pages/floor/edit-floor-modal';

type Props = {
    data: PaginatedData<Floor>;
    buildings: BuildingOption[];
};

export default function FloorIndexPage({ data, buildings }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteKey, setDeleteKey] = useState(0);


console.log(data)

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

    const handleEdit = (floor: Floor) => {
        setSelectedFloor(floor);
        setEditModalOpen(true);
    };

    const handleDelete = (floor: Floor) => {
        setSelectedFloor(floor);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedFloor) return;

        router.delete(`/floor/${selectedFloor.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedFloor(null);
            },
        });
    };

    return (
        <>
            <Head title="Floor Setup" />
            <PageTitle title="Floor Setup" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Floor
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
                                    <TableHead sticky>Building</TableHead>
                                    <TableHead sticky>Floor Name</TableHead>
                                    <TableHead sticky>Floor Number</TableHead>
                                    <TableHead sticky>Code</TableHead>
                                    <TableHead sticky>Line Amount</TableHead>
                                    <TableHead sticky>Max Machine / Line</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((floor, idx) => (
                                        <TableRow key={floor.id}>
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                {floor.building?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>{floor.name}</TableCell>
                                            <TableCell>{floor.floor_number}</TableCell>
                                            <TableCell>{floor.code || 'N/A'}</TableCell>
                                            <TableCell>{floor.line_amount}</TableCell>
                                            <TableCell>{floor.max_machine_per_line}</TableCell>
                                            <TableCell>
                                                {floor.is_active ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Badge variant="danger">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(floor)}
                                                    onDelete={() => handleDelete(floor)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={9} />
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

            <CreateFloorModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                buildings={buildings}
            />

            <EditFloorModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedFloor(null);
                }}
                floor={selectedFloor}
                buildings={buildings}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedFloor(null);
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
// import { Edit, Trash } from 'react-feather';
// import type { Floor, BuildingOption } from '@/types/floor';
// import type { PaginatedData } from '@/types/pagination';
// import CreateFloorModal from '@/components/pages/floor/create-floor-modal';
// import EditFloorModal from '@/components/pages/floor/edit-floor-modal';

// type Props = {
//     data: PaginatedData<Floor>;
//     buildings: BuildingOption[];
// };

// export default function FloorIndexPage({ data, buildings }: Props) {
//     const [createModalOpen, setCreateModalOpen] = useState(false);
//     const [editModalOpen, setEditModalOpen] = useState(false);
//     const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//     const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
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

//     const handleEdit = (floor: Floor) => {
//         setSelectedFloor(floor);
//         setEditModalOpen(true);
//     };

//     const handleDelete = (floor: Floor) => {
//         setSelectedFloor(floor);
//         setDeleteKey((prev) => prev + 1);
//         setDeleteModalOpen(true);
//     };

//     const confirmDelete = () => {
//         if (!selectedFloor) return;

//         router.delete(`/floor/${selectedFloor.id}`, {
//             preserveScroll: true,
//             onStart: () => setDeleting(true),
//             onFinish: () => setDeleting(false),
//             onSuccess: () => {
//                 setDeleteModalOpen(false);
//                 setSelectedFloor(null);
//             },
//         });
//     };

//     return (
//         <>
//             <Head title="Floor Setup" />
//             <PageTitle title="Floor Setup" />

//             <div className="container-fluid">
//                 <Card>
//                     <CardHeader>
//                         <div className="d-flex flex-wrap gap-3 justify-content-between">
//                             <Button onClick={() => setCreateModalOpen(true)}>
//                                 Add New Floor
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
//                                     <TableHead sticky>Building</TableHead>
//                                     <TableHead sticky>Floor Name</TableHead>
//                                     <TableHead sticky>Floor Number</TableHead>
//                                     <TableHead sticky>Code</TableHead>
//                                     <TableHead sticky>Status</TableHead>
//                                     <TableHead sticky>Actions</TableHead>
//                                 </TableRow>
//                             </TableHeader>

//                             <TableBody>
//                                 {data.data.length > 0 ? (
//                                     data.data.map((floor, idx) => (
//                                         <TableRow key={floor.id}>
//                                             <TableCell>
//                                                 {(data.current_page - 1) * data.per_page + idx + 1}
//                                             </TableCell>
//                                             <TableCell>
//                                                 {floor.building?.name || 'N/A'}
//                                             </TableCell>
//                                             <TableCell>{floor.name}</TableCell>
//                                             <TableCell>{floor.floor_number}</TableCell>
//                                             <TableCell>{floor.code || 'N/A'}</TableCell>
//                                             <TableCell>
//                                                 {floor.is_active ? (
//                                                     <Badge variant="success">Active</Badge>
//                                                 ) : (
//                                                     <Badge variant="danger">Inactive</Badge>
//                                                 )}
//                                             </TableCell>
//                                             <TableCell>
//                                                 <ActionCell
//                                                     onEdit={() => handleEdit(floor)}
//                                                     onDelete={() => handleDelete(floor)}
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

//             <CreateFloorModal
//                 open={createModalOpen}
//                 onOpenChange={setCreateModalOpen}
//                 buildings={buildings}
//             />

//             <EditFloorModal
//                 open={editModalOpen}
//                 onOpenChange={(open) => {
//                     setEditModalOpen(open);
//                     if (!open) setSelectedFloor(null);
//                 }}
//                 floor={selectedFloor}
//                 buildings={buildings}
//             />

//             <DeleteConfirmModal
//                 key={deleteKey}
//                 open={deleteModalOpen}
//                 onOpenChange={(open) => {
//                     if (deleting) return;
//                     setDeleteModalOpen(open);
//                     if (!open) setSelectedFloor(null);
//                 }}
//                 processing={deleting}
//                 onConfirm={confirmDelete}
//             />
//         </>
//     );
// }

// type ActionCellProps = {
//     onEdit: () => void;
//     onDelete: () => void;
// };

// function ActionCell({ onEdit, onDelete }: ActionCellProps) {
//     return (
//         <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
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