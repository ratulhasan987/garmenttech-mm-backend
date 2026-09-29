import {
    useEffect,
    useState,
    type FormEvent,
} from 'react';

import {
    router,
} from '@inertiajs/react';

import {
    Input,
} from '@/components/ui/form/input';

import {
    DatePicker,
} from '@/components/ui/form/date-picker';

import {
    Button,
} from '@/components/ui/button';

import type {
    SalaryAdvance,
    SalaryAdvanceStatus,
} from '@/types/hr';

type Props = {
    open: boolean;

    advance:
        | SalaryAdvance
        | null;

    onClose: () => void;
};

export default function SalaryAdvanceEditModal({
    open,
    advance,
    onClose,
}: Props) {
    const [
        amount,
        setAmount,
    ] = useState('');

    const [
        month,
        setMonth,
    ] = useState('');

    const [
        status,
        setStatus,
    ] = useState<SalaryAdvanceStatus>(
        'Active',
    );

    const [
        processing,
        setProcessing,
    ] = useState(false);

    useEffect(() => {
        if (!advance) {
            return;
        }

        setAmount(
            String(
                advance.amount,
            ),
        );

        setMonth(
            advance.month,
        );

        setStatus(
            advance.status,
        );
    }, [
        advance,
    ]);

    const closeModal = () => {
        if (processing) {
            return;
        }

        onClose();
    };

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!advance) {
            return;
        }

        router.put(
            `/hr/salary-advance/${advance.id}`,
            {
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
                    onClose();
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    if (
        !open ||
        !advance
    ) {
        return null;
    }

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{
                backgroundColor:
                    'rgba(0, 0, 0, 0.5)',
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
                            borderBottom:
                                '1px solid #e5e7eb',
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
                            Update salary advance
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
                                padding:
                                    '18px 16px 16px',
                            }}
                        >
                            {/* Employee */}

                            <div className="mb-3">
                                <label className="form-label">
                                    Select Employee
                                </label>

                                <div
                                    className="form-control"
                                    style={{
                                        height: '40px',
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        backgroundColor:
                                            '#fff',
                                        cursor:
                                            'default',
                                    }}
                                >
                                    {advance
                                        .user
                                        ?.name ??
                                        'Employee'}

                                    {advance
                                        .user
                                        ?.employee_id && (
                                        <span className="text-muted ms-1">
                                            #
                                            {
                                                advance
                                                    .user
                                                    .employee_id
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Amount */}

                            <div className="mb-3">
                                <label className="form-label">
                                    Amount
                                </label>

                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(
                                        event,
                                    ) =>
                                        setAmount(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* Salary Month */}

                            <div className="mb-3">
                                <label className="form-label">
                                    Salary Month
                                </label>

                                <DatePicker
                                    mode="month"
                                    value={month}
                                    onChange={(
                                        value,
                                    ) =>
                                        setMonth(
                                            value,
                                        )
                                    }
                                    placeholder="Select month"
                                    disabled={
                                        processing
                                    }
                                    required
                                />
                            </div>

                            {/* Status */}

                            <div
                                style={{
                                    border:
                                        '1px solid #d9dee5',
                                    borderRadius:
                                        '6px',
                                    padding:
                                        '10px 14px',
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            '#ffb000',
                                        fontSize:
                                            '16px',
                                        fontWeight:
                                            600,
                                        fontStyle:
                                            'italic',
                                        marginBottom:
                                            '3px',
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
                                            cursor:
                                                'pointer',
                                            fontSize:
                                                '14px',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="edit_salary_advance_status"
                                            checked={
                                                status ===
                                                'Active'
                                            }
                                            onChange={() =>
                                                setStatus(
                                                    'Active',
                                                )
                                            }
                                            disabled={
                                                processing
                                            }
                                            style={{
                                                appearance:
                                                    'none',
                                                WebkitAppearance:
                                                    'none',
                                                width:
                                                    '16px',
                                                height:
                                                    '16px',
                                                borderRadius:
                                                    '50%',
                                                border:
                                                    status ===
                                                    'Active'
                                                        ? '2px solid #087f7f'
                                                        : '1px solid #d1d5db',
                                                backgroundColor:
                                                    status ===
                                                    'Active'
                                                        ? '#087f7f'
                                                        : '#ffffff',
                                                boxShadow:
                                                    status ===
                                                    'Active'
                                                        ? 'inset 0 0 0 3px #ffffff'
                                                        : 'none',
                                                cursor:
                                                    processing
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                                transition:
                                                    'all 0.15s ease',
                                            }}
                                        />

                                        Active
                                    </label>

                                    <label
                                        className="d-flex align-items-center"
                                        style={{
                                            gap: '6px',
                                            cursor:
                                                'pointer',
                                            fontSize:
                                                '14px',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="edit_salary_advance_status"
                                            checked={
                                                status ===
                                                'In-active'
                                            }
                                            onChange={() =>
                                                setStatus(
                                                    'In-active',
                                                )
                                            }
                                            disabled={
                                                processing
                                            }
                                            style={{
                                                appearance:
                                                    'none',
                                                WebkitAppearance:
                                                    'none',
                                                width:
                                                    '16px',
                                                height:
                                                    '16px',
                                                borderRadius:
                                                    '50%',
                                                border:
                                                    status ===
                                                    'In-active'
                                                        ? '2px solid #087f7f'
                                                        : '1px solid #d1d5db',
                                                backgroundColor:
                                                    status ===
                                                    'In-active'
                                                        ? '#087f7f'
                                                        : '#ffffff',
                                                boxShadow:
                                                    status ===
                                                    'In-active'
                                                        ? 'inset 0 0 0 3px #ffffff'
                                                        : 'none',
                                                cursor:
                                                    processing
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                                transition:
                                                    'all 0.15s ease',
                                            }}
                                        />

                                        In-active
                                    </label>

                                    {status ===
                                        'Completed' && (
                                        <span
                                            className="text-muted"
                                            style={{
                                                fontSize:
                                                    '14px',
                                            }}
                                        >
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}

                        <div
                            className="modal-footer"
                            style={{
                                padding:
                                    '12px 16px',
                                borderTop:
                                    '1px solid #e5e7eb',
                                gap: '8px',
                            }}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                appearance="default"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    processing
                                }
                                style={{
                                    backgroundColor:
                                        '#ff654d',
                                    borderColor:
                                        '#ff654d',
                                }}
                            >
                                Close
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    processing
                                }
                            >
                                {processing
                                    ? 'Updating...'
                                    : 'Save changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}