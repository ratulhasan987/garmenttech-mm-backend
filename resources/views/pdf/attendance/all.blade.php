<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        http-equiv="X-UA-Compatible"
        content="ie=edge"
    >

    <meta
        http-equiv="Content-Type"
        content="text/html; charset=utf-8"
    >

    <link
        rel="icon"
        href="{{ asset($configure->logo) }}"
        type="image/x-icon"
    >

    <link
        rel="shortcut icon"
        href="{{ asset($configure->logo) }}"
        type="image/x-icon"
    >

    <title>
        All Employee Attendance Report
    </title>


    <style>

        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }


        body {

            font-family: Arial, sans-serif;

            margin: 0;

            padding: 20px;

            padding-bottom: 90px;

            color: #222;

            background: #fff;
        }


        .report {

            width: 100%;

            max-width: 1000px;

            margin: 0 auto;

            padding: 35px 20px;

            background: #fff;

            border-radius: 8px;

            border: 2px dashed #ddd;
        }


        /* =========================================================
           HEADER
        ========================================================== */

        .header {

            text-align: center;

            padding-bottom: 25px;

            border-bottom: 1px solid #ddd;
        }


        .header h1 {

            margin-bottom: 10px;

            font-size: 28px;

            color: #333;
        }


        .header p {

            font-size: 14px;

            line-height: 1.5;

            color: #333;
        }


        .header p span {

            font-weight: 700;
        }


        /* =========================================================
           BODY
        ========================================================== */

        .body {

            margin-top: 30px;
        }


        .body h3 {

            font-size: 22px;

            margin-bottom: 20px;

            text-align: center;

            color: #222;
        }


        /* =========================================================
           INFORMATION
        ========================================================== */

        .information {

            width: 100%;

            margin-bottom: 20px;

            font-size: 14px;

            overflow: hidden;
        }


        .information .left {

            float: left;

            width: 50%;
        }


        .information .right {

            float: right;

            width: 50%;

            text-align: right;
        }


        .information p {

            margin-bottom: 7px;

            line-height: 1.4;
        }


        .information span {

            font-weight: 700;
        }


        /* =========================================================
           TABLE
        ========================================================== */

        table {

            width: 100%;

            border-collapse: collapse;

            font-size: 10px;

            table-layout: fixed;
        }


        th,
        td {

            padding: 6px 4px;

            text-align: center;

            vertical-align: middle;

            border: 1px solid #d8d8d8;

            word-wrap: break-word;

            white-space: normal;
        }


        thead th {

            font-weight: 700;

            background: #f7f7f7;

            color: #111;
        }


        .employee {

            text-align: left;

            width: 150px;
        }


        .employee-name {

            font-weight: 700;

            margin-bottom: 2px;
        }


        .employee-id {

            font-size: 9px;

            color: #555;
        }


        /* =========================================================
           FOOTER / PDF BAR
        ========================================================== */

        .download-pdf {

            position: fixed;

            left: 0;

            right: 0;

            bottom: 0;

            height: 60px;

            background: #fff;

            border-top: 1px solid #ddd;

            display: flex;

            align-items: center;

            z-index: 999;
        }


        .download-pdf-inner {

            width: 100%;

            max-width: 1000px;

            margin: 0 auto;

            display: flex;

            justify-content: space-between;

            align-items: center;

            padding: 0 10px;
        }


        .download-label {

            font-size: 14px;
        }


        .download-label strong {

            margin-right: 5px;
        }


        .download-button {

            width: 140px;

            height: 40px;

            border: 1px solid #0066ff;

            background: #0066ff;

            color: #fff;

            font-size: 14px;

            border-radius: 5px;

            cursor: pointer;
        }


        .download-button:hover {

            background: transparent;

            color: #0066ff;
        }


        /* =========================================================
           PRINT
        ========================================================== */

        @media print {

            body {

                padding: 0;
            }


            .report {

                max-width: none;

                margin: 0;

                border: none;

                padding: 10px;
            }


            .download-pdf {

                display: none;
            }


            table {

                font-size: 9px;
            }

        }


        /* =========================================================
           PAGE
        ========================================================== */

        @page {

            size: A4 landscape;

            margin: 15px;
        }


        .page-break {

            page-break-after: always;
        }

    </style>

</head>


<body>


