import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Check, Clock, Edit, Plus, Search, X } from 'react-feather';

import PageTitle from '@/components/page-title';
import { DatePicker } from '@/components/ui/form/date-picker';

type Department = {
    id: number;
    name: string;
};

type Shift = {
    id: number;
    name: string;
};

type Employee = {
    id: number;
    name: string;
    employee_id: string;
};

type Attendance = {
    id: number;
    user_id: number;

    checked_in_at: string | null;
    checked_out_at: string | null;

    checked_in_at_note: string | null;
    checked_out_at_note: string | null;

    attendance_status: string | null;
    attendance_type: string | null;

    modification_by: number | null;

    created_at: string;
    // Date-only value sent by Laravel in the application's attendance timezone.
    attendance_date?: string | null;
    updated_at: string | null;

    user?: Employee;
    modify_by?: Employee | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedAttendances = {
    data: Attendance[];

    current_page: number;
    last_page: number;

    per_page: number;
    total: number;

    from: number | null;
    to: number | null;

    links: PaginationLink[];
};

type Filters = {
    department?: string | number | null;
    shift?: string | number | null;
    month?: string | null;
};

type Props = {
    attendances: PaginatedAttendances;

    departments: Department[];

    shifts: Shift[];

    filters: Filters;
};

type AttendanceForm = {
    user_id: string;
    date: string;

    checked_in_at: string;
    checked_out_at: string;

    checked_in_at_note: string;
    checked_out_at_note: string;
};

const EMPTY_FORM: AttendanceForm = {
    user_id: '',
    date: '',
    checked_in_at: '',
    checked_out_at: '',
    checked_in_at_note: '',
    checked_out_at_note: '',
};

// Current date
function getToday(): string {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Current month
function getCurrentMonth(): string {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
}

// Format time
function formatTime(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    return value;
}

// Convert time to input[type=time]
function convertToTimeInput(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    // H:i
    if (/^\d{2}:\d{2}$/.test(value)) {
        return value;
    }

    // H:i:s
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
        return value.substring(0, 5);
    }

    // 12 hour time
    const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);

    if (!match) {
        return '';
    }

    let hour = Number(match[1]);

    const minute = match[2];

    const period = match[3].toUpperCase();

    if (period === 'AM' && hour === 12) {
        hour = 0;
    }

    if (period === 'PM' && hour !== 12) {
        hour += 12;
    }

    return `${String(hour).padStart(2, '0')}:${minute}`;
}

