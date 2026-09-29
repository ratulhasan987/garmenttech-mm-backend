// resources/js/pages/hr/loan-request.tsx

import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'react-feather';

import { Button } from '@/components/ui/button';

import { AppModal } from '@/components/ui/modal/app-modal';
import PageTitle from '@/components/page-title';
import { Pagination } from '@/components/ui/pagination';
import { PaginatedData } from '@/types/pagination';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
    TableBody,
} from '@/components/ui/table';
import { TableEmpty } from '@/components/shared/table-empty';
import ApplyLoanModal from '@/components/pages/loan/apply-loan-modal';
import dayjs from 'dayjs';

type LoanStatus =
    'pending' | 'approved' | 'rejected' | 'active' | 'completed' | string;

type Loan = {
    id: number;
    created_at: string;
    amount: number | string;
    repayment_amount: number | string;
    monthly_installment: number | string;
    repayment_from: string;
    duration: number;
    approval_date?: string | null;
    status: LoanStatus;
    installment_url?: string | null;
};

type LoanDetails = {
    employee_name?: string | null;
    employee_id?: string | number | null;
    employee_image?: string | null;
    applied_date?: string | null;
    amount?: string | number | null;
    repayment_amount?: string | number | null;
    repayment_from?: string | null;
    duration?: string | number | null;
    monthly_installment?: string | number | null;
    loan_details?: string | null;
    status?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    loans: PaginatedData<Loan>;
    interestRate: number;
    storeUrl?: string;
    showUrlPrefix?: string;
    defaultAvatar?: string;
};

const formatAmount = (value: number | string | null | undefined) =>
    Number(value ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
};

const formatMonth = (month: string | null | undefined) => {
    if (!month) return 'N/A';

    const [year, monthNumber] = month.split('-');

    if (!year || !monthNumber) return month;

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(Number(year), Number(monthNumber) - 1, 1));
};

const getStatusClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'pending') return 'bg-warning';
    if (normalizedStatus === 'approved') return 'bg-success';
    if (normalizedStatus === 'rejected') return 'bg-danger';
    if (normalizedStatus === 'active') return 'bg-primary';
    if (normalizedStatus === 'completed') return 'bg-purple';

    return 'bg-secondary';
};


