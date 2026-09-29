<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    @if ($configure?->logo)
        <link rel="icon" href="{{ asset($configure->logo) }}" type="image/x-icon">
    @endif

    <title>
        Sales Invoice #{{ $salesInvoice->invoice_no }}
    </title>

    <style>
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'solaimanlipi', DejaVu Sans, sans-serif;
            font-weight: 400;
            margin: 0;
            color: #333;
        }

        .report {
            max-width: 100%;
            margin: 0 auto;
            padding: 30px;
            background-color: #fff;
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }

        .header h1 {
            margin-bottom: 5px;
            font-size: 22px;
            letter-spacing: 1px;
        }

        .header p {
            font-size: 12px;
            padding: 2px 0;
        }

        .header span {
            font-weight: 700;
        }

        .body {
            margin-top: 20px;
        }

        .body h3 {
            font-size: 18px;
            letter-spacing: 1px;
            margin-bottom: 5px;
            text-align: center;
        }

        .sub-title {
            text-align: center;
            font-size: 12px;
            color: #555;
            margin-bottom: 20px;
        }

        .information {
            font-size: 12px;
            margin-bottom: 20px;
        }

        .information::after {
            content: "";
            clear: both;
            display: table;
        }

        .information .left {
            float: left;
            width: 55%;
        }

        .information .right {
            float: right;
            width: 40%;
            text-align: right;
        }

        .information p {
            margin: 4px 0;
        }

        .information strong {
            font-weight: 700;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
            font-size: 10px;
            letter-spacing: 0.5px;
        }

        th,
        td {
            padding: 6px 5px;
            text-align: center;
            word-wrap: break-word;
            border: 1px solid #ddd;
            white-space: normal;
        }

        th {
            background-color: #f0f0f0;
            font-weight: 700;
        }

        td.text-left {
            text-align: left;
        }

        td.text-right {
            text-align: right;
        }

        .tax-line {
            margin-bottom: 2px;
        }

        .summary {
            width: 40%;
            margin-left: auto;
        }

        .summary td {
            padding: 6px;
        }

        .remarks {
            margin-top: 20px;
        }

        .remarks-title {
            background: #f0f0f0;
            padding: 7px;
            font-weight: 700;
            font-size: 11px;
        }

        .remarks-content {
            border: 1px solid #ddd;
            border-top: 0;
            padding: 8px;
            font-size: 11px;
        }

        .signature {
            margin-top: 70px;
        }

        .signature td {
            border: 0;
            padding-top: 35px;
        }

        @page {
            margin: 15px;
        }

        @media print {
            .no-print {
                display: none;
            }

            body {
                margin: 0;
                padding: 0;
            }

            .report {
                padding: 15px;
            }
        }
    </style>
</head>

