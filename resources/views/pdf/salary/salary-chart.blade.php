<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Employee Salary Chart
    </title>

    <style>

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family:
                Arial,
                Helvetica,
                sans-serif;

            color: #222;

            font-size: 13px;

            background: #f4f6f9;

            padding: 10px;
        }

        .report {
            width: 100%;

            margin: 0;

            padding: 20px;

            background: #fff;

            border: 1px solid #e1e5ea;

            border-radius: 8px;

            /* box-shadow:
                0 3px 12px
                rgba(0, 0, 0, 0.08); */
        }

        .header {
            text-align: center;

            margin-bottom: 30px;
        }

        .company-name {
            font-size: 28px;

            font-weight: 700;

            color: #0d6efd;

            margin-bottom: 8px;
        }

        .company-info {
            font-size: 13px;

            color: #555;

            line-height: 21px;
        }

        .report-title {
            margin-top: 18px;

            font-size: 21px;

            font-weight: 700;

            color: #222;
        }

        .report-month {
            margin-top: 7px;

            font-size: 15px;

            font-weight: 600;

            color: #666;
        }

        .table-wrapper {
            width: 100%;

            overflow-x: auto;

            overflow-y: visible;

            margin-top: 15px;

            border: 1px solid #e0e3e7;

            border-radius: 5px;
        }

        table {
            width: 100%;

            min-width: 1450px;

            border-collapse: collapse;

            table-layout: fixed;
        }

        thead {
            background: #f1f3f5;
        }

        th {
            font-size: 12px;

            font-weight: 700;

            padding: 12px 7px;

            border: 1px solid #d6dbe0;

            text-align: center;

            vertical-align: middle;

            line-height: 17px;

            white-space: normal;
        }

        td {
            font-size: 12px;

            padding: 11px 7px;

            border: 1px solid #e0e3e7;

            text-align: center;

            vertical-align: middle;

            line-height: 17px;
        }

        tbody tr:hover {
            background: #fafafa;
        }

        .employee {
            text-align: left;

            font-weight: 600;
        }

        .employee-id {
            display: block;

            margin-top: 4px;

            font-size: 10px;

            color: #777;

            font-weight: 400;
        }

        .total-row td {
            font-weight: 700;

            background: #f8f9fa;
        }

        .total-label {
            text-align: right;
        }

        .approval-area {
            margin-top: 70px;

            display: table;

            width: 100%;

            table-layout: fixed;
        }

        .approval-item {
            display: table-cell;

            text-align: center;

            width: 33.33%;
        }

        .approval-line {
            display: inline-block;

            width: 180px;

            padding-top: 9px;

            border-top: 1px solid #333;

            font-size: 11px;

            color: #333;
        }

        .footer {
            margin-top: 25px;

            text-align: right;

            font-size: 10px;

            color: #999;
        }

        .download-section {
            width: 100%;

            margin-top: 18px;

            padding: 0 5px 20px;

            display: flex;

            justify-content: flex-end;

            position: sticky;

            bottom: 0;

            z-index: 20;

            pointer-events: none;
        }

        .download-button {
            pointer-events: auto;

            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 8px;

            min-width: 160px;

            height: 46px;

            padding: 0 24px;

            border: 1px solid #0d6efd;

            border-radius: 6px;

            background: #0d6efd;

            color: #fff;

            font-size: 14px;

            font-weight: 600;

            text-decoration: none;

            cursor: pointer;

            box-shadow:
                0 3px 10px
                rgba(0, 0, 0, 0.15);
        }

        .download-button:hover {
            background: #0b5ed7;

            border-color: #0b5ed7;

            color: #fff;
        }

        .download-icon {
            width: 18px;

            height: 18px;

            fill: currentColor;
        }

        @media print {

            body {
                background: #fff;

                padding: 0;
            }

            .report {
                padding: 0;

                border: 0;

                box-shadow: none;

                border-radius: 0;
            }

            .download-section {
                display: none;
            }

            .table-wrapper {
                overflow: visible;

                border: 0;
            }

            table {
                min-width: 0;
            }

        }

        @media (max-width: 768px) {

            body {
                padding: 12px;
            }

            .report {
                padding: 18px;
            }

            .company-name {
                font-size: 23px;
            }

            .report-title {
                font-size: 18px;
            }

            .download-section {
                justify-content: center;
            }

            .download-button {
                width: 100%;
            }

        }

    </style>

