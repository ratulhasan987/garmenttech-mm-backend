// resources/js/pages/hr/components/apply-loan-modal.tsx

import { useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { AppModal } from '@/components/ui/modal/app-modal';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Textarea } from '@/components/ui/form/textarea';
import { NumberInput } from '@/components/ui/form/number-input';
import { DatePicker } from '@/components/ui/form/date-picker';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

type ApplyLoanModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    interestRate: number;
    isHr?: boolean;
};

type EmployeeSuggestion = {
    id: number;
    name: string;
    employee_id: string;
};

const formatAmount = (value: number) =>
    value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const searchEmployees = async (
    keyword: string,
): Promise<EmployeeSuggestion[]> => {
    try {
        const params = new URLSearchParams();

        if (keyword.trim()) {
            params.set('keyword', keyword.trim());
        }

        const response = await fetch(`/get-employees?${params.toString()}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            throw new Error('Unable to load employees.');
        }

        return await response.json();
    } catch {
        return [];
    }
};

export default function ApplyLoanModal({
    open,
    onOpenChange,
    interestRate,
    isHr = false,
}: ApplyLoanModalProps) {
    const form = useForm({
        user_id: '',
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
        if (duration <= 0) {
            return 0;
        }

        return repaymentAmount / duration;
    }, [duration, repaymentAmount]);

    useEffect(() => {
        if (!open) {
            form.reset();
            form.clearErrors();
        }
    }, [open]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Change this to your exact HR loan route if needed.
        const route = isHr
            ? '/hr/manually-loan-request'
            : '/hr/loan-request';

        form.post(route, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title={isHr ? 'Manual Loan Request' : 'Loan Request'}
        >
            <form onSubmit={handleSubmit}>
                {isHr && (
                    <div className="col-md-12">
                        <FormField>
                            <FormLabel required>Select Employee</FormLabel>

                            <SuggestionSearchInput<EmployeeSuggestion>
                                key="apply-loan.employee-suggestion"
                                searchFn={searchEmployees}
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="employee_id"
                                placeholder="Search employees"
                                showSearchIcon={false}
                                clearOnFocus={false}
                                emptyLabel="No employees found."
                                onSelect={(employee) => {
                                    form.setData(
                                        'user_id',
                                        String(employee.id),
                                    );
                                    form.clearErrors('user_id');
                                }}
                                onClear={() => form.setData('user_id', '')}
                            />

                            <FormError error={form.errors.user_id} />
                        </FormField>
                    </div>
                )}

                <div className="col-md-12">
                    <FormField>
                        <FormLabel required>Purpose of Loan</FormLabel>

                        <Textarea
                            id="loan_details"
                            rows={2}
                            maxLength={500}
                            className={`form-control ${
                                form.errors.loan_details ? 'is-invalid' : ''
                            }`}
                            error={form.errors.loan_details}
                            value={form.data.loan_details}
                            onChange={(event) =>
                                form.setData(
                                    'loan_details',
                                    event.target.value,
                                )
                            }
                        />

                        <div className="form-text">
                            {form.data.loan_details.length}/500 characters
                        </div>

                        <FormError error={form.errors.loan_details} />
                    </FormField>
                </div>

                <div className="col-md-12">
                    <FormField>
                        <FormLabel required>Amount</FormLabel>

                        <NumberInput
                            id="amount"
                            value={Number(form.data.amount)}
                            error={form.errors.amount}
                            onValueChange={(value) =>
                                form.setData('amount', String(value))
                            }
                        />

                        <FormError error={form.errors.amount} />
                    </FormField>
                </div>

                <div className="col-md-12">
                    <FormField>
                        <FormLabel required>Duration – in Months</FormLabel>

                        <NumberInput
                            id="duration"
                            value={Number(form.data.duration)}
                            error={form.errors.duration}
                            onValueChange={(value) =>
                                form.setData('duration', String(value))
                            }
                        />

                        <FormError error={form.errors.duration} />
                    </FormField>
                </div>

                <div className="col-md-12">
                    <FormField>
                        <FormLabel>Monthly Installment</FormLabel>

                        <input
                            id="monthly_installment"
                            type="text"
                            className="form-control"
                            value={formatAmount(monthlyInstallment)}
                            readOnly
                        />
                    </FormField>
                </div>

                <div className="col-md-12">
                    <FormField>
                        <FormLabel required>Repayment From</FormLabel>

                        <DatePicker
                            mode="month"
                            id="repayment_from"
                            name="repayment_from"
                            value={form.data.repayment_from}
                            onChange={(value) =>
                                form.setData('repayment_from', value)
                            }
                        />

                        <FormError error={form.errors.repayment_from} />
                    </FormField>
                </div>

                <div className="col-md-12">
                    <FormField>
                        <FormLabel>
                            Repayment Amount{' '}
                            {Number(interestRate) !== 0
                                ? `(With ${interestRate}% Interest)`
                                : '(Without Interest)'}
                        </FormLabel>

                        <input
                            id="repayment_amount"
                            type="text"
                            className="form-control"
                            value={formatAmount(repaymentAmount)}
                            readOnly
                        />
                    </FormField>
                </div>

                <div className="modal-footer">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>

                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            form.data.loan_details.length > 500 ||
                            (isHr && !form.data.user_id)
                        }
                    >
                        {form.processing ? 'Saving...' : 'Submit Request'}
                    </Button>
                </div>
            </form>
        </AppModal>
    );
}
