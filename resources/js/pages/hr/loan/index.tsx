import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Edit, Eye, Plus, Trash2 } from 'react-feather';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { AppModal } from '@/components/ui/modal/app-modal';
import { DatePicker } from '@/components/ui/form/date-picker';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { NumberInput } from '@/components/ui/form/number-input';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { Textarea } from '@/components/ui/form/textarea';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { TableEmpty } from '@/components/shared/table-empty';
import ApplyLoanModal from '@/components/pages/loan/apply-loan-modal';
import { usePermission } from '@/hooks/use-permission';
import PageTitle from '@/components/page-title';

type Employee = { id: number; name: string; employee_id: string };

type Loan = {
    id: number;
    user_id: number;
    amount: number | string;
    repayment_amount: number | string;
    monthly_installment: number | string;
    duration: number;
    repayment_from: string;
    approval_date: string | null;
    status: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Rejected';
    loan_details: string;
    created_at: string;
    user: Employee;
};

type PaginatedLoans = {
    data: Loan[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type PageProps = {
    loans: PaginatedLoans;
    numberOfLoans: number;
    interestRate: number;
    filters?: {
        employee?: string;
        status?: string;
        sorting?: string;
        start_date?: string;
        end_date?: string;
    };
    auth: { user: { permissions?: string[] } };
};

const money = (value: number | string) =>
    Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const shortDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(value));

const monthLabel = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    return year && month
        ? new Intl.DateTimeFormat(undefined, {
              month: 'long',
              year: 'numeric',
          }).format(new Date(year, month - 1, 1))
        : '—';
};