</head>

<body>

    <div class="report">

        <div class="header">

            <div class="company-name">
                {{ $configure->name }}
            </div>

            <div class="company-info">
                {{ $configure->address }}
            </div>

            <div class="company-info">

                {{ $configure->phone }}

                @if ($configure->email)

                    , Email:
                    {{ $configure->email }}

                @endif

            </div>

            <div class="report-title">
                Employee Salary Chart
            </div>

            <div class="report-month">

                {{ \Carbon\Carbon::createFromFormat(
                    'Y-m',
                    $month
                )->format('F, Y') }}

            </div>

        </div>


        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th style="width: 3%;">
                            Sl
                        </th>

                        <th style="width: 12%;">
                            Employee
                        </th>

                        <th style="width: 6%;">
                            Basic
                        </th>

                        <th style="width: 6%;">
                            Transport
                        </th>

                        <th style="width: 6%;">
                            Family
                        </th>

                        <th style="width: 6%;">
                            Others
                        </th>

                        <th style="width: 7%;">
                            Gross
                        </th>

                        <th style="width: 6%;">
                            Loan
                        </th>

                        <th style="width: 6%;">
                            Advance
                        </th>

                        <th style="width: 6%;">
                            Absent
                        </th>

                        <th style="width: 7%;">
                            Consecutive Late
                        </th>

                        <th style="width: 6%;">
                            Late
                        </th>

                        <th style="width: 7%;">
                            Remaining Time
                        </th>

                        <th style="width: 7%;">
                            Total Deduction
                        </th>

                        <th style="width: 7%;">
                            Net Salary
                        </th>

                    </tr>

                </thead>

                <tbody>

                    @foreach ($salaries as $salary)

                        <tr>

                            <td>
                                {{ $loop->iteration }}
                            </td>

                            <td class="employee">

                                {{ $salary->user->name }}

                                <span class="employee-id">
                                    #{{ $salary->user->employee_id }}
                                </span>

                            </td>

                            <td>
                                {{ number_format($salary->basic_salary, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->transport_allowance, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->family_allowance, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->others_allowance, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->gross_salary, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->loan_deduction, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->salary_advance, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->absent_deduction, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->consecutive_late_deduction, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->late_minutes_deduction, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->remaining_minutes_deduction, 2) }}
                            </td>

                            <td>
                                {{ number_format($salary->total_deductions, 2) }}
                            </td>

                            <td>

                                <strong>
                                    {{ number_format($salary->net_salary, 2) }}
                                </strong>

                            </td>

                        </tr>

                    @endforeach

                    <tr class="total-row">

                        <td
                            colspan="14"
                            class="total-label"
                        >
                            Total Net Salary
                        </td>

                        <td>

                            {{ number_format(
                                $salaries->sum('net_salary'),
                                2
                            ) }}

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>


        <div class="approval-area">

            <div class="approval-item">

                <span class="approval-line">
                    Prepared by: Admin
                </span>

            </div>

            <div class="approval-item">

                <span class="approval-line">
                    Checked by
                </span>

            </div>

            <div class="approval-item">

                <span class="approval-line">
                    Authorized by
                </span>

            </div>

        </div>


        <div class="footer">

            Generated on
            {{ now()->format('d M Y, h:i A') }}

        </div>

    </div>


    <div class="download-section">

        <a
            href="{{ route(
                'hr.salary.chart',
                [
                    'month' => $month,
                    'download' => 'pdf',
                ]
            ) }}"
            class="download-button"
        >

            <svg
                class="download-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path
                    d="M12 3a1 1 0 0 1 1 1v9.586l3.293-3.293
                    a1 1 0 1 1 1.414 1.414l-5 5
                    a1 1 0 0 1-1.414 0l-5-5
                    a1 1 0 1 1 1.414-1.414L11 13.586V4
                    a1 1 0 0 1 1-1z"
                />

                <path
                    d="M5 19a1 1 0 0 1 1-1h12
                    a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z"
                />

            </svg>

            Download PDF

        </a>

    </div>

</body>

</html>