<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Monthly Attendance Report
    </title>


    <style>

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }


        body {

            font-family: Arial, sans-serif;

            padding: 20px;

            color: #222;

            padding-bottom: 80px;
        }


        .report {

            width: 100%;

            max-width: 1000px;

            margin: auto;

            padding: 35px 20px;

            background: #fff;

            border: 2px dashed #ddd;

            border-radius: 8px;
        }


        /* HEADER */

        .header {

            text-align: center;

            padding-bottom: 25px;

            border-bottom: 1px solid #ddd;
        }


        .header h1 {

            font-size: 28px;

            margin-bottom: 10px;
        }


        .header p {

            font-size: 14px;

            line-height: 1.5;
        }


        .header span {

            font-weight: 700;
        }


        /* BODY */

        .body {

            margin-top: 30px;
        }


        .body h3 {

            text-align: center;

            font-size: 22px;

            margin-bottom: 20px;
        }


        /* INFORMATION */

        .information {

            width: 100%;

            margin-bottom: 20px;

            font-size: 14px;

            overflow: hidden;
        }


        .left {

            float: left;

            width: 50%;
        }


        .right {

            float: right;

            width: 50%;

            text-align: right;
        }


        .information p {

            margin-bottom: 7px;
        }


        .information span {

            font-weight: 700;
        }


        /* TABLE */

        table {

            width: 100%;

            border-collapse: collapse;

            font-size: 10px;

            table-layout: fixed;
        }


        th,
        td {

            border: 1px solid #d8d8d8;

            padding: 6px 4px;

            text-align: center;

            vertical-align: middle;

            word-wrap: break-word;
        }


        th {

            background: #f7f7f7;

            font-weight: 700;
        }


        .employee {

            text-align: left;

            width: 150px;
        }


        .employee-name {

            font-weight: 700;
        }


        .employee-id {

            font-size: 9px;

            color: #555;
        }


        /* DOWNLOAD */

        .download-pdf {

            position: fixed;

            left: 0;

            right: 0;

            bottom: 0;

            height: 60px;

            background: #fff;

            border-top: 1px solid #ddd;
        }


        .download-inner {

            width: 100%;

            max-width: 1000px;

            height: 60px;

            margin: auto;

            padding: 0 10px;

            display: flex;

            align-items: center;

            justify-content: space-between;
        }


        .download-button {

            width: 140px;

            height: 40px;

            background: #0066ff;

            border: 1px solid #0066ff;

            border-radius: 5px;

            color: #fff;

            font-size: 14px;

            cursor: pointer;
        }


        @page {

            size: A4 landscape;

            margin: 15px;
        }


        @media print {

            body {

                padding: 0;
            }


            .report {

                border: none;

                padding: 10px;
            }


            .download-pdf {

                display: none;
            }

        }

    </style>

</head>


<body>


