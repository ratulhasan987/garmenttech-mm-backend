<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <title>
        Employee Salary Chart
    </title>

    <style>

        @page {
            size: A4 landscape;

            margin: 10mm;
        }

        * {
            margin: 0;

            padding: 0;

            box-sizing: border-box;
        }

        body {
            font-family:
                DejaVu Sans,
                Arial,
                Helvetica,
                sans-serif;

            color: #222;

            font-size: 7px;
        }

        .report {
            width: 100%;
        }

        .header {
            text-align: center;

            margin-bottom: 14px;
        }

        .company-name {
            font-size: 18px;

            font-weight: bold;

            color: #0d6efd;

            margin-bottom: 4px;
        }

        .company-info {
            font-size: 7.5px;

            color: #555;

            line-height: 11px;
        }

        .report-title {
            margin-top: 8px;

            font-size: 12px;

            font-weight: bold;

            color: #222;
        }

        .report-month {
            margin-top: 3px;

            font-size: 8px;

            font-weight: bold;

            color: #666;
        }

        table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
        }

        thead {
            display: table-header-group;
        }

        tr {
            page-break-inside: avoid;
        }

        th {
            background: #f1f3f5;

            font-size: 6.5px;

            font-weight: bold;

            padding: 5px 2px;

            border: 0.5px solid #cfd4da;

            text-align: center;

            vertical-align: middle;

            line-height: 8px;
        }

        td {
            font-size: 6.5px;

            padding: 4px 2px;

            border: 0.5px solid #dfe3e7;

            text-align: center;

            vertical-align: middle;

            line-height: 8px;
        }

        .employee {
            text-align: left;

            font-weight: bold;
        }

        .employee-id {
            display: block;

            margin-top: 1px;

            font-size: 5px;

            color: #777;

            font-weight: normal;
        }

        .total-row td {
            font-weight: bold;

            background: #f8f9fa;
        }

        .total-label {
            text-align: right;
        }

        .approval-area {
            margin-top: 30px;

            width: 100%;

            display: table;

            table-layout: fixed;
        }

        .approval-item {
            display: table-cell;

            width: 33.33%;

            text-align: center;
        }

        .approval-line {
            display: inline-block;

            width: 110px;

            padding-top: 5px;

            border-top: 0.7px solid #333;

            font-size: 6.5px;
        }

        .footer {
            margin-top: 10px;

            text-align: right;

            font-size: 5.5px;

            color: #999;
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

                                {{ number_format(
                                    $salary->net_salary,
                                    2
                                ) }}

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

</body>

</html>