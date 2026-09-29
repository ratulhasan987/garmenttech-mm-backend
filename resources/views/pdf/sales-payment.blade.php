<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">

    <title>
        Sales Payment
    </title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #333;
        }

        .header {
            width: 100%;
            margin-bottom: 20px;
        }

        .company {
            font-size: 18px;
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        table th {
            background: #f1f1f1;
            border: 1px solid #ddd;
            padding: 8px;
        }

        table td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        .section-title {
            background: #f5f5f5;
            padding: 8px;
            font-weight: bold;
            margin-top: 15px;
        }

        .summary {
            width: 40%;
            float: right;
            margin-top: 20px;
        }

        .summary td {
            padding: 6px;
        }

        .signature {
            margin-top: 80px;
        }

        .status {
            font-weight: bold;
        }
    </style>
</head>

<body>

    <table class="header">
        <tr>

            <td style="border: none;">

                <div class="company">
                    {{ $configure?->name ?? config('app.name') }}
                </div>

                @if($configure)

                    {{ $configure->address }}

                    <br>

                    Phone:
                    {{ $configure->phone }}

                    <br>

                    Email:
                    {{ $configure->email }}

                @endif

            </td>

            <td
                class="text-right"
                style="border: none;"
            >

                <h2>
                    SALES PAYMENT
                </h2>

                <strong>
                    Payment No:
                </strong>

                {{ $payment->payment_no }}

                <br>

                <strong>
                    Date:
                </strong>

                {{ $payment->payment_date?->format('d M Y') }}

            </td>

        </tr>
    </table>

    <div class="section-title">
        Payment Information
    </div>

    <table>

        <tr>

            <td>

                <strong>
                    Payment No:
                </strong>

                {{ $payment->payment_no }}

                <br>

                <strong>
                    Payment Date:
                </strong>

                {{ $payment->payment_date?->format('d M Y') }}

                <br>

                <strong>
                    Payment Method:
                </strong>

                {{ ucwords(str_replace('_', ' ', $payment->payment_method)) }}

                <br>

                <strong>
                    Reference:
                </strong>

                {{ $payment->reference ?? '-' }}

            </td>

            <td>

                <strong>
                    Status:
                </strong>

                {{ $payment->status }}

                <br>

                @if($payment->approvedBy)

                    <strong>
                        Approved By:
                    </strong>

                    {{ $payment->approvedBy->name }}

                    <br>

                @endif

                @if($payment->approved_at)

                    <strong>
                        Approved At:
                    </strong>

                    {{ $payment->approved_at->format('d M Y h:i A') }}

                @endif

            </td>

        </tr>

    </table>

    <div class="section-title">
        Customer Information
    </div>

    <table>

        <tr>

            <td>

                <strong>
                    Customer:
                </strong>

                {{ $payment->invoice?->client?->name }}

                <br>

                @if($payment->invoice?->client?->company_name)

                    <strong>
                        Company:
                    </strong>

                    {{ $payment->invoice->client->company_name }}

                    <br>

                @endif

                <strong>
                    Phone:
                </strong>

                {{ $payment->invoice?->client?->phone }}

                <br>

                <strong>
                    Address:
                </strong>

                {{ $payment->invoice?->client?->address }}

            </td>

            <td>

                <strong>
                    Invoice No:
                </strong>

                {{ $payment->invoice?->invoice_no }}

                <br>

                <strong>
                    Invoice Date:
                </strong>

                {{ $payment->invoice?->invoice_date?->format('d M Y') }}

                <br>

                <strong>
                    Warehouse:
                </strong>

                {{ $payment->invoice?->warehouse?->name }}

            </td>

        </tr>

    </table>

    <div class="section-title">
        Payment Details
    </div>

    <table>

        <thead>

            <tr>

                <th width="5%">
                    SL
                </th>

                <th>
                    Description
                </th>

                <th class="text-right">
                    Amount
                </th>

            </tr>

        </thead>

        <tbody>

            <tr>

                <td class="text-center">
                    1
                </td>

                <td>
                    Payment against invoice
                    {{ $payment->invoice?->invoice_no }}
                </td>

                <td class="text-right">
                    {{ number_format($payment->amount, 2) }}
                </td>

            </tr>

        </tbody>

    </table>

    <table class="summary">

        <tr>

            <td>
                Invoice Total
            </td>

            <td class="text-right">
                {{ number_format($payment->invoice?->grand_total ?? 0, 2) }}
            </td>

        </tr>

        <tr>

            <td>
                Previous Paid
            </td>

            <td class="text-right">
                {{ number_format(
                    max(
                        (float) ($payment->invoice?->paid_amount ?? 0) -
                        (float) $payment->amount,
                        0
                    ),
                    2
                ) }}
            </td>

        </tr>

        <tr>

            <td>
                This Payment
            </td>

            <td class="text-right">
                {{ number_format($payment->amount, 2) }}
            </td>

        </tr>

        <tr>

            <td>
                Current Due
            </td>

            <td class="text-right">
                {{ number_format($payment->invoice?->due_amount ?? 0, 2) }}
            </td>

        </tr>

        <tr>

            <td>
                <strong>
                    Payment Status
                </strong>
            </td>

            <td class="text-right">

                <strong>
                    {{ ucfirst($payment->invoice?->payment_status ?? '-') }}
                </strong>

            </td>

        </tr>

    </table>

    <br style="clear: both">

    @if($payment->remarks)

        <div class="section-title">
            Remarks
        </div>

        <p>
            {{ $payment->remarks }}
        </p>

    @endif

    <div class="signature">

        <table>

            <tr>

                <td class="text-center">

                    __________________________

                    <br>

                    Prepared By

                </td>

                <td class="text-center">

                    __________________________

                    <br>

                    Customer Signature

                </td>

                <td class="text-center">

                    __________________________

                    <br>

                    Authorized Signature

                </td>

            </tr>

        </table>

    </div>

</body>

</html>