<section class="report">


    {{-- COMPANY HEADER --}}

    <div class="header">

        <h1>
            {{ $configure->name }}
        </h1>


        <p>

            <span>
                Office Address:
            </span>

            {{ $configure->address }}

        </p>


        <p>

            <span>
                Contact No.:
            </span>

            {{ $configure->phone }}

            ,

            Email:

            {{ $configure->email }}

        </p>

    </div>


    {{-- REPORT BODY --}}

    <div class="body">


        <h3>
            Monthly Attendance Report
        </h3>


        {{-- INFORMATION --}}

        <div class="information">


            <div class="left">

                <p>

                    <span>
                        Date:
                    </span>

                    {{ now()->format('d F, Y') }}

                </p>


                <p>

                    <span>
                        Month:
                    </span>

                    {{
                        \Carbon\Carbon::parse(
                            $month . '-01'
                        )->format('F, Y')
                    }}

                </p>

            </div>


            <div class="right">

                <p>

                    <span>
                        Employee Name:
                    </span>

                    All Employee

                </p>


                <p>

                    <span>
                        Employee ID:
                    </span>

                    All Employee

                </p>

            </div>


        </div>


        {{-- TABLE --}}

        @if(
            !empty($employeeAttendances) &&
            count($employeeAttendances) > 0
        )

            <table>

                <thead>

                    <tr>

                        <th class="employee">
                            Employee
                        </th>

                        <th>
                            Working<br>Days
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
                            Late<br>Hours
                        </th>

                        <th>
                            Early<br>Hours
                        </th>

                        <th>
                            Targeted<br>Hours
                        </th>

                        <th>
                            Hours<br>Worked
                        </th>

                        <th>
                            Remaining<br>Hours
                        </th>

                    </tr>

                </thead>


                <tbody>


                    @foreach(
                        $employeeAttendances
                        as $employee
                    )

                        <tr>


                            {{-- EMPLOYEE --}}

                            <td class="employee">

                                <div class="employee-name">

                                    {{
                                        ucwords(
                                            $employee[
                                                'employee_name'
                                            ] ?? '-'
                                        )
                                    }}

                                </div>


                                <div class="employee-id">

                                    #
                                    {{
                                        $employee[
                                            'employee_id'
                                        ] ?? '-'
                                    }}

                                </div>

                            </td>


                            {{-- WORKING DAYS --}}

                            <td>
                                {{
                                    $employee[
                                        'total_working_days'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- PRESENT --}}

                            <td>
                                {{
                                    $employee[
                                        'total_present'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- HOME --}}

                            <td>
                                {{
                                    $employee[
                                        'total_home'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- ABSENT --}}

                            <td>
                                {{
                                    $employee[
                                        'total_absent'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- LEAVE --}}

                            <td>
                                {{
                                    $employee[
                                        'total_leave'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- LATE --}}

                            <td>
                                {{
                                    $employee[
                                        'total_late'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- EARLY --}}

                            <td>
                                {{
                                    $employee[
                                        'total_early'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- LATE HOURS --}}

                            <td>

                                @php

                                    $minutes =
                                        (int) (
                                            $employee[
                                                'total_minutes_late'
                                            ] ?? 0
                                        );

                                    $hours =
                                        floor(
                                            $minutes / 60
                                        );

                                    $mins =
                                        $minutes % 60;

                                @endphp

                                {{ $hours }}:{{
                                    str_pad(
                                        $mins,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- EARLY HOURS --}}

                            <td>

                                @php

                                    $minutes =
                                        (int) (
                                            $employee[
                                                'total_minutes_early'
                                            ] ?? 0
                                        );

                                    $hours =
                                        floor(
                                            $minutes / 60
                                        );

                                    $mins =
                                        $minutes % 60;

                                @endphp

                                {{ $hours }}:{{
                                    str_pad(
                                        $mins,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- TARGETED HOURS --}}

                            <td>

                                @php

                                    $target =
                                        (float) (
                                            $employee[
                                                'total_targeted_hours'
                                            ] ?? 0
                                        );

                                    $minutes =
                                        round(
                                            $target * 60
                                        );

                                    $hours =
                                        floor(
                                            $minutes / 60
                                        );

                                    $mins =
                                        $minutes % 60;

                                @endphp

                                {{ $hours }}:{{
                                    str_pad(
                                        $mins,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- WORKED HOURS --}}

                            <td>

                                @php

                                    $worked =
                                        (float) (
                                            $employee[
                                                'total_hours_worked'
                                            ] ?? 0
                                        );

                                    $minutes =
                                        round(
                                            $worked * 60
                                        );

                                    $hours =
                                        floor(
                                            $minutes / 60
                                        );

                                    $mins =
                                        $minutes % 60;

                                @endphp

                                {{ $hours }}:{{
                                    str_pad(
                                        $mins,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- REMAINING HOURS --}}

                            <td>

                                @php

                                    $remaining =
                                        isset(
                                            $employee[
                                                'remaining_hours'
                                            ]
                                        )
                                        ? (float)
                                            $employee[
                                                'remaining_hours'
                                            ]
                                        : max(
                                            0,
                                            $target -
                                            $worked
                                        );

                                    $minutes =
                                        round(
                                            $remaining * 60
                                        );

                                    $hours =
                                        floor(
                                            $minutes / 60
                                        );

                                    $mins =
                                        $minutes % 60;

                                @endphp


                                @if($minutes > 0)

                                    {{ $hours }}:{{
                                        str_pad(
                                            $mins,
                                            2,
                                            '0',
                                            STR_PAD_LEFT
                                        )
                                    }}

                                @else

                                    0:00

                                @endif

                            </td>


                        </tr>

                    @endforeach


                </tbody>

            </table>


        @else

            <p style="text-align:center;padding:30px;">

                No attendance records found
                for this month.

            </p>

        @endif


    </div>

</section>


{{-- =========================================================
     DOWNLOAD BAR
========================================================== --}}

@if (request()->input('download') !== 'pdf')

    <div class="download-pdf">

        <div class="download-inner">


            <div>

                <strong>
                    Attendance Report:
                </strong>

                Monthly Attendance Report

            </div>


            <form
                action="{{ route('hr.report.attendance.monthly') }}"
                method="POST"
            >

                @csrf


                <input
                    type="hidden"
                    name="month"
                    value="{{ $month }}"
                >


                <button
                    type="submit"
                    name="download"
                    value="pdf"
                    class="download-button"
                >
                    Download PDF
                </button>

            </form>


        </div>

    </div>

@endif


</body>

</html>