import { Head, router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, X } from 'react-feather';

type Department = { id: number; name: string };
type Shift = { id: number; name: string };

type AttendanceDetail = {
    status?: string | null;
    attendance_status?: string | null;
    check_in?: string | null;
    check_out?: string | null;
    checked_in_at?: string | null;
    checked_out_at?: string | null;
    check_in_note?: string | null;
    check_out_note?: string | null;
    checked_in_at_note?: string | null;
    checked_out_at_note?: string | null;
    holiday?: string | null;
    type_of_leave?: string | null;
};

type DailyAttendance = AttendanceDetail | string | null;

type Employee = {
    id?: number;
    name: string;
    employee_id: string | number;
    department?: string | null;
    department_id?: number | null;
    shift?: string | null;
    shift_id?: number | null;
    daily: DailyAttendance[] | Record<string, DailyAttendance>;
    total_working_days?: number;
    total_present?: number;
    total_home?: number;
    total_absent?: number;
    total_leave?: number;
    total_holidays?: number;
    total_weekends?: number;
    total_late?: number;
    total_early?: number;
    total_minutes_late?: number;
    total_minutes_early?: number;
    total_targeted_hours?: number;
    total_hours_worked?: number;
    remaining_hours?: number;
};

type Props = {
    report?: Employee[];
    departments?: Department[];
    shifts?: Shift[];
    month?: string;
    filters?: {
        department?: string | number | null;
        shift?: string | number | null;
        month?: string | null;
    };
};

