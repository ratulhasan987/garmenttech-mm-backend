<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Salary Report -
        {{ $salary->user->name ?? 'Employee' }}
    </title>

    <style>
        * {
            box-sizing: border-box;
        }

        @page {
            size: A4 portrait;
            margin: 12mm;
        }

        html,
        body {
            margin: 0;
            padding: 0;
        }

        body {
            font-family:
                Arial,
                Helvetica,
                sans-serif;

            color: #222;
            background: #fff;

            font-size: 13px;
            line-height: 1.4;
        }

        .report {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }



        .header {
            width: 100%;

            display: table;
            table-layout: fixed;

            margin-bottom: 25px;
        }

        .header-left,
        .header-right {
            display: table-cell;

            vertical-align: top;

            width: 50%;
        }

        .header-right {
            text-align: right;
        }

        .company-name {
            color: #00a2ff;

            font-size: 26px;

            font-weight: 700;

            margin-bottom: 8px;
        }

        .header p {
            margin: 3px 0;

            font-size: 12px;
        }

        .report-title {
            color: #00a2ff;

            font-size: 25px;

            font-weight: 700;

            margin-top: 5px;
        }



        .employee-information {
            width: 100%;

            margin-bottom: 25px;
        }

        .employee-information table {
            width: 100%;

            border-collapse: collapse;
        }

        .employee-information th {
            background: #00a2ff;

            color: #fff;

            padding: 10px;

            text-align: left;

            font-size: 14px;
        }

        .employee-information td {
            padding: 7px 10px;

            border: 1px solid #e5e7eb;
        }

        .employee-name {
            font-size: 18px;

            font-weight: 700;
        }

        .employee-label {
            font-weight: 700;
        }



        .salary-table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
        }

        .salary-table thead {
            background: #00a2ff;

            color: #fff;
        }

        .salary-table th {
            padding: 10px 7px;

            border: 1px solid #ddd;

            font-size: 11px;

            text-align: center;
        }

        .salary-table td {
            padding: 9px 7px;

            border: 1px solid #ddd;

            font-size: 11px;

            text-align: center;
        }

        .salary-table td:first-child {
            text-align: left;
        }

        .gross-row {
            font-weight: 700;

            background: #f4faff;
        }

        .deduction-row td:first-child {
            text-align: left;
        }

        .total-row {
            font-weight: 700;

            font-size: 14px !important;
        }

        .net-salary {
            background: #00a2ff !important;

            color: #000 !important;

            font-weight: 700;
        }

        .net-salary td {
            background: #00a2ff !important;

            color: #000 !important;

            font-size: 15px !important;

            font-weight: 700;
        }


        .approval-area {
            margin-top: 70px;

            display: table;

            width: 100%;

            table-layout: fixed;
        }

        .approval-item {
            display: table-cell;

            width: 33.33%;

            text-align: center;
        }

        .approval-line {
            display: inline-block;

            width: 150px;

            border-top: 1px solid #333;

            padding-top: 7px;

            font-size: 11px;
        }



        .footer {
            margin-top: 25px;

            text-align: right;

            color: #777;

            font-size: 9px;
        }



        .print-actions {
            margin-top: 25px;

            text-align: center;
        }

        .print-button {
            display: inline-block;

            padding: 10px 20px;

            background: #00a2ff;

            color: #fff;

            border: 0;

            border-radius: 5px;

            cursor: pointer;

            font-size: 13px;
        }


        @media print {

            .print-actions {
                display: none !important;
            }

            .report {
                max-width: none;

                padding: 0;
            }

            .salary-table thead,
            .employee-information th,
            .net-salary,
            .net-salary td {
                -webkit-print-color-adjust: exact !important;

                print-color-adjust: exact !important;
            }
        }
    </style>
</head>


<body>

