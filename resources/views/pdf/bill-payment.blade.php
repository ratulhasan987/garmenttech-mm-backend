<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        http-equiv="Content-Type"
        content="text/html; charset=UTF-8"
    >

    <meta
        http-equiv="X-UA-Compatible"
        content="IE=edge"
    >

    @if ($configure?->logo)
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
    @endif

    <title>
        Bill Payment - {{ $bill->bill_no }}
    </title>

    <style>
        /*
        |--------------------------------------------------------------------------
        | General
        |--------------------------------------------------------------------------
        */

        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'solaimanlipi', sans-serif;
            font-family: 'solaimanlipi' !important;
            font-weight: 400;
            font-style: normal;
            margin: 0;
        }

        .report {
            max-width: 100%;
            margin: 0 auto;
            padding: 30px;
            background-color: #fff;
        }

        /*
        |--------------------------------------------------------------------------
        | Header
        |--------------------------------------------------------------------------
        */

        .report .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 1px solid #ddd;
        }

        .report .header h1 {
            margin-bottom: 5px;
            font-size: 25px;
            letter-spacing: 1px;
            color: #333;
        }

        .report .header p {
            font-size: 14px;
            padding: 3px 0;
            color: #333;
        }

        .report .header p span {
            font-weight: 700;
        }

        /*
        |--------------------------------------------------------------------------
        | Body
        |--------------------------------------------------------------------------
        */

        .report .body {
            margin-top: 30px;
        }

        .report .body h3 {
            font-size: 20px;
            letter-spacing: 1px;
            margin-bottom: 2px;
            text-align: center;
        }

        /*
        |--------------------------------------------------------------------------
        | Information
        |--------------------------------------------------------------------------
        */

        .informations {
            font-size: 14px !important;
            margin-bottom: 20px;
            margin-top: 20px;
        }

        .informations::after {
            content: "";
            clear: both;
            display: table;
        }

        .informations .left {
            float: left;
            width: 50%;
        }

        .informations .right {
            float: right;
            width: 50%;
            text-align: right;
        }

        .informations p {
            margin-bottom: 5px;
        }

        .informations span {
            font-weight: 700;
        }

        /*
        |--------------------------------------------------------------------------
        | Table
        |--------------------------------------------------------------------------
        */

        .report table {
            font-size: 11px !important;
            letter-spacing: 1px;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            padding: 6px;
            letter-spacing: 1px;
            text-align: center;
            word-wrap: break-word;
            border: 1px solid #ddd;
            white-space: normal;
        }

        th {
            font-weight: 700;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        .summary-wrapper {
            width: 45%;
            margin-left: auto;
            margin-top: 15px;
        }

        .summary-table {
            width: 100%;
        }

        .summary-table td {
            padding: 7px;
        }

        .summary-table .label {
            text-align: left;
            font-weight: 600;
        }

        .summary-table .amount {
            text-align: right;
        }

        .summary-table .total td {
            font-size: 13px;
            font-weight: 700;
            border-top: 2px solid #333;
        }

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        .status {
            display: inline-block;
            padding: 3px 8px;
            border: 1px solid #999;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 700;
        }

        /*
        |--------------------------------------------------------------------------
        | Print
        |--------------------------------------------------------------------------
        */

        @page {
            margin: 20px;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }

            .report {
                padding: 20px;
            }
        }
    </style>
</head>

