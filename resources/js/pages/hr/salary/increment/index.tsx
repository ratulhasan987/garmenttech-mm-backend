import { Head, router } from '@inertiajs/react';

import { useEffect, useRef, useState } from 'react';

import { Edit, Eye, Filter, Plus, Search, Trash2, X } from 'react-feather';

import PageTitle from '@/components/page-title';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import { ConfirmModal } from '@/components/modals/confirm-modal';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Pagination } from '@/components/ui/pagination';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';

import { TableEmpty } from '@/components/shared/table-empty';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import IncrementCreateModal from '@/components/pages/hr/salary/increment/IncrementCreateModal';

import IncrementEditModal from '@/components/pages/hr/salary/increment/IncrementEditModal';

import IncrementShowModal from '@/components/pages/hr/salary/increment/IncrementShowModal';


type Department = {
    id: number;
    name: string;
};

type Designation = {
    id: number;
    name: string;
};

type Employee = {
    id: number;
    employee_id: string;
    name: string;
    basic_salary?: number | string;
};

type IncrementUser = Employee & {
    image?: string | null;

    department?: Department | null;

    designation?: Designation | null;
};

export type Increment = {
    id: number;

    user_id: number;

    increment_type: 'percentage' | 'fixed';

    increment_value: number | string;

    increment_amount: number | string;

    old_basic_salary: number | string;

    new_basic_salary: number | string;

    effective_date: string;

    status: 'pending' | 'approved' | 'rejected';

    user: IncrementUser;
};

type Currency = {
    id?: number;

    symbol: string;

    exchange_rate: number | string;
} | null;

type PaginationLink = {
    url: string | null;

    label: string;

    active: boolean;
};

type IncrementPagination = {
    data: Increment[];

    current_page: number;

    last_page: number;

    per_page: number;

    from: number | null;

    to: number | null;

    total: number;

    links: PaginationLink[];
};

type Props = {
    increments: IncrementPagination;

    numberOfIncrements: number;

    departments: Department[];

    designations: Designation[];

    activeCurrency: Currency;

    filters: {
        user?: number | string | null;

        department?: number | string | null;

        designation?: number | string | null;

        status?: 'pending' | 'approved' | 'rejected' | string | null;

        sorting?: string | null;

        employee?: Employee | null;
    };

    permissions: {
        create: boolean;

        view: boolean;

        edit: boolean;

        delete: boolean;

        status: boolean;
    };
};