@php

    /*
    | Report Data:
    |
    | IMPORTANT:
    |
    | The controller sends the calculated report as:
    |
    |     $report
    |
    | We MUST use this data for deduction values.
    |
    | We should NOT directly use:
    |
    |     $salary->absent_deduction
    |     $salary->late_minutes_deduction
    |     $salary->remaining_minutes_deduction
    |
    | because those values may come from an already generated salary.
    |
    */

    $reportData =
        isset($report) && is_array($report)
            ? $report
            : (
                isset($deductions) && is_array($deductions)
                    ? $deductions
                    : []
            );


 //  Basic Salary Information

    $basicSalary =
        (float) (
            $reportData['basic_salary']
            ?? $salary->basic_salary
            ?? 0
        );

    $transportAllowance =
        (float) (
            $reportData['transport_allowance']
            ?? $salary->transport_allowance
            ?? 0
        );

    $familyAllowance =
        (float) (
            $reportData['family_allowance']
            ?? $salary->family_allowance
            ?? 0
        );

    $othersAllowance =
        (float) (
            $reportData['others_allowance']
            ?? $salary->others_allowance
            ?? 0
        );

    $overtime =
        (float) (
            $reportData['overtime']
            ?? $salary->overtime
            ?? 0
        );


  // Gross Salary
    $grossSalary =
        (float) (
            $reportData['gross_salary']
            ?? $salary->gross_salary
            ?? (
                $basicSalary
                + $transportAllowance
                + $familyAllowance
                + $othersAllowance
                + $overtime
            )
        );


  //  Fixed Deductions

    $loanDeduction =
        (float) (
            $reportData['loan_deduction']
            ?? $salary->loan_deduction
            ?? 0
        );

    $salaryAdvance =
        (float) (
            $reportData['salary_advance']
            ?? $salary->salary_advance
            ?? 0
        );


    /*
    | Absent Deduction
    |
    | The controller sets this to 0 when the rule is not selected.
    |
    */

    $totalAbsent =
        (float) (
            $reportData['total_absent']
            ?? 0
        );

    $absentDeduction =
        (float) (
            $reportData['absent_deduction']
            ?? 0
        );


    // Unpaid Leave

    $unpaidLeave =
        (float) (
            $reportData['unpaid_leave']
            ?? 0
        );

    $unpaidLeaveDeduction =
        (float) (
            $reportData['unpaid_leave_deduction']
            ?? 0
        );


    // Consecutive Late

    $totalConsecutiveLate =
        (float) (
            $reportData['total_consecutive_late']
            ?? 0
        );

    $consecutiveLateDeduction =
        (float) (
            $reportData['consecutive_late_deduction']
            ?? 0
        );


    $totalLateMinutes =
        (float) (
            $reportData['total_late_minutes']
            ?? 0
        );

    $lateMinutesDeduction =
        (float) (
            $reportData['late_minutes_deduction']
            ?? 0
        );


    $totalRemainingMinutes =
        (float) (
            $reportData['total_remaining_minutes']
            ?? 0
        );

    $remainingMinutesDeduction =
        (float) (
            $reportData['remaining_minutes_deduction']
            ?? 0
        );



    $totalDeductions =
        (float) (
            $reportData['total_deductions']
            ?? (
                $loanDeduction
                + $salaryAdvance
                + $absentDeduction
                + $unpaidLeaveDeduction
                + $consecutiveLateDeduction
                + $lateMinutesDeduction
                + $remainingMinutesDeduction
            )
        );



    $netSalary =
        (float) (
            $reportData['net_salary']
            ?? (
                $grossSalary
                - $totalDeductions
            )
        );


    /*
    | Selected Rules
    |
    | These are not used to hide rows.
    |
    | All rows remain visible.
    |
    | They are useful only for determining whether the
    | corresponding amount should be calculated.
    |
    */

    $rules =
        $reportData['rules']
        ?? [];

    $applyAbsent =
        (bool) (
            $rules['absent_deduction']
            ?? false
        );

    $applyConsecutive =
        (bool) (
            $rules['consecutive_deduction']
            ?? false
        );

    $applyLate =
        (bool) (
            $rules['late_deduction']
            ?? false
        );

    $applyPenaltyAbsent =
        (bool) (
            $rules['penalty_absent_deduction']
            ?? false
        );

    $applyRemainingTime =
        (bool) (
            $rules['remaining_time_deduction']
            ?? false
        );

@endphp