<body>

    <section class="report">

        <!--
        |--------------------------------------------------------------------------
        | Header
        |--------------------------------------------------------------------------
        -->

        <div class="header">

            <h1>
                {{ $configure?->name ?? config('app.name') }}
            </h1>

            <p>
                <span>
                    Office Address:
                </span>

                {{ $configure?->address ?? 'N/A' }}
            </p>

            <p>
                <span>
                    Contact No.:
                </span>

                {{ $configure?->phone ?? 'N/A' }},

                Email:

                {{ $configure?->email ?? 'N/A' }}
            </p>

        </div>

        <!--
        |--------------------------------------------------------------------------
        | Body
        |--------------------------------------------------------------------------
        -->

        <div class="body">

            <h3>
                Bill Payment Details
            </h3>

            <h3>
                Bill No.
                {{ $bill->bill_no }}
            </h3>

            <!--
            |--------------------------------------------------------------------------
            | Bill Information
            |--------------------------------------------------------------------------
            -->

            <div class="informations">

                <div class="left">

                    <p style="margin-bottom: 5px;">
                        <span>
                            Bill Information:
                        </span>
                    </p>

                    <p>
                        Bill No.:

                        {{ $bill->bill_no }}
                    </p>

                    <p>
                        PO No.:

                        {{ $bill->purchaseOrder?->order_id ?? 'N/A' }}
                    </p>

                    <p>
                        GRN No.:

                        {{ $bill->goodsReceivedNote?->grn_no ?? 'N/A' }}
                    </p>

                    <p>
                        Vendor:

                        {{ $bill->vendor?->name ?? 'N/A' }}

                        @if ($bill->vendor?->vendor_id)
                            (
                                {{ $bill->vendor->vendor_id }}
                            )
                        @endif
                    </p>

                </div>

                <div class="right">

                    <p style="margin-bottom: 5px;">
                        <span>
                            Payment Summary:
                        </span>
                    </p>

                    <p>
                        Bill Date:

                        {{
                            $bill->bill_date
                                ? \Carbon\Carbon::parse(
                                    $bill->bill_date
                                )->format(
                                    'd M, Y'
                                )
                                : 'N/A'
                        }}
                    </p>

                    <p>
                        Payment Status:

                        <span class="">
                            {{ $bill->payment_status }}
                        </span>
                    </p>

                    <p>
                        Number of Payments:

                        {{ $bill->payments->count() }}
                    </p>

                </div>

            </div>

            <!--
            |--------------------------------------------------------------------------
            | Payments
            |--------------------------------------------------------------------------
            -->

            <h4 style="margin-bottom: 10px;">
                Payment History
            </h4>

            @if ($bill->payments->count() > 0)

                <table>

                    <thead>

                        <tr>

                            <th>
                                SL
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Reference
                            </th>


                            <th>
                                Description
                            </th>

                            <th>
                                Created By
                            </th>

                            <th>
                                Amount
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        @foreach ($bill->payments as $index => $payment)

                            <tr>

                                <td>
                                    {{ $index + 1 }}
                                </td>

                                <td>
                                    {{
                                        $payment->date
                                            ? \Carbon\Carbon::parse(
                                                $payment->date
                                            )->format(
                                                'd M, Y'
                                            )
                                            : 'N/A'
                                    }}
                                </td>

                                <td>
                                    {{ $payment->reference ?? 'N/A' }}
                                </td>

                                <td class="text-left">
                                    {{ $payment->description ?? 'N/A' }}
                                </td>

                                <td>
                                    {{ $payment->createdBy?->name ?? 'N/A' }}

                                    @if ($payment->createdBy?->employee_id)

                                        <br>

                                        <small>
                                            #{{ $payment->createdBy->employee_id }}
                                        </small>

                                    @endif
                                </td>

                                <td class="text-right">

                                    <strong>
                                        {{
                                            number_format(
                                                (float) (
                                                    $payment->pay_amount ??
                                                    0
                                                ),
                                                2
                                            )
                                        }}
                                    </strong>

                                </td>

                            </tr>

                        @endforeach

                    </tbody>

                </table>

            @else

                <p>
                    No payment records found for this bill.
                </p>

            @endif

            <!--
            |--------------------------------------------------------------------------
            | Summary
            |--------------------------------------------------------------------------
            -->

            <div class="summary-wrapper">

                <table class="summary-table">

                    <tbody>

                        <tr>

                            <td class="label">
                                Grand Total
                            </td>

                            <td class="amount">
                                {{
                                    number_format(
                                        (float) $bill->grand_total,
                                        2
                                    )
                                }}
                            </td>

                        </tr>

                        <tr>

                            <td class="label">
                                Paid Amount
                            </td>

                            <td class="amount">
                                {{
                                    number_format(
                                        (float) $bill->paid_amount,
                                        2
                                    )
                                }}
                            </td>

                        </tr>

                        <tr class="total">

                            <td class="label">
                                Due Amount
                            </td>

                            <td class="amount">
                                {{
                                    number_format(
                                        (float) $bill->due_amount,
                                        2
                                    )
                                }}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </section>

</body>

</html>