const searchEmployees = async (keyword: string): Promise<Employee[]> => {
    try {
        const query = new URLSearchParams();
        if (keyword.trim()) query.set('keyword', keyword.trim());
        const response = await fetch(`/get-employees?${query.toString()}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });
        return response.ok ? response.json() : [];
    } catch {
        return [];
    }
};

function EditLoanModal({
    loan,
    interestRate,
    onClose,
}: {
    loan: Loan | null;
    interestRate: number;
    onClose: () => void;
}) {
    const form = useForm({
        id: '',
        loan_details: '',
        amount: '',
        duration: '',
        repayment_from: '',
    });

    const repaymentAmount = useMemo(() => {
        const amount = Number(form.data.amount) || 0;
        return amount + (amount * Number(interestRate || 0)) / 100;
    }, [form.data.amount, interestRate]);
    const installment =
        Number(form.data.duration) > 0
            ? repaymentAmount / Number(form.data.duration)
            : 0;

    // Reset the edit form whenever another loan is selected.
    useEffect(() => {
        if (loan) {
            form.setData({
                id: String(loan.id),
                loan_details: loan.loan_details,
                amount: String(loan.amount),
                duration: String(loan.duration),
                repayment_from: loan.repayment_from,
            });
        }
    }, [loan]);

    return (
        <AppModal
            open={Boolean(loan)}
            onOpenChange={(open) => !open && onClose()}
            title="Update Request"
        >
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/hr/loan-request/update', {
                        preserveScroll: true,
                        onSuccess: onClose,
                    });
                }}
            >
                <FormField>
                    <FormLabel>Employee</FormLabel>
                    <input
                        className="form-control"
                        value={
                            loan
                                ? `${loan.user.name} - ${loan.user.employee_id}`
                                : ''
                        }
                        readOnly
                    />
                </FormField>
                <FormField>
                    <FormLabel required>Purpose of Loan</FormLabel>
                    <Textarea
                        rows={2}
                        maxLength={500}
                        value={form.data.loan_details}
                        onChange={(event) =>
                            form.setData('loan_details', event.target.value)
                        }
                    />
                    <FormError error={form.errors.loan_details} />
                </FormField>
                <FormField>
                    <FormLabel required>Amount</FormLabel>
                    <NumberInput
                        value={Number(form.data.amount)}
                        onValueChange={(value) =>
                            form.setData('amount', String(value))
                        }
                        error={form.errors.amount}
                    />
                    <FormError error={form.errors.amount} />
                </FormField>
                <FormField>
                    <FormLabel required>Duration – in Months</FormLabel>
                    <NumberInput
                        value={Number(form.data.duration)}
                        onValueChange={(value) =>
                            form.setData('duration', String(value))
                        }
                        error={form.errors.duration}
                    />
                    <FormError error={form.errors.duration} />
                </FormField>
                <FormField>
                    <FormLabel>Monthly Installment</FormLabel>
                    <input
                        className="form-control"
                        value={money(installment)}
                        readOnly
                    />
                </FormField>
                <FormField>
                    <FormLabel required>Repayment From</FormLabel>
                    <DatePicker
                        mode="month"
                        value={form.data.repayment_from}
                        onChange={(value) =>
                            form.setData('repayment_from', value)
                        }
                    />
                    <FormError error={form.errors.repayment_from} />
                </FormField>
                <FormField>
                    <FormLabel>Repayment Amount</FormLabel>
                    <input
                        className="form-control"
                        value={money(repaymentAmount)}
                        readOnly
                    />
                </FormField>
                <div className="modal-footer">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </AppModal>
    );
}

function LoanDetailsModal({
    loan,
    onClose,
    canEdit,
}: {
    loan: Loan | null;
    onClose: () => void;
    canEdit: boolean;
}) {
    const statusForm = useForm({
        id: '',
        status: '',
    });

    const submitStatus = (status: 'Approved' | 'Rejected') => {
        if (!loan) {
            return;
        }

        statusForm.transform(() => ({
            id: String(loan.id),
            status,
        }));

        statusForm.post('/hr/loan-request-status', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <AppModal
            open={Boolean(loan)}
            onOpenChange={(open) => !open && onClose()}
            title={loan?.user.name ?? 'Loan Request'}
            size="lg"
        >
            {loan && (
                <>
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                            <h5 className="mb-1">{loan.user.name}</h5>
                            <p className="mb-0 text-muted">
                                Employee ID: {loan.user.employee_id}
                            </p>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-borderless">
                            <tbody>
                                <tr>
                                    <th>Applied Day</th>
                                    <td>{shortDate(loan.created_at)}</td>
                                </tr>
                                <tr>
                                    <th>Amount</th>
                                    <td>{money(loan.amount)}</td>
                                </tr>
                                <tr>
                                    <th>Repayment Amount</th>
                                    <td>{money(loan.repayment_amount)}</td>
                                </tr>
                                <tr>
                                    <th>Repayment From</th>
                                    <td>{monthLabel(loan.repayment_from)}</td>
                                </tr>
                                <tr>
                                    <th>Duration</th>
                                    <td>{loan.duration} Month</td>
                                </tr>
                                <tr>
                                    <th>Monthly Installment</th>
                                    <td>{money(loan.monthly_installment)}</td>
                                </tr>
                                <tr>
                                    <th>Details</th>
                                    <td>{loan.loan_details}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="modal-footer">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        {canEdit && loan.status === 'Pending' && (
                            <>
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => submitStatus('Rejected')}
                                    disabled={statusForm.processing}
                                >
                                    Reject
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => submitStatus('Approved')}
                                    disabled={statusForm.processing}
                                >
                                    Approve
                                </Button>
                            </>
                        )}
                    </div>
                </>
            )}
        </AppModal>
    );
}

export default function LoanRequestIndex({
    loans,
    numberOfLoans,
    interestRate,
    filters = {},
}: PageProps) {
    const [applyOpen, setApplyOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [filter, setFilter] = useState({
        employee: filters.employee ?? '',
        status: filters.status ?? '',
        sorting: filters.sorting ?? '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });

    const { can } = usePermission();

    const canAct = can('loan.view') || can('loan.edit') || can('loan.delete');

    const filterLoans = (page?: number) =>
        router.get(
            '/hr/all-loan-request',
            { ...filter, page },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const deleteLoan = (loan: Loan) =>
        Swal.fire({
            title: 'Delete loan request?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            confirmButtonColor: '#dc3545',
        }).then(({ isConfirmed }) => {
            if (isConfirmed)
                router.delete(`/hr/loan-request/${loan.id}`, {
                    preserveScroll: true,
                });
        });

    return (
        <>
           <Head title="Loan Reques" />

            <PageTitle title="Loan Request" />
            <div className="card">
                <div className="card-header">
                    <form
                        className="d-flex gap-2 flex-wrap align-items-center"
                        onSubmit={(event) => {
                            event.preventDefault();
                            filterLoans();
                        }}
                    >
                        <Button
                            type="button"
                            onClick={() => setApplyOpen(true)}
                            leftIcon={<Plus size={16} />}
                        >
                            Apply Loan
                        </Button>
                        <div style={{ flex: '1 1 200px' }}>
                            <SuggestionSearchInput<Employee>
                                searchFn={searchEmployees}
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="employee_id"
                                placeholder="Search employees"
                                clearOnFocus={false}
                                defaultSelectedItem={employee}
                                onSelect={(item) => {
                                    setEmployee(item);
                                    setFilter((value) => ({
                                        ...value,
                                        employee: String(item.id),
                                    }));
                                }}
                                onClear={() => {
                                    setEmployee(null);
                                    setFilter((value) => ({
                                        ...value,
                                        employee: '',
                                    }));
                                }}
                            />
                        </div>
                        <select
                            className="form-control"
                            style={{ flex: '1 1 160px' }}
                            value={filter.status}
                            onChange={(event) =>
                                setFilter((value) => ({
                                    ...value,
                                    status: event.target.value,
                                }))
                            }
                        >
                            <option value="">All Status</option>
                            {[
                                'Pending',
                                'Approved',
                                'Active',
                                'Completed',
                                'Rejected',
                            ].map((status) => (
                                <option key={status}>{status}</option>
                            ))}
                        </select>
                        <select
                            className="form-control"
                            style={{ flex: '1 1 160px' }}
                            value={filter.sorting}
                            onChange={(event) =>
                                setFilter((value) => ({
                                    ...value,
                                    sorting: event.target.value,
                                }))
                            }
                        >
                            <option value="">-- Sort By Date --</option>
                            <option value="asc">Oldest First</option>
                            <option value="desc">Newest First</option>
                        </select>

                        <div style={{ flex: '1 1 160px' }}>
                            <DatePicker
                                id="start_date"
                                placeholder="Start date"
                                value={filter.start_date}
                                onChange={(date) => {
                                    setFilter((value) => ({
                                        ...value,
                                        start_date: date,
                                    }));
                                }}
                                style={{ flex: '1 1 160px' }}
                                className="form-control"
                                showClearButton
                            />
                        </div>

                        <div style={{ flex: '1 1 160px' }}>
                            <DatePicker
                                id="end_date"
                                placeholder="End date"
                                value={filter.end_date}
                                onChange={(date) => {
                                    setFilter((value) => ({
                                        ...value,
                                        end_date: date,
                                    }));
                                }}
                                className="form-control"
                                style={{ flex: '1 1 160px' }}
                                showClearButton
                            />
                        </div>

                        <Button type="submit">Filter</Button>
                    </form>
                </div>
                <div className="card-body">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sl</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Repayment Amount</TableHead>
                                <TableHead>Monthly Installment</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Payment From</TableHead>
                                <TableHead>Approval Date</TableHead>
                                <TableHead>Status</TableHead>
                                {canAct && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loans.data.length === 0 ? (
                                <TableEmpty colSpan={canAct ? 10 : 9} />
                            ) : (
                                loans.data.map((loan, index) => {
                                    const pendingOrRejected = [
                                        'Pending',
                                        'Rejected',
                                    ].includes(loan.status);
                                    return (
                                        <TableRow key={loan.id}>
                                            <TableCell>
                                                {(loans.from ?? 1) + index}
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    pendingOrRejected
                                                        ? 'cursor-pointer'
                                                        : ''
                                                }
                                                onClick={() =>
                                                    pendingOrRejected
                                                        ? setSelectedLoan(loan)
                                                        : router.visit(
                                                              `/hr/loan-request/${loan.id}/installment`,
                                                          )
                                                }
                                            >
                                                <strong>
                                                    {loan.user.name}
                                                </strong>
                                                <br />
                                                <span>
                                                    #{loan.user.employee_id}
                                                </span>
                                                <br />
                                                <small className="text-secondary">
                                                    {shortDate(loan.created_at)}
                                                </small>
                                            </TableCell>
                                            <TableCell>
                                                {money(loan.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {money(loan.repayment_amount)}
                                            </TableCell>
                                            <TableCell>
                                                {money(
                                                    loan.monthly_installment,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {loan.duration} Month
                                            </TableCell>
                                            <TableCell>
                                                {monthLabel(
                                                    loan.repayment_from,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {loan.approval_date ??
                                                    'Not Approved Yet'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`badge bg-${loan.status === 'Pending' ? 'warning' : loan.status === 'Rejected' ? 'danger' : loan.status === 'Approved' ? 'success' : loan.status === 'Active' ? 'primary' : 'secondary'}`}
                                                >
                                                    {loan.status}
                                                </span>
                                            </TableCell>
                                            {canAct && (
                                                <TableCell>
                                                    <div className="d-flex gap-2">
                                                        {can('loan.view') && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0"
                                                                onClick={() =>
                                                                    pendingOrRejected
                                                                        ? setSelectedLoan(
                                                                              loan,
                                                                          )
                                                                        : router.visit(
                                                                              `/hr/loan-installment/${loan.id}/show`,
                                                                          )
                                                                }
                                                            >
                                                                <Eye
                                                                    size={17}
                                                                />
                                                            </button>
                                                        )}
                                                        {can('loan.edit') &&
                                                            pendingOrRejected && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link p-0"
                                                                    onClick={() =>
                                                                        setEditingLoan(
                                                                            loan,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                        {can('loan.delete') &&
                                                            pendingOrRejected && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link text-danger p-0"
                                                                    onClick={() =>
                                                                        deleteLoan(
                                                                            loan,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                    <div className="mt-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <span>
                            Showing {loans.from ?? 0} to {loans.to ?? 0} of{' '}
                            {numberOfLoans} Loans
                        </span>
                        {loans.last_page > 1 && (
                            <Pagination
                                currentPage={loans.current_page}
                                lastPage={loans.last_page}
                                onPageChange={(page) => filterLoans(page)}
                            />
                        )}
                    </div>
                </div>
            </div>
            <ApplyLoanModal
                open={applyOpen}
                onOpenChange={setApplyOpen}
                interestRate={interestRate}
                isHr
            />
            <LoanDetailsModal
                loan={selectedLoan}
                onClose={() => setSelectedLoan(null)}
                canEdit={can('loan.edit')}
            />
            <EditLoanModal
                loan={editingLoan}
                interestRate={interestRate}
                onClose={() => setEditingLoan(null)}
            />
        </>
    );
}