// Component
export default function ManualAttendance({
    attendances,
    departments,
    shifts,
    filters,
}: Props) {
    // Filters
    const [department, setDepartment] = useState(
        filters.department ? String(filters.department) : '',
    );

    const [shift, setShift] = useState(
        filters.shift ? String(filters.shift) : '',
    );

    const [month, setMonth] = useState(filters.month || getCurrentMonth());
    const [showModal, setShowModal] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showEmployees, setShowEmployees] = useState(false);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const employeeSearchRef = useRef<HTMLDivElement>(null);
    const [attendanceChecking, setAttendanceChecking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState<AttendanceForm>(EMPTY_FORM);
    const checkInRef = useRef<HTMLInputElement>(null);
    const checkOutRef = useRef<HTMLInputElement>(null);

    //Close employee dropdown
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                employeeSearchRef.current &&
                !employeeSearchRef.current.contains(event.target as Node)
            ) {
                setShowEmployees(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const updateForm = (field: keyof AttendanceForm, value: string) => {
        setForm((previous) => ({
            ...previous,

            [field]: value,
        }));
    };

    // Employee search
    const searchEmployees = async (keyword: string) => {
        setEmployeeLoading(true);

        try {
            const params = new URLSearchParams();

            if (keyword.trim()) {
                params.set('keyword', keyword.trim());
            }

            const response = await fetch(
                `/get-employees?${params.toString()}`,
                {
                    method: 'GET',

                    credentials: 'same-origin',

                    headers: {
                        Accept: 'application/json',

                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Unable to load employees.');
            }

            const result = await response.json();

            const data = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                  ? result.data
                  : [];

            setEmployees(data);

            setShowEmployees(true);
        } catch (exception) {
            console.error(exception);

            setEmployees([]);

            setShowEmployees(false);
        } finally {
            setEmployeeLoading(false);
        }
    };

    // Check existing attendance
    const checkAttendance = async (userId: number, date: string) => {
        if (!userId || !date) {
            return;
        }

        setAttendanceChecking(true);

        setError('');

        try {
            const response = await fetch(
                `/hr/attendance/manual/${userId}/check/${date}`,
                {
                    method: 'GET',

                    credentials: 'same-origin',

                    headers: {
                        Accept: 'application/json',

                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message || 'Unable to check attendance.',
                );
            }

            if (result?.exists && result?.data) {
                setForm((previous) => ({
                    ...previous,

                    checked_in_at: convertToTimeInput(
                        result.data.checked_in_at,
                    ),

                    checked_out_at: convertToTimeInput(
                        result.data.checked_out_at,
                    ),

                    checked_in_at_note: result.data.checked_in_at_note || '',

                    checked_out_at_note: result.data.checked_out_at_note || '',
                }));
            } else {
                setForm((previous) => ({
                    ...previous,

                    checked_in_at: '',

                    checked_out_at: '',

                    checked_in_at_note: '',

                    checked_out_at_note: '',
                }));
            }
        } catch (exception) {
            console.error(exception);

            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Unable to check attendance.',
            );
        } finally {
            setAttendanceChecking(false);
        }
    };

    // Select employee
    const selectEmployee = (employee: Employee) => {
        setEmployeeSearch(`${employee.name} - ${employee.employee_id}`);

        setForm((previous) => ({
            ...previous,

            user_id: String(employee.id),
        }));

        setShowEmployees(false);

        if (form.date) {
            void checkAttendance(employee.id, form.date);
        }
    };

    const openCreateModal = () => {
        setError('');

        setForm({
            ...EMPTY_FORM,

            date: getToday(),
        });

        setEmployeeSearch('');

        setEmployees([]);

        setShowEmployees(false);

        setShowModal(true);
    };

    const openEditModal = (attendance: Attendance) => {
        setError('');

        const employee = attendance.user;

        // Eloquent serializes created_at as UTC ISO-8601. Slicing it can
        // return the previous calendar day for a local midnight record.
        // Prefer the date-only field supplied by AttendanceController.
        const date =
            attendance.attendance_date ||
            (attendance.created_at
                ? dayjs(attendance.created_at).format('YYYY-MM-DD')
                : getToday());

        setEmployeeSearch(
            employee ? `${employee.name} - ${employee.employee_id}` : '',
        );

        setForm({
            user_id: String(attendance.user_id),

            date,

            checked_in_at: convertToTimeInput(attendance.checked_in_at),

            checked_out_at: convertToTimeInput(attendance.checked_out_at),

            checked_in_at_note: attendance.checked_in_at_note || '',

            checked_out_at_note: attendance.checked_out_at_note || '',
        });

        setShowEmployees(false);

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);

        setError('');

        setShowEmployees(false);
    };

    const handleDateChange = async (value: string) => {
        updateForm('date', value);

        if (form.user_id && value) {
            await checkAttendance(Number(form.user_id), value);
        }
    };

    const openTimePicker = (input: HTMLInputElement | null) => {
        if (!input) {
            return;
        }

        input.focus();

        const picker = input as HTMLInputElement & {
            showPicker?: () => void;
        };

        if (typeof picker.showPicker === 'function') {
            try {
                picker.showPicker();
            } catch {
                // Browser fallback.
            }
        }
    };

    const submitForm = (event: FormEvent) => {
        event.preventDefault();

        setError('');

        if (!form.user_id) {
            setError('Please select an employee.');

            return;
        }

        if (!form.date) {
            setError('Please select a date.');

            return;
        }

        setSaving(true);

        router.post(
            '/hr/attendance/manual',
            {
                user_id: Number(form.user_id),

                date: form.date,

                checked_in_at: form.checked_in_at || null,

                checked_out_at: form.checked_out_at || null,

                checked_in_at_note: form.checked_in_at_note || null,

                checked_out_at_note: form.checked_out_at_note || null,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowModal(false);

                    setForm({
                        ...EMPTY_FORM,
                    });

                    setEmployeeSearch('');

                    setEmployees([]);

                    setShowEmployees(false);
                },

                onError: (errors) => {
                    const firstError = Object.values(errors)[0];

                    setError(
                        typeof firstError === 'string'
                            ? firstError
                            : 'Unable to save attendance.',
                    );
                },

                onFinish: () => {
                    setSaving(false);
                },
            },
        );
    };

    const applyFilters = () => {
        router.get(
            '/hr/attendance/manual',
            {
                month,

                department: department || undefined,

                shift: shift || undefined,
            },
            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    const clearFilters = () => {
        const currentMonth = getCurrentMonth();

        setDepartment('');

        setShift('');

        setMonth(currentMonth);

        router.get(
            '/hr/attendance/manual',
            {
                month: currentMonth,
            },
            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.visit(url, {
            preserveState: true,

            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Manual Attendance" />

            <div className="container-fluid">
                <PageTitle title="Manual Attendance" />

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                    {/* ADD */}
                                    <button
                                        type="button"
                                        className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-1"
                                        onClick={openCreateModal}
                                    >
                                        <Plus size={16} />

                                        <span>Add New</span>
                                    </button>

                                    <div className="d-flex flex-wrap align-items-end gap-2 mt-3">
                                        {/* Department */}

                                        <div>
                                            <select
                                                className="form-select"
                                                style={{
                                                    width: 190,
                                                }}
                                                value={department}
                                                onChange={(event) =>
                                                    setDepartment(
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    All Departments
                                                </option>

                                                {departments.map(
                                                    (departmentItem) => (
                                                        <option
                                                            key={
                                                                departmentItem.id
                                                            }
                                                            value={
                                                                departmentItem.id
                                                            }
                                                        >
                                                            {
                                                                departmentItem.name
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        {/* Shift */}
                                        <div>
                                            <select
                                                className="form-select"
                                                style={{
                                                    width: 180,
                                                }}
                                                value={shift}
                                                onChange={(event) =>
                                                    setShift(event.target.value)
                                                }
                                            >
                                                <option value="">
                                                    All Shifts
                                                </option>

                                                {shifts.map((shiftItem) => (
                                                    <option
                                                        key={shiftItem.id}
                                                        value={shiftItem.id}
                                                    >
                                                        {shiftItem.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <div
                                                style={{
                                                    width: 190,
                                                }}
                                            >
                                                <DatePicker
                                                    value={`${month}-01`}
                                                    mode="month"
                                                    onChange={(
                                                        value: string,
                                                    ) => {
                                                        if (!value) {
                                                            return;
                                                        }

                                                        /*
                                                    | DatePicker month mode may return
                                                    | YYYY-MM or YYYY-MM-DD.
                                                    */

                                                        if (
                                                            /^\d{4}-\d{2}$/.test(
                                                                value,
                                                            )
                                                        ) {
                                                            setMonth(value);

                                                            return;
                                                        }

                                                        const match =
                                                            value.match(
                                                                /^(\d{4})-(\d{2})/,
                                                            );

                                                        if (match) {
                                                            setMonth(
                                                                `${match[1]}-${match[2]}`,
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Filter */}

                                        <button
                                            type="button"
                                            className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-1"
                                            onClick={applyFilters}
                                        >
                                            <Search size={15} />

                                            <span>Filter</span>
                                        </button>

                                        {/* Clear */}

                                        {(department ||
                                            shift ||
                                            month !== getCurrentMonth()) && (
                                            <button
                                                type="button"
                                                className="btn btn-light border d-inline-flex align-items-center justify-content-center gap-1"
                                                onClick={clearFilters}
                                            >
                                                <X size={15} />

                                                <span>Clear</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TABLE*/}
                            <div className="card-body p-0">
                                <div
                                    className="table-responsive"
                                    style={{
                                        minHeight: 300,
                                    }}
                                >
                                    <table className="table table-hover table-bordered align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th
                                                    style={{
                                                        width: 60,
                                                    }}
                                                >
                                                    Sl
                                                </th>

                                                <th
                                                    style={{
                                                        minWidth: 180,
                                                    }}
                                                >
                                                    Employee
                                                </th>

                                                <th
                                                    style={{
                                                        minWidth: 120,
                                                    }}
                                                >
                                                    Date
                                                </th>

                                                <th
                                                    style={{
                                                        minWidth: 100,
                                                    }}
                                                >
                                                    Check In
                                                </th>

                                                <th
                                                    style={{
                                                        minWidth: 180,
                                                    }}
                                                >
                                                    In Note
                                                </th>

                                                <th
                                                    style={{
                                                        minWidth: 100,
                                                    }}
                                                >
                                                    Check Out
                                                </th>

                                                <th
                                                    style={{
                                                        minWidth: 180,
                                                    }}
                                                >
                                                    Out Note
                                                </th>

                                                <th
                                                    style={{
                                                        minWidth: 160,
                                                    }}
                                                >
                                                    Modification By
                                                </th>

                                                <th
                                                    className="text-center"
                                                    style={{
                                                        width: 80,
                                                    }}
                                                >
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {attendances.data.length > 0 ? (
                                                attendances.data.map(
                                                    (attendance, index) => (
                                                        <tr key={attendance.id}>
                                                            {/* SL */}

                                                            <td>
                                                                {(attendances.current_page -
                                                                    1) *
                                                                    attendances.per_page +
                                                                    index +
                                                                    1}
                                                            </td>

                                                            {/* EMPLOYEE */}

                                                            <td>
                                                                <div className="fw-semibold">
                                                                    {attendance
                                                                        .user
                                                                        ?.name ||
                                                                        '-'}
                                                                </div>

                                                                <small className="text-muted">
                                                                    #
                                                                    {attendance
                                                                        .user
                                                                        ?.employee_id ||
                                                                        '-'}
                                                                </small>
                                                            </td>

                                                            {/* DATE */}

                                                            <td>
                                                                {dayjs(
                                                                    attendance.attendance_date ||
                                                                        attendance.created_at,
                                                                ).format(
                                                                    'DD MMM YYYY',
                                                                )}
                                                            </td>

                                                            {/* CHECK IN */}

                                                            <td>
                                                                {formatTime(
                                                                    attendance.checked_in_at,
                                                                )}
                                                            </td>

                                                            {/* IN NOTE */}

                                                            <td>
                                                                {attendance.checked_in_at_note ? (
                                                                    <span
                                                                        className="d-inline-block text-truncate"
                                                                        style={{
                                                                            maxWidth: 220,
                                                                        }}
                                                                        title={
                                                                            attendance.checked_in_at_note
                                                                        }
                                                                    >
                                                                        {
                                                                            attendance.checked_in_at_note
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </td>

                                                            {/* CHECK OUT */}

                                                            <td>
                                                                {formatTime(
                                                                    attendance.checked_out_at,
                                                                )}
                                                            </td>

                                                            {/* OUT NOTE */}

                                                            <td>
                                                                {attendance.checked_out_at_note ? (
                                                                    <span
                                                                        className="d-inline-block text-truncate"
                                                                        style={{
                                                                            maxWidth: 220,
                                                                        }}
                                                                        title={
                                                                            attendance.checked_out_at_note
                                                                        }
                                                                    >
                                                                        {
                                                                            attendance.checked_out_at_note
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </td>

                                                            {/* MODIFICATION */}

                                                            <td>
                                                                {attendance
                                                                    .modify_by
                                                                    ?.name ||
                                                                    '-'}

                                                                {attendance
                                                                    .modify_by
                                                                    ?.name &&
                                                                    attendance.updated_at && (
                                                                        <small className="d-block text-muted">
                                                                            {dayjs(
                                                                                attendance.updated_at,
                                                                            ).format(
                                                                                'DD MMM YYYY',
                                                                            )}
                                                                        </small>
                                                                    )}
                                                            </td>

                                                            {/* ACTION */}

                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                                                    title="Edit Attendance"
                                                                    onClick={() => {
                                                                        openEditModal(
                                                                            attendance,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        className="text-center py-5 text-muted"
                                                    >
                                                        No attendance records
                                                        found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* FOOTER*/}

                            {attendances.total > 0 && (
                                <div className="card-footer">
                                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                        {/*DYNAMIC COUNT */}
                                        <div className="text-muted small">
                                            Showing{' '}
                                            <strong>{attendances.from}</strong>{' '}
                                            to <strong>{attendances.to}</strong>{' '}
                                            of{' '}
                                            <strong>{attendances.total}</strong>{' '}
                                            entries
                                        </div>

                                        {/* PAGINATION ONLY > 10*/}

                                        {attendances.total > 10 && (
                                            <ul className="pagination pagination-sm mb-0">
                                                {attendances.links.map(
                                                    (link, index) => (
                                                        <li
                                                            key={`${link.label}-${index}`}
                                                            className={`page-item ${
                                                                link.active
                                                                    ? 'active'
                                                                    : ''
                                                            } ${
                                                                !link.url
                                                                    ? 'disabled'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="page-link"
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                onClick={() =>
                                                                    goToPage(
                                                                        link.url,
                                                                    )
                                                                }
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL*/}

            {showModal && (
                <>
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                    >
                        <style>
                            {`
            input[type="time"]::-webkit-calendar-picker-indicator {
                display: none;
                -webkit-appearance: none;
            }

            input[type="time"]::-webkit-clear-button {
                display: none;
            }
        `}
                        </style>

                        <div
                            className="modal-dialog modal-dialog-centered"
                            style={{
                                maxWidth: 520,
                            }}
                        >
                            <div className="modal-content">
                                {/*HEADER*/}
                                <div className="modal-header">
                                    <h5 className="modal-title mb-0">
                                        Modify Attendance
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={closeModal}
                                    />
                                </div>

                                {/*FORM*/}
                                <form onSubmit={submitForm}>
                                    <div className="modal-body">
                                        {/* ERROR */}
                                        {error && (
                                            <div className="alert alert-danger py-2 mb-3">
                                                {error}
                                            </div>
                                        )}

                                        {/*DATE*/}
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Date{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>

                                            <DatePicker
                                                value={form.date}
                                                onChange={(value: string) =>
                                                    void handleDateChange(value)
                                                }
                                            />

                                            {attendanceChecking && (
                                                <small className="text-muted d-block mt-1">
                                                    Checking attendance...
                                                </small>
                                            )}
                                        </div>

                                        {/*EMPLOYEE*/}

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Employee{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>

                                            <div
                                                ref={employeeSearchRef}
                                                className="position-relative"
                                            >
                                                <Search
                                                    size={16}
                                                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                                                    style={{
                                                        zIndex: 2,
                                                    }}
                                                />

                                                <input
                                                    type="text"
                                                    className="form-control ps-5"
                                                    placeholder="Search employee..."
                                                    autoComplete="off"
                                                    value={employeeSearch}
                                                    onFocus={() => {
                                                        if (
                                                            employees.length > 0
                                                        ) {
                                                            setShowEmployees(
                                                                true,
                                                            );
                                                        } else {
                                                            void searchEmployees(
                                                                employeeSearch,
                                                            );
                                                        }
                                                    }}
                                                    onChange={(event) => {
                                                        const value =
                                                            event.target.value;

                                                        setEmployeeSearch(
                                                            value,
                                                        );

                                                        updateForm(
                                                            'user_id',
                                                            '',
                                                        );

                                                        void searchEmployees(
                                                            value,
                                                        );
                                                    }}
                                                />

                                                {showEmployees && (
                                                    <div
                                                        className="position-absolute start-0 end-0 bg-white border rounded shadow-sm mt-1"
                                                        style={{
                                                            zIndex: 1060,
                                                            maxHeight: 240,
                                                            overflowY: 'auto',
                                                        }}
                                                    >
                                                        {employeeLoading ? (
                                                            <div className="px-3 py-2 text-muted small">
                                                                Searching
                                                                employees...
                                                            </div>
                                                        ) : employees.length >
                                                          0 ? (
                                                            employees.map(
                                                                (employee) => (
                                                                    <button
                                                                        key={
                                                                            employee.id
                                                                        }
                                                                        type="button"
                                                                        className="dropdown-item text-start px-3 py-2"
                                                                        onClick={() =>
                                                                            selectEmployee(
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
                                                                            #
                                                                            {
                                                                                employee.employee_id
                                                                            }
                                                                        </small>
                                                                    </button>
                                                                ),
                                                            )
                                                        ) : (
                                                            <div className="px-3 py-2 text-muted small">
                                                                No employees
                                                                found.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/*CHECK IN*/}
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Check In
                                            </label>

                                            <div className="position-relative">
                                                <input
                                                    ref={checkInRef}
                                                    type="time"
                                                    className="form-control pe-5"
                                                    value={form.checked_in_at}
                                                    onChange={(event) =>
                                                        updateForm(
                                                            'checked_in_at',
                                                            event.target.value,
                                                        )
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-transparent d-flex align-items-center justify-content-center text-muted p-1"
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        zIndex: 5,
                                                    }}
                                                    aria-label="Open check-in time picker"
                                                    onClick={() =>
                                                        openTimePicker(
                                                            checkInRef.current,
                                                        )
                                                    }
                                                >
                                                    <Clock size={17} />
                                                </button>
                                            </div>
                                        </div>

                                        {/*CHECK IN NOTE*/}
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Check In Note
                                            </label>

                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                maxLength={255}
                                                placeholder="Enter check-in note"
                                                value={form.checked_in_at_note}
                                                onChange={(event) =>
                                                    updateForm(
                                                        'checked_in_at_note',
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            <small className="text-muted">
                                                {form.checked_in_at_note.length}
                                                /255
                                            </small>
                                        </div>

                                        {/*CHECK OUT*/}
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Check Out
                                            </label>

                                            <div className="position-relative">
                                                <input
                                                    ref={checkOutRef}
                                                    type="time"
                                                    className="form-control pe-5"
                                                    value={form.checked_out_at}
                                                    onChange={(event) =>
                                                        updateForm(
                                                            'checked_out_at',
                                                            event.target.value,
                                                        )
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-transparent d-flex align-items-center justify-content-center text-muted p-1"
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        zIndex: 5,
                                                    }}
                                                    aria-label="Open check-out time picker"
                                                    onClick={() =>
                                                        openTimePicker(
                                                            checkOutRef.current,
                                                        )
                                                    }
                                                >
                                                    <Clock size={17} />
                                                </button>
                                            </div>
                                        </div>

                                        {/*CHECK OUT NOTE*/}
                                        <div className="mb-0">
                                            <label className="form-label">
                                                Check Out Note
                                            </label>

                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                maxLength={255}
                                                placeholder="Enter check-out note"
                                                value={form.checked_out_at_note}
                                                onChange={(event) =>
                                                    updateForm(
                                                        'checked_out_at_note',
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            <small className="text-muted">
                                                {
                                                    form.checked_out_at_note
                                                        .length
                                                }
                                                /255
                                            </small>
                                        </div>
                                    </div>

                                    {/*FOOTER*/}
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light d-inline-flex align-items-center justify-content-center gap-1"
                                            disabled={saving}
                                            onClick={closeModal}
                                        >
                                            <X size={15} />

                                            <span>Close</span>
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-1"
                                            disabled={
                                                saving || attendanceChecking
                                            }
                                        >
                                            {saving ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm"
                                                        role="status"
                                                    />

                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={15} />

                                                    <span>Submit</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* BACKDROP */}
                    <div
                        className="modal-backdrop fade show"
                        onClick={closeModal}
                    />
                </>
            )}
        </>
    );
}
