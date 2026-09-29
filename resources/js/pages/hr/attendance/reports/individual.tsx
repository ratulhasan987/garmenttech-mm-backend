import {
    Link,
    usePage,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Download,
} from 'react-feather';


type Employee = {
    id: number;
    employee_id: string | null;
    name: string;
};


type AttendanceRow = {
    date: string;

    attendance_status: string | null;

    checked_in_at: string | null;
    checked_out_at: string | null;

    checked_in_at_note: string | null;
    checked_out_at_note: string | null;

    is_late: boolean | string | number;
    minutes_late: number | string;

    is_early: boolean | string | number;
    minutes_early: number | string;

    hours_worked: number | string;
};


type Summary = {
    working_days: number | string;
    present: number | string;
    home: number | string;
    absent: number | string;
    leave: number | string;

    late: number | string;
    early: number | string;

    late_minutes: number | string;
    early_minutes: number | string;

    targeted_hours: number | string;
    hours_worked: number | string;
    remaining_hours: number | string;
};


type PageProps = {
    employee: Employee;
    rows: AttendanceRow[];
    summary: Summary;

    start_date: string;
    end_date: string;
};


const formatDate = (
    value: string,
): string => {

    if (!value) {
        return '-';
    }

    const date =
        new Date(
            `${value}T00:00:00`,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    );
};


const formatMinutes = (
    value: number | string | null | undefined,
): string => {

    const total =
        Number(value ?? 0);

    if (!Number.isFinite(total)) {
        return '0:00';
    }

    const hours =
        Math.floor(
            total / 60,
        );

    const minutes =
        Math.abs(
            total % 60,
        );

    return `${hours}:${String(minutes).padStart(2, '0')}`;
};


const formatHours = (
    value: number | string | null | undefined,
): string => {

    const hours =
        Number(value ?? 0);

    if (!Number.isFinite(hours)) {
        return '0:00';
    }

    return formatMinutes(
        Math.round(
            hours * 60,
        ),
    );
};


const isTruthy = (
    value: boolean | string | number,
): boolean => {

    if (
        value === true ||
        value === 1
    ) {
        return true;
    }

    if (
        typeof value === 'string'
    ) {
        return [
            '1',
            'true',
            'yes',
            'late',
            'early',
        ].includes(
            value.toLowerCase(),
        );
    }

    return false;
};


