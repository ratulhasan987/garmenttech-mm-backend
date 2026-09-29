// [Biztek] NEW FILE - Commission index page with pagination
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
import type { Commission } from '@/types/commission';
import type { PaginatedData } from '@/types/pagination';
import CreateCommissionModal from '@/components/pages/commission/create-commission-modal';
import EditCommissionModal from '@/components/pages/commission/edit-commission-modal';

type Props = {
    data: PaginatedData<Commission>;
};

export default function CommissionIndexPage({ data }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteKey, setDeleteKey] = useState(0);

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            { page },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleEdit = (commission: Commission) => {
        setSelectedCommission(commission);
        setEditModalOpen(true);
    };

    const handleDelete = (commission: Commission) => {
        setSelectedCommission(commission);
        setDeleteKey((prev) => prev + 1);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedCommission) return;

        router.delete(`/commission/${selectedCommission.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedCommission(null);
            },
        });
    };

    return (
        <>
         <Head title="Commissions" />
            <PageTitle title="Commissions" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button onClick={() => setCreateModalOpen(true)}>
                                Add New Commission
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
                                    <TableHead sticky>Employee Name</TableHead>
                                    <TableHead sticky>Commission Type</TableHead>
                                    <TableHead sticky>Commission Rate</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Created By</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((commission, idx) => (
                                        <TableRow key={commission.id}>
                                            <TableCell>
                                                {(data.current_page - 1) * data.per_page + idx + 1}
                                            </TableCell>

                                            {/* [Biztek] Employee name + #employee_id - matches Realbiz */}
                                            <TableCell>
                                                {commission.user?.name}
                                                <br />
                                                <small className="text-muted">#{commission.user?.employee_id}</small>
                                            </TableCell>

                                            <TableCell>{commission.commission_type}</TableCell>
                                            <TableCell>{commission.commission_rate}</TableCell>

                                            {/* [Biztek] Status badge - matches Realbiz status-badge */}
                                            <TableCell>
                                                <Badge variant={commission.status === 'active' ? 'success' : 'secondary'}>
                                                    {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                                                </Badge>
                                            </TableCell>

                                            {/* [Biztek] Created By - matches Realbiz */}
                                            <TableCell>
                                                {commission.createdBy?.name}
                                                <br />
                                                <small className="text-muted">#{commission.createdBy?.employee_id}</small>
                                            </TableCell>

                                            <TableCell>
                                                <ActionCell
                                                    onEdit={() => handleEdit(commission)}
                                                    onDelete={() => handleDelete(commission)}
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

            <CreateCommissionModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            <EditCommissionModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setSelectedCommission(null);
                }}
                commission={selectedCommission}
            />

            <DeleteConfirmModal
                key={deleteKey}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedCommission(null);
                }}
                processing={deleting}
                title="Delete Commission?"
                description={
                    selectedCommission
                        ? `Are you sure you want to delete commission for "${selectedCommission.user?.name}"?`
                        : 'Are you sure you want to delete this commission?'
                }
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
                <button type="button" title="Edit" className="btn btn-link p-0 border-0" onClick={onEdit}>
                    <Edit size={24} />
                </button>
            </li>
            <li>
                <button type="button" title="Delete" className="btn text-danger btn-link p-0 border-0" onClick={onDelete}>
                    <Trash size={24} />
                </button>
            </li>
        </ul>
    );
}







// import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
// import CreateDepartmentModal from '@/components/pages/department/create-department-modal';
// import EditDepartmentModal from '@/components/pages/department/edit-department-modal';
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
// import { Input } from '@/components/ui/form/input';
// import { Pagination } from '@/components/ui/pagination';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
// import type { Department } from '@/types/department';
// import type { PaginatedData } from '@/types/pagination';

// import { router } from '@inertiajs/react';
// import { useState } from 'react';
// import { Edit, Trash } from 'react-feather';
// import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

// type Props = {
//     data: PaginatedData<Department>;
//     filters: {
//         department_id?: number | string | null;
//     };
// };

// type DepartmentSuggestion = {
//     id: number;
//     code: string;
//     name: string;
// };

// async function searchDepartments(
//     query: string,
//     signal?: AbortSignal,
// ): Promise<DepartmentSuggestion[]> {
//     const response = await fetch(
//         `/get-departments?keyword=${encodeURIComponent(query)}`,
//         {
//             signal,
//             headers: {
//                 Accept: 'application/json',
//             },
//         },
//     );

//     if (!response.ok) {
//         throw new Error(
//             'Failed to search departments.',
//         );
//     }

//     return response.json();
// }

// export default function DepartmentIndexPage({
//     data,
//     filters
// }: Props) {
//     const [
//         createModalOpen,
//         setCreateModalOpen,
//     ] = useState(false);

//     const [
//         editModalOpen,
//         setEditModalOpen,
//     ] = useState(false);

//     const [
//         deleteModalOpen,
//         setDeleteModalOpen,
//     ] = useState(false);

//     const [
//         selectedDepartment,
//         setSelectedDepartment,
//     ] = useState<Department | null>(null);

//     const [
//         deleting,
//         setDeleting,
//     ] = useState(false);

//     const handlePageChange = (
//         page: number,
//     ) => {
//         router.get(
//             window.location.pathname,
//             {
//                 page,
//             },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 replace: true,
//             },
//         );
//     };

//     const handleEdit = (
//         department: Department,
//     ) => {
//         setSelectedDepartment(department);
//         setEditModalOpen(true);
//     };

//     const handleDelete = (
//         department: Department,
//     ) => {
//         setSelectedDepartment(department);
//         setDeleteModalOpen(true);
//     };

//     const confirmDelete = () => {
//         if (!selectedDepartment) {
//             return;
//         }

//         router.delete(
//             `/department/${selectedDepartment.id}`,
//             {
//                 preserveScroll: true,

//                 onStart: () => {
//                     setDeleting(true);
//                 },

//                 onFinish: () => {
//                     setDeleting(false);
//                 },

//                 onSuccess: () => {
//                     setDeleteModalOpen(false);
//                     setSelectedDepartment(null);
//                 },
//             },
//         );
//     };

//     const handleDepartmentSelect = (
//         department: DepartmentSuggestion | null,
//     ) => {
//         router.get(
//             window.location.pathname,
//             department
//                 ? {
//                     department_id: department.id,
//                 }
//                 : {},
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 replace: true,
//             },
//         );
//     };



//     return (
//         <>
//             <PageTitle title="Departments" />

//             <div className="container-fluid">
//                 <Card>
//                     <CardHeader>
//                         <div className="d-flex flex-wrap gap-3 justify-content-between">
//                             <Button
//                                 onClick={() =>
//                                     setCreateModalOpen(
//                                         true,
//                                     )
//                                 }
//                             >
//                                 Add New Department
//                             </Button>

//                             {/* <Input
//                                 className="d-inline w-auto"
//                                 placeholder="Quick Search..."
//                             /> */}
//                             <SuggestionSearchInput<DepartmentSuggestion>
//                                 searchFn={searchDepartments}
//                                 idKey="id"
//                                 labelKey="name"
//                                 secondaryLabelKey="code"
//                                 placeholder="Quick Search..."
//                                 showSearchIcon
//                                 onSelect={(department) => { handleDepartmentSelect(department) }}
//                                 onClear={() => {
//                                     handleDepartmentSelect(null)
//                                 }}
//                                 clearOnFocus

//                             />
//                         </div>
//                     </CardHeader>

//                     <CardBody>
//                         <div>
//                             <Table wrapperClassName="overflow-auto"
//                                 wrapperStyle={{
//                                     maxHeight: 'calc(100vh - 350px)',
//                                 }}>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead sticky>
//                                             Sl
//                                         </TableHead>

//                                         <TableHead sticky>
//                                             Code
//                                         </TableHead>

//                                         <TableHead sticky>
//                                             Department Name
//                                         </TableHead>

//                                         <TableHead sticky>
//                                             Actions
//                                         </TableHead>
//                                     </TableRow>
//                                 </TableHeader>

//                                 <TableBody className=''>
//                                     {data.data.length > 0 ? (
//                                         data.data.map(
//                                             (
//                                                 department,
//                                                 idx,
//                                             ) => (
//                                                 <TableRow
//                                                     key={
//                                                         department.id
//                                                     }
//                                                 >
//                                                     <TableCell>
//                                                         {(data.current_page -
//                                                             1) *
//                                                             data.per_page +
//                                                             idx +
//                                                             1}
//                                                     </TableCell>

//                                                     <TableCell>
//                                                         {
//                                                             department.code
//                                                         }
//                                                     </TableCell>

//                                                     <TableCell>
//                                                         {
//                                                             department.name
//                                                         }
//                                                     </TableCell>

//                                                     <TableCell>
//                                                         {department.status ===
//                                                             'default' ? (
//                                                             'Default'
//                                                         ) : (
//                                                             <ActionCell
//                                                                 onEdit={() =>
//                                                                     handleEdit(
//                                                                         department,
//                                                                     )
//                                                                 }
//                                                                 onDelete={() =>
//                                                                     handleDelete(
//                                                                         department,
//                                                                     )
//                                                                 }
//                                                             />
//                                                         )}
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ),
//                                         )
//                                     ) : (
//                                         <TableEmpty
//                                             colSpan={
//                                                 4
//                                             }
//                                         />
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </div>
//                     </CardBody>

//                     <CardFooter>
//                         <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
//                             <TablePaginationInfo
//                                 from={
//                                     data.from ??
//                                     0
//                                 }
//                                 to={
//                                     data.to ??
//                                     0
//                                 }
//                                 total={
//                                     data.total
//                                 }
//                             />

//                             <Pagination
//                                 currentPage={
//                                     data.current_page
//                                 }
//                                 lastPage={
//                                     data.last_page
//                                 }
//                                 onPageChange={
//                                     handlePageChange
//                                 }
//                             />
//                         </div>
//                     </CardFooter>
//                 </Card>
//             </div>

//             {/* Create */}
//             <CreateDepartmentModal
//                 open={createModalOpen}
//                 onOpenChange={
//                     setCreateModalOpen
//                 }
//             />

//             {/* Edit */}
//             <EditDepartmentModal
//                 open={editModalOpen}
//                 onOpenChange={(open) => {
//                     setEditModalOpen(open);

//                     if (!open) {
//                         setSelectedDepartment(
//                             null,
//                         );
//                     }
//                 }}
//                 department={
//                     selectedDepartment
//                 }
//             />

//             {/* Delete */}
//             <DeleteConfirmModal
//                 open={deleteModalOpen}
//                 onOpenChange={(open) => {
//                     if (deleting) {
//                         return;
//                     }

//                     setDeleteModalOpen(open);

//                     if (!open) {
//                         setSelectedDepartment(
//                             null,
//                         );
//                     }
//                 }}
//                 processing={deleting}
//                 title="Delete Department?"
//                 description={
//                     selectedDepartment
//                         ? `Are you sure you want to delete "${selectedDepartment.name}"? This action cannot be undone.`
//                         : 'Are you sure you want to delete this department?'
//                 }
//                 onConfirm={confirmDelete}
//             />
//         </>
//     );
// }

// type ActionCellProps = {
//     onEdit: () => void;
//     onDelete: () => void;
// };

// function ActionCell({
//     onEdit,
//     onDelete,
// }: ActionCellProps) {
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