export default function IncrementIndex({
    increments,
    departments,
    designations,
    activeCurrency,
    filters,
    permissions,
}: Props) {

    const [employeeSearch, setEmployeeSearch] = useState(
        filters.employee
            ? `${filters.employee.name} - ${filters.employee.employee_id}`
            : '',
    );

    const [employeeId, setEmployeeId] = useState(
        filters.user ? String(filters.user) : '',
    );

    const [employees, setEmployees] = useState<Employee[]>([]);

    const [showSuggestions, setShowSuggestions] = useState(false);


    const [department, setDepartment] = useState(
        filters.department ? String(filters.department) : '',
    );

    const [designation, setDesignation] = useState(
        filters.designation ? String(filters.designation) : '',
    );

    const [status, setStatus] = useState(filters.status ?? '');

    const [sorting, setSorting] = useState(filters.sorting ?? 'desc');


    const [createOpen, setCreateOpen] = useState(false);

    const [editOpen, setEditOpen] = useState(false);

    const [showOpen, setShowOpen] = useState(false);


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const [deleteIncrement, setDeleteIncrement] = useState<Increment | null>(
        null,
    );

    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [statusIncrement, setStatusIncrement] = useState<Increment | null>(
        null,
    );

    const [nextStatus, setNextStatus] = useState<
        'approved' | 'rejected' | null
    >(null);


    const [selectedIncrement, setSelectedIncrement] =
        useState<Increment | null>(null);


    const employeeRef = useRef<HTMLDivElement>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    const searchEmployees = async (keyword = '') => {
        try {
            const response = await fetch(
                `/get-employees?keyword=${encodeURIComponent(keyword)}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                return;
            }

            const result = (await response.json()) as Employee[];

            setEmployees(result);

            setShowSuggestions(true);
        } catch (error) {
            console.error(error);
        }
    };

    const employeeInput = (value: string) => {
        setEmployeeSearch(value);

        setEmployeeId('');

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            void searchEmployees(value);
        }, 300);
    };

    const selectEmployee = (employee: Employee) => {
        setEmployeeSearch(`${employee.name} - ${employee.employee_id}`);

        setEmployeeId(String(employee.id));

        setShowSuggestions(false);
    };


    const applyFilters = () => {
        router.get(
            '/hr/increment',
            {
                user: employeeId || undefined,

                department: department || undefined,

                designation: designation || undefined,

                status: status || undefined,

                sorting: sorting || undefined,
            },
            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };


    const clearFilters = () => {
        setEmployeeSearch('');

        setEmployeeId('');

        setDepartment('');

        setDesignation('');

        setStatus('');

        setSorting('desc');

        router.get(
            '/hr/increment',
            {},
            {
                preserveState: false,

                preserveScroll: false,

                replace: true,
            },
        );
    };


    const handleView = async (id: number) => {
        try {
            const response = await fetch(`/hr/increment/${id}`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load increment.');
            }

            const increment = (await response.json()) as Increment;

            setSelectedIncrement(increment);

            setShowOpen(true);
        } catch (error) {
            console.error(error);
        }
    };


    const handleEdit = async (id: number) => {
        try {
            const response = await fetch(`/hr/increment/${id}/edit`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load increment.');
            }

            const increment = (await response.json()) as Increment;

            setSelectedIncrement(increment);

            setEditOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

 

    const handleDelete = (increment: Increment) => {
        setDeleteIncrement(increment);

        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteIncrement) {
            return;
        }

        router.delete(`/hr/increment/${deleteIncrement.id}`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);

                setDeleteIncrement(null);
            },

            onFinish: () => {
                setDeleting(false);
            },
        });
    };



    const requestStatusChange = (
        increment: Increment,
        newStatus: 'approved' | 'rejected',
    ) => {
        setStatusIncrement(increment);

        setNextStatus(newStatus);

        setStatusModalOpen(true);
    };


    const confirmStatusChange = () => {
        if (!statusIncrement || !nextStatus) {
            return;
        }

        router.patch(
            `/hr/increment/${statusIncrement.id}/status`,
            {
                status: nextStatus,
            },
            {
                preserveScroll: true,

                onStart: () => {
                    setUpdatingStatus(true);
                },

                onSuccess: () => {
                    setStatusModalOpen(false);

                    setStatusIncrement(null);

                    setNextStatus(null);

                    setShowOpen(false);

                    setSelectedIncrement(null);
                },

                onFinish: () => {
                    setUpdatingStatus(false);
                },
            },
        );
    };

 

    const handlePageChange = (page: number) => {
        router.get(
            '/hr/increment',
            {
                page,

                user: employeeId || undefined,

                department: department || undefined,

                designation: designation || undefined,

                status: status || undefined,

                sorting: sorting || undefined,
            },
            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };

   // Click Outside Employee Search
    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (
                employeeRef.current &&
                !employeeRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handler);

        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, []);

    // Currency
    const currency = activeCurrency?.symbol ?? '৳';

    const rate = Number(activeCurrency?.exchange_rate ?? 1) || 1;

    const money = (value: number | string) =>
        new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,

            maximumFractionDigits: 2,
        }).format(Number(value) * rate);

   // Active Filter Check
    const hasFilters = Boolean(
        employeeId || department || designation || status || sorting !== 'desc',
    );


    return (
        <>
            <Head title="Salary Increment" />

            <PageTitle title="Salary Increment" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            {permissions.create && (
                                <Button
                                    type="button"
                                    variant="primary"
                                    leftIcon={<Plus size={15} />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Add New
                                </Button>
                            )}

                            <div
                                ref={employeeRef}
                                className="position-relative"
                                style={{
                                    width: 260,
                                }}
                            >
                                <Search
                                    size={16}
                                    className="
                    position-absolute
                    top-50
                    start-0
                    translate-middle-y
                    ms-3
                    text-muted
                "
                                />

                                <input
                                    type="text"
                                    className="form-control ps-5"
                                    placeholder="Search employees"
                                    value={employeeSearch}
                                    onFocus={() => {
                                        void searchEmployees(employeeSearch);
                                    }}
                                    onChange={(event) =>
                                        employeeInput(event.target.value)
                                    }
                                />

                                {showSuggestions && (
                                    <div
                                        className="
                        position-absolute
                        px-2
                        bg-white
                        border
                        rounded
                        shadow-sm
                        w-100
                        mt-1
                    "
                                        style={{
                                            zIndex: 1050,
                                            maxHeight: 200,
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {employees.length > 0 ? (
                                            employees.map((employee) => (
                                                <button
                                                    key={employee.id}
                                                    type="button"
                                                    className="
                                        dropdown-item
                                        text-start
                                        py-2
                                    "
                                                    onClick={() =>
                                                        selectEmployee(employee)
                                                    }
                                                >
                                                    <div className="fw-semibold">
                                                        {employee.name}
                                                    </div>

                                                    <small className="text-muted">
                                                        #{employee.employee_id}
                                                    </small>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-muted small">
                                                No employees found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <select
                                className="form-select"
                                style={{
                                    width: 220,
                                }}
                                value={department}
                                onChange={(event) =>
                                    setDepartment(event.target.value)
                                }
                            >
                                <option value="">All Departments</option>

                                {departments.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="form-select"
                                style={{
                                    width: 220,
                                }}
                                value={designation}
                                onChange={(event) =>
                                    setDesignation(event.target.value)
                                }
                            >
                                <option value="">All Designations</option>

                                {designations.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="form-select"
                                style={{
                                    width: 160,
                                }}
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <option value="">All Status</option>

                                <option value="pending">Pending</option>

                                <option value="approved">Approved</option>

                                <option value="rejected">Rejected</option>
                            </select>

                            <select
                                className="form-select"
                                style={{
                                    width: 170,
                                }}
                                value={sorting}
                                onChange={(event) =>
                                    setSorting(event.target.value)
                                }
                            >
                                <option value="desc">Newest First</option>

                                <option value="asc">Oldest First</option>
                            </select>

                            <Button
                                type="button"
                                variant="primary"
                                leftIcon={<Filter size={15} />}
                                onClick={applyFilters}
                            >
                                Filter
                            </Button>

                            {hasFilters && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    leftIcon={<X size={15} />}
                                    onClick={clearFilters}
                                >
                                    Clear
                                </Button>
                            )}
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

                                    <TableHead>Employee</TableHead>

                                    <TableHead>Designation</TableHead>

                                    <TableHead>Department</TableHead>

                                    <TableHead>Increment</TableHead>

                                    <TableHead>Increment Amount</TableHead>

                                    <TableHead>Old Basic</TableHead>

                                    <TableHead>New Basic</TableHead>

                                    <TableHead>Effective Date</TableHead>

                                    <TableHead>Status</TableHead>

                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {increments.data.length > 0 ? (
                                    increments.data.map((increment, index) => (
                                        <TableRow key={increment.id}>
                                            <TableCell>
                                                {(increments.from ?? 1) + index}
                                            </TableCell>

                                            <TableCell>
                                                <div className="fw-semibold">
                                                    {increment.user.name}
                                                </div>

                                                <small className="text-muted">
                                                    #
                                                    {increment.user.employee_id}
                                                </small>
                                            </TableCell>

                                            <TableCell>
                                                {increment.user.designation
                                                    ?.name ?? '-'}
                                            </TableCell>

                                            <TableCell>
                                                {increment.user.department
                                                    ?.name ?? '-'}
                                            </TableCell>

                                            <TableCell>
                                                {increment.increment_type ===
                                                    'fixed' && <>{currency} </>}

                                                {Number(
                                                    increment.increment_value,
                                                ).toFixed(2)}

                                                {increment.increment_type ===
                                                    'percentage' && ' %'}
                                            </TableCell>

                                            <TableCell>
                                                {currency}{' '}
                                                {money(
                                                    increment.increment_amount,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {currency}{' '}
                                                {money(
                                                    increment.old_basic_salary,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {currency}{' '}
                                                {money(
                                                    increment.new_basic_salary,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {new Date(
                                                    increment.effective_date,
                                                ).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>

                                            <TableCell>
                                                {increment.status ===
                                                'approved' ? (
                                                    <span className="badge bg-success">
                                                        Approved
                                                    </span>
                                                ) : increment.status ===
                                                  'rejected' ? (
                                                    <span className="badge bg-danger">
                                                        Rejected
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark">
                                                        Pending
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="d-flex gap-1">
                                                    {permissions.view && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light"
                                                            title="View"
                                                            onClick={() =>
                                                                void handleView(
                                                                    increment.id,
                                                                )
                                                            }
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                    )}

                                                    {permissions.edit &&
                                                        increment.status ===
                                                            'pending' && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    void handleEdit(
                                                                        increment.id,
                                                                    )
                                                                }
                                                            >
                                                                <Edit
                                                                    size={15}
                                                                />
                                                            </button>
                                                        )}

                                                    {permissions.delete &&
                                                        increment.status !==
                                                            'approved' && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light text-danger"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        increment,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={15}
                                                                />
                                                            </button>
                                                        )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={11} />
                                )}
                            </TableBody>
                        </Table>

                        <div className="d-flex w-100 flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3">
                            <TablePaginationInfo
                                from={increments.from ?? 0}
                                to={increments.to ?? 0}
                                total={increments.total}
                            />

                            <Pagination
                                currentPage={increments.current_page}
                                lastPage={increments.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Create */}

            {permissions.create && (
                <IncrementCreateModal
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                />
            )}

            {/* Edit */}

            {permissions.edit && (
                <IncrementEditModal
                    open={editOpen}
                    increment={selectedIncrement}
                    onClose={() => {
                        setEditOpen(false);

                        setSelectedIncrement(null);
                    }}
                />
            )}

            {/* Show */}

            {permissions.view && (
                <IncrementShowModal
                    open={showOpen}
                    increment={selectedIncrement}
                    canChangeStatus={permissions.status}
                    onApprove={() => {
                        if (selectedIncrement) {
                            requestStatusChange(selectedIncrement, 'approved');
                        }
                    }}
                    onReject={() => {
                        if (selectedIncrement) {
                            requestStatusChange(selectedIncrement, 'rejected');
                        }
                    }}
                    onClose={() => {
                        setShowOpen(false);

                        setSelectedIncrement(null);
                    }}
                />
            )}

            {/* Status Confirmation */}

            <ConfirmModal
                open={statusModalOpen}
                onOpenChange={(open) => {
                    if (updatingStatus) {
                        return;
                    }

                    setStatusModalOpen(open);

                    if (!open) {
                        setStatusIncrement(null);

                        setNextStatus(null);
                    }
                }}
                processing={updatingStatus}
                title={
                    nextStatus === 'approved'
                        ? 'Approve Increment?'
                        : 'Reject Increment?'
                }
                description={
                    statusIncrement && nextStatus
                        ? `Are you sure you want to ${nextStatus} the increment request for "${statusIncrement.user.name}"?`
                        : 'Are you sure you want to update this increment?'
                }
                confirmVariant={
                    nextStatus === 'approved' ? 'success' : 'danger'
                }
                onConfirm={confirmStatusChange}
            />

            {/* Delete Confirmation */}

            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setDeleteIncrement(null);
                    }
                }}
                processing={deleting}
                title="Delete Increment?"
                description={
                    deleteIncrement
                        ? `Are you sure you want to delete the increment request for "${deleteIncrement.user.name}"?`
                        : 'Are you sure you want to delete this increment?'
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}
