import { CalendarDays, CircleCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';

import { DatePicker } from '@/components/ui/form/date-picker';

interface SalaryReportFormProps {
    currentMonth: string;
}

export function SalaryReportForm({ currentMonth }: SalaryReportFormProps) {
    const [month, setMonth] = useState(currentMonth);

    const [absentDeduction, setAbsentDeduction] = useState(true);

    const [consecutiveDeduction, setConsecutiveDeduction] = useState(false);

    const [lateDeduction, setLateDeduction] = useState(false);

    const [penaltyAbsentDeduction, setPenaltyAbsentDeduction] = useState(false);

    const [remainingTimeDeduction, setRemainingTimeDeduction] = useState(false);

    const [processing, setProcessing] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        /*
         * Prevent double submission.
         */
        if (processing) {
            event.preventDefault();

            return;
        }

        /*
         * Allow the browser to perform the
         * normal form submission.
         *
         * Because target="_blank" is used,
         * Laravel's report will open in a
         * new tab.
         */
        setProcessing(true);

        /*
         * The current page stays mounted because
         * the form opens in a new tab.
         *
         * Reset the button state shortly after
         * the browser has started the submission.
         */
        window.setTimeout(() => {
            setProcessing(false);
        }, 800);
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="card shadow-sm">
                    <CardHeader>
                        <div className="d-flex align-items-center gap-2">
                            <div>
                                <h5 className="mb-1">My Salary Report</h5>

                                <small className="text-muted">
                                    View your salary details for a selected
                                    month.
                                </small>
                            </div>
                        </div>
                    </CardHeader>

                    <div className="card-body">
                        <form
                            method="POST"
                            action="/hr/salary-report"
                            target="_blank"
                            onSubmit={handleSubmit}
                        >
                            {/* Laravel CSRF */}
                            <input
                                type="hidden"
                                name="_token"
                                value={
                                    document
                                        .querySelector<HTMLMetaElement>(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') ?? ''
                                }
                            />

                            <div className="row">
                                {/* DEDUCTION RULES*/}
                                <div className="col-12">
                                    <h6 className="fw-semibold mb-3">
                                        Deduction Rules
                                    </h6>
                                </div>

                                {/* Absent deduction */}
                                <div className="col-12 mb-3">
                                    <div className="form-check">
                                        <input
                                            id="absent_deduction"
                                            name="absent_deduction"
                                            type="checkbox"
                                            value="1"
                                            className="form-check-input"
                                            checked={absentDeduction}
                                            onChange={(event) =>
                                                setAbsentDeduction(
                                                    event.target.checked,
                                                )
                                            }
                                        />

                                        <label
                                            htmlFor="absent_deduction"
                                            className="form-check-label"
                                        >
                                            Absent deduction
                                            <span className="text-muted ms-1">
                                                (If you are absent, salary will
                                                be deducted)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Consecutive late */}
                                <div className="col-12 mb-3">
                                    <div className="form-check">
                                        <input
                                            id="consecutive_deduction"
                                            name="consecutive_deduction"
                                            type="checkbox"
                                            value="1"
                                            className="form-check-input"
                                            checked={consecutiveDeduction}
                                            onChange={(event) =>
                                                setConsecutiveDeduction(
                                                    event.target.checked,
                                                )
                                            }
                                        />

                                        <label
                                            htmlFor="consecutive_deduction"
                                            className="form-check-label"
                                        >
                                            If you are late for 3 consecutive
                                            days, 1 day's salary will be
                                            deducted.
                                        </label>
                                    </div>
                                </div>

                                {/* Late deduction */}
                                <div className="col-12 mb-3">
                                    <div className="form-check">
                                        <input
                                            id="late_deduction"
                                            name="late_deduction"
                                            type="checkbox"
                                            value="1"
                                            className="form-check-input"
                                            checked={lateDeduction}
                                            onChange={(event) =>
                                                setLateDeduction(
                                                    event.target.checked,
                                                )
                                            }
                                        />

                                        <label
                                            htmlFor="late_deduction"
                                            className="form-check-label"
                                        >
                                            If total late minutes in a month is
                                            120+, 1 day's salary will be
                                            deducted.
                                        </label>
                                    </div>
                                </div>

                                {/* Penalty absent */}
                                <div className="col-12 mb-3">
                                    <div className="form-check">
                                        <input
                                            id="penalty_absent_deduction"
                                            name="penalty_absent_deduction"
                                            type="checkbox"
                                            value="1"
                                            className="form-check-input"
                                            checked={penaltyAbsentDeduction}
                                            onChange={(event) =>
                                                setPenaltyAbsentDeduction(
                                                    event.target.checked,
                                                )
                                            }
                                        />

                                        <label
                                            htmlFor="penalty_absent_deduction"
                                            className="form-check-label"
                                        >
                                            If absent 1 day, 2 day's salary will
                                            be deducted.
                                        </label>
                                    </div>
                                </div>

                                {/* Remaining time */}
                                <div className="col-12 mb-4">
                                    <div className="form-check">
                                        <input
                                            id="remaining_time_deduction"
                                            name="remaining_time_deduction"
                                            type="checkbox"
                                            value="1"
                                            className="form-check-input"
                                            checked={remainingTimeDeduction}
                                            onChange={(event) =>
                                                setRemainingTimeDeduction(
                                                    event.target.checked,
                                                )
                                            }
                                        />

                                        <label
                                            htmlFor="remaining_time_deduction"
                                            className="form-check-label"
                                        >
                                            If remaining time is found, per
                                            minute salary will be deducted.
                                        </label>
                                    </div>
                                </div>

                                {/*SALARY MONTH*/}

                                <div className="col-md-6 col-lg-4">
                                    <label
                                        htmlFor="salaryMonth"
                                        className="form-label fw-medium d-flex align-items-center"
                                    >
                                        <CalendarDays
                                            size={15}
                                            className="me-1"
                                        />
                                        Salary Month
                                    </label>

                                    <DatePicker
                                        value={month}
                                        onChange={(value) => setMonth(value)}
                                        mode="month"
                                    />

                                    {/* Actual value submitted to Laravel */}
                                    <input
                                        type="hidden"
                                        name="month"
                                        value={month}
                                    />
                                </div>

                                <div className="col-12 mt-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={processing}
                                        leftIcon={
                                            processing ? (
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <CircleCheck size={16} />
                                            )
                                        }
                                    >
                                        {processing
                                            ? 'Generating...'
                                            : 'View Salary Report'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
