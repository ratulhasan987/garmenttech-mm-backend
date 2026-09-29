import { useState, type FormEvent } from 'react';

import { router } from '@inertiajs/react';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

import { Input } from '@/components/ui/form/input';

import { DatePicker } from '@/components/ui/form/date-picker';

import { Button } from '@/components/ui/button';

import { searchEmployees } from '@/lib/hr';

import type { SalaryAdvanceEmployee } from '@/types/hr';

// Types

type Props = {
    open: boolean;

    onClose: () => void;
};

// Component

export default function SalaryAdvanceCreateModal({ open, onClose }: Props) {
    const [employee, setEmployee] = useState<SalaryAdvanceEmployee | null>(
        null,
    );

    const [amount, setAmount] = useState('');

    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    const [status, setStatus] = useState<'Active' | 'In-active'>('Active');

    const [processing, setProcessing] = useState(false);

    // Close

    const closeModal = () => {
        if (processing) {
            return;
        }

        onClose();
    };

    // Submit

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!employee?.id) {
            return;
        }

        router.post(
            '/hr/salary-advance',
            {
                user_id: employee.id,

                amount,

                month,

                status,
            },
            {
                preserveScroll: true,

                onStart: () => {
                    setProcessing(true);
                },

                onSuccess: () => {
                    setEmployee(null);

                    setAmount('');

                    setMonth(new Date().toISOString().slice(0, 7));

                    setStatus('Active');

                    onClose();
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    if (!open) {
        return null;
    }

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                role="document"
                style={{
                    maxWidth: '500px',
                }}
            >
                <div
                    className="modal-content"
                    style={{
                        borderRadius: '8px',
                        overflow: 'visible',
                    }}
                >
                    {/* Header */}

                    <div
                        className="modal-header"
                        style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid #e5e7eb',
                        }}
                    >
                        <h5
                            className="modal-title"
                            style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                margin: 0,
                            }}
                        >
                            Add salary advance
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={closeModal}
                            disabled={processing}
                        />
                    </div>

                    <form onSubmit={submit}>
                        {/* Body */}

                        <div
                            className="modal-body"
                            style={{
                                padding: '18px 16px 16px',
                            }}
                        >
                            {/* Employee */}

                            <div className="mb-3">
                                <label className="form-label">
                                    Select Employee
                                </label>

                                <SuggestionSearchInput<SalaryAdvanceEmployee>
                                    label=""
                                    required
                                    placeholder="Search employees"
                                    searchFn={searchEmployees}
                                    labelKey="label"
                                    secondaryLabelKey="employee_id"
                                    idKey="id"
                                    onSelect={(selected) =>
                                        setEmployee(selected)
                                    }
                                    onClear={() => setEmployee(null)}
                                />
                            </div>

                            {/* Amount */}

                            <div className="mb-3">
                                <label className="form-label">Amount</label>

                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(event.target.value)
                                    }
                                    placeholder="10000"
                                    required
                                />
                            </div>

                            {/* Month */}

                            <div className="mb-3">
                                <label className="form-label">
                                    Salary Month
                                </label>

                                <DatePicker
                                    mode="month"
                                    value={month}
                                    onChange={(value) => setMonth(value)}
                                    placeholder="Select month"
                                    disabled={processing}
                                    required
                                />
                            </div>

                            {/* Status */}

                            <div
                                style={{
                                    border: '1px solid #d9dee5',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                }}
                            >
                                <div
                                    style={{
                                        color: '#ffb000',
                                        fontSize: '16px',
                                        fontStyle: 'italic',
                                        fontWeight: 600,
                                        marginBottom: '3px',
                                    }}
                                >
                                    Is Active
                                </div>

                                <div
                                    className="d-flex align-items-center"
                                    style={{
                                        gap: '20px',
                                    }}
                                >
                                    <label
                                        className="d-flex align-items-center"
                                        style={{
                                            gap: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="salary_advance_status"
                                            checked={status === 'Active'}
                                            onChange={() => setStatus('Active')}
                                            style={{
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                border:
                                                    status === 'Active'
                                                        ? '2px solid #087f7f'
                                                        : '1px solid #d1d5db',
                                                backgroundColor:
                                                    status === 'Active'
                                                        ? '#087f7f'
                                                        : '#ffffff',
                                                boxShadow:
                                                    status === 'Active'
                                                        ? 'inset 0 0 0 3px #ffffff'
                                                        : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                            }}
                                        />
                                        Active
                                    </label>

                                    <label
                                        className="d-flex align-items-center"
                                        style={{
                                            gap: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="salary_advance_status"
                                            checked={status === 'In-active'}
                                            onChange={() =>
                                                setStatus('In-active')
                                            }
                                            style={{
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                border:
                                                    status === 'In-active'
                                                        ? '2px solid #087f7f'
                                                        : '1px solid #d1d5db',
                                                backgroundColor:
                                                    status === 'In-active'
                                                        ? '#087f7f'
                                                        : '#ffffff',
                                                boxShadow:
                                                    status === 'In-active'
                                                        ? 'inset 0 0 0 3px #ffffff'
                                                        : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                            }}
                                        />
                                        In-active
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}

                        <div
                            className="modal-footer"
                            style={{
                                padding: '12px 16px',
                                borderTop: '1px solid #e5e7eb',
                                gap: '8px',
                            }}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                appearance="default"
                                onClick={closeModal}
                                disabled={processing}
                                style={{
                                    backgroundColor: '#ff654d',
                                    borderColor: '#ff654d',
                                }}
                            >
                                Close
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing || !employee}
                            >
                                {processing ? 'Saving...' : 'Submit'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
