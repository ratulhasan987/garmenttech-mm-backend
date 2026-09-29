import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/form/date-picker';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Select } from '@/components/ui/form/select';

import type {
    SalaryDepartment,
    SalaryGenerateForm as SalaryGenerateFormData,
} from '@/types/salary';

interface SalaryEmployee {
    id: number;
    employee_id: string;
    name: string;
    department_id?: number | null;
}

interface SalaryGenerateFormProps {
    departments: SalaryDepartment[];

    employees: SalaryEmployee[];

    currentMonth: string;
}

export function SalaryGenerateForm({
    departments = [],
    employees = [],
    currentMonth,
}: SalaryGenerateFormProps) {
    const { data, setData, post, processing, errors } =
        useForm<SalaryGenerateFormData>({
            department: 'all',
            employee: null,
            month: currentMonth,
            consecutive_deduction: false,
            late_deduction: false,
            absent_deduction: true,
            penalty_absent_deduction: false,
            remaining_time_deduction: false,
        });

    const [employeeSearch, setEmployeeSearch] = useState('');

    const [showEmployees, setShowEmployees] = useState(false);

   //  Set Current Month
    useEffect(() => {
        if (!data.month && currentMonth) {
            setData('month', currentMonth);
        }
    }, [currentMonth, data.month, setData]);

   
    const handleDepartmentChange = (value: string) => {
        setData('department', value);

        // Employee is only required for Individual

        if (value !== 'individually') {
            setData('employee', null);

            setEmployeeSearch('');

            setShowEmployees(false);
        }
    };

    // Employee Selection

    const handleEmployeeSelect = (employee: SalaryEmployee) => {
        setData('employee', employee.id);

        setEmployeeSearch(`${employee.name} - ${employee.employee_id}`);

        setShowEmployees(false);
    };

    const filteredEmployees = employees.filter((employee) => {
        const search = employeeSearch.trim().toLowerCase();

        if (!search) {
            return true;
        }

        return (
            employee.name.toLowerCase().includes(search) ||
            employee.employee_id.toLowerCase().includes(search)
        );
    });


    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/hr/salary-generate', {
            preserveScroll: true,
        });
    };

    return (
        <div className="row g-3">

            <div className="col-lg-6">
                <div className="card h-100">
                    <div className="card-header">
                        <h5 className="mb-0">Generate Salary</h5>
                    </div>

                    <div className="card-body">
                        <form onSubmit={submit}>
                            <div className="row g-3">

                                <div className="col-12">
                                    <FormField>
                                        <FormLabel>Department</FormLabel>

                                        <Select
                                            value={data.department}
                                            onChange={(event) =>
                                                handleDepartmentChange(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="all">
                                                All Departments
                                            </option>
                                            <option value="individually">
                                                Individually
                                            </option>
                                            {/* <option value="" disabled >
                                                ─────────────────
                                            </option> */}

                                            {departments.map((department) => (
                                                <option
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.name}
                                                </option>
                                            ))}
                                        </Select>

                                        <FormError>
                                            {errors.department}
                                        </FormError>
                                    </FormField>
                                </div>

                                {/* EMPLOYEE
                                    ONLY FOR INDIVIDUAL*/}

                                {data.department === 'individually' && (
                                    <div className="col-12">
                                        <FormField>
                                            <FormLabel>Employee</FormLabel>

                                            <div className="position-relative">
                                                <input
                                                    type="text"
                                                    className={`
                                                        form-control
                                                        ${
                                                            errors.employee
                                                                ? 'is-invalid'
                                                                : ''
                                                        }
                                                    `}
                                                    placeholder="Search employee..."
                                                    value={employeeSearch}
                                                    onFocus={() =>
                                                        setShowEmployees(true)
                                                    }
                                                    onChange={(event) => {
                                                        setEmployeeSearch(
                                                            event.target.value,
                                                        );

                                                        /*
                                                        | Clear selected employee
                                                        | when searching again.
                                                        */

                                                        if (data.employee) {
                                                            setData(
                                                                'employee',
                                                                null,
                                                            );
                                                        }

                                                        setShowEmployees(true);
                                                    }}
                                                />

                                                {/* CLEAR BUTTON*/}

                                                {employeeSearch && (
                                                    <button
                                                        type="button"
                                                        className="
                                                            btn
                                                            btn-lg
                                                            position-absolute
                                                            top-50
                                                            end-0
                                                            translate-middle-y
                                                            me-2
                                                            text-muted
                                                        "
                                                        onClick={() => {
                                                            setEmployeeSearch(
                                                                '',
                                                            );

                                                            setData(
                                                                'employee',
                                                                null,
                                                            );

                                                            setShowEmployees(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                )}

                                                {/* EMPLOYEE DROPDOWN*/}

                                                {showEmployees && (
                                                    <>
                                                        {/* Backdrop */}

                                                        <button
                                                            type="button"
                                                            className="
                                                                position-fixed
                                                                top-0
                                                                start-0
                                                                w-100
                                                                h-100
                                                                border-0
                                                                bg-transparent
                                                            "
                                                            style={{
                                                                zIndex: 1040,
                                                            }}
                                                            onClick={() =>
                                                                setShowEmployees(
                                                                    false,
                                                                )
                                                            }
                                                        />

                                                        {/* Dropdown */}

                                                        <div
                                                            className="
                                                                position-absolute
                                                                bg-white
                                                                border
                                                                rounded
                                                                shadow
                                                                w-100
                                                            "
                                                            style={{
                                                                zIndex: 1050,
                                                                top: '100%',
                                                                left: 0,
                                                                maxHeight: 250,
                                                                overflowY:
                                                                    'auto',
                                                            }}
                                                        >
                                                            {filteredEmployees.length >
                                                            0 ? (
                                                                filteredEmployees.map(
                                                                    (
                                                                        employee,
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                employee.id
                                                                            }
                                                                            type="button"
                                                                            className="
                                                                                dropdown-item
                                                                                text-start
                                                                                py-2 px-2
                                                                            "
                                                                            onClick={() =>
                                                                                handleEmployeeSelect(
                                                                                    employee,
                                                                                )
                                                                            }
                                                                        >
                                                                            <div className="fw-semibold">
                                                                                {
                                                                                    employee.name
                                                                                }
                                                                            </div>

                                                                            <small className="text-muted">
                                                                                {
                                                                                    employee.employee_id
                                                                                }
                                                                            </small>
                                                                        </button>
                                                                    ),
                                                                )
                                                            ) : (
                                                                <div
                                                                    className="
                                                                        px-3
                                                                        py-3
                                                                        text-muted
                                                                        small
                                                                    "
                                                                >
                                                                    No employees
                                                                    found.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <FormError>
                                                {errors.employee}
                                            </FormError>
                                        </FormField>
                                    </div>
                                )}

                                {/*SALARY MONTH */}

                                <div className="col-12">
                                    <FormField>
                                        <FormLabel>Salary Month</FormLabel>

                                        <DatePicker
                                            mode="month"
                                            value={data.month}
                                            onChange={(value) =>
                                                setData('month', value)
                                            }
                                            placeholder="Select month"
                                            error={errors.month}
                                        />
                                    </FormField>
                                </div>

                                {/*GENERATE BUTTON*/}

                                <div className="col-12">
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Generating...'
                                            : 'Generate'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/*DEDUCTION RULES*/}
            <div className="col-lg-6">
                <div className="card h-100">
                    <div className="card-header">
                        <h5 className="mb-0">Deduction Rules</h5>
                    </div>

                    <div className="card-body">
                        <div className="d-flex flex-column gap-3">
                            {/* Absent */}

                            <label
                                className="
                                    d-flex
                                    align-items-start
                                    gap-2
                                "
                            >
                                <input
                                    type="checkbox"
                                    className="
                                        form-check-input
                                        mt-1
                                    "
                                    checked={data.absent_deduction}
                                    onChange={(event) =>
                                        setData(
                                            'absent_deduction',
                                            event.target.checked,
                                        )
                                    }
                                />

                                <span>
                                    Absent deduction
                                    <span className="text-muted">
                                        {' '}
                                        (If employees absent, salary will be
                                        deducted)
                                    </span>
                                </span>
                            </label>

                            {/* Consecutive Late */}

                            <label
                                className="
                                    d-flex
                                    align-items-start
                                    gap-2
                                "
                            >
                                <input
                                    type="checkbox"
                                    className="
                                        form-check-input
                                        mt-1
                                    "
                                    checked={data.consecutive_deduction}
                                    onChange={(event) =>
                                        setData(
                                            'consecutive_deduction',
                                            event.target.checked,
                                        )
                                    }
                                />

                                <span>
                                    If employees are late for 3 consecutive
                                    days, 1 day's salary will be deducted.
                                </span>
                            </label>

                            {/* Late Minutes */}

                            <label
                                className="
                                    d-flex
                                    align-items-start
                                    gap-2
                                "
                            >
                                <input
                                    type="checkbox"
                                    className="
                                        form-check-input
                                        mt-1
                                    "
                                    checked={data.late_deduction}
                                    onChange={(event) =>
                                        setData(
                                            'late_deduction',
                                            event.target.checked,
                                        )
                                    }
                                />

                                <span>
                                    If total late minutes in a month is 120+, 1
                                    day's salary will be deducted.
                                </span>
                            </label>

                            {/* Penalty Absent */}

                            <label
                                className="
                                    d-flex
                                    align-items-start
                                    gap-2
                                "
                            >
                                <input
                                    type="checkbox"
                                    className="
                                        form-check-input
                                        mt-1
                                    "
                                    checked={data.penalty_absent_deduction}
                                    onChange={(event) =>
                                        setData(
                                            'penalty_absent_deduction',
                                            event.target.checked,
                                        )
                                    }
                                />

                                <span>
                                    If Absent 1 day, 2 day's salary will be
                                    deducted.
                                </span>
                            </label>

                            {/* Remaining Time */}

                            <label
                                className="
                                    d-flex
                                    align-items-start
                                    gap-2
                                "
                            >
                                <input
                                    type="checkbox"
                                    className="
                                        form-check-input
                                        mt-1
                                    "
                                    checked={data.remaining_time_deduction}
                                    onChange={(event) =>
                                        setData(
                                            'remaining_time_deduction',
                                            event.target.checked,
                                        )
                                    }
                                />

                                <span>
                                    If remaining time found, per minute salary
                                    will be deducted.
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
