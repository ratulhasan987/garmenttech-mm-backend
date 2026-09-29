import { router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'react-feather';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { TableEmpty } from '@/components/shared/table-empty';

type LoanInstallment = {
    id: number;
    installment_no?: number;
    amount?: number | string;
    installment_amount?: number | string;
    paid_amount?: number | string;
    due_date?: string | null;
    payment_date?: string | null;
    status: string;
    remarks?: string | null;
};

type Loan = {
    id: number;
    amount: number | string;
    repayment_amount: number | string;
    monthly_installment: number | string;
    duration: number;
    repayment_from: string;
    approval_date: string | null;
    status: string;
    loan_details: string;
    user: {
        id: number;
        employee_id: string;
        name: string;
        image: string | null;
        phone: string | null;
        email: string | null;
        emergency_contact: string | null;
    };
    installments: LoanInstallment[];
};

type PageProps = {
    loan: Loan;
};

const formatMoney = (value: number | string | null | undefined) =>
    Number(value ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const formatDate = (value: string | null | undefined) => {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
};

const formatMonth = (value: string) => {
    const [year, month] = value.split('-').map(Number);

    if (!year || !month) {
        return '—';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
    }).format(new Date(year, month - 1, 1));
};

const statusClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'paid':
        case 'completed':
            return 'success';

        case 'pending':
            return 'warning';

        case 'overdue':
        case 'rejected':
            return 'danger';

        case 'active':
            return 'primary';

        default:
            return 'secondary';
    }
};

export default function LoanInstallmentIndex({ loan }: PageProps) {
    const totalPaid = loan.installments.reduce(
        (total, installment) => total + Number(installment.paid_amount ?? 0),
        0,
    );

    const remainingAmount = Math.max(
        Number(loan.repayment_amount) - totalPaid,
        0,
    );

    return (
        <>
            <div className="mt-3 row">
                <div className="col-12 mb-3">
                    <Button
                        variant="secondary"
                        appearance="outline"
                        leftIcon={<ArrowLeft size={16} />}
                        onClick={() => router.visit('/hr/all-loan-request')}
                    >
                        Back to Loan Requests
                    </Button>
                </div>

                <div className="col-xl-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Employee Information</h5>
                        </div>

                        <div className="card-body">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <img
                                    src={
                                        loan.user.image
                                            ? `/${loan.user.image}`
                                            : '/avatar.png'
                                    }
                                    alt={loan.user.name}
                                    width={70}
                                    height={70}
                                    className="rounded-circle border object-fit-cover"
                                />

                                <div>
                                    <h5 className="mb-1">{loan.user.name}</h5>
                                    <p className="text-muted mb-0">
                                        #{loan.user.employee_id}
                                    </p>
                                </div>
                            </div>

                            <InfoRow label="Phone" value={loan.user.phone} />
                            <InfoRow label="Email" value={loan.user.email} />
                            <InfoRow
                                label="Emergency Contact"
                                value={loan.user.emergency_contact}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Loan Summary</h5>
                        </div>

                        <div className="card-body">
                            <InfoRow
                                label="Loan Amount"
                                value={formatMoney(loan.amount)}
                            />
                            <InfoRow
                                label="Repayment Amount"
                                value={formatMoney(loan.repayment_amount)}
                            />
                            <InfoRow
                                label="Monthly Installment"
                                value={formatMoney(loan.monthly_installment)}
                            />
                            <InfoRow
                                label="Duration"
                                value={`${loan.duration} Month${
                                    loan.duration > 1 ? 's' : ''
                                }`}
                            />
                            <InfoRow
                                label="Repayment From"
                                value={formatMonth(loan.repayment_from)}
                            />
                            <InfoRow
                                label="Approval Date"
                                value={formatDate(loan.approval_date)}
                            />
                            <InfoRow
                                label="Remaining Amount"
                                value={formatMoney(remainingAmount)}
                                valueClass="text-danger fw-bold"
                            />

                            <div className="mt-3">
                                <span
                                    className={`badge bg-${statusClass(
                                        loan.status,
                                    )}`}
                                >
                                    {loan.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Installment History</h5>
                        </div>

                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Loan Purpose
                                </label>

                                <p className="mb-0 text-muted">
                                    {loan.loan_details || '—'}
                                </p>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sl</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>
                                            Installment Amount
                                        </TableHead>
                                        <TableHead>Paid Amount</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {loan.installments.length === 0 ? (
                                        <TableEmpty colSpan={7} />
                                    ) : (
                                        loan.installments.map(
                                            (installment, index) => (
                                                <TableRow key={installment.id}>
                                                    <TableCell>
                                                        {installment.installment_no ??
                                                            index + 1}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatDate(
                                                            installment.due_date,
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatMoney(
                                                            installment.installment_amount ??
                                                                installment.amount,
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatMoney(
                                                            installment.paid_amount,
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatDate(
                                                            installment.payment_date,
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        <span
                                                            className={`badge bg-${statusClass(
                                                                installment.status,
                                                            )}`}
                                                        >
                                                            {installment.status}
                                                        </span>
                                                    </TableCell>

                                                    <TableCell>
                                                        {installment.remarks ||
                                                            '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({
    label,
    value,
    valueClass = '',
}: {
    label: string;
    value: string | number | null | undefined;
    valueClass?: string;
}) {
    return (
        <div className="d-flex justify-content-between gap-3 border-bottom py-2">
            <span className="text-muted">{label}</span>

            <span className={`text-end ${valueClass}`}>{value || '—'}</span>
        </div>
    );
}