<body>

    <section class="report">

        <div class="header">

            <h1>
                {{ $configure?->name ?? config('app.name') }}
            </h1>

            @if ($configure)
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

                    &nbsp;

                    <span>
                        Email:
                    </span>

                    {{ $configure->email }}
                </p>
            @endif

        </div>

        <div class="body">

            <h3>
                Sales Invoice
            </h3>

            <p class="sub-title">
                #{{ $salesInvoice->invoice_no }}

                &nbsp;|&nbsp;

                Status:
                {{ $salesInvoice->status }}
            </p>

            <div class="information">

                <div class="left">

                    <p>
                        <strong>
                            Invoice No:
                        </strong>

                        {{ $salesInvoice->invoice_no }}
                    </p>

                    <p>
                        <strong>
                            Invoice Date:
                        </strong>

                        {{ $salesInvoice->invoice_date?->format('d M, Y') }}
                    </p>

                    <p>
                        <strong>
                            Created:
                        </strong>

                        {{ $salesInvoice->created_at?->format('d M, Y h:i A') }}
                    </p>

                    <p>
                        <strong>
                            Warehouse:
                        </strong>

                        {{ $salesInvoice->warehouse?->name ?? 'N/A' }}

                        @if ($salesInvoice->warehouse?->code)
                            ({{ $salesInvoice->warehouse->code }})
                        @endif
                    </p>

                </div>

                <div class="right">

                    <p>
                        <strong>
                            Customer:
                        </strong>

                        {{ $salesInvoice->client?->name ?? 'N/A' }}
                    </p>

                    @if ($salesInvoice->client?->client_id)
                        <p>
                            Customer ID:
                            {{ $salesInvoice->client->client_id }}
                        </p>
                    @endif

                    @if ($salesInvoice->client?->company_name)
                        <p>
                            Company:
                            {{ $salesInvoice->client->company_name }}
                        </p>
                    @endif

                    <p>
                        Phone:
                        {{ $salesInvoice->client?->phone ?? 'N/A' }}
                    </p>

                    <p>
                        Address:
                        {{ $salesInvoice->client?->present_address ?? ($salesInvoice->client?->permanent_address ?? 'N/A') }}
                    </p>

                    <p>
                        Payment Status:
                        {{ $salesInvoice->payment_status }}
                    </p>

                </div>

            </div>

            @if ($salesInvoice->items->count() > 0)

                <table>

                    <thead>

                        <tr>

                            <th style="width: 5%;">
                                SL
                            </th>

                            <th style="width: 28%;">
                                Product
                            </th>

                            <th style="width: 9%;">
                                Unit
                            </th>

                            <th style="width: 9%;">
                                Qty
                            </th>

                            <th style="width: 12%;">
                                Price
                            </th>

                            <th style="width: 11%;">
                                Discount
                            </th>

                            <th style="width: 13%;">
                                Tax
                            </th>

                            <th style="width: 13%;">
                                Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        @foreach ($salesInvoice->items as $index => $item)
                            <tr>

                                <td>
                                    {{ $index + 1 }}
                                </td>

                                <td class="text-left">

                                    <strong>
                                        {{ $item->product?->name ?? 'N/A' }}
                                    </strong>

                                    @if ($item->product?->code)
                                        <br>

                                        <small>
                                            {{ $item->product->code }}
                                        </small>
                                    @endif

                                </td>

                                <td>
                                    {{ $item->product?->unit?->name ?? 'N/A' }}
                                </td>

                                <td>
                                    {{ number_format((float) $item->quantity, 2) }}
                                </td>

                                <td class="text-right">
                                    {{ number_format((float) $item->unit_price, 2) }}
                                </td>

                                <td class="text-right">
                                    {{ number_format((float) $item->discount, 2) }}
                                </td>

                                <td class="text-right">

                                    @if ($item->taxes && $item->taxes->count() > 0)
                                        @foreach ($item->taxes as $tax)
                                            <div class="tax-line">
                                                {{ $tax->name }}

                                                ({{ number_format((float) $tax->rate, 2) }}%)
                                                <br>

                                                {{ number_format((float) ($tax->tax_amount ?? 0), 2) }}
                                            </div>
                                        @endforeach
                                    @else
                                        {{ number_format((float) $item->tax, 2) }}
                                    @endif

                                </td>

                                <td class="text-right">
                                    <strong>
                                        {{ number_format((float) $item->line_total, 2) }}
                                    </strong>
                                </td>

                            </tr>
                        @endforeach

                        <tr>

                            <td colspan="7" class="text-right">
                                Subtotal
                            </td>

                            <td class="text-right">
                                {{ number_format((float) $salesInvoice->subtotal, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td colspan="7" class="text-right">
                                Discount
                            </td>

                            <td class="text-right">
                                {{ number_format((float) $salesInvoice->discount, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td colspan="7" class="text-right">
                                Tax
                            </td>

                            <td class="text-right">
                                {{ number_format((float) $salesInvoice->tax, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td colspan="7" class="text-right">
                                Adjustment
                            </td>

                            <td class="text-right">
                                {{ number_format((float) $salesInvoice->adjustment_amount, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td colspan="7" class="text-right">
                                <strong>
                                    Grand Total
                                </strong>
                            </td>

                            <td class="text-right">
                                <strong>
                                    {{ number_format((float) $salesInvoice->grand_total, 2) }}
                                </strong>
                            </td>

                        </tr>

                        <tr>

                            <td colspan="7" class="text-right">
                                Paid
                            </td>

                            <td class="text-right">
                                {{ number_format((float) $salesInvoice->paid_amount, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td colspan="7" class="text-right">
                                <strong>
                                    Due
                                </strong>
                            </td>

                            <td class="text-right">
                                <strong>
                                    {{ number_format((float) $salesInvoice->due_amount, 2) }}
                                </strong>
                            </td>

                        </tr>

                    </tbody>

                </table>
            @else
                <p style="text-align: center;">
                    No items found for this invoice.
                </p>

            @endif

            <div style="clear: both;"></div>

            @if ($salesInvoice->remarks)
                <div class="remarks">

                    <div class="remarks-title">
                        Remarks
                    </div>

                    <div class="remarks-content">
                        {{ $salesInvoice->remarks }}
                    </div>

                </div>
            @endif

            <div class="signature">

                <table>

                    <tr>

                        <td>
                            ______________________
                            <br>
                            Prepared By
                        </td>

                        <td>
                            ______________________
                            <br>
                            Customer Signature
                        </td>

                        <td>
                            ______________________
                            <br>
                            Authorized Signature
                        </td>

                    </tr>

                </table>

            </div>

        </div>

    </section>

</body>

</html>