const Individual = () => {

    const {
        employee,
        rows = [],
        summary,
        start_date,
        end_date,
    } =
        usePage<PageProps>().props;


    const csrfToken =
        (
            document.querySelector(
                'meta[name="csrf-token"]',
            ) as HTMLMetaElement | null
        )?.content ?? '';


    return (
        <>
            {/* PAGE TITLE*/}
            <div className="page-title">

                <div className="row">

                    <div className="col-sm-6">

                        <h3>
                            Individual Attendance Report
                        </h3>

                    </div>


                    <div className="col-sm-6">

                        <ol className="breadcrumb">

                            <li className="breadcrumb-item">

                                <Link href="/">
                                    <i className="iconly-Home icli" />
                                </Link>

                            </li>

                            <li className="breadcrumb-item">
                                Human Resources
                            </li>

                            <li className="breadcrumb-item">
                                Attendance
                            </li>

                            <li className="breadcrumb-item">
                                Reports
                            </li>

                            <li className="breadcrumb-item active">
                                Individual
                            </li>

                        </ol>

                    </div>

                </div>

            </div>


            <div className="container-fluid">

                <div className="card">

                    {/* HEADER*/}
                    <div className="card-header d-flex justify-content-between align-items-center">

                        <div>

                            <h4 className="mb-1">
                                Individual Attendance Report
                            </h4>

                            <p className="text-muted mb-0">
                                Detailed attendance information.
                            </p>

                        </div>


                        <Link
                            href="/hr/attendance/reports"
                            className="btn btn-light d-flex align-items-center"
                        >

                            <ArrowLeft
                                size={16}
                                className="me-1"
                            />

                            Back

                        </Link>

                    </div>


                    <div className="card-body">

                        {/* EMPLOYEE INFORMATION*/}
                        <div className="row g-3 mb-4">

                            <div className="col-md-4">

                                <div className="border rounded p-3">

                                    <div className="text-muted small mb-1">
                                        Employee
                                    </div>

                                    <div className="fw-semibold">
                                        {
                                            employee?.name ??
                                            '-'
                                        }
                                    </div>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="border rounded p-3">

                                    <div className="text-muted small mb-1">
                                        Employee ID
                                    </div>

                                    <div className="fw-semibold">
                                        #
                                        {
                                            employee?.employee_id ??
                                            '-'
                                        }
                                    </div>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="border rounded p-3">

                                    <div className="text-muted small mb-1">
                                        Report Period
                                    </div>

                                    <div className="fw-semibold">
                                        {formatDate(start_date)}
                                        {' - '}
                                        {formatDate(end_date)}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ATTENDANCE TABLE*/}
                        <div className="table-responsive">

                            <table className="table table-bordered table-hover align-middle">

                                <thead>

                                    <tr>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            In Time
                                        </th>

                                        <th>
                                            In Status
                                        </th>

                                        <th>
                                            Out Time
                                        </th>

                                        <th>
                                            Out Status
                                        </th>

                                        <th
                                            style={{
                                                minWidth: 180,
                                            }}
                                        >
                                            Reason
                                        </th>

                                        <th>
                                            Hours
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {rows.length > 0 ? (

                                        rows.map(
                                            (
                                                row,
                                                index,
                                            ) => (

                                                <tr
                                                    key={`${row.date}-${index}`}
                                                >

                                                    <td>
                                                        {formatDate(
                                                            row.date,
                                                        )}
                                                    </td>


                                                    <td>
                                                        {
                                                            row.attendance_status ??
                                                            '-'
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.checked_in_at ??
                                                            '-'
                                                        }
                                                    </td>


                                                    <td>

                                                        {isTruthy(
                                                            row.is_late,
                                                        ) ? (

                                                            <span className="text-danger">

                                                                Late

                                                                {Number(
                                                                    row.minutes_late,
                                                                ) >
                                                                0 && (
                                                                    <>
                                                                        {' '}
                                                                        (
                                                                        {
                                                                            row.minutes_late
                                                                        }
                                                                        {' '}
                                                                        min)
                                                                    </>
                                                                )}

                                                            </span>

                                                        ) : (

                                                            <span className="text-success">
                                                                On Time
                                                            </span>

                                                        )}

                                                    </td>


                                                    <td>
                                                        {
                                                            row.checked_out_at ??
                                                            '-'
                                                        }
                                                    </td>


                                                    <td>

                                                        {isTruthy(
                                                            row.is_early,
                                                        ) ? (

                                                            <span className="text-danger">

                                                                Early

                                                                {Number(
                                                                    row.minutes_early,
                                                                ) >
                                                                0 && (
                                                                    <>
                                                                        {' '}
                                                                        (
                                                                        {
                                                                            row.minutes_early
                                                                        }
                                                                        {' '}
                                                                        min)
                                                                    </>
                                                                )}

                                                            </span>

                                                        ) : (

                                                            <span className="text-success">
                                                                On Time
                                                            </span>

                                                        )}

                                                    </td>


                                                    <td className="text-start">

                                                        {row.checked_in_at_note && (

                                                            <div className="mb-1">

                                                                <strong>
                                                                    In:
                                                                </strong>{' '}

                                                                {
                                                                    row.checked_in_at_note
                                                                }

                                                            </div>

                                                        )}


                                                        {row.checked_out_at_note && (

                                                            <div>

                                                                <strong>
                                                                    Out:
                                                                </strong>{' '}

                                                                {
                                                                    row.checked_out_at_note
                                                                }

                                                            </div>

                                                        )}


                                                        {!row.checked_in_at_note &&
                                                            !row.checked_out_at_note && (
                                                                <span className="text-muted">
                                                                    -
                                                                </span>
                                                            )}

                                                    </td>


                                                    <td>
                                                        {formatHours(
                                                            row.hours_worked,
                                                        )}
                                                    </td>

                                                </tr>

                                            ),
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan={8}
                                                className="text-center py-5 text-muted"
                                            >
                                                No attendance records
                                                found for the selected
                                                criteria.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* SUMMARY*/}
                        <div className="mt-4">

                            <h5 className="mb-3">
                                Attendance Summary
                            </h5>


                            <div className="row g-3">

                                {[
                                    [
                                        'Working Days',
                                        summary?.working_days,
                                    ],
                                    [
                                        'Present',
                                        summary?.present,
                                    ],
                                    [
                                        'Home',
                                        summary?.home,
                                    ],
                                    [
                                        'Absent',
                                        summary?.absent,
                                    ],
                                    [
                                        'Leave',
                                        summary?.leave,
                                    ],
                                    [
                                        'Late',
                                        summary?.late,
                                    ],
                                    [
                                        'Early',
                                        summary?.early,
                                    ],
                                    [
                                        'Late Minutes',
                                        summary?.late_minutes,
                                    ],
                                    [
                                        'Early Minutes',
                                        summary?.early_minutes,
                                    ],
                                    [
                                        'Targeted Hours',
                                        formatHours(
                                            summary?.targeted_hours,
                                        ),
                                    ],
                                    [
                                        'Hours Worked',
                                        formatHours(
                                            summary?.hours_worked,
                                        ),
                                    ],
                                    [
                                        'Remaining Hours',
                                        formatHours(
                                            summary?.remaining_hours,
                                        ),
                                    ],
                                ].map(
                                    (
                                        item,
                                    ) => (

                                        <div
                                            key={
                                                item[0] as string
                                            }
                                            className="col-xl-3 col-lg-4 col-md-6"
                                        >

                                            <div className="border rounded p-3">

                                                <div className="text-muted small">
                                                    {
                                                        item[0]
                                                    }
                                                </div>

                                                <div className="fs-5 fw-semibold mt-1">
                                                    {
                                                        item[1] ??
                                                        0
                                                    }
                                                </div>

                                            </div>

                                        </div>

                                    ),
                                )}

                            </div>

                        </div>

                    </div>


                    {/* FOOTER*/}
                    <div className="card-footer d-flex justify-content-between align-items-center">

                        <div className="text-muted">
                            Individual Attendance Report
                        </div>


                        <form
                            action="/hr/report/attendance/individual"
                            method="POST"
                            target="_blank"
                        >

                            <input
                                type="hidden"
                                name="_token"
                                value={csrfToken}
                            />

                            <input
                                type="hidden"
                                name="person"
                                value={
                                    employee?.id ?? ''
                                }
                            />

                            <input
                                type="hidden"
                                name="start_date"
                                value={start_date}
                            />

                            <input
                                type="hidden"
                                name="end_date"
                                value={end_date}
                            />

                            <input
                                type="hidden"
                                name="download"
                                value="pdf"
                            />

                            <button
                                type="submit"
                                className="btn btn-primary d-flex align-items-center"
                            >

                                <Download
                                    size={16}
                                    className="me-2"
                                />

                                Download PDF

                            </button>

                        </form>

                    </div>

                </div>

            </div>
        </>
    );
};


export default Individual;