export default function LoanRequest({
    loans,
    interestRate,
    defaultAvatar = '/avatar.png',
}: Props) {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<LoanDetails | null>(null);
    const [isLoadingLoan, setIsLoadingLoan] = useState(false);

    const form = useForm({
        loan_details: '',
        amount: '',
        duration: '',
        repayment_from: '',
    });

    const amount = Number(form.data.amount) || 0;
    const duration = Number(form.data.duration) || 0;

    const repaymentAmount = useMemo(
        () => amount + (amount * Number(interestRate || 0)) / 100,
        [amount, interestRate],
    );

    const monthlyInstallment = useMemo(() => {
        if (duration <= 0) return 0;

        return repaymentAmount / duration;
    }, [duration, repaymentAmount]);

    useEffect(() => {
        if (!isApplyModalOpen) {
            form.reset();
            form.clearErrors();
        }
    }, [isApplyModalOpen]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/hr/loan-request', {
            preserveScroll: true,
            onSuccess: () => {
                setIsApplyModalOpen(false);
            },
        });
    };

    const handleShowRequest = async (loanId: number) => {
        setIsShowModalOpen(true);
        setIsLoadingLoan(true);
        setSelectedLoan(null);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            )?.content;

            const response = await fetch(`/hr/loan-request/${loanId}/show`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    ...(csrfToken
                        ? {
                              'X-CSRF-TOKEN': csrfToken,
                          }
                        : {}),
                },
            });

            if (!response.ok) {
                throw new Error('Unable to load loan request details.');
            }

            setSelectedLoan(await response.json());
        } catch (error) {
            console.error(error);
            setSelectedLoan(null);
        } finally {
            setIsLoadingLoan(false);
        }
    };

    return (
        <>
           <Head title="Loan Request" />

            <PageTitle title="Loan Request" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <Button
                            type="button"
                            leftIcon={<Plus size={16} />}
                            onClick={() => setIsApplyModalOpen(true)}
                        >
                            Apply Loan
                        </Button>
                    </CardHeader>

                    <CardBody>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sl</TableHead>
                                    <TableHead>Applied Day</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Repayment Amount</TableHead>
                                    <TableHead>Monthly Installment</TableHead>
                                    <TableHead>Payment From</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Approval Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loans.data.length > 0 ? (
                                    loans.data.map((loan, index) => {
                                        const isViewable = [
                                            'pending',
                                            'rejected',
                                        ].includes(loan.status.toLowerCase());

                                        return (
                                            <TableRow key={loan.id}>
                                                <TableCell>
                                                    {(loans.from ?? 1) + index}
                                                </TableCell>

                                                <TableCell>
                                                    <span>
                                                        {dayjs(
                                                            loan.created_at,
                                                        ).format(
                                                            'DD MMM, YYYY',
                                                        )}
                                                    </span>
                                                    {/* {isViewable ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-link p-0 text-secondary text-decoration-none"
                                                            onClick={() =>
                                                                handleShowRequest(
                                                                    loan.id,
                                                                )
                                                            }
                                                        >
                                                            {formatDate(
                                                                loan.created_at,
                                                            )}
                                                        </button>
                                                    ) : loan.installment_url ? (
                                                        <Link
                                                            href={
                                                                loan.installment_url
                                                            }
                                                            className="text-info text-decoration-none"
                                                        >
                                                            {formatDate(
                                                                loan.created_at,
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-info">
                                                            {formatDate(
                                                                loan.created_at,
                                                            )}
                                                        </span>
                                                    )} */}
                                                </TableCell>

                                                <TableCell>
                                                    {formatAmount(loan.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatAmount(
                                                        loan.repayment_amount,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatAmount(
                                                        loan.monthly_installment,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatMonth(
                                                        loan.repayment_from,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {loan.duration} Month
                                                </TableCell>
                                                <TableCell>
                                                    {loan.approval_date ??
                                                        'Not Approved Yet'}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`badge ${getStatusClass(
                                                            loan.status,
                                                        )}`}
                                                    >
                                                        {loan.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableEmpty colSpan={9} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                    <CardFooter>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <TablePaginationInfo
                                from={loans?.from ?? 0}
                                to={loans?.to ?? 0}
                                total={loans?.total}
                            />
                            <Pagination
                                currentPage={loans?.current_page}
                                lastPage={loans.last_page}
                                onPageChange={(page) => {
                                    console.log(page);
                                }}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <ApplyLoanModal
                open={isApplyModalOpen}
                onOpenChange={setIsApplyModalOpen}
                interestRate={interestRate}
            />

            <AppModal
                open={isShowModalOpen}
                onOpenChange={setIsShowModalOpen}
                title="Show Request"
                size="lg"
            >
                <div className="modal-body">
                    {isLoadingLoan ? (
                        <div className="py-5 text-center text-muted">
                            Loading loan request...
                        </div>
                    ) : !selectedLoan ? (
                        <div className="py-5 text-center text-danger">
                            Unable to load loan request details.
                        </div>
                    ) : (
                        <>
                            <div className="card mb-4 border-0 shadow-sm">
                                <div className="card-body d-flex align-items-center">
                                    <img
                                        src={
                                            selectedLoan.employee_image ||
                                            defaultAvatar
                                        }
                                        className="me-3 rounded-circle border border-2 border-white shadow"
                                        width="70"
                                        height="70"
                                        alt="Employee"
                                        onError={(event) => {
                                            event.currentTarget.src =
                                                defaultAvatar;
                                        }}
                                    />

                                    <div>
                                        <h5 className="mb-1 fw-semibold">
                                            {selectedLoan.employee_name ??
                                                'N/A'}
                                        </h5>
                                        <p className="mb-0 small text-muted">
                                            Employee ID:{' '}
                                            {selectedLoan.employee_id ?? 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-borderless table-hover mb-0">
                                    <tbody>
                                        <DetailRow
                                            label="Applied Day"
                                            value={
                                                selectedLoan.applied_date ??
                                                'N/A'
                                            }
                                        />
                                        <DetailRow
                                            label="Amount"
                                            value={formatAmount(
                                                selectedLoan.amount,
                                            )}
                                        />
                                        <DetailRow
                                            label="Re-payment Amount"
                                            value={formatAmount(
                                                selectedLoan.repayment_amount,
                                            )}
                                        />
                                        <DetailRow
                                            label="Re-payment From"
                                            value={
                                                selectedLoan.repayment_from ??
                                                'N/A'
                                            }
                                        />
                                        <DetailRow
                                            label="Duration"
                                            value={
                                                selectedLoan.duration
                                                    ? `${selectedLoan.duration} Month`
                                                    : 'N/A'
                                            }
                                        />
                                        <DetailRow
                                            label="Monthly Installment"
                                            value={formatAmount(
                                                selectedLoan.monthly_installment,
                                            )}
                                        />
                                        <DetailRow
                                            label="Details"
                                            value={
                                                selectedLoan.loan_details ??
                                                'N/A'
                                            }
                                            last
                                        />
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {selectedLoan && !isLoadingLoan && (
                    <div className="modal-footer justify-content-center">
                        <p className="mb-0">
                            <strong>Your Request Status is: </strong>
                            <span className="text-capitalize">
                                {selectedLoan.status ?? 'N/A'}
                            </span>
                        </p>
                    </div>
                )}
            </AppModal>
        </>
    );
}

function DetailRow({
    label,
    value,
    last = false,
}: {
    label: string;
    value: string | number;
    last?: boolean;
}) {
    return (
        <tr className={last ? '' : 'border-bottom'}>
            <th className="fw-normal text-muted">{label}</th>
            <td>{value}</td>
        </tr>
    );
}
