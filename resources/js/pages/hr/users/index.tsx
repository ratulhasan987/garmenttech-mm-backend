import { useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';

import { Edit, Eye, Trash } from 'react-feather';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { Select } from '@/components/ui/form/select';
import { Switch } from '@/components/ui/form/switch';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { TableEmpty } from '@/components/shared/table-empty';

import { rihoAsset } from '@/lib/riho';

import type { Department } from '@/types/department';
import type { Designation } from '@/types/designation';
import type { PaginatedData } from '@/types/pagination';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import { usePermission } from '@/hooks/use-permission';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { useFilters } from '@/hooks/use-filters';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type UserStatus = 'active' | 'inactive';

type User = {
    id: number;

    employee_id: string;

    image: string | null;

    name: string;

    email: string;

    role: string;

    department_id: number | null;

    designation_id: number | null;

    reporting_officer: {
        id: number;
        name: string;
    } | null;

    last_login_at: string | null;

    status: UserStatus;

    department: Pick<Department, 'id' | 'name'> | null;

    designation: Pick<Designation, 'id' | 'name'> | null;
};

type UsersIndexPageProps = {
    departments: {
        id: number;
        name: string;
    }[];

    data: PaginatedData<User>;
    filters?: Partial<UserFilters>;
};

type PendingStatusChange = {
    userId: number;

    userName: string;

    currentStatus: UserStatus;

    nextStatus: UserStatus;
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

type Employee = {
    id: number;
    name: string;
    employee_id: string;
};

const searchEmployees = async (keyword: string): Promise<Employee[]> => {
    const response = await fetch(
        `/get-employees?keyword=${encodeURIComponent(keyword)}`,
        {
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        return [];
    }

    const result = await response.json();

    return Array.isArray(result) ? result : (result.data ?? []);
};

type UserFilters = {
    user?: { id: number; name: string; employee_id: string } | null;
    department?: string;
    status?: string;
    sorting?: string;
};

export default function UsersIndexPage({
    departments,
    data,
    filters,
}: UsersIndexPageProps) {
    const initialFilters: UserFilters = {
        user: filters?.user ?? null,
        status: filters?.status ?? '',
        sorting: filters?.sorting ?? '',
        department: filters?.department,
    };

    const {
        filters: filterValues,
        updateFilter,
        submit,
        reset,
        buildQuery,
    } = useFilters(initialFilters, {
        url: '/user',
        serializers: {
            user: (user) => user?.id,
        },
    });

    const { can, canAny, canAll } = usePermission();

    const showActions = canAny(['user.edit', 'user.delete', 'user.view']);

    const canEditUser = canAll(['user.view', 'user.edit']);
    const canDeleteUser = can('user.delete');
    const canViewUser = can('user.view');
    const canUpdateStatus = can('user.status');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const [deleting, setDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setSelectedUserId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedUserId) {
            return;
        }

        router.delete(`/user/${selectedUserId}`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onFinish: () => {
                setDeleting(false);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedUserId(null);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Status Confirmation
    |--------------------------------------------------------------------------
    */

    const [pendingStatusChange, setPendingStatusChange] =
        useState<PendingStatusChange | null>(null);

    const [statusProcessing, setStatusProcessing] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Switch Click
    |--------------------------------------------------------------------------
    */

    const handleStatusChangeRequest = (employee: User, checked: boolean) => {
        const nextStatus: UserStatus = checked ? 'active' : 'inactive';

        /*
        |--------------------------------------------------------------------------
        | Do nothing if status is already the same
        |--------------------------------------------------------------------------
        */

        if (nextStatus === employee.status) {
            return;
        }

        setPendingStatusChange({
            userId: employee.id,

            userName: employee.name,

            currentStatus: employee.status,

            nextStatus,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Status Change
    |--------------------------------------------------------------------------
    */

    const handleConfirmStatusChange = () => {
        if (!pendingStatusChange) {
            return;
        }

        router.get(
            `/user-status/${pendingStatusChange.userId}`,
            {},
            {
                preserveScroll: true,

                onStart: () => {
                    setStatusProcessing(true);
                },

                onSuccess: () => {
                    setPendingStatusChange(null);
                },

                onFinish: () => {
                    setStatusProcessing(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Close Status Modal
    |--------------------------------------------------------------------------
    */

    const handleStatusModalChange = (open: boolean) => {
        if (statusProcessing) {
            return;
        }

        if (!open) {
            setPendingStatusChange(null);
        }
    };

    const handleEmployeeSelect = (employe: Employee | null) => {
        router.get(
            window.location.pathname,
            employe
                ? {
                      user: employe.id,
                  }
                : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            {
                ...buildQuery(),
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Manage Users" />

            <PageTitle title="User List" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            {can('user.create') && (
                                <Link href="/user/create">
                                    <Button>Add New</Button>
                                </Link>
                            )}

                            <SuggestionSearchInput<Employee>
                                searchFn={searchEmployees}
                                idKey="id"
                                labelKey="name"
                                placeholder="Search employee ID..."
                                showSearchIcon
                                clearOnFocus
                                onSelect={(employee) => {
                                    handleEmployeeSelect(employee);
                                }}
                                onClear={() => {
                                    handleEmployeeSelect(null);
                                }}
                            />

                            {/* Department */}

                            <Select
                                id="department"
                                name="department"
                                value={filterValues?.department ?? ''}
                                onChange={(event) =>
                                    updateFilter(
                                        'department',
                                        event?.target?.value,
                                    )
                                }
                                style={{
                                    width: '100%',
                                    maxWidth: '200px',
                                }}
                            >
                                <option value="">All Department</option>

                                {departments?.map((department) => (
                                    <option
                                        key={department.id}
                                        value={department.id}
                                    >
                                        {department.name}
                                    </option>
                                ))}
                            </Select>

                            {/* Status */}

                            <Select
                                id="status"
                                name="status"
                                value={filterValues?.status ?? ''}
                                onChange={(event) =>
                                    updateFilter('status', event.target.value)
                                }
                                style={{
                                    width: '100%',
                                    maxWidth: '160px',
                                }}
                            >
                                <option value="">All Status</option>

                                <option value="active">Active</option>

                                <option value="inactive">Inactive</option>
                            </Select>

                            {/* Sort */}

                            <Select
                                id="sort"
                                name="sort"
                                value={filterValues?.sorting ?? ''}
                                onChange={(event) =>
                                    updateFilter('sorting', event.target.value)
                                }
                                style={{
                                    width: '100%',
                                    maxWidth: '160px',
                                }}
                            >
                                <option value="latest">Latest</option>

                                <option value="oldest">Oldest</option>

                                <option value="name_asc">Name A-Z</option>

                                <option value="name_desc">Name Z-A</option>
                            </Select>

                            <Button
                                appearance="outline"
                                onClick={() => {
                                    submit();
                                }}
                            >
                                Filter
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
                                    <TableHead sticky>SL</TableHead>

                                    <TableHead sticky>Image</TableHead>

                                    <TableHead sticky>Full Name</TableHead>

                                    <TableHead sticky>Role</TableHead>

                                    <TableHead sticky>
                                        Reporting Officer
                                    </TableHead>

                                    <TableHead sticky>Department</TableHead>

                                    <TableHead sticky>Designation</TableHead>

                                    <TableHead sticky>Last Login</TableHead>

                                    {canUpdateStatus && (
                                        <TableHead sticky>Status</TableHead>
                                    )}
                                    {showActions && (
                                        <TableHead sticky>Action</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data?.data?.length > 0 ? (
                                    data.data.map((employee, index) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>
                                                <img
                                                    src={
                                                        employee.image
                                                            ? `/${employee.image}`
                                                            : rihoAsset(
                                                                  '/images/avtar/3.jpg',
                                                              )
                                                    }
                                                    alt={employee.name}
                                                    style={{
                                                        width: '40px',

                                                        height: '40px',

                                                        borderRadius: '100%',

                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <div className="d-flex flex-column">
                                                    <span>{employee.name}</span>

                                                    <small className="text-muted">
                                                        #{employee.employee_id}
                                                    </small>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {employee.role}
                                            </TableCell>

                                            <TableCell>
                                                {employee.reporting_officer
                                                    ?.name || '-'}
                                            </TableCell>

                                            <TableCell>
                                                {employee.department?.name ||
                                                    '-'}
                                            </TableCell>

                                            <TableCell>
                                                {employee.designation?.name ||
                                                    '-'}
                                            </TableCell>

                                            <TableCell>
                                                {employee.last_login_at || '-'}
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Status Switch
                                                |--------------------------------------------------------------------------
                                                */}

                                            {canUpdateStatus && (
                                                <TableCell>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Switch
                                                            id={`user-status-${employee.id}`}
                                                            checked={
                                                                employee.status ===
                                                                'active'
                                                            }
                                                            disabled={
                                                                statusProcessing &&
                                                                pendingStatusChange?.userId ===
                                                                    employee.id
                                                            }
                                                            onChange={(event) =>
                                                                handleStatusChangeRequest(
                                                                    employee,

                                                                    event.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            )}

                                            {showActions && (
                                                <TableCell>
                                                    <ActionCell
                                                        onDelete={() =>
                                                            handleDelete(
                                                                employee.id,
                                                            )
                                                        }
                                                        userId={employee.id}
                                                        canViewUser={
                                                            canViewUser
                                                        }
                                                        canDeleteUser={
                                                            canDeleteUser
                                                        }
                                                        canEditUser={
                                                            canEditUser
                                                        }
                                                    />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={10} />
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

            {/*
            |--------------------------------------------------------------------------
            | Status Confirmation Modal
            |--------------------------------------------------------------------------
            */}

            <ConfirmModal
                open={pendingStatusChange !== null}
                onOpenChange={handleStatusModalChange}
                onConfirm={handleConfirmStatusChange}
                processing={statusProcessing}
                title={
                    pendingStatusChange?.nextStatus === 'active'
                        ? 'Activate this user?'
                        : 'Deactivate this user?'
                }
                description={
                    pendingStatusChange
                        ? pendingStatusChange.nextStatus === 'active'
                            ? `${pendingStatusChange.userName} will be able to access the system.`
                            : `${pendingStatusChange.userName} will no longer be able to access the system.`
                        : ''
                }
                confirmText={
                    pendingStatusChange?.nextStatus === 'active'
                        ? 'Yes, activate'
                        : 'Yes, deactivate'
                }
                processingText={
                    pendingStatusChange?.nextStatus === 'active'
                        ? 'Activating...'
                        : 'Deactivating...'
                }
                confirmVariant={
                    pendingStatusChange?.nextStatus === 'active'
                        ? 'success'
                        : 'warning'
                }
            />

            {/*
            |--------------------------------------------------------------------------
            | User Delete Confirmation Modal
            |--------------------------------------------------------------------------
            */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedUserId(null);
                    }
                }}
                processing={deleting}

                onConfirm={confirmDelete}
            />
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Action Cell
|--------------------------------------------------------------------------
*/

type ActionCellProps = {
    onDelete: () => void;

    userId: number;
    canViewUser: boolean;
    canEditUser: boolean;
    canDeleteUser: boolean;
};

function ActionCell({
    onDelete,
    userId,
    canViewUser,
    canDeleteUser,
    canEditUser,
}: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            {canViewUser && (
                <li>
                    <Link
                        href={`/user/${userId}`}
                        className="btn btn-link p-0 border-0"
                        title="View"
                    >
                        <Eye size={24} />
                    </Link>
                </li>
            )}

            {canEditUser && (
                <li>
                    <Link
                        href={`/user/${userId}/edit`}
                        className="btn btn-link p-0 border-0"
                        title="Edit"
                    >
                        <Edit size={24} />
                    </Link>
                </li>
            )}

            {canDeleteUser && (
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
            )}
        </ul>
    );
}
