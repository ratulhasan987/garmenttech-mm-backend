<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Payslip - {{ $salary->user->name }}
    </title>

    <style>

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 12mm;
        }

        :root {
            --primary: #0d9fe8;
            --primary-dark: #078dd0;
            --primary-light: #8dd3f4;
            --border: #e2e7eb;
            --text: #111827;
            --muted: #64748b;
            --background: #f4f6f8;
        }

        body {
            font-family:
                Arial,
                Helvetica,
                sans-serif;

            background: var(--background);

            color: var(--text);

            font-size: 13px;

            padding: 30px 20px;
        }



        .page-wrapper {
            width: 100%;

            display: flex;

            flex-direction: column;

            align-items: center;
        }

  

        .payslip {
            width: 100%;

            max-width: 720px;

            background: #ffffff;

            border: 1px solid #e4e7eb;

            border-radius: 7px;

            /* box-shadow:
                0 3px 12px
                rgba(15, 23, 42, 0.08); */

            padding: 16px;

            margin: 0 auto;
        }

  

        .header {
            width: 100%;

            display: table;

            table-layout: fixed;

            margin-bottom: 20px;
        }

        .company-block {
            display: table-cell;

            width: 70%;

            vertical-align: top;

            text-align: left;
        }

        .payslip-title {
            display: table-cell;

            width: 30%;

            vertical-align: top;

            text-align: right;
        }

        .company-name {
            font-size: 24px;

            line-height: 28px;

            font-weight: 700;

            color: var(--primary);

            margin-bottom: 4px;
        }

        .company-info {
            font-size: 10px;

            line-height: 15px;

            color: #334155;
        }

        .payslip-heading {
            font-size: 22px;

            line-height: 28px;

            font-weight: 700;

            color: var(--primary);

            text-transform: uppercase;
        }

   

        .information-area {
            width: 100%;

            display: table;

            table-layout: fixed;

            margin-bottom: 18px;
        }

        .employee-information {
            display: table-cell;

            width: 58%;

            padding-right: 18px;

            vertical-align: top;
        }

        .payment-information {
            display: table-cell;

            width: 42%;

            vertical-align: top;
        }

        .blue-title {
            background: var(--primary);

            color: #fff;

            font-size: 11px;

            font-weight: 700;

            padding: 7px 12px;

            text-align: left;
        }

        .employee-content {
            padding-top: 7px;
        }

        .employee-name {
            font-size: 13px;

            font-weight: 700;

            margin-bottom: 4px;
        }

        .employee-detail {
            font-size: 10px;

            line-height: 16px;

            color: #111827;
        }

 

        .payment-table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
        }

        .payment-table th {
            background: var(--primary);

            color: #fff;

            font-size: 9px;

            font-weight: 700;

            padding: 7px 5px;

            text-align: center;

            border-right: 1px solid rgba(255, 255, 255, 0.5);
        }

        .payment-table th:last-child {
            border-right: none;
        }

        .payment-table td {
            background: var(--primary-light);

            color: #16445d;

            font-size: 9px;

            padding: 7px 5px;

            text-align: center;

            border-right: 1px solid #ffffff;
        }

        .payment-table td:last-child {
            border-right: none;
        }

        .payment-table .second-header th {
            padding-top: 6px;

            padding-bottom: 6px;
        }

        .payment-table .employee-id {
            text-align: left;
        }

        .salary-table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
        }

        .salary-table th {
            background: var(--primary);

            color: #fff;

            font-size: 10px;

            font-weight: 700;

            padding: 7px 8px;

            border-right: 1px solid #ffffff;

            text-align: center;
        }

        .salary-table th:first-child {
            text-align: left;
        }

        .salary-table th:last-child {
            border-right: none;
        }

        .salary-table td {
            border: 1px solid var(--border);

            font-size: 10px;

            padding: 7px 8px;

            line-height: 14px;

            background: #fff;
        }

        .salary-table td:first-child {
            text-align: left;
        }

        .salary-table td.amount {
            text-align: right;
        }

        .salary-table .empty-cell {
            color: #94a3b8;
        }

   

        .gross-row td {
            font-weight: 700;

            background: #f8fafc;
        }

        .gross-row td:first-child {
            text-align: right;
        }

   

        .deduction-row td {
            padding-top: 6px;

            padding-bottom: 6px;
        }


        .total-deduction-row td {
            font-weight: 700;

            background: #f8fafc;
        }

        .total-deduction-row td:first-child {
            text-align: right;
        }


        .net-salary-row td {
            background: var(--primary);

            color: #fff;

            font-size: 11px;

            font-weight: 700;

            border-color: var(--primary);
        }

        .net-salary-row td:first-child {
            text-align: right;
        }


        .approval-area {
            width: 100%;

            display: table;

            table-layout: fixed;

            margin-top: 68px;
        }

        .approval-item {
            display: table-cell;

            width: 33.33%;

            text-align: center;

            vertical-align: bottom;
        }

        .approval-line {
            display: inline-block;

            width: 125px;

            padding-top: 6px;

            border-top: 1px solid #333;

            font-size: 9px;

            color: #111827;
        }


        .bottom-controls {
            width: 100%;

            max-width: 720px;

            margin-top: 0;

            padding: 10px 0;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 15px;
        }

        .bottom-employee {
            font-size: 11px;

            color: #111827;
        }

        .bottom-employee strong {
            font-weight: 700;
        }

        .print-button {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 7px;

            min-width: 95px;

            height: 34px;

            padding: 0 15px;

            border: none;

            border-radius: 4px;

            background: #0d6efd;

            color: #fff;

            font-size: 10px;

            font-weight: 600;

            cursor: pointer;

            text-decoration: none;
        }

        .print-button:hover {
            background: #0b5ed7;
        }

        .print-icon {
            width: 14px;

            height: 14px;

            fill: currentColor;
        }

        .footer {
            margin-top: 12px;

            text-align: center;

            font-size: 8px;

            color: #94a3b8;
        }


        @media (max-width: 768px) {

            body {
                padding: 15px 10px;
            }

            .payslip {
                padding: 12px;

                max-width: 100%;
            }

            .company-name {
                font-size: 19px;
            }

            .payslip-heading {
                font-size: 18px;
            }

            .company-info {
                font-size: 9px;
            }

            .employee-information {
                padding-right: 10px;
            }

            .blue-title {
                font-size: 10px;
            }

            .salary-table {
                min-width: 650px;
            }

            .salary-table-wrapper {
                overflow-x: auto;
            }

            .bottom-controls {
                max-width: 100%;
            }

            .approval-area {
                margin-top: 45px;
            }

            .approval-line {
                width: 90px;
            }

        }


