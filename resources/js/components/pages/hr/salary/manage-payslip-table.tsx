import type { Salary, SalaryPagination } from '@/types/salary';

import { Link, router } from '@inertiajs/react';

import { TableHead } from './../../../ui/table';
import { Eye } from 'lucide-react';

interface ManagePayslipTableProps {
    salaries: SalaryPagination<Salary>;

    currentMonth?: string;

    months?: string[];

    numberOfSalaries?: number;
}

function formatMonth(value?: string) {
    if (!value) {
        return '-';
    }

    const [year, month] = value.split('-');

    const date = new Date(Number(year), Number(month) - 1, 1);

    return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
}

export function ManagePayslipTable({
    salaries,
    currentMonth,
    months = [],
    numberOfSalaries = 0,
}: ManagePayslipTableProps) {
    const selectedMonth = currentMonth ?? salaries.data?.[0]?.month ?? '';

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const month = event.target.value;

        if (!month) {
            return;
        }

        router.get(
            '/hr/payslip',
            {
                month,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="card">
            <div
                className="
                    card-header
                    d-flex
                    align-items-center
                    justify-content-between
                    gap-3
                    flex-wrap
                "
            >
                <h5 className="mb-0 fw-bolder">Manage Employee Salary</h5>

                <select
                    className="form-select"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    style={{
                        width: '185px',
                    }}
                >
                    {months.length > 0 ? (
                        months.map((month) => (
                            <option key={month} value={month}>
                                {formatMonth(month)}
                            </option>
                        ))
                    ) : selectedMonth ? (
                        <option value={selectedMonth}>
                            {formatMonth(selectedMonth)}
                        </option>
                    ) : (
                        <option value="">No months available</option>
                    )}
                </select>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead>
                            <tr>
                                <TableHead
                                    sticky
                                    style={{
                                        width: '60px',
                                    }}
                                >
                                    Sl
                                </TableHead>

                                <TableHead sticky>Employee</TableHead>

                                <TableHead sticky>Salary Month</TableHead>

                                <TableHead
                                    sticky
                                    style={{
                                        width: '330px',
                                        textAlign: 'right',
                                    }}
                                >
                                    Action
                                </TableHead>
                            </tr>
                        </thead>

                        <tbody>
                            {salaries?.data?.length > 0 ? (
                                salaries.data.map((salary, index) => (
                                    <tr key={salary.id}>
                                        <td>{(salaries.from ?? 1) + index}</td>

                                        <td>
                                            <div>
                                                <div className="fw-medium">
                                                    {salary.user?.name}
                                                </div>

                                                <small className="text-muted">
                                                    #{salary.user?.employee_id}
                                                </small>
                                            </div>
                                        </td>

                                        <td>{formatMonth(salary.month)}</td>

                                        <td>
                                            <div
                                                className="
                                                        d-flex
                                                        justify-content-end
                                                        align-items-center
                                                        gap-2
                                                    "
                                            >
                                                <Link
                                                    href={`/hr/payslip/${salary.id}`}
                                                    target="_blank"
                                                    className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center gap-1"
                                                    style={{
                                                        minWidth: '115px',
                                                    }}
                                                >
                                                    <Eye size={15} />
                                                    View Details Payslip
                                                </Link>
                                                {/* 
                                                    <a
                                                        href={`/hr/payslip/${salary.id}/download`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-sm btn-success"
                                                        style={{
                                                            minWidth:
                                                                '190px',
                                                        }}
                                                    >
                                                        Download Pay slip
                                                    </a> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-center py-5"
                                    >
                                        <div className="text-muted">
                                            No payslips found for{' '}
                                            {formatMonth(selectedMonth)}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div
                    className="
                        d-flex
                        flex-wrap
                        justify-content-between
                        align-items-center
                        gap-3
                        p-3
                    "
                >
                    <div className="text-muted">
                        Showing {salaries.from ?? 0} to {salaries.to ?? 0} of{' '}
                        {numberOfSalaries} Salaries
                    </div>

                    {salaries.links && salaries.links.length > 3 && (
                        <div className="d-flex gap-1">
                            {salaries.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`
                                                btn
                                                btn-sm
                                                ${
                                                    link.active
                                                        ? 'btn-primary'
                                                        : 'btn-outline-secondary'
                                                }
                                                ${!link.url ? 'disabled' : ''}
                                            `}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
