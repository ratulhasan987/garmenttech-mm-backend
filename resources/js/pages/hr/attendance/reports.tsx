import React, {
    FormEvent,
    useMemo,
    useState,
} from 'react';

import {
    Head,
    usePage,
} from '@inertiajs/react';

import {
    Search,
    X,
} from 'react-feather';

import {
    DatePicker,
} from '@/components/ui/form/date-picker';


type Employee = {
    id: number;
    employee_id: string | null;
    name: string;
};

type PageProps = {
    currentMonth: string;
    employees: Employee[];
};


const getToday = (): string => {
    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            date.getDate()
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};


const Reports = () => {

    const {
        currentMonth,
        employees = [],
    } =
        usePage<PageProps>().props;


// Employee
    const [
        employeeSearch,
        setEmployeeSearch,
    ] = useState('');

    const [
        selectedEmployee,
        setSelectedEmployee,
    ] =
        useState<Employee | null>(
            null
        );

    const [
        employeeDropdownOpen,
        setEmployeeDropdownOpen,
    ] =
        useState(false);


  // Dates
    const [
        individualStartDate,
        setIndividualStartDate,
    ] =
        useState(
            getToday()
        );

    const [
        individualEndDate,
        setIndividualEndDate,
    ] =
        useState(
            getToday()
        );

    const [
        allStartDate,
        setAllStartDate,
    ] =
        useState(
            getToday()
        );

    const [
        allEndDate,
        setAllEndDate,
    ] =
        useState(
            getToday()
        );

    const [
        monthlyMonth,
        setMonthlyMonth,
    ] =
        useState(
            currentMonth
        );


    // Filter Employees
    const filteredEmployees =
        useMemo(() => {

            const keyword =
                employeeSearch
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return employees;
            }

            return employees.filter(
                (employee) => {

                    const name =
                        employee.name
                            ?.toLowerCase() ??
                        '';

                    const employeeId =
                        employee.employee_id
                            ?.toLowerCase() ??
                        '';

                    return (
                        name.includes(
                            keyword
                        ) ||
                        employeeId.includes(
                            keyword
                        )
                    );
                }
            );

        }, [
            employees,
            employeeSearch,
        ]);


   // Employee Select

    const handleEmployeeSelect =
        (
            employee: Employee
        ) => {

            setSelectedEmployee(
                employee
            );

            setEmployeeSearch(
                ''
            );

            setEmployeeDropdownOpen(
                false
            );
        };


   // Clear Employee
    const clearEmployee = () => {

        setSelectedEmployee(
            null
        );

        setEmployeeSearch(
            ''
        );

        setEmployeeDropdownOpen(
            true
        );
    };

    // Individual Submit
    const handleIndividualSubmit =
        (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            if (
                !selectedEmployee
            ) {
                event.preventDefault();

                alert(
                    'Please select an employee.'
                );

                return;
            }

            if (
                !individualStartDate ||
                !individualEndDate
            ) {
                event.preventDefault();

                alert(
                    'Please select both start and end dates.'
                );
            }
        };


   // All Employee Submit

    const handleAllReportSubmit =
        (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            if (
                !allStartDate ||
                !allEndDate
            ) {
                event.preventDefault();

                alert(
                    'Please select both start and end dates.'
                );
            }
        };


    return (
        <>
        <Head title="Attendance Report" />
            {/* PAGE TITLE*/}
            <div className="page-title">
                <div className="row">

                    <div className="col-sm-6">
                        <h3>
                            Attendance Reports
                        </h3>
                    </div>

                    <div className="col-sm-6">
                        <ol className="breadcrumb">

                            <li className="breadcrumb-item">
                                <a href="/">
                                    <i className="iconly-Home icli" />
                                </a>
                            </li>

                            <li className="breadcrumb-item">
                                Human Resources
                            </li>

                            <li className="breadcrumb-item">
                                Attendance
                            </li>

                            <li className="breadcrumb-item active">
                                Reports
                            </li>

                        </ol>
                    </div>

                </div>
            </div>


            {/* CONTENT*/}
            <div className="container-fluid">
                <div className="row g-4">


                    {/* INDIVIDUAL REPORT */}
                    <div className="col-xl-6">

                        <div className="card h-100">

                            <div className="card-header">
                                <h4 className="mb-1">
                                    Individual Attendance Report
                                </h4>

                                <p className="text-muted mb-0">
                                    Generate attendance details for one employee.
                                </p>
                            </div>


                            <div className="card-body">

                                <form
                                    method="POST"
                                    action="/hr/report/attendance/individual"
                                    target="_blank"
                                    onSubmit={
                                        handleIndividualSubmit
                                    }
                                >

                                    {/* CSRF */}

                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            (
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]'
                                                    ) as HTMLMetaElement
                                            )?.content ?? ''
                                        }
                                    />


                                    {/* Employee ID */}
                                    <input
                                        type="hidden"
                                        name="person"
                                        value={
                                            selectedEmployee?.id ??
                                            ''
                                        }
                                    />


                                    {/*EMPLOYEE*/}
                                    <div className="mb-4">

                                        <label className="form-label">
                                            Employee
                                            <span className="text-danger">
                                                {' '}*
                                            </span>
                                        </label>

                                        <div className="position-relative">

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    <Search
                                                        size={16}
                                                    />
                                                </span>


                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder={
                                                        selectedEmployee
                                                            ? ''
                                                            : 'Select employee'
                                                    }
                                                    value={
                                                        selectedEmployee
                                                            ? `${selectedEmployee.name} - ${selectedEmployee.employee_id ?? ''}`
                                                            : employeeSearch
                                                    }
                                                    onFocus={() => {
                                                        setEmployeeDropdownOpen(
                                                            true
                                                        );
                                                    }}
                                                    onChange={(
                                                        event
                                                    ) => {

                                                        setSelectedEmployee(
                                                            null
                                                        );

                                                        setEmployeeSearch(
                                                            event.target.value
                                                        );

                                                        setEmployeeDropdownOpen(
                                                            true
                                                        );
                                                    }}
                                                    autoComplete="off"
                                                />


                                                {selectedEmployee && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-light border"
                                                        onClick={
                                                            clearEmployee
                                                        }
                                                    >
                                                        <X
                                                            size={16}
                                                        />
                                                    </button>
                                                )}

                                            </div>


                                            {/*EMPLOYEE DROPDOWN*/}
                                            {employeeDropdownOpen && (
                                                <div
                                                    className="position-absolute bg-white border rounded shadow-sm w-100"
                                                    style={{
                                                        zIndex: 1050,
                                                        top: '100%',
                                                        left: 0,
                                                        maxHeight: '280px',
                                                        overflowY: 'auto',
                                                    }}
                                                >

                                                    {filteredEmployees.length >
                                                    0 ? (
                                                        filteredEmployees.map(
                                                            (
                                                                employee
                                                            ) => (

                                                                <button
                                                                    key={
                                                                        employee.id
                                                                    }
                                                                    type="button"
                                                                    className="dropdown-item px-3 py-2"
                                                                    onClick={() =>
                                                                        handleEmployeeSelect(
                                                                            employee
                                                                        )
                                                                    }
                                                                >

                                                                    <div className="fw-medium">
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

                                                            )
                                                        )
                                                    ) : (

                                                        <div className="p-3 text-muted">
                                                            No employee found.
                                                        </div>

                                                    )}

                                                </div>
                                            )}

                                        </div>

                                    </div>


                                    {/*DATE RANGE*/}
                                    <div className="row  mt-5">

                                        <div className="col-md-6">

                                            <div className="mb-4">

                                                <label className="form-label">
                                                    Start Date
                                                    <span className="text-danger">
                                                        {' '}*
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        individualStartDate
                                                    }
                                                    onChange={
                                                        setIndividualStartDate
                                                    }
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={
                                                        individualStartDate
                                                    }
                                                />

                                            </div>

                                        </div>


                                        <div className="col-md-6">

                                            <div className="mb-4">

                                                <label className="form-label">
                                                    End Date
                                                    <span className="text-danger">
                                                        {' '}*
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        individualEndDate
                                                    }
                                                    onChange={
                                                        setIndividualEndDate
                                                    }
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={
                                                        individualEndDate
                                                    }
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mt-5"
                                    >
                                        Generate Individual Report
                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>


                    {/*ALL EMPLOYEE REPORT*/}

                    <div className="col-xl-6">

                        <div className="card h-100">

                            <div className="card-header">
                                <h4 className="mb-1">
                                    All Employee Attendance Report
                                </h4>

                                <p className="text-muted mb-0">
                                    Generate attendance summary for all employees.
                                </p>
                            </div>


                            <div className="card-body">

                                <form
                                    method="POST"
                                    action="/hr/report/attendance/all"
                                    target="_blank"
                                    onSubmit={
                                        handleAllReportSubmit
                                    }
                                >

                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            (
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]'
                                                    ) as HTMLMetaElement
                                            )?.content ?? ''
                                        }
                                    />


                                    <div className="row">

                                        <div className="col-md-6">

                                            <div className="mb-4">

                                                <label className="form-label">
                                                    Start Date
                                                    <span className="text-danger">
                                                        {' '}*
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        allStartDate
                                                    }
                                                    onChange={
                                                        setAllStartDate
                                                    }
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={
                                                        allStartDate
                                                    }
                                                />

                                            </div>

                                        </div>


                                        <div className="col-md-6">

                                            <div className="mb-4">

                                                <label className="form-label">
                                                    End Date
                                                    <span className="text-danger">
                                                        {' '}*
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        allEndDate
                                                    }
                                                    onChange={
                                                        setAllEndDate
                                                    }
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={
                                                        allEndDate
                                                    }
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate All Employee Report
                                    </button>

                                </form>


                                <hr className="my-4" />


                                {/* =================================================
                                    MONTHLY
                                ================================================== */}

                                <form
                                    method="POST"
                                    action="/hr/report/attendance/monthly"
                                    target="_blank"
                                >

                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            (
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]'
                                                    ) as HTMLMetaElement
                                            )?.content ?? ''
                                        }
                                    />


                                    <div className="mb-4">

                                        <label className="form-label">
                                            Attendance Month
                                        </label>

                                        <DatePicker
                                            value={
                                                monthlyMonth
                                            }
                                            mode="month"
                                            onChange={
                                                setMonthlyMonth
                                            }
                                        />

                                        <input
                                            type="hidden"
                                            name="month"
                                            value={
                                                monthlyMonth
                                            }
                                        />

                                    </div>


                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate Monthly Report
                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </>
    );
};

export default Reports;