@media print {


    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    body {
        background: #ffffff !important;
        padding: 0 !important;
    }

    .page-wrapper {
        display: block;
    }

    .payslip {
        width: 100%;
        max-width: none;

        background: #ffffff !important;

        border: none;
        border-radius: 0;
        box-shadow: none;

        padding: 0;
    }



    .blue-title {
        background: #0d9fe8 !important;
        color: #ffffff !important;

        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .payment-table th {
        background: #0d9fe8 !important;
        color: #ffffff !important;

        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .payment-table td {
        background: #8dd3f4 !important;
        color: #16445d !important;

        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .salary-table th {
        background: #0d9fe8 !important;
        color: #ffffff !important;

        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .net-salary-row td {
        background: #0d9fe8 !important;
        color: #ffffff !important;

        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }


    .gross-row td,
    .total-deduction-row td {
        background: #f8fafc !important;

        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }


    .bottom-controls {
        display: none !important;
    }

    .salary-table-wrapper {
        overflow: visible !important;
    }

    .salary-table {
        min-width: 0 !important;
    }



    tr {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .approval-area {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    

    .footer {
        margin-top: 15px;
    }
}

    </style>

</head>


<body>

<div class="page-wrapper">

    <div class="payslip">


        <div class="header">

            <div class="company-block">

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

            </div>


            <div class="payslip-title">

                <div class="payslip-heading">
                    PAYSLIP
                </div>

            </div>

        </div>



        <div class="information-area">


            {{-- Employee --}}
            <div class="employee-information">

                <div class="blue-title">
                    Employee Information
                </div>

                <div class="employee-content">

                    <div class="employee-name">

                        {{ $salary->user->name }}

                    </div>


                    <div class="employee-detail">

                        @if ($salary->user->address)

                            Address:
                            {{ $salary->user->address }}

                        @else

                            Address Here

                        @endif

                    </div>


                    @if ($salary->user->phone)

                        <div class="employee-detail">

                            Phone:
                            {{ $salary->user->phone }}

                        </div>

                    @endif


                    @if ($salary->user->email)

                        <div class="employee-detail">

                            Email:
                            {{ $salary->user->email }}

                        </div>

                    @endif


                    @if ($salary->user->department)

                        <div class="employee-detail">

                            Department:
                            {{ $salary->user->department->name }}

                        </div>

                    @endif


                    @if ($salary->user->designation)

                        <div class="employee-detail">

                            Designation:
                            {{ $salary->user->designation->name }}

                        </div>

                    @endif

                </div>

            </div>


            {{-- Payment --}}
            <div class="payment-information">

                <table class="payment-table">

                    <thead>

                        <tr>

                            <th>
                                PAY DATE
                            </th>

                            <th>
                                PAY MONTH
                            </th>

                            <th>
                                PAY TYPE
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr>

                            <td>
                                {{ now()->format('d/m/Y') }}
                            </td>

                            <td>

                                {{ \Carbon\Carbon::createFromFormat(
                                    'Y-m',
                                    $salary->month
                                )->format('M, Y') }}

                            </td>

                            <td>
                                Monthly
                            </td>

                        </tr>

                    </tbody>

                    <thead>

                        <tr class="second-header">

                            <th>
                                Employee ID
                            </th>

                            <th>
                                TIN NUMBER
                            </th>

                            <th>
                                TAX CODE
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr>

                            <td class="employee-id">

                                {{ $salary->user->employee_id }}

                            </td>

                            <td>
                                -
                            </td>

                            <td>
                                -
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>


        <div class="salary-table-wrapper">

            <table class="salary-table">

                <thead>

                    <tr>

                        <th style="width: 35%;">
                            Description
                        </th>

                        <th style="width: 18%;">
                            Gross Amount
                        </th>

                        <th style="width: 10%;">
                            Rate
                        </th>

                        <th style="width: 18%;">
                            Value
                        </th>

                        <th style="width: 19%;">
                            Deduction
                        </th>

                    </tr>

                </thead>


                <tbody>


                    <tr>

                        <td>
                            Basic
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->basic_salary,
                                2
                            ) }}

                        </td>

                        <td></td>

                        <td class="amount">

                            {{ number_format(
                                $salary->basic_salary,
                                2
                            ) }}

                        </td>

                        <td></td>

                    </tr>


                    <tr>

                        <td>
                            Transport Allowance
                        </td>

                        <td class="amount">

                            @if ($salary->transport_allowance > 0)

                                {{ number_format(
                                    $salary->transport_allowance,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                        <td class="amount">

                            @if ($salary->transport_allowance > 0)

                                {{ number_format(
                                    $salary->transport_allowance,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                    </tr>


                    <tr>

                        <td>
                            Family Allowance
                        </td>

                        <td class="amount">

                            @if ($salary->family_allowance > 0)

                                {{ number_format(
                                    $salary->family_allowance,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                        <td class="amount">

                            @if ($salary->family_allowance > 0)

                                {{ number_format(
                                    $salary->family_allowance,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                    </tr>


                    <tr>

                        <td>
                            Others Allowance
                        </td>

                        <td class="amount">

                            @if ($salary->others_allowance > 0)

                                {{ number_format(
                                    $salary->others_allowance,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                        <td class="amount">

                            @if ($salary->others_allowance > 0)

                                {{ number_format(
                                    $salary->others_allowance,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                    </tr>



                    <tr>

                        <td>
                            Overtime
                        </td>

                        <td class="amount">

                            @if ($salary->overtime > 0)

                                {{ number_format(
                                    $salary->overtime,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                        <td class="amount">

                            @if ($salary->overtime > 0)

                                {{ number_format(
                                    $salary->overtime,
                                    2
                                ) }}

                            @endif

                        </td>

                        <td></td>

                    </tr>



                    <tr class="gross-row">

                        <td colspan="3">
                            Gross Salary
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->gross_salary,
                                2
                            ) }}

                        </td>

                        <td></td>

                    </tr>



                    <tr class="deduction-row">

                        <td colspan="4">
                            Loan deduction
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->loan_deduction,
                                2
                            ) }}

                        </td>

                    </tr>


                    <tr class="deduction-row">

                        <td colspan="4">
                            Salary advance
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->salary_advance,
                                2
                            ) }}

                        </td>

                    </tr>

                    <tr class="deduction-row">

                        <td colspan="4">
                            State Tax
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->state_tax,
                                2
                            ) }}

                        </td>

                    </tr>



                    <tr class="deduction-row">

                        <td colspan="4">
                            Social Security
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->social_security,
                                2
                            ) }}

                        </td>

                    </tr>


                    <tr class="deduction-row">

                        <td colspan="4">

                            Absent Deduction

                            @if ($salary->total_absent)
                                ({{ $salary->total_absent }})
                            @endif

                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->absent_deduction,
                                2
                            ) }}

                        </td>

                    </tr>



                    <tr class="deduction-row">

                        <td colspan="4">

                            Un-paid Leave Deduction

                            @if ($salary->unpaid_leave !== null)
                                ({{ $salary->unpaid_leave }} days)
                            @endif

                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->unpaid_leave_deduction,
                                2
                            ) }}

                        </td>

                    </tr>



                    <tr class="deduction-row">

                        <td colspan="4">

                            Consecutive Late Deduction

                            ({{ number_format(
                                $salary->total_consecutive_late,
                                0
                            ) }} days)

                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->consecutive_late_deduction,
                                2
                            ) }}

                        </td>

                    </tr>



                    <tr class="deduction-row">

                        <td colspan="4">

                            Late - Deduction

                            ({{ number_format(
                                $salary->total_late_minutes,
                                0
                            ) }} minutes)

                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->late_minutes_deduction,
                                2
                            ) }}

                        </td>

                    </tr>




                    <tr class="deduction-row">

                        <td colspan="4">

                            Remaining Time Deduction

                            ({{ number_format(
                                $salary->total_remaining_minutes,
                                0
                            ) }} minutes)

                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->remaining_minutes_deduction,
                                2
                            ) }}

                        </td>

                    </tr>



                    <tr class="total-deduction-row">

                        <td colspan="4">
                            Total deductions
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->total_deductions,
                                2
                            ) }}

                        </td>

                    </tr>



                    <tr class="net-salary-row">

                        <td colspan="4">
                            Net salary
                        </td>

                        <td class="amount">

                            {{ number_format(
                                $salary->net_salary,
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

            This is a computer-generated salary statement.

        </div>

    </div>



    <div class="bottom-controls">

        <div class="bottom-employee">

            <strong>
                Payslip:
            </strong>

            &nbsp;

            {{ $salary->user->name }}

        </div>


        <button
            type="button"
            class="print-button"
            onclick="window.print()"
        >

            <svg
                class="print-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path
                    d="M6 9V3h12v6h1a3 3 0 0 1 3 3v5h-4v4H6v-4H2v-5a3 3 0 0 1 3-3h1zm2-4v4h8V5H8zm8 15v-4H8v4h8zm2-7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                />

            </svg>

            Print Payslip

        </button>

    </div>

</div>

</body>

</html>