<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Individual Attendance Report</title>

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

        .body {
            margin-top: 30px;
        }

        .body h3 {
            text-align: center;
            font-size: 22px;
            margin-bottom: 20px;
        }

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

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }

        th,
        td {
            border: 1px solid #d8d8d8;
            padding: 6px 5px;
            text-align: center;
            vertical-align: middle;
        }

        th {
            background: #f7f7f7;
            font-weight: 700;
        }

        .text-left {
            text-align: left;
        }

        .summary {
            margin-top: 25px;
        }

        .summary h4 {
            font-size: 16px;
            margin-bottom: 10px;
        }

        .summary-table {
            width: 100%;
        }

        .summary-table td {
            width: 25%;
        }

        .summary-label {
            font-weight: 700;
        }

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
            <span>Office Address:</span>
            {{ $configure->address }}
        </p>

        <p>
            <span>Contact No.:</span>
            {{ $configure->phone }},
            Email: {{ $configure->email }}
        </p>

    </div>


    {{-- REPORT --}}
    <div class="body">

        <h3>
            Individual Attendance Report
        </h3>


        {{-- INFORMATION --}}
        <div class="information">

            <div class="left">

                <p>
                    <span>Date:</span>
                    {{ now()->format('d F, Y') }}
                </p>

                <p>
                    <span>From:</span>
                    {{
                        \Carbon\Carbon::parse(
                            $start_date
                        )->format('d F, Y')
                    }}

                    <span>To:</span>
                    {{
                        \Carbon\Carbon::parse(
                            $end_date
                        )->format('d F, Y')
                    }}
                </p>

            </div>


            <div class="right">

                <p>
                    <span>Employee Name:</span>
                    {{ $employee['name'] ?? '-' }}
                </p>

                <p>
                    <span>Employee ID:</span>
                    #{{ $employee['employee_id'] ?? '-' }}
                </p>

            </div>

        </div>


        {{-- ATTENDANCE TABLE --}}
        @if (!empty($rows) && count($rows) > 0)

            <table>

                <thead>

                    <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>In Note</th>
                        <th>Check Out</th>
                        <th>Out Note</th>
                        <th>Late</th>
                        <th>Early</th>
                        <th>Hours Worked</th>
                    </tr>

                </thead>

                <tbody>

                    @foreach ($rows as $row)

                        <tr>

                            <td>
                                {{
                                    \Carbon\Carbon::parse(
                                        $row['date']
                                    )->format('d M, Y')
                                }}
                            </td>

                            <td>
                                {{ $row['attendance_status'] ?? '-' }}
                            </td>

                            <td>
                                {{ $row['checked_in_at'] ?? '-' }}
                            </td>

                            <td class="text-left">
                                {{ $row['checked_in_at_note'] ?? '-' }}
                            </td>

                            <td>
                                {{ $row['checked_out_at'] ?? '-' }}
                            </td>

                            <td class="text-left">
                                {{ $row['checked_out_at_note'] ?? '-' }}
                            </td>

                            <td>
                               @if (($row['is_late'] ?? false))
    Yes
    @if (($row['minutes_late'] ?? 0) > 0)
        ({{ $row['minutes_late'] }} min)
    @endif
@else
    No
@endif
                            </td>

                            <td>
                               @if (($row['is_early'] ?? false))
    Yes
    @if (($row['minutes_early'] ?? 0) > 0)
        ({{ $row['minutes_early'] }} min)
    @endif
@else
    No
@endif
                            </td>

                            <td>
                                {{
                                    number_format(
                                        (float) (
                                            $row['hours_worked'] ?? 0
                                        ),
                                        2
                                    )
                                }}
                            </td>

                        </tr>

                    @endforeach

                </tbody>

            </table>

        @else

            <p style="text-align:center;padding:30px;">
                No attendance records found.
            </p>

        @endif


        {{-- SUMMARY --}}
        @if (!empty($summary))

            <div class="summary">

                <h4>
                    Attendance Summary
                </h4>

                <table class="summary-table">

                    <tr>

                        <td>
                            <span class="summary-label">
                                Working Days
                            </span>
                            <br>
                            {{ $summary['working_days'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Present
                            </span>
                            <br>
                            {{ $summary['present'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Home
                            </span>
                            <br>
                            {{ $summary['home'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Absent
                            </span>
                            <br>
                            {{ $summary['absent'] ?? 0 }}
                        </td>

                    </tr>

                    <tr>

                        <td>
                            <span class="summary-label">
                                Leave
                            </span>
                            <br>
                            {{ $summary['leave'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Late
                            </span>
                            <br>
                            {{ $summary['late'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Early
                            </span>
                            <br>
                            {{ $summary['early'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Late Minutes
                            </span>
                            <br>
                            {{ $summary['late_minutes'] ?? 0 }}
                        </td>

                    </tr>

                    <tr>

                        <td>
                            <span class="summary-label">
                                Early Minutes
                            </span>
                            <br>
                            {{ $summary['early_minutes'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Targeted Hours
                            </span>
                            <br>
                            {{ $summary['targeted_hours'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Hours Worked
                            </span>
                            <br>
                            {{ $summary['hours_worked'] ?? 0 }}
                        </td>

                        <td>
                            <span class="summary-label">
                                Remaining Hours
                            </span>
                            <br>
                            {{ $summary['remaining_hours'] ?? 0 }}
                        </td>

                    </tr>

                </table>

            </div>

        @endif

    </div>

</section>


{{-- DOWNLOAD --}}
@if (request()->input('download') !== 'pdf')

    <div class="download-pdf">

        <div class="download-inner">

            <div>
                <strong>Attendance Report:</strong>
                Individual Attendance Report
            </div>

            <form
                action="{{ route('hr.report.attendance.individual') }}"
                method="POST"
            >

                @csrf

                <input
                    type="hidden"
                    name="person"
                    value="{{ $employee['id'] ?? '' }}"
                >

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