function formatTime(value?: string | null): string {
    if (!value || value === 'N/A') return 'N/A';
    if (/AM|PM/i.test(value)) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function getStatus(value: DailyAttendance): string {
    if (value && typeof value === 'object') {
        return value.status ?? value.attendance_status ?? 'Absent';
    }
    return value || 'Absent';
}

function getPresentData(value: DailyAttendance): AttendanceDetail | null {
    if (!value || typeof value !== 'object') return null;
    const status = String(value.status ?? value.attendance_status ?? '')
        .trim()
        .toLowerCase();
    return status === 'present' ? value : null;
}

function statusClass(status: string): string {
    switch (status.trim().toLowerCase()) {
        case 'present': return 'eam-present';
        case 'home': return 'eam-home';
        case 'leave': return 'eam-leave';
        case 'holiday': return 'eam-holiday';
        case 'weekend': return 'eam-weekend';
        case 'absent': return 'eam-absent';
        default: return 'eam-default';
    }
}

function formatHours(value?: number | string | null): string {
    const hours = Number(value ?? 0);
    if (!Number.isFinite(hours)) return '0.0';
    const totalMinutes = Math.round(hours * 60);
    return `${Math.floor(totalMinutes / 60)}.${totalMinutes % 60}`;
}

function getDailyValue(
    employee: Employee,
    index: number,
    dateString: string,
): DailyAttendance {
    const daily = employee.daily;
    if (Array.isArray(daily)) return daily[index] ?? null;
    if (daily && typeof daily === 'object') {
        if (Object.prototype.hasOwnProperty.call(daily, dateString)) {
            return daily[dateString];
        }
        const day = String(Number(dateString.slice(8, 10)));
        if (Object.prototype.hasOwnProperty.call(daily, day)) {
            return daily[day];
        }
        if (Object.prototype.hasOwnProperty.call(daily, String(index))) {
            return daily[String(index)];
        }
    }
    return null;
}

export default function EmployeeAttendance({
    report = [],
    departments = [],
    shifts = [],
    month,
    filters,
}: Props) {
    /* The header owns the theme. Observe the EXACT classes it toggles. */
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const syncTheme = () => {
            setIsDarkMode(document.body.classList.contains('dark-only'));
        };

        syncTheme();

        const observer = new MutationObserver(syncTheme);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const currentMonth =
        month || filters?.month || new Date().toISOString().slice(0, 7);

    const [selectedDepartment, setSelectedDepartment] = useState(
        filters?.department ? String(filters.department) : '',
    );
    const [selectedShift, setSelectedShift] = useState(
        filters?.shift ? String(filters.shift) : '',
    );
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);

    const openNote = (value: string) => {
        setNote(value);
        setShowNoteModal(true);
    };
    const closeNote = () => {
        setShowNoteModal(false);
        setNote('');
    };

    const monthOptions = useMemo(() => {
        const result: { value: string; label: string }[] = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
            result.push({
                value: `${year}-${monthNumber}`,
                label: date.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                }),
            });
        }
        return result;
    }, []);

    const days = useMemo(() => {
        const [year, monthNumber] = selectedMonth.split('-').map(Number);
        if (!year || !monthNumber) return [];

        const now = new Date();
        const currentMonthValue = now.getFullYear() * 100 + now.getMonth() + 1;
        const selectedMonthValue = year * 100 + monthNumber;
        if (selectedMonthValue > currentMonthValue) return [];

        let totalDays = new Date(year, monthNumber, 0).getDate();
        if (selectedMonthValue === currentMonthValue) {
            totalDays = now.getDate();
        }

        return Array.from({ length: totalDays }, (_, index) => {
            const day = index + 1;
            const date = new Date(year, monthNumber - 1, day);
            return {
                dateString: `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
                formattedDate: `${String(day).padStart(2, '0')}-${String(monthNumber).padStart(2, '0')}-${String(year).slice(-2)}`,
            };
        });
    }, [selectedMonth]);

    const applyFilters = (
        department: string,
        shift: string,
        monthValue: string,
    ) => {
        setLoading(true);
        router.get(
            '/hr/attendance/employees',
            {
                ...(department ? { department } : {}),
                ...(shift ? { shift } : {}),
                month: monthValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleDepartmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedDepartment(value);
        applyFilters(value, selectedShift, selectedMonth);
    };
    const handleShiftChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedShift(value);
        applyFilters(selectedDepartment, value, selectedMonth);
    };
    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedMonth(value);
        applyFilters(selectedDepartment, selectedShift, value);
    };

    return (
        <>
            <Head title="Attendance" />

            <div className={`eam-page ${isDarkMode ? 'eam-dark' : 'eam-light'}`}>
                <div className="eam-page-header">
                    <h2>Attendance</h2>
                    <div className="eam-breadcrumb">
                        <i className="fa fa-home" />
                        <span>/</span>
                        <span>Attendance</span>
                    </div>
                </div>

                <div className="eam-card">
                    <div className="eam-filters">
                        <div className="eam-filter-row">
                            <select
                                aria-label="Department"
                                className="eam-select"
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                disabled={loading}
                            >
                                <option value="">All Departments</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                aria-label="Shift"
                                className="eam-select"
                                value={selectedShift}
                                onChange={handleShiftChange}
                                disabled={loading}
                            >
                                <option value="">All Shifts</option>
                                {shifts.map((shift) => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                aria-label="Month"
                                className="eam-select"
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                disabled={loading}
                            >
                                {monthOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="eam-table-scroll">
                        <table className="eam-table">
                            <thead>
                                <tr>
                                    <th className="eam-sl">Sl</th>
                                    <th className="eam-employee">Employee Name</th>
                                    {days.map((day) => (
                                        <th className="eam-day" key={day.dateString}>
                                            {day.weekday} - {day.formattedDate}
                                        </th>
                                    ))}
                                    <th className="eam-summary">Working Day</th>
                                    <th className="eam-summary">Present</th>
                                    <th className="eam-summary">Absent</th>
                                    <th className="eam-summary">Leave</th>
                                    <th className="eam-summary">Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={days.length + 7} className="eam-message">
                                            Loading attendance...
                                        </td>
                                    </tr>
                                )}

                                {!loading && report.length === 0 && (
                                    <tr>
                                        <td colSpan={days.length + 7} className="eam-message">
                                            <span className="eam-empty">
                                                <AlertCircle size={23} />
                                                No attendance records found. Try another month,
                                                department, or shift.
                                            </span>
                                        </td>
                                    </tr>
                                )}

                                {!loading && report.map((employee, employeeIndex) => (
                                    <tr key={`${employee.employee_id}-${employeeIndex}`}>
                                        <td className="eam-sl">{employeeIndex + 1}</td>
                                        <td className="eam-employee">
                                            <strong>{employee.name}</strong>
                                            <small>#{employee.employee_id}</small>
                                        </td>

                                        {days.map((day, dayIndex) => {
                                            const value = getDailyValue(
                                                employee,
                                                dayIndex,
                                                day.dateString,
                                            );
                                            const status = getStatus(value);
                                            const present = getPresentData(value);
                                            const checkIn = present?.check_in ?? present?.checked_in_at;
                                            const checkOut = present?.check_out ?? present?.checked_out_at;
                                            const checkInNote = present?.check_in_note ?? present?.checked_in_at_note;
                                            const checkOutNote = present?.check_out_note ?? present?.checked_out_at_note;
                                            const statusNote = value && typeof value === 'object'
                                                ? value.holiday ?? value.type_of_leave
                                                : null;

                                            return (
                                                <td className="eam-day" key={day.dateString}>
                                                    {present ? (
                                                        <div className="eam-present-details">
                                                            <div className="eam-time-line">
                                                                <span><b>In:</b> {formatTime(checkIn)}</span>
                                                                {checkInNote && (
                                                                    <button
                                                                        type="button"
                                                                        className="eam-note"
                                                                        aria-label="View check-in note"
                                                                        onClick={() => openNote(checkInNote)}
                                                                    >
                                                                        <AlertCircle size={15} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="eam-time-line">
                                                                <span><b>Out:</b> {formatTime(checkOut)}</span>
                                                                {checkOutNote && (
                                                                    <button
                                                                        type="button"
                                                                        className="eam-note"
                                                                        aria-label="View check-out note"
                                                                        onClick={() => openNote(checkOutNote)}
                                                                    >
                                                                        <AlertCircle size={15} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="eam-status-wrap">
                                                            <span className={`eam-status ${statusClass(status)}`}>
                                                                {status}
                                                            </span>
                                                            {statusNote && (
                                                                <button
                                                                    type="button"
                                                                    className="eam-note"
                                                                    aria-label="View attendance note"
                                                                    onClick={() => openNote(statusNote)}
                                                                >
                                                                    <AlertCircle size={15} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        <td className="eam-summary">{employee.total_working_days ?? 0}</td>
                                        <td className="eam-summary">{employee.total_present ?? 0}</td>
                                        <td className="eam-summary">{employee.total_absent ?? 0}</td>
                                        <td className="eam-summary">{employee.total_leave ?? 0}</td>
                                        <td className="eam-summary">
                                            {formatHours(employee.total_hours_worked)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showNoteModal && (
                    <div className="eam-overlay" onClick={closeNote}>
                        <div
                            className="eam-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Attendance note"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="eam-modal-header">
                                <h5>Note</h5>
                                <button
                                    type="button"
                                    className="eam-modal-x"
                                    aria-label="Close note"
                                    onClick={closeNote}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="eam-modal-body">
                                {note || 'No additional notes available.'}
                            </div>
                            <div className="eam-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeNote}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                /* Header switch: body.dark-only or body.light. React synchronizes
                   those classes into eam-dark / eam-light automatically. */
                .eam-page.eam-light {
                    --eam-card: #ffffff;
                    --eam-header: #f2f5f9;
                    --eam-sticky: #ffffff;
                    --eam-hover: #f3f8fc;
                    --eam-text: #2c3e50;
                    --eam-title: #172033;
                    --eam-muted: #66788d;
                    --eam-border: #dee5ed;
                    --eam-input: #ffffff;
                    --eam-input-border: #ced9e5;
                    --eam-note: #2c3e50;
                    --eam-shadow: 0 2px 8px rgba(0, 0, 0, .04);
                    color-scheme: light;
                }

                .eam-page.eam-dark {
                    --eam-card: #1b2433;
                    --eam-header: #263347;
                    --eam-sticky: #1b2433;
                    --eam-hover: #29374b;
                    --eam-text: #d7e0ed;
                    --eam-title: #f1f5f9;
                    --eam-muted: #9cacc0;
                    --eam-border: #354359;
                    --eam-input: #253145;
                    --eam-input-border: #44536b;
                    --eam-note: #aac9e5;
                    --eam-shadow: 0 6px 20px rgba(0, 0, 0, .16);
                    color-scheme: dark;
                }

                .eam-page {
                    width: 100%;
                    padding-bottom: 28px;
                    color: var(--eam-text);
                }
                .eam-page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 18px;
                }
                .eam-page-header h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 500;
                    color: var(--eam-title);
                }
                .eam-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--eam-muted);
                    font-size: 14px;
                }
                .eam-breadcrumb i { color: #008b8b; }
                .eam-card {
                    background: var(--eam-card);
                    border: 1px solid var(--eam-border);
                    border-radius: 7px;
                    box-shadow: var(--eam-shadow);
                    overflow: hidden;
                }
                .eam-filters {
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--eam-border);
                }
                .eam-filter-row {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    flex-wrap: wrap;
                    gap: 14px;
                    width: 100%;
                }
                .eam-page .eam-select {
                    flex: 0 1 300px;
                    width: 300px;
                    max-width: 100%;
                    min-width: 0;
                    height: 38px;
                    padding: 0 12px;
                    border: 1px solid var(--eam-input-border);
                    border-radius: 5px;
                    background: var(--eam-input);
                    color: var(--eam-text);
                    font-size: 14px;
                    outline: none;
                    color-scheme: inherit;
                }
                .eam-select:focus {
                    border-color: #008b8b;
                    box-shadow: 0 0 0 3px rgba(0, 139, 139, .12);
                }
                .eam-select:disabled { opacity: .6; cursor: not-allowed; }
                .eam-select option { background: var(--eam-input); color: var(--eam-text); }

                .eam-table-scroll {
                    height: calc(100vh - 280px);
                    min-height: 420px;
                    overflow: auto;
                    position: relative;
                    scrollbar-width: thin;
                    scrollbar-color: var(--eam-input-border) transparent;
                }
                .eam-page .eam-table {
                    width: max-content;
                    min-width: 100%;
                    table-layout: fixed;
                    border-collapse: separate;
                    border-spacing: 0;
                    font-size: 14px;
                    background: var(--eam-card);
                    color: var(--eam-text);
                }
                .eam-page .eam-table thead th {
                    // position: sticky;
                    top: 0;
                    z-index: 30;
                    height: 52px;
                    padding: 10px 8px;
                    background: var(--eam-header);
                    color: var(--eam-title);
                    border-right: 1px solid var(--eam-border);
                    border-bottom: 1px solid var(--eam-border);
                    text-align: center;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .eam-page .eam-table tbody td {
                    padding: 8px;
                    background: var(--eam-card);
                    color: var(--eam-text);
                    border-right: 1px solid var(--eam-border);
                    border-bottom: 1px solid var(--eam-border);
                    text-align: center;
                    vertical-align: middle;
                    white-space: nowrap;
                }
                .eam-page .eam-table tbody tr:hover td { background: var(--eam-hover); }
                .eam-table .eam-sl { width: 55px; min-width: 55px; max-width: 55px; }
                .eam-table .eam-employee { width: 180px; min-width: 180px; max-width: 180px; }
                .eam-table .eam-day { width: 150px; min-width: 150px; max-width: 150px; }
                .eam-table .eam-summary { width: 150px; min-width: 150px; }
                .eam-page .eam-table thead .eam-sl {
                    position: sticky; left: 0; z-index: 50;
                    background: var(--eam-header);
                }
                .eam-page .eam-table thead .eam-employee {
                    position: sticky; left: 55px; z-index: 50;
                    background: var(--eam-header);
                }
                .eam-page .eam-table tbody .eam-sl {
                    position: sticky; left: 0; z-index: 20;
                    background: var(--eam-sticky);
                }
                .eam-page .eam-table tbody .eam-employee {
                    position: sticky; left: 55px; z-index: 20;
                    background: var(--eam-sticky);
                }
                .eam-page .eam-table tbody tr:hover .eam-sl,
                .eam-page .eam-table tbody tr:hover .eam-employee {
                    background: var(--eam-hover);
                }
                .eam-employee strong {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--eam-title);
                }
                .eam-employee small { display: block; font-size: 12px; color: var(--eam-muted); }
                .eam-present-details {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .eam-time-line,
                .eam-status-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .eam-time-line { font-size: 12px; }
                .eam-time-line b { color: var(--eam-title); }
                .eam-status {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 72px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 13px;
                    font-weight: 500;
                    line-height: 1.3;
                    color: #ffffff;
                }
                .eam-status.eam-present, .eam-status.eam-home { background: #20bf6b; }
                .eam-status.eam-leave, .eam-status.eam-holiday {
                    background: #f1c40f;
                    color: #172033;
                }
                .eam-status.eam-weekend { background: #2c3e50; }
                .eam-status.eam-absent { background: #7f8c8d; }
                .eam-status.eam-default { background: #64748b; }
                .eam-page .eam-note {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 19px;
                    height: 19px;
                    padding: 0;
                    border: 0;
                    background: transparent;
                    color: var(--eam-note);
                    cursor: pointer;
                }
                .eam-page .eam-note:hover { color: #008b8b; }
                .eam-page .eam-message {
                    padding: 40px;
                    color: var(--eam-muted);
                    text-align: center;
                }
                .eam-empty {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 7px;
                    white-space: normal;
                }
                .eam-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(0, 0, 0, .55);
                }
                .eam-modal {
                    width: 100%;
                    max-width: 500px;
                    background: var(--eam-card);
                    color: var(--eam-text);
                    border: 1px solid var(--eam-border);
                    border-radius: 6px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, .2);
                    overflow: hidden;
                }
                .eam-modal-header, .eam-modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 15px 20px;
                }
                .eam-modal-header { border-bottom: 1px solid var(--eam-border); }
                .eam-modal-footer {
                    justify-content: flex-end;
                    border-top: 1px solid var(--eam-border);
                }
                .eam-modal-header h5 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: var(--eam-title);
                }
                .eam-page .eam-modal-x {
                    border: 0;
                    background: transparent;
                    color: var(--eam-muted);
                    cursor: pointer;
                }
                .eam-modal-body {
                    min-height: 100px;
                    padding: 20px;
                    color: var(--eam-text);
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                }
                @media (max-width: 991px) {
                    .eam-page .eam-select { flex: 1 1 220px; }
                }
                @media (max-width: 767px) {
                    .eam-filters { padding: 15px; }
                    .eam-filter-row { gap: 10px; }
                    .eam-page .eam-select { width: 100%; flex: 1 1 100%; }
                    .eam-table-scroll { height: calc(100vh - 250px); }
                    .eam-page-header h2 { font-size: 21px; }
                    .eam-table .eam-employee { width: 155px; min-width: 155px; max-width: 155px; }
                }
            `}</style>
        </>
    );
}






// import { Head, router } from '@inertiajs/react';
// import React, { useMemo, useState } from 'react';

// import { AlertCircle } from 'react-feather';

// type Department = {
//     id: number;
//     name: string;
// };

// type Shift = {
//     id: number;
//     name: string;
// };

// type PresentAttendance = {
//     status: 'Present';
//     check_in?: string | null;
//     check_out?: string | null;
//     check_in_note?: string | null;
//     check_out_note?: string | null;
// };

// type DailyAttendance = PresentAttendance | string | null;

// type Employee = {
//     id?: number;

//     name: string;

//     employee_id: string | number;

//     department?: string | null;
//     department_id?: number | null;

//     shift?: string | null;
//     shift_id?: number | null;

//     daily: DailyAttendance[] | Record<string, DailyAttendance>;

//     total_working_days?: number;

//     total_present?: number;

//     total_home?: number;

//     total_absent?: number;

//     total_leave?: number;

//     total_holidays?: number;

//     total_weekends?: number;

//     total_late?: number;

//     total_early?: number;

//     total_minutes_late?: number;

//     total_minutes_early?: number;

//     total_targeted_hours?: number;

//     total_hours_worked?: number;

//     remaining_hours?: number;
// };

// type Props = {
//     report?: Employee[];

//     departments?: Department[];

//     shifts?: Shift[];

//     month?: string;

//     filters?: {
//         department?: string | number | null;

//         shift?: string | number | null;

//         month?: string | null;
//     };
// };

// // Helpers
// function formatTime(value: string | null | undefined): string {
//     if (!value || value === 'N/A') {
//         return 'N/A';
//     }

//     if (/AM|PM/i.test(value)) {
//         return value;
//     }

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//         return value;
//     }

//     return date.toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//     });
// }

// function getStatus(value: DailyAttendance): string {
//     if (value && typeof value === 'object') {
//         return value.status;
//     }

//     return value || 'Absent';
// }

// function getPresentData(value: DailyAttendance): PresentAttendance | null {
//     if (value && typeof value === 'object' && value.status === 'Present') {
//         return value;
//     }

//     return null;
// }

// function statusBackground(status: string): string {
//     switch (status.toLowerCase()) {
//         case 'present':
//             return '#20bf6b';

//         case 'home':
//             return '#20bf6b';

//         case 'leave':
//             return '#f1c40f';

//         case 'holiday':
//             return '#f1c40f';

//         case 'weekend':
//             return '#2c3e50';

//         case 'absent':
//         default:
//             return '#7f8c8d';
//     }
// }

// function formatHours(value: number | string | null | undefined): string {
//     const hours = Number(value ?? 0);

//     if (!Number.isFinite(hours)) {
//         return '0.0';
//     }

//     const totalMinutes = Math.round(hours * 60);

//     const wholeHours = Math.floor(totalMinutes / 60);

//     const minutes = totalMinutes % 60;

//     return `${wholeHours}.${minutes}`;
// }

// function getDailyValue(
//     employee: Employee,
//     index: number,
//     dateString: string,
// ): DailyAttendance {
//     const daily = employee.daily;

//     if (Array.isArray(daily)) {
//         return daily[index] ?? null;
//     }

//     if (daily && typeof daily === 'object') {
//         if (Object.prototype.hasOwnProperty.call(daily, dateString)) {
//             return daily[dateString];
//         }

//         const day = String(Number(dateString.slice(8, 10)));

//         if (Object.prototype.hasOwnProperty.call(daily, day)) {
//             return daily[day];
//         }

//         if (Object.prototype.hasOwnProperty.call(daily, String(index))) {
//             return daily[String(index)];
//         }
//     }

//     return null;
// }
// // Component
// export default function EmployeeAttendance({
//     report = [],
//     departments = [],
//     shifts = [],
//     month,
//     filters,
// }: Props) {
//     const currentMonth =
//         month || filters?.month || new Date().toISOString().slice(0, 7);

//     const [selectedDepartment, setSelectedDepartment] = useState(
//         filters?.department ? String(filters.department) : '',
//     );

//     const [selectedShift, setSelectedShift] = useState(
//         filters?.shift ? String(filters.shift) : '',
//     );

//     const [selectedMonth, setSelectedMonth] = useState(currentMonth);

//     const [loading, setLoading] = useState(false);

//     const [note, setNote] = useState('');

//     const [showNoteModal, setShowNoteModal] = useState(false);

//     const monthOptions = useMemo(() => {
//         const result: {
//             value: string;
//             label: string;
//         }[] = [];

//         const now = new Date();

//         for (let i = 0; i < 12; i++) {
//             const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

//             const year = date.getFullYear();

//             const monthNumber = String(date.getMonth() + 1).padStart(2, '0');

//             result.push({
//                 value: `${year}-${monthNumber}`,

//                 label: date.toLocaleDateString('en-US', {
//                     month: 'long',
//                     year: 'numeric',
//                 }),
//             });
//         }

//         return result;
//     }, []);

//     const days = useMemo(() => {
//         const [year, monthNumber] = selectedMonth.split('-').map(Number);

//         if (!year || !monthNumber) {
//             return [];
//         }

//         const now = new Date();

//         const currentYear = now.getFullYear();

//         const currentMonthNumber = now.getMonth() + 1;

//         const selectedMonthValue = year * 100 + monthNumber;

//         const currentMonthValue = currentYear * 100 + currentMonthNumber;

//         // Do not show future months
//         if (selectedMonthValue > currentMonthValue) {
//             return [];
//         }

//         let totalDays = new Date(year, monthNumber, 0).getDate();

//         // Current month only goes until today
//         if (selectedMonthValue === currentMonthValue) {
//             totalDays = now.getDate();
//         }

//         return Array.from(
//             {
//                 length: totalDays,
//             },
//             (_, index) => {
//                 const day = index + 1;

//                 const date = new Date(year, monthNumber - 1, day);

//                 return {
//                     day,

//                     dateString: `${year}-${String(monthNumber).padStart(
//                         2,
//                         '0',
//                     )}-${String(day).padStart(2, '0')}`,

//                     weekday: date.toLocaleDateString('en-US', {
//                         weekday: 'short',
//                     }),

//                     formattedDate: `${String(day).padStart(2, '0')}-${String(
//                         monthNumber,
//                     ).padStart(2, '0')}-${String(year).slice(-2)}`,
//                 };
//             },
//         );
//     }, [selectedMonth]);

//     // Filter
//     const applyFilters = (
//         department: string,
//         shift: string,
//         monthValue: string,
//     ) => {
//         setLoading(true);

//         router.get(
//             '/hr/attendance/employees',
//             {
//                 ...(department
//                     ? {
//                           department,
//                       }
//                     : {}),

//                 ...(shift
//                     ? {
//                           shift,
//                       }
//                     : {}),

//                 month: monthValue,
//             },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 replace: true,

//                 onFinish: () => {
//                     setLoading(false);
//                 },
//             },
//         );
//     };

//     const handleDepartmentChange = (
//         event: React.ChangeEvent<HTMLSelectElement>,
//     ) => {
//         const value = event.target.value;

//         setSelectedDepartment(value);

//         applyFilters(value, selectedShift, selectedMonth);
//     };

//     const handleShiftChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//         const value = event.target.value;

//         setSelectedShift(value);

//         applyFilters(selectedDepartment, value, selectedMonth);
//     };

//     const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//         const value = event.target.value;

//         setSelectedMonth(value);

//         applyFilters(selectedDepartment, selectedShift, value);
//     };

//     const openNote = (value: string) => {
//         setNote(value);

//         setShowNoteModal(true);
//     };

//     const filterRowStyle: React.CSSProperties = {
//         display: 'flex',
//         flexDirection: 'row',
//         flexWrap: 'nowrap',
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         gap: '14px',
//         width: '100%',
//     };

//     const filterStyle: React.CSSProperties = {
//         width: '300px',
//         minWidth: '300px',
//         height: '38px',
//         border: '1px solid #dee2e6',
//         borderRadius: '5px',
//         backgroundColor: '#fff',
//         padding: '0 38px 0 12px',
//         fontSize: '14px',
//         color: '#2c3e50',
//         outline: 'none',
//     };

//     const tableHeaderStyle: React.CSSProperties = {
//         position: 'sticky',
//         top: 0,
//         zIndex: 30,
//         backgroundColor: '#f2f2f2',
//         border: '1px solid #ddd',
//         padding: '10px 8px',
//         whiteSpace: 'nowrap',
//         fontWeight: 500,
//         textAlign: 'center',
//         height: '52px',
//     };

//     return (
//         <>
//             <Head title="Attendance" />

//             <div
//                 style={{
//                     width: '100%',
//                 }}
//             >
//                 <div
//                     style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'space-between',
//                         marginBottom: '18px',
//                     }}
//                 >
//                     <h2
//                         style={{
//                             margin: 0,
//                             fontSize: '24px',
//                             fontWeight: 500,
//                             color: '#111',
//                         }}
//                     >
//                         Attendance
//                     </h2>

//                     <div
//                         style={{
//                             fontSize: '14px',
//                             color: '#36506b',
//                         }}
//                     >
//                         <span
//                             style={{
//                                 color: '#008b8b',
//                                 marginRight: '8px',
//                             }}
//                         >
//                             <i className="fa fa-home" />
//                         </span>

//                         <span>/</span>

//                         <span
//                             style={{
//                                 marginLeft: '8px',
//                             }}
//                         >
//                             Attendance
//                         </span>
//                     </div>
//                 </div>

//                 {/* Main Card */}
//                 <div
//                     style={{
//                         background: '#fff',
//                         border: '1px solid #e5e7eb',
//                         borderRadius: '7px',
//                         boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
//                         overflow: 'hidden',
//                     }}
//                 >
//                     {/* Filters */}
//                     <div
//                         style={{
//                             padding: '20px 24px',
//                             borderBottom: '1px solid #edf0f2',
//                         }}
//                     >
//                         <div style={filterRowStyle}>
//                             {/*
//                             Department
//                             */}

//                             <div
//                                 style={{
//                                     position: 'relative',
//                                     width: '300px',
//                                     minWidth: '300px',
//                                 }}
//                             >
//                                 <select
//                                     value={selectedDepartment}
//                                     onChange={handleDepartmentChange}
//                                     disabled={loading}
//                                     style={filterStyle}
//                                 >
//                                     <option value="">All Departments</option>

//                                     {departments.map((department) => (
//                                         <option
//                                             key={department.id}
//                                             value={department.id}
//                                         >
//                                             {department.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/*
//                             Shift
//                             */}

//                             <div
//                                 style={{
//                                     position: 'relative',
//                                     width: '300px',
//                                     minWidth: '300px',
//                                 }}
//                             >
//                                 <select
//                                     value={selectedShift}
//                                     onChange={handleShiftChange}
//                                     disabled={loading}
//                                     style={filterStyle}
//                                 >
//                                     <option value="">All Shifts</option>

//                                     {shifts.map((shift) => (
//                                         <option key={shift.id} value={shift.id}>
//                                             {shift.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/*
//                             Month
//                             */}

//                             <div
//                                 style={{
//                                     position: 'relative',
//                                     width: '300px',
//                                     minWidth: '300px',
//                                 }}
//                             >
//                                 <select
//                                     value={selectedMonth}
//                                     onChange={handleMonthChange}
//                                     disabled={loading}
//                                     style={filterStyle}
//                                 >
//                                     {monthOptions.map((item) => (
//                                         <option
//                                             key={item.value}
//                                             value={item.value}
//                                         >
//                                             {item.label}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>
//                     </div>

//                     {/*Table*/}

//                     <div
//                         style={{
//                             padding: '0',
//                         }}
//                     >
//                         <div
//                             style={{
//                                 height: 'calc(100vh - 280px)',
//                                 overflowX: 'auto',
//                                 overflowY: 'auto',
//                                 position: 'relative',
//                                 whiteSpace: 'nowrap',
//                             }}
//                         >
//                             <table
//                                 style={{
//                                     width: 'max-content',
//                                     minWidth: '100%',
//                                     borderCollapse: 'collapse',
//                                     tableLayout: 'fixed',
//                                     fontSize: '14px',
//                                     color: '#2c3e50',
//                                 }}
//                             >
//                                 <thead>
//                                     <tr>
//                                         {/*
//                                         SL
//                                         */}

//                                         <th
//                                             style={{
//                                                 ...tableHeaderStyle,

//                                                 position: 'sticky',

//                                                 left: 0,

//                                                 zIndex: 50,

//                                                 width: '55px',

//                                                 minWidth: '55px',

//                                                 maxWidth: '55px',

//                                                 backgroundColor: '#f2f2f2',
//                                             }}
//                                         >
//                                             Sl
//                                         </th>

//                                         {/*
//                                         Employee
//                                         */}

//                                         <th
//                                             style={{
//                                                 ...tableHeaderStyle,

//                                                 position: 'sticky',

//                                                 left: '55px',

//                                                 zIndex: 50,

//                                                 width: '180px',

//                                                 minWidth: '180px',

//                                                 maxWidth: '180px',

//                                                 backgroundColor: '#f2f2f2',
//                                             }}
//                                         >
//                                             Employee Name
//                                         </th>

//                                         {/*
//                                         Days
//                                         */}

//                                         {days.map((day) => (
//                                             <th
//                                                 key={day.dateString}
//                                                 style={{
//                                                     ...tableHeaderStyle,

//                                                     width: '150px',

//                                                     minWidth: '150px',

//                                                     maxWidth: '150px',
//                                                 }}
//                                             >
//                                                 {day.weekday} -{' '}
//                                                 {day.formattedDate}
//                                             </th>
//                                         ))}

//                                         {/*
//                                         Summary
//                                         */}

//                                         <th
//                                             style={{
//                                                 ...tableHeaderStyle,

//                                                 width: '150px',

//                                                 minWidth: '150px',
//                                             }}
//                                         >
//                                             Working Day
//                                         </th>

//                                         <th
//                                             style={{
//                                                 ...tableHeaderStyle,

//                                                 width: '150px',

//                                                 minWidth: '150px',
//                                             }}
//                                         >
//                                             Present
//                                         </th>

//                                         <th
//                                             style={{
//                                                 ...tableHeaderStyle,

//                                                 width: '150px',

//                                                 minWidth: '150px',
//                                             }}
//                                         >
//                                             Absent
//                                         </th>

//                                         <th
//                                             style={{
//                                                 ...tableHeaderStyle,

//                                                 width: '150px',

//                                                 minWidth: '150px',
//                                             }}
//                                         >
//                                             Leave
//                                         </th>

//                                         <th
//                                             style={{
//                                                 ...tableHeaderStyle,

//                                                 width: '150px',

//                                                 minWidth: '150px',
//                                             }}
//                                         >
//                                             Hours
//                                         </th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {loading && (
//                                         <tr>
//                                             <td
//                                                 colSpan={days.length + 7}
//                                                 style={{
//                                                     border: '1px solid #ddd',
//                                                     padding: '40px',
//                                                     textAlign: 'center',
//                                                 }}
//                                             >
//                                                 Loading attendance...
//                                             </td>
//                                         </tr>
//                                     )}

//                                     {!loading && report.length === 0 && (
//                                         <tr>
//                                             <td
//                                                 colSpan={days.length + 7}
//                                                 style={{
//                                                     border: '1px solid #ddd',
//                                                     height: '60px',
//                                                     padding: '10px',
//                                                     textAlign: 'center',
//                                                     color: '#6c757d',
//                                                     fontSize: '14px',
//                                                 }}
//                                             >
//                                                 <div
//                                                     style={{
//                                                         display: 'flex',
//                                                         justifyContent:
//                                                             'center',
//                                                         alignItems: 'center',
//                                                         gap: '5px',
//                                                     }}
//                                                 >
//                                                     <AlertCircle
//                                                         size={28}
//                                                         style={{
//                                                             color: '#adb5bd',
//                                                         }}
//                                                     />

//                                                     <span>
//                                                         No attendance records
//                                                         found
//                                                     </span>

//                                                     <span>
//                                                         Try another month,
//                                                         department, or shift.
//                                                     </span>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}

//                                     {!loading &&
//                                         report.map(
//                                             (employee, employeeIndex) => (
//                                                 <tr
//                                                     key={`${employee.employee_id}-${employeeIndex}`}
//                                                 >
//                                                     {/*
//                                                     SL
//                                                     */}

//                                                     <td
//                                                         style={{
//                                                             position: 'sticky',
//                                                             left: 0,
//                                                             zIndex: 20,
//                                                             width: '55px',
//                                                             minWidth: '55px',
//                                                             maxWidth: '55px',
//                                                             background: '#fff',
//                                                             border: '1px solid #ddd',
//                                                             padding: '8px',
//                                                             textAlign: 'center',
//                                                             whiteSpace:
//                                                                 'nowrap',
//                                                         }}
//                                                     >
//                                                         {employeeIndex + 1}
//                                                     </td>

//                                                     {/*
//                                                     Employee
//                                                     */}

//                                                     <td
//                                                         style={{
//                                                             position: 'sticky',
//                                                             left: '55px',
//                                                             zIndex: 20,
//                                                             width: '180px',
//                                                             minWidth: '180px',
//                                                             maxWidth: '180px',
//                                                             background: '#fff',
//                                                             border: '1px solid #ddd',
//                                                             padding: '8px',
//                                                             textAlign: 'center',
//                                                             whiteSpace:
//                                                                 'nowrap',
//                                                         }}
//                                                     >
//                                                         {employee.name}

//                                                         <br />

//                                                         <span>
//                                                             #
//                                                             {
//                                                                 employee.employee_id
//                                                             }
//                                                         </span>
//                                                     </td>

//                                                     {/*
//                                                     Daily
//                                                     */}

//                                                     {days.map(
//                                                         (day, dayIndex) => {
//                                                             const value =
//                                                                 getDailyValue(
//                                                                     employee,
//                                                                     dayIndex,
//                                                                     day.dateString,
//                                                                 );

//                                                             const status =
//                                                                 getStatus(
//                                                                     value,
//                                                                 );

//                                                             const present =
//                                                                 getPresentData(
//                                                                     value,
//                                                                 );

//                                                             return (
//                                                                 <td
//                                                                     key={
//                                                                         day.dateString
//                                                                     }
//                                                                     style={{
//                                                                         width: '150px',

//                                                                         minWidth:
//                                                                             '150px',

//                                                                         maxWidth:
//                                                                             '150px',

//                                                                         border: '1px solid #ddd',

//                                                                         padding:
//                                                                             '8px',

//                                                                         textAlign:
//                                                                             'center',

//                                                                         verticalAlign:
//                                                                             'middle',

//                                                                         whiteSpace:
//                                                                             'nowrap',
//                                                                     }}
//                                                                 >
//                                                                     {present ? (
//                                                                         <div
//                                                                             style={{
//                                                                                 display:
//                                                                                     'flex',
//                                                                                 flexDirection:
//                                                                                     'column',
//                                                                                 alignItems:
//                                                                                     'center',
//                                                                                 gap: '4px',
//                                                                             }}
//                                                                         >
//                                                                             <div
//                                                                                 style={{
//                                                                                     display:
//                                                                                         'flex',
//                                                                                     alignItems:
//                                                                                         'center',
//                                                                                     justifyContent:
//                                                                                         'center',
//                                                                                     gap: '6px',
//                                                                                 }}
//                                                                             >
//                                                                                 <span>
//                                                                                     <b>
//                                                                                         In:
//                                                                                     </b>{' '}
//                                                                                     {formatTime(
//                                                                                         present.check_in,
//                                                                                     )}
//                                                                                 </span>

//                                                                                 {present.check_in_note && (
//                                                                                     <button
//                                                                                         type="button"
//                                                                                         onClick={() =>
//                                                                                             openNote(
//                                                                                                 present.check_in_note ??
//                                                                                                     '',
//                                                                                             )
//                                                                                         }
//                                                                                         style={{
//                                                                                             border: 'none',
//                                                                                             background:
//                                                                                                 'transparent',
//                                                                                             padding: 0,
//                                                                                             cursor: 'pointer',
//                                                                                             color: '#2c3e50',
//                                                                                         }}
//                                                                                     >
//                                                                                         <AlertCircle
//                                                                                             size={
//                                                                                                 15
//                                                                                             }
//                                                                                         />
//                                                                                     </button>
//                                                                                 )}
//                                                                             </div>

//                                                                             <div
//                                                                                 style={{
//                                                                                     display:
//                                                                                         'flex',
//                                                                                     alignItems:
//                                                                                         'center',
//                                                                                     justifyContent:
//                                                                                         'center',
//                                                                                     gap: '6px',
//                                                                                 }}
//                                                                             >
//                                                                                 <span>
//                                                                                     <b>
//                                                                                         Out:
//                                                                                     </b>{' '}
//                                                                                     {formatTime(
//                                                                                         present.check_out,
//                                                                                     )}
//                                                                                 </span>

//                                                                                 {present.check_out_note && (
//                                                                                     <button
//                                                                                         type="button"
//                                                                                         onClick={() =>
//                                                                                             openNote(
//                                                                                                 present.check_out_note ??
//                                                                                                     '',
//                                                                                             )
//                                                                                         }
//                                                                                         style={{
//                                                                                             border: 'none',
//                                                                                             background:
//                                                                                                 'transparent',
//                                                                                             padding: 0,
//                                                                                             cursor: 'pointer',
//                                                                                             color: '#2c3e50',
//                                                                                         }}
//                                                                                     >
//                                                                                         <AlertCircle
//                                                                                             size={
//                                                                                                 15
//                                                                                             }
//                                                                                         />
//                                                                                     </button>
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                     ) : (
//                                                                         <span
//                                                                             style={{
//                                                                                 display:
//                                                                                     'inline-block',

//                                                                                 padding:
//                                                                                     '4px 8px',

//                                                                                 borderRadius:
//                                                                                     '4px',

//                                                                                 fontSize:
//                                                                                     '13px',

//                                                                                 fontWeight: 500,

//                                                                                 color: '#fff',

//                                                                                 background:
//                                                                                     statusBackground(
//                                                                                         status,
//                                                                                     ),
//                                                                             }}
//                                                                         >
//                                                                             {
//                                                                                 status
//                                                                             }
//                                                                         </span>
//                                                                     )}
//                                                                 </td>
//                                                             );
//                                                         },
//                                                     )}

//                                                     {/*
//                                                     Summary
//                                                     */}

//                                                     <td
//                                                         style={{
//                                                             width: '150px',
//                                                             minWidth: '150px',
//                                                             border: '1px solid #ddd',
//                                                             padding: '8px',
//                                                             textAlign: 'center',
//                                                         }}
//                                                     >
//                                                         {employee.total_working_days ??
//                                                             0}
//                                                     </td>

//                                                     <td
//                                                         style={{
//                                                             width: '150px',
//                                                             minWidth: '150px',
//                                                             border: '1px solid #ddd',
//                                                             padding: '8px',
//                                                             textAlign: 'center',
//                                                         }}
//                                                     >
//                                                         {employee.total_present ??
//                                                             0}
//                                                     </td>

//                                                     <td
//                                                         style={{
//                                                             width: '150px',
//                                                             minWidth: '150px',
//                                                             border: '1px solid #ddd',
//                                                             padding: '8px',
//                                                             textAlign: 'center',
//                                                         }}
//                                                     >
//                                                         {employee.total_absent ??
//                                                             0}
//                                                     </td>

//                                                     <td
//                                                         style={{
//                                                             width: '150px',
//                                                             minWidth: '150px',
//                                                             border: '1px solid #ddd',
//                                                             padding: '8px',
//                                                             textAlign: 'center',
//                                                         }}
//                                                     >
//                                                         {employee.total_leave ??
//                                                             0}
//                                                     </td>

//                                                     <td
//                                                         style={{
//                                                             width: '150px',
//                                                             minWidth: '150px',
//                                                             border: '1px solid #ddd',
//                                                             padding: '8px',
//                                                             textAlign: 'center',
//                                                         }}
//                                                     >
//                                                         {formatHours(
//                                                             employee.total_hours_worked,
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             ),
//                                         )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Note Modal */}
//             {showNoteModal && (
//                 <div
//                     onClick={() => setShowNoteModal(false)}
//                     style={{
//                         position: 'fixed',
//                         inset: 0,
//                         zIndex: 9999,
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         background: 'rgba(0,0,0,0.5)',
//                         padding: '20px',
//                     }}
//                 >
//                     <div
//                         onClick={(event) => event.stopPropagation()}
//                         style={{
//                             width: '100%',
//                             maxWidth: '500px',
//                             background: '#fff',
//                             borderRadius: '6px',
//                             boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//                         }}
//                     >
//                         <div
//                             style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'space-between',
//                                 padding: '15px 20px',
//                                 borderBottom: '1px solid #dee2e6',
//                             }}
//                         >
//                             <h5
//                                 style={{
//                                     margin: 0,
//                                     fontSize: '18px',
//                                     fontWeight: 500,
//                                 }}
//                             >
//                                 Note
//                             </h5>

//                             <button
//                                 type="button"
//                                 onClick={() => setShowNoteModal(false)}
//                                 style={{
//                                     border: 'none',
//                                     background: 'transparent',
//                                     fontSize: '24px',
//                                     cursor: 'pointer',
//                                     color: '#6c757d',
//                                 }}
//                             >
//                                 ×
//                             </button>
//                         </div>

//                         <div
//                             style={{
//                                 padding: '20px',
//                                 minHeight: '100px',
//                                 color: '#333',
//                             }}
//                         >
//                             {note || 'No additional notes available.'}
//                         </div>

//                         <div
//                             style={{
//                                 display: 'flex',
//                                 justifyContent: 'flex-end',
//                                 padding: '12px 20px',
//                                 borderTop: '1px solid #dee2e6',
//                             }}
//                         >
//                             <button
//                                 type="button"
//                                 onClick={() => setShowNoteModal(false)}
//                                 className="btn btn-secondary"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }
