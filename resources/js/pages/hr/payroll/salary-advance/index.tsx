import { useState } from 'react';

import { Head, router } from '@inertiajs/react';

import dayjs from 'dayjs';

import { Edit, Filter, RotateCcw, Trash2 } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { Select } from '@/components/ui/form/select';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

import { DatePicker } from '@/components/ui/form/date-picker';

import { Pagination } from '@/components/ui/pagination';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { searchEmployees } from '@/lib/hr';

import type {
    SalaryAdvance,
    SalaryAdvanceEmployee,
    SalaryAdvanceIndexProps,
    SalaryAdvanceStatus,
} from '@/types/hr';

import SalaryAdvanceCreateModal from '@/components/pages/hr/payroll/salary-advance/SalaryAdvanceCreateModal';

import SalaryAdvanceEditModal from '@/components/pages/hr/payroll/salary-advance/SalaryAdvanceEditModal';

function money(value: string | number): string {
    return Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function statusClass(status: SalaryAdvanceStatus): string {
    switch (status) {
        case 'Active':
            return 'bg-success';

        case 'Completed':
            return 'bg-info';

        case 'In-active':
            return 'bg-secondary';

        default:
            return 'bg-secondary';
    }
}

export default function SalaryAdvanceIndexPage({
    advances,
    numberOfAdvances,
    filters,
    selectedEmployee,
}: SalaryAdvanceIndexProps) {
    // Filter state

    const [employee, setEmployee] = useState<SalaryAdvanceEmployee | null>(
        selectedEmployee ?? null,
    );

    const [status, setStatus] = useState<SalaryAdvanceStatus | ''>(
        (filters.status as SalaryAdvanceStatus) ?? '',
    );

    const [sorting, setSorting] = useState(filters.sorting ?? '');

    const [startDate, setStartDate] = useState(filters.start_date ?? '');

    const [endDate, setEndDate] = useState(filters.end_date ?? '');

    // Modal state

    const [createOpen, setCreateOpen] = useState(false);

    const [editOpen, setEditOpen] = useState(false);

    const [selectedAdvance, setSelectedAdvance] =
        useState<SalaryAdvance | null>(null);

    // Delete state

    const [deleteAdvance, setDeleteAdvance] = useState<SalaryAdvance | null>(
        null,
    );

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [deleting, setDeleting] = useState(false);

    // Apply filters

    const applyFilters = () => {
        router.get(
            '/hr/salary-advance',
            {
                user: employee?.id ?? undefined,

                status: status || undefined,

                sorting: sorting || undefined,

                start_date: startDate || undefined,

                end_date: endDate || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Reset filters

    const resetFilters = () => {
        setEmployee(null);
        setStatus('');
        setSorting('');
        setStartDate('');
        setEndDate('');

        router.get(
            '/hr/salary-advance',
            {},
            {
                preserveState: false,
                preserveScroll: false,
                replace: true,
            },
        );
    };

    // Pagination

    const handlePageChange = (page: number) => {
        router.get(
            '/hr/salary-advance',
            {
                page,

                user: filters.user ?? undefined,

                status: filters.status ?? undefined,

                sorting: filters.sorting ?? undefined,

                start_date: filters.start_date ?? undefined,

                end_date: filters.end_date ?? undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Edit

    const handleEdit = (advance: SalaryAdvance) => {
        setSelectedAdvance(advance);
        setEditOpen(true);
    };

    // Delete

    const handleDelete = (advance: SalaryAdvance) => {
        setDeleteAdvance(advance);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteAdvance) {
            return;
        }

        router.delete(`/hr/salary-advance/${deleteAdvance.id}`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);
                setDeleteAdvance(null);
            },

            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    // Selected employee

    const selectedEmployeeLabel = selectedEmployee
        ? `${selectedEmployee.name} - ${selectedEmployee.employee_id}`
        : '';

    // Filter status

    const hasFilters = Boolean(
        filters.user ||
        filters.status ||
        filters.sorting ||
        filters.start_date ||
        filters.end_date,
    );

    return (
        <>
            <Head title="Salary Advance" />

            <PageTitle title="Salary Advance" />

            <div className="container-fluid">
                <Card>
                    {/* Header */}

                    <CardHeader>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {/* Add */}

                            <Button
                                type="button"
                                onClick={() => setCreateOpen(true)}
                                className="flex-shrink-0 ms-auto"
                            >
                                Add Salary Advance
                            </Button>

                            {/* Employee */}

                            <div
                                style={{
                                    minWidth: '220px',
                                    flex: '1 1 220px',
                                }}
                            >
                                <SuggestionSearchInput<SalaryAdvanceEmployee>
                                    placeholder="Search employee..."
                                    searchFn={searchEmployees}
                                    labelKey="label"
                                    secondaryLabelKey="employee_id"
                                    idKey="id"
                                    defaultValue={selectedEmployeeLabel}
                                    defaultSelectedItem={selectedEmployee}
                                    onSelect={(employee) => {
                                        setEmployee(employee);
                                    }}
                                    onClear={() => {
                                        setEmployee(null);
                                    }}
                                />
                            </div>

                            {/* Status */}

                            <div
                                style={{
                                    minWidth: '140px',
                                    flex: '0 1 150px',
                                }}
                            >
                                <Select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value as
                                                SalaryAdvanceStatus | '',
                                        )
                                    }
                                >
                                    <option value="">All Status</option>

                                    <option value="Active">Active</option>

                                    <option value="In-active">In-active</option>

                                    <option value="Completed">Completed</option>
                                </Select>
                            </div>

                            {/* Sorting */}

                            <div
                                style={{
                                    minWidth: '140px',
                                    flex: '0 1 150px',
                                }}
                            >
                                <Select
                                    value={sorting}
                                    onChange={(event) =>
                                        setSorting(event.target.value)
                                    }
                                >
                                    <option value="">Newest First</option>

                                    <option value="desc">Newest First</option>

                                    <option value="asc">Oldest First</option>
                                </Select>
                            </div>

                            {/* From */}

                            <div
                                style={{
                                    minWidth: '145px',
                                    flex: '1 1 160px',
                                }}
                            >
                                <DatePicker
                                    value={startDate}
                                    placeholder="From Date"
                                    onChange={(value) => {
                                        setStartDate(value ?? '');
                                    }}
                                />
                            </div>

                            {/* To */}

                            <div
                                style={{
                                    minWidth: '145px',
                                    flex: '1 1 160px',
                                }}
                            >
                                <DatePicker
                                    minDate={startDate}
                                    value={endDate}
                                    placeholder="To Date"
                                    onChange={(value) => {
                                        setEndDate(value ?? '');
                                    }}
                                />
                            </div>

                            {/* Filter */}

                            <Button
                                type="button"
                                onClick={applyFilters}
                                className="flex-shrink-0"
                                title="Apply Filter"
                            >
                                <Filter size={15} />
                                <span className="ms-2">Filter</span>
                            </Button>

                            {/* Reset */}

                            {hasFilters && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    onClick={resetFilters}
                                    className="flex-shrink-0"
                                    title="Reset Filters"
                                >
                                    <RotateCcw size={15} />
                                    <span className="ms-2">Reset</span>
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    {/* Table */}

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

                                    <TableHead sticky>Employee</TableHead>

                                    <TableHead sticky>Amount</TableHead>

                                    <TableHead sticky>Salary Month</TableHead>

                                    <TableHead sticky>Created</TableHead>

                                    <TableHead sticky>Status</TableHead>

                                    <TableHead sticky>Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {advances.data.length > 0 ? (
                                    advances.data.map((advance, index) => (
                                        <TableRow key={advance.id}>
                                            <TableCell>
                                                {(advances.current_page - 1) *
                                                    advances.per_page +
                                                    index +
                                                    1}
                                            </TableCell>

                                            <TableCell>
                                                <div className="f-w-500">
                                                    {advance.user?.name}
                                                </div>

                                                <small className="text-muted">
                                                    #{advance.user?.employee_id}
                                                </small>
                                            </TableCell>

                                            <TableCell>
                                                <span className="f-w-500">
                                                    {money(advance.amount)}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                {dayjs(
                                                    `${advance.month}-01`,
                                                ).format('MMM, YYYY')}
                                            </TableCell>

                                            <TableCell>
                                                {dayjs(
                                                    advance.created_at,
                                                ).format('DD MMM, YYYY')}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`badge ${statusClass(
                                                        advance.status,
                                                    )}`}
                                                >
                                                    {advance.status}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <div className="d-flex align-items-center gap-1">
                                                    {advance.status !==
                                                        'Completed' && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="warning"
                                                                appearance="outline"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        advance,
                                                                    )
                                                                }
                                                            >
                                                                <Edit
                                                                    size={15}
                                                                />
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="danger"
                                                                appearance="outline"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        advance,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={15}
                                                                />
                                                            </Button>
                                                        </>
                                                    )}
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

                    {/* Pagination */}

                    <CardFooter>
                        <div className="d-flex w-100 flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <TablePaginationInfo
                                from={advances.from ?? 0}
                                to={advances.to ?? 0}
                                total={advances.total}
                            />

                            <Pagination
                                currentPage={advances.current_page}
                                lastPage={advances.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Create */}

            <SalaryAdvanceCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />

            {/* Edit */}

            <SalaryAdvanceEditModal
                open={editOpen}
                advance={selectedAdvance}
                onClose={() => {
                    setEditOpen(false);

                    setSelectedAdvance(null);
                }}
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
                        setDeleteAdvance(null);
                    }
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}