<div class="report">


    <div class="header">

        <div class="header-left">

            <div class="company-name">
                {{ $configure->name ?? 'Company' }}
            </div>

            <p>
                {{ $configure->address ?? '' }}
            </p>

            <p>

                {{ $configure->phone ?? '' }}

                @if (!empty($configure->email))
                    , Email: {{ $configure->email }}
                @endif

            </p>

        </div>


        <div class="header-right">

            <div class="report-title">
                SALARY REPORT
            </div>

            <p>
                {{ \Carbon\Carbon::parse($salary->month)->format('F, Y') }}
            </p>

        </div>

    </div>


    <div class="employee-information">

        <table>

            <tr>

                <th colspan="2">
                    Employee Information
                </th>

            </tr>


            <tr>

                <td>

                    <span class="employee-label">
                        Name:
                    </span>

                    <span class="employee-name">
                        {{ $salary->user->name ?? '-' }}
                    </span>

                </td>


                <td>

                    <span class="employee-label">
                        Employee ID:
                    </span>

                    #{{ $salary->user->employee_id ?? '-' }}

                </td>

            </tr>


            <tr>

                <td>

                    <span class="employee-label">
                        Phone:
                    </span>

                    {{ $salary->user->phone ?? '-' }}

                </td>


                <td>

                    <span class="employee-label">
                        Email:
                    </span>

                    {{ $salary->user->email ?? '-' }}

                </td>

            </tr>


            <tr>

                <td>

                    <span class="employee-label">
                        Address:
                    </span>

                    {{ $salary->user->address ?? '-' }}

                </td>


                <td>

                    <span class="employee-label">
                        Salary Month:
                    </span>

                    {{ \Carbon\Carbon::parse($salary->month)->format('F, Y') }}

                </td>

            </tr>

        </table>

    </div>



    <table class="salary-table">

        <thead>

            <tr>

                <th style="width: 40%;">
                    Description
                </th>

                <th style="width: 15%;">
                    Gross Amount
                </th>

                <th style="width: 15%;">
                    Rate
                </th>

                <th style="width: 15%;">
                    Value
                </th>

                <th style="width: 15%;">
                    Deduction
                </th>

            </tr>

        </thead>


        <tbody>


            <tr>

                <td>
                    Basic Salary
                </td>

                <td>
                    {{ number_format($basicSalary, 2) }}
                </td>

                <td>
                    -
                </td>

                <td>
                    {{ number_format($basicSalary, 2) }}
                </td>

                <td>
                    -
                </td>

            </tr>

            <tr>

                <td>
                    Transport Allowance
                </td>

                <td>
                    {{ number_format($transportAllowance, 2) }}
                </td>

                <td>
                    -
                </td>

                <td>
                    {{ number_format($transportAllowance, 2) }}
                </td>

                <td>
                    -
                </td>

            </tr>


            <tr>

                <td>
                    Family Allowance
                </td>

                <td>
                    {{ number_format($familyAllowance, 2) }}
                </td>

                <td>
                    -
                </td>

                <td>
                    {{ number_format($familyAllowance, 2) }}
                </td>

                <td>
                    -
                </td>

            </tr>


            <tr>

                <td>
                    Others Allowance
                </td>

                <td>
                    {{ number_format($othersAllowance, 2) }}
                </td>

                <td>
                    -
                </td>

                <td>
                    {{ number_format($othersAllowance, 2) }}
                </td>

                <td>
                    -
                </td>

            </tr>



            @if ($overtime > 0)

                <tr>

                    <td>
                        Overtime
                    </td>

                    <td>
                        {{ number_format($overtime, 2) }}
                    </td>

                    <td>
                        -
                    </td>

                    <td>
                        {{ number_format($overtime, 2) }}
                    </td>

                    <td>
                        -
                    </td>

                </tr>

            @endif



            <tr class="gross-row">

                <td colspan="3">
                    Gross Salary
                </td>

                <td>
                    {{ number_format($grossSalary, 2) }}
                </td>

                <td>
                    -
                </td>

            </tr>



            <tr class="deduction-row">

                <td colspan="4">
                    Loan Deduction
                </td>

                <td>
                    {{ number_format($loanDeduction, 2) }}
                </td>

            </tr>


            <tr class="deduction-row">

                <td colspan="4">
                    Salary Advance
                </td>

                <td>
                    {{ number_format($salaryAdvance, 2) }}
                </td>

            </tr>


            <tr class="deduction-row">

                <td colspan="4">

                    Absent Deduction

                    @if ($applyPenaltyAbsent && $applyAbsent)

                        ({{ number_format($totalAbsent, 0) }}
                        days -
                        {{ number_format($totalAbsent * 2, 0) }}
                        days penalty)

                    @else

                        ({{ number_format($totalAbsent, 0) }}
                        days)

                    @endif

                </td>

                <td>
                    {{ number_format($absentDeduction, 2) }}
                </td>

            </tr>



            <tr class="deduction-row">

                <td colspan="4">

                    Unpaid Leave Deduction

                    ({{ number_format($unpaidLeave, 0) }}
                    days)

                </td>

                <td>
                    {{ number_format($unpaidLeaveDeduction, 2) }}
                </td>

            </tr>




            <tr class="deduction-row">

                <td colspan="4">

                    Consecutive Late Deduction

                    ({{ number_format($totalConsecutiveLate, 0) }}
                    days)

                </td>

                <td>
                    {{ number_format($consecutiveLateDeduction, 2) }}
                </td>

            </tr>



            <tr class="deduction-row">

                <td colspan="4">

                    Late - Deduction

                    ({{ number_format($totalLateMinutes, 0) }}
                    minutes)

                </td>

                <td>
                    {{ number_format($lateMinutesDeduction, 2) }}
                </td>

            </tr>



            <tr class="deduction-row">

                <td colspan="4">

                    Remaining Time Deduction

                    ({{ number_format($totalRemainingMinutes, 0) }}
                    minutes)

                </td>

                <td>
                    {{ number_format($remainingMinutesDeduction, 2) }}
                </td>

            </tr>



            <tr class="total-row">

                <td colspan="4">
                    Total Deductions
                </td>

                <td>
                    {{ number_format($totalDeductions, 2) }}
                </td>

            </tr>



            <tr class="net-salary">

                <td colspan="4">
                    Net Salary
                </td>

                <td>
                    {{ number_format($netSalary, 2) }}
                </td>

            </tr>


        </tbody>

    </table>



    <div class="approval-area">

        <div class="approval-item">

            <span class="approval-line">
                Prepared by
            </span>

        </div>


        <div class="approval-item">

            <span class="approval-line">
                Checked by
            </span>

        </div>


        <div class="approval-item">

            <span class="approval-line">
                Employee
            </span>

        </div>

    </div>


 

    <div class="footer">

        Generated on
        {{ now()->format('d M Y, h:i A') }}

    </div>


    {{-- PRINT --}}

    <div class="print-actions">

        <button
            type="button"
            class="print-button"
            onclick="window.print()"
        >
            Print / Save as PDF
        </button>

    </div>


</div>


</body>

</html>