<section class="report">


    {{-- =========================================================
         COMPANY HEADER
    ========================================================== --}}

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


    {{-- =========================================================
         REPORT BODY
    ========================================================== --}}

    <div class="body">


        <h3>
            All Employee Attendance Report
        </h3>


        {{-- =====================================================
             REPORT INFORMATION
        ====================================================== --}}

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
                        From:
                    </span>

                    {{
                        \Carbon\Carbon::parse(
                            $start_date
                        )->format('d F, Y')
                    }}


                    <span>
                        To:
                    </span>

                    {{
                        \Carbon\Carbon::parse(
                            $end_date
                        )->format('d F, Y')
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


        {{-- =====================================================
             TABLE
        ====================================================== --}}

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


                            {{-- Employee --}}

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


                            {{-- Working Days --}}

                            <td>
                                {{
                                    $employee[
                                        'total_working_days'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- Present --}}

                            <td>
                                {{
                                    $employee[
                                        'total_present'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- Home --}}

                            <td>
                                {{
                                    $employee[
                                        'total_home'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- Absent --}}

                            <td>
                                {{
                                    $employee[
                                        'total_absent'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- Leave --}}

                            <td>
                                {{
                                    $employee[
                                        'total_leave'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- Late --}}

                            <td>
                                {{
                                    $employee[
                                        'total_late'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- Early --}}

                            <td>
                                {{
                                    $employee[
                                        'total_early'
                                    ] ?? 0
                                }}
                            </td>


                            {{-- Late Hours --}}

                            <td>

                                @php

                                    $lateMinutes =
                                        (int) (
                                            $employee[
                                                'total_minutes_late'
                                            ] ?? 0
                                        );

                                    $lateHours =
                                        floor(
                                            $lateMinutes / 60
                                        );

                                    $lateRemainingMinutes =
                                        $lateMinutes % 60;

                                @endphp


                                {{
                                    $lateHours
                                }}:{{
                                    str_pad(
                                        $lateRemainingMinutes,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- Early Hours --}}

                            <td>

                                @php

                                    $earlyMinutes =
                                        (int) (
                                            $employee[
                                                'total_minutes_early'
                                            ] ?? 0
                                        );

                                    $earlyHours =
                                        floor(
                                            $earlyMinutes / 60
                                        );

                                    $earlyRemainingMinutes =
                                        $earlyMinutes % 60;

                                @endphp


                                {{
                                    $earlyHours
                                }}:{{
                                    str_pad(
                                        $earlyRemainingMinutes,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- Targeted Hours --}}

                            <td>

                                @php

                                    $targetedHours =
                                        (float) (
                                            $employee[
                                                'total_targeted_hours'
                                            ] ?? 0
                                        );

                                    $targetedMinutes =
                                        round(
                                            $targetedHours * 60
                                        );

                                    $targetedHourPart =
                                        floor(
                                            $targetedMinutes / 60
                                        );

                                    $targetedMinutePart =
                                        $targetedMinutes % 60;

                                @endphp


                                {{
                                    $targetedHourPart
                                }}:{{
                                    str_pad(
                                        $targetedMinutePart,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- Hours Worked --}}

                            <td>

                                @php

                                    $workedHours =
                                        (float) (
                                            $employee[
                                                'total_hours_worked'
                                            ] ?? 0
                                        );

                                    $workedMinutes =
                                        round(
                                            $workedHours * 60
                                        );

                                    $workedHourPart =
                                        floor(
                                            $workedMinutes / 60
                                        );

                                    $workedMinutePart =
                                        $workedMinutes % 60;

                                @endphp


                                {{
                                    $workedHourPart
                                }}:{{
                                    str_pad(
                                        $workedMinutePart,
                                        2,
                                        '0',
                                        STR_PAD_LEFT
                                    )
                                }}

                            </td>


                            {{-- Remaining Hours --}}

                            <td>

                                @php

                                    /*
                                    |--------------------------------------------------------------------------
                                    | Prefer service-provided remaining_hours
                                    |--------------------------------------------------------------------------
                                    */

                                    if (
                                        isset(
                                            $employee[
                                                'remaining_hours'
                                            ]
                                        )
                                    ) {

                                        $remainingHoursValue =
                                            (float) $employee[
                                                'remaining_hours'
                                            ];

                                    } else {

                                        $remainingHoursValue =
                                            max(
                                                0,
                                                $targetedHours -
                                                $workedHours
                                            );

                                    }


                                    $remainingMinutes =
                                        round(
                                            $remainingHoursValue * 60
                                        );

                                    $remainingHourPart =
                                        floor(
                                            $remainingMinutes / 60
                                        );

                                    $remainingMinutePart =
                                        $remainingMinutes % 60;

                                @endphp


                                @if(
                                    $remainingMinutes > 0
                                )

                                    {{
                                        $remainingHourPart
                                    }}:{{
                                        str_pad(
                                            $remainingMinutePart,
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

            <p style="text-align:center; padding:30px;">

                No attendance records found
                for the selected criteria.

            </p>

        @endif


    </div>

</section>


{{-- =========================================================
     DOWNLOAD BAR
========================================================== --}}

@if (request()->input('download') !== 'pdf')

    <div class="download-pdf">

        <div class="download-pdf-inner">

            <div class="download-label">

                <strong>
                    Attendance Report:
                </strong>

                <span>
                    All Employee Attendance Report
                </span>

            </div>


            <form
                action="{{ route('hr.report.attendance.all') }}"
                method="POST"
            >

                @csrf


                <input
                    type="hidden"
                    name="start_date"
                    value="{{ $start_date }}"
                >


                <input
                    type="hidden"
                    name="end_date"
                    value="{{ $end_date }}"
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