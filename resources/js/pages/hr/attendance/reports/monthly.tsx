import {
    Link,
    usePage,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Download,
} from 'react-feather';


type EmployeeAttendance = {
    employee_id: string | number | null;
    employee_name: string | null;

    total_working_days: number | string;
    total_present: number | string;
    total_home: number | string;
    total_absent: number | string;
    total_leave: number | string;

    total_late: number | string;
    total_early: number | string;

    total_minutes_late: number | string;
    total_minutes_early: number | string;

    total_targeted_hours: number | string;
    total_hours_worked: number | string;

    remaining_hours: number | string;
};


type PageProps = {
    employeeAttendances: EmployeeAttendance[];
    month: string;
};


const formatMonth = (
    value: string,
): string => {

    if (!value) {
        return '-';
    }

    const date =
        new Date(
            `${value}-01T00:00:00`,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        'en-US',
        {
            month: 'long',
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


const Monthly = () => {

    const {
        employeeAttendances = [],
        month,
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
                            Monthly Attendance Report
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
                                Monthly
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
                                Monthly Attendance Report
                            </h4>

                            <p className="text-muted mb-0">
                                {formatMonth(month)}
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

                        {/* MONTH INFORMATION*/}
                        <div className="row mb-4">

                            <div className="col-md-4">

                                <div className="border rounded p-3">

                                    <div className="text-muted small">
                                        Attendance Month
                                    </div>

                                    <div className="fw-semibold mt-1">
                                        {formatMonth(month)}
                                    </div>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="border rounded p-3">

                                    <div className="text-muted small">
                                        Employees
                                    </div>

                                    <div className="fw-semibold mt-1">
                                        {
                                            employeeAttendances.length
                                        }
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* TABLE*/}
                        <div className="table-responsive">

                            <table className="table table-bordered table-hover align-middle">

                                <thead>

                                    <tr>

                                        <th
                                            className="text-start"
                                            style={{
                                                minWidth: 180,
                                            }}
                                        >
                                            Employee
                                        </th>

                                        <th>
                                            Working Days
                                        </th>

                                        <th>
                                            Present
                                        </th>

                                        <th>
                                            Home
                                        </th>

                                        <th>
                                            Absent
                                        </th>

                                        <th>
                                            Leave
                                        </th>

                                        <th>
                                            Late
                                        </th>

                                        <th>
                                            Early
                                        </th>

                                        <th>
                                            Late Hours
                                        </th>

                                        <th>
                                            Early Hours
                                        </th>

                                        <th>
                                            Targeted Hours
                                        </th>

                                        <th>
                                            Hours Worked
                                        </th>

                                        <th>
                                            Remaining Hours
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {employeeAttendances.length >
                                    0 ? (

                                        employeeAttendances.map(
                                            (
                                                employee,
                                                index,
                                            ) => (

                                                <tr
                                                    key={
                                                        employee.employee_id ??
                                                        index
                                                    }
                                                >

                                                    <td className="text-start">

                                                        <div className="fw-semibold">
                                                            {
                                                                employee.employee_name ??
                                                                '-'
                                                            }
                                                        </div>

                                                        <small className="text-muted">
                                                            #
                                                            {
                                                                employee.employee_id ??
                                                                '-'
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>
                                                        {
                                                            employee.total_working_days ??
                                                            0
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            employee.total_present ??
                                                            0
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            employee.total_home ??
                                                            0
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            employee.total_absent ??
                                                            0
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            employee.total_leave ??
                                                            0
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            employee.total_late ??
                                                            0
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            employee.total_early ??
                                                            0
                                                        }
                                                    </td>


                                                    <td>
                                                        {formatMinutes(
                                                            employee.total_minutes_late,
                                                        )}
                                                    </td>


                                                    <td>
                                                        {formatMinutes(
                                                            employee.total_minutes_early,
                                                        )}
                                                    </td>


                                                    <td>
                                                        {formatHours(
                                                            employee.total_targeted_hours,
                                                        )}
                                                    </td>


                                                    <td>
                                                        {formatHours(
                                                            employee.total_hours_worked,
                                                        )}
                                                    </td>


                                                    <td>
                                                        {formatHours(
                                                            employee.remaining_hours,
                                                        )}
                                                    </td>

                                                </tr>

                                            ),
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan={13}
                                                className="text-center py-5 text-muted"
                                            >
                                                No attendance records
                                                found for this month.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>


                    {/* FOOTER*/}
                    <div className="card-footer d-flex justify-content-between align-items-center">

                        <div className="text-muted">
                            Monthly Attendance Report
                        </div>


                        <form
                            action="/hr/report/attendance/monthly"
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
                                name="month"
                                value={month}
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


export default Monthly;