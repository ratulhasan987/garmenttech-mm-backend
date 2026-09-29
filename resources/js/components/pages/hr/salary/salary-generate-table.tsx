import { useState, type ChangeEvent } from 'react';

import { router } from '@inertiajs/react';

import { Check, List, Pause } from 'react-feather';

import { ConfirmModal } from '@/components/modals/confirm-modal';

import type { PaginatedData, Salary } from '@/types/salary';

type SalaryGenerateTableProps = {
    salaries: PaginatedData<Salary>;
    numberOfSalaries: number;
    month: string;
};

function formatMonth(month: string): string {
    if (!month) {
        return '-';
    }

    const date = new Date(`${month}-01T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return month;
    }

    return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
}

function formatSalary(value: string | number | null | undefined): string {
    return Number(value ?? 0).toFixed(2);
}

export function SalaryGenerateTable({
    salaries,
    numberOfSalaries,
    month,
}: SalaryGenerateTableProps) {
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [processing, setProcessing] = useState(false);

    // Generate month options

    const monthOptions = Array.from(
        {
            length: 12,
        },
        (_, index) => {
            const date = new Date();

            date.setDate(1);

            date.setMonth(date.getMonth() - index);

            const value = `${date.getFullYear()}-${String(
                date.getMonth() + 1,
            ).padStart(2, '0')}`;

            return {
                value,
                label: date.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                }),
            };
        },
    );

    // Change month

    const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedMonth = event.target.value;

        router.get(
            '/hr/salary-generate',
            {
                month: selectedMonth,
            },
            {
                preserveState: true,

                preserveScroll: true,
            },
        );
    };

    // Open status confirmation

    const handleStatusClick = (salary: Salary) => {
        setSelectedSalary(salary);

        setConfirmOpen(true);
    };

    // Update salary status

    const handleStatusConfirm = () => {
        if (!selectedSalary) {
            return;
        }

        const nextStatus =
            selectedSalary.status === 'Approved' ? 'Hold' : 'Approved';

        setProcessing(true);

        router.patch(
            `/hr/payslip/${selectedSalary.id}/status`,
            {
                status: nextStatus,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setConfirmOpen(false);

                    setSelectedSalary(null);
                },

                onError: (errors) => {
                    console.error('Salary status update failed:', errors);
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    // Close confirmation modal

    const handleConfirmModalChange = (open: boolean) => {
        if (processing) {
            return;
        }

        setConfirmOpen(open);

        if (!open) {
            setSelectedSalary(null);
        }
    };

    // Pagination

    const handlePagination = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,

                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <div className="card mt-3">
                <div className="card-body">
                    {/* Header */}

                    <div
                        className="
                            d-flex
                            align-items-center
                            justify-content-between
                            gap-2
                            flex-wrap
                            mb-3
                        "
                    >
                        <div>
                            <h5 className="fw-bold mb-1">Salary Generate</h5>

                            <div className="text-muted small">
                                {numberOfSalaries} salaries for{' '}
                                {formatMonth(month)}
                            </div>
                        </div>

                        <div
                            className="
                                d-flex
                                align-items-center
                                gap-2
                            "
                        >
                            <label
                                htmlFor="salary-month"
                                className="mb-0 text-muted small"
                            >
                                Month
                            </label>

                            <select
                                id="salary-month"
                                value={month}
                                onChange={handleMonthChange}
                                className="form-select form-select-sm"
                                style={{
                                    width: '180px',
                                }}
                            >
                                {monthOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}

                    <div
                        className="table-responsive"
                        style={{
                            overflowX: 'auto',
                        }}
                    >
                        <table className="table">
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            width: '60px',
                                        }}
                                    >
                                        Sl
                                    </th>

                                    <th
                                        style={{
                                            width: '140px',
                                        }}
                                    >
                                        Employee ID
                                    </th>

                                    <th>Employee</th>

                                    <th
                                        style={{
                                            width: '150px',
                                        }}
                                    >
                                        Salary Month
                                    </th>

                                    <th
                                        style={{
                                            width: '140px',
                                        }}
                                    >
                                        Basic Salary
                                    </th>

                                    <th
                                        style={{
                                            width: '140px',
                                        }}
                                    >
                                        Gross Salary
                                    </th>

                                    <th
                                        style={{
                                            width: '140px',
                                        }}
                                    >
                                        Net Salary
                                    </th>

                                    <th
                                        style={{
                                            width: '110px',
                                        }}
                                    >
                                        Status
                                    </th>

                                    <th
                                        className="text-end"
                                        style={{
                                            width: '110px',
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {salaries.data.length > 0 ? (
                                    salaries.data.map((salary, index) => (
                                        <tr key={salary.id}>
                                            <td>
                                                {(salaries.from ?? 1) + index}
                                            </td>

                                            <td>
                                                {salary.user?.employee_id ??
                                                    '-'}
                                            </td>

                                            <td>
                                                <div className="fw-medium">
                                                    {salary.user?.name}
                                                </div>
                                            </td>

                                            <td>{formatMonth(salary.month)}</td>

                                            <td>
                                                {formatSalary(
                                                    salary.basic_salary,
                                                )}
                                            </td>

                                            <td>
                                                {formatSalary(
                                                    salary.gross_salary,
                                                )}
                                            </td>

                                            <td>
                                                {formatSalary(
                                                    salary.net_salary,
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        salary.status ===
                                                        'Approved'
                                                            ? 'badge bg-success'
                                                            : 'badge bg-warning text-dark'
                                                    }
                                                >
                                                    {salary.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div
                                                    className="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-end
                                                            gap-1
                                                        "
                                                >
                                                    {/* Change status */}

                                                    <button
                                                        type="button"
                                                        title={
                                                            salary.status ===
                                                            'Approved'
                                                                ? 'Put on hold'
                                                                : 'Approve salary'
                                                        }
                                                        className="btn btn-sm"
                                                        onClick={() =>
                                                            handleStatusClick(
                                                                salary,
                                                            )
                                                        }
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            padding: 0,
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            border: '1px solid #635bff',
                                                            color: '#635bff',
                                                            backgroundColor:
                                                                '#fff',
                                                            borderRadius: '4px',
                                                        }}
                                                    >
                                                        {salary.status ===
                                                        'Approved' ? (
                                                            <Pause size={16} />
                                                        ) : (
                                                            <Check size={17} />
                                                        )}
                                                    </button>

                                                    {/* View payslip */}

                                                    <a
                                                        href={`/hr/salary-generate/chart/${salary.month}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="View payslip"
                                                        className="btn btn-sm"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            padding: 0,
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            border: '1px solid #635bff',
                                                            color: '#635bff',
                                                            backgroundColor:
                                                                '#fff',
                                                            borderRadius: '4px',
                                                        }}
                                                    >
                                                        <List size={17} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="
                                                text-center
                                                text-muted
                                                py-5
                                            "
                                        >
                                            No salary generated for{' '}
                                            {formatMonth(month)}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}

                    <div
                        className="
        mt-3
        d-flex
        align-items-center
        justify-content-between
        flex-wrap
        gap-2
    "
                    >
                        <div className="text-muted small">
                            Showing {salaries.from ?? 0} to {salaries.to ?? 0}{' '}
                            of {numberOfSalaries} Salaries
                        </div>

                        {numberOfSalaries > 8 && salaries.links?.length > 0 && (
                            <div
                                className="
                    d-flex
                    align-items-center
                    justify-content-end
                    gap-1
                    ms-auto
                "
                            >
                                {salaries.links.map((link, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={!link.url || link.active}
                                        className={`
                                btn
                                btn-sm
                                ${
                                    link.active
                                        ? 'btn-primary'
                                        : 'btn-outline-secondary'
                                }
                            `}
                                        onClick={() =>
                                            handlePagination(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status confirmation */}

            <ConfirmModal
                open={confirmOpen}
                onOpenChange={handleConfirmModalChange}
                onConfirm={handleStatusConfirm}
                title={
                    selectedSalary?.status === 'Approved'
                        ? 'Put Salary on Hold?'
                        : 'Approve Salary?'
                }
                description={
                    selectedSalary
                        ? `Are you sure you want to change the salary status for ${selectedSalary.user?.name ?? 'this employee'}?`
                        : 'Are you sure you want to change this salary status?'
                }
                confirmText={
                    selectedSalary?.status === 'Approved'
                        ? 'Yes, Hold'
                        : 'Yes, Approve'
                }
                cancelText="Cancel"
                confirmVariant={
                    selectedSalary?.status === 'Approved'
                        ? 'warning'
                        : 'success'
                }
                processing={processing}
                processingText="Updating..."
            />
        </>
    );
}
