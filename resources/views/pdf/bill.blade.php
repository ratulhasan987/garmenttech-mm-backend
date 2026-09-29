<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    @if ($configure?->logo)
        <link rel="icon" href="{{ asset($configure->logo) }}" type="image/x-icon">

        <link rel="shortcut icon" href="{{ asset($configure->logo) }}" type="image/x-icon">
    @endif

    <title>
        Bill - {{ $bill->bill_no }}
    </title>

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <style>
        /*
        |--------------------------------------------------------------------------
        | General Styles
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
            padding-top: 5px;
            padding: 30px;
            background-color: #fff;
            border-radius: 8px;
        }

        /*
        |--------------------------------------------------------------------------
        | Header Styles
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
        | Body Styles
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

        .report .body .informations {
            font-size: 14px !important;
            margin-bottom: 20px;
            margin-top: 20px;
        }

        .report .body .informations::after {
            content: "";
            clear: both;
            display: table;
        }

        .report .body .informations .left {
            float: left;
            width: 50%;
        }

        .report .body .informations .right {
            float: right;
            width: 50%;
            text-align: right;
        }

        .report .body .informations .left div,
        .report .body .informations .right div {
            margin: 5px 0;
        }

        .report .body .informations .left span,
        .report .body .informations .right span {
            font-weight: 700;
        }

        /*
        |--------------------------------------------------------------------------
        | Table Styles
        |--------------------------------------------------------------------------
        */

        .report table {
            font-size: 11px !important;
            letter-spacing: 1px;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            max-width: 100%;
        }

        th,
        td {
            padding: 5px;
            letter-spacing: 1px;
            text-align: center;
            word-wrap: break-word;
            border: 1px solid #ddd;
            white-space: normal;
        }

        .report thead {
            color: #000;
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
            width: 42%;
            margin-left: auto;
            margin-top: 10px;
        }

        .summary-table {
            width: 100%;
            font-size: 12px !important;
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

        .summary-table .grand-total td {
            font-size: 13px;
            font-weight: 700;
            border-top: 2px solid #333;
        }

        .summary-table .paid td {
            font-weight: 600;
        }

        .summary-table .due td {
            font-weight: 700;
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

        .doc-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 8px;
        }

        /*
        |--------------------------------------------------------------------------
        | Page Break
        |--------------------------------------------------------------------------
        */

        .page-break {
            page-break-after: always;
        }

        /*
        |--------------------------------------------------------------------------
        | PDF Page
        |--------------------------------------------------------------------------
        */

        @page {
            margin: 20px;
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
                Purchase Bill
            </h3>

            <h3>
                Bill No.
                {{ $bill->bill_no }}
            </h3>

            <!--
            |--------------------------------------------------------------------------
            | Information
            |--------------------------------------------------------------------------
            -->

            <div class="informations">

                <!-- Left -->

                <div class="left">

                    <div>

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

                        @if ($bill->purchaseOrder?->requisition?->requisition_id)
                            <p>
                                Requisition No.:

                                {{ $bill->purchaseOrder->requisition->requisition_id }}
                            </p>
                        @endif

                        <p>
                            Vendor:

                            {{ $bill->vendor?->name ?? 'N/A' }}

                            @if ($bill->vendor?->vendor_id)
                                (
                                {{ $bill->vendor->vendor_id }}
                                )
                            @endif
                        </p>

                        <p>
                            Warehouse:

                            {{ $bill->goodsReceivedNote?->warehouse?->name ?? ($bill->purchaseOrder?->warehouse?->name ?? 'N/A') }}
                        </p>

                    </div>

                </div>

                <!-- Right -->

                <div class="right">

                    <div>

                        <p style="margin-bottom: 5px;">
                            <span>
                                Bill Details:
                            </span>
                        </p>

                        <p>
                            Bill Date:

                            {{ $bill->bill_date ? \Carbon\Carbon::parse($bill->bill_date)->format('d M, Y') : 'N/A' }}
                        </p>

                        <p>
                            Due Date:

                            {{ $bill->due_date ? \Carbon\Carbon::parse($bill->due_date)->format('d M, Y') : 'N/A' }}
                        </p>

                        <p>
                            Payment Status:

                            <span class="">
                                {{ $bill->payment_status }}
                            </span>
                        </p>

                        <p>
                            Created By:

                            {{ $bill->createdBy?->name ?? 'N/A' }}
                        </p>

                        @if ($bill->createdBy?->employee_id)
                            <p>
                                Employee ID:

                                {{ $bill->createdBy->employee_id }}
                            </p>
                        @endif

                        <p>
                            Created At:

                            {{ $bill->created_at ? $bill->created_at->format('d M, Y h:i A') : 'N/A' }}
                        </p>

                    </div>

                </div>

            </div>

            <!--
            |--------------------------------------------------------------------------
            | Items Table
            |--------------------------------------------------------------------------
            -->

            @if ($bill->items->count() > 0)

                <table>
                    <thead>
                        <tr>

                            <th>
                                SL
                            </th>

                            <th>
                                Item Name
                            </th>

                            <th>
                                Unit
                            </th>

                            <th>
                                Quantity
                            </th>

                            <th>
                                Unit Price
                            </th>

                            <th>
                                Tax
                            </th>

                            <th>
                                Total
                            </th>

                        </tr>
                    </thead>

                    <tbody>

                        @forelse ($bill->items as $index => $item)
                            <tr>

                                <td>
                                    {{ $index + 1 }}
                                </td>

                                <td>

                                    {{ $item->product?->name ?? 'N/A' }}

                                    @if ($item->product?->code)
                                        <br>

                                        <small>
                                            #{{ $item->product->code }}
                                        </small>
                                    @endif

                                </td>

                                <td>
                                    {{ $item->unit ?? 'N/A' }}
                                </td>

                                <td class="text-right">

                                    {{ number_format((float) ($item->quantity ?? 0), 2) }}

                                </td>

                                <td class="text-right">

                                    {{ number_format((float) ($item->unit_price ?? 0), 2) }}

                                </td>


                                <td>

                                    @php
                                        $taxes = is_array($item->taxes) ? $item->taxes : [];
                                    @endphp

                                    @if (count($taxes) > 0)
                                        @foreach ($taxes as $tax)
                                            {{ $tax['name'] ?? 'Tax' }}

                                            @if (isset($tax['rate']))
                                                ({{ number_format((float) $tax['rate'], 2) }}%)
                                            @endif

                                            @if (!$loop->last)
                                                <br>
                                            @endif
                                        @endforeach
                                    @else
                                        N/A
                                    @endif

                                    @if ((float) $item->total_tax > 0)
                                        <br>

                                        <small>
                                            Amount:
                                            {{ number_format((float) $item->total_tax, 2) }}
                                        </small>
                                    @endif

                                </td>

                                <td class="text-right">

                                    <strong>
                                        {{ number_format((float) ($item->total_amount ?? 0), 2) }}
                                    </strong>

                                </td>

                            </tr>

                        @empty

                            <tr>

                                <td colspan="8" style="text-align: center;">
                                    No items found for this bill.
                                </td>

                            </tr>
                        @endforelse

                    </tbody>

                </table>
            @else
                <p>
                    No item records found for this bill.
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
                                Sub Total
                            </td>

                            <td class="amount">
                                {{ number_format((float) $bill->sub_total, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td class="label">
                                Total Tax
                            </td>

                            <td class="amount">
                                +
                                {{ number_format((float) $bill->total_tax, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td class="label">
                                Discount
                            </td>

                            <td class="amount">
                                -
                                {{ number_format((float) $bill->total_discount, 2) }}
                            </td>

                        </tr>

                        <tr>

                            <td class="label">
                                Shipping Cost
                            </td>

                            <td class="amount">
                                +
                                {{ number_format((float) $bill->shipping_cost, 2) }}
                            </td>

                        </tr>

                        <tr class="grand-total">

                            <td class="label">
                                Grand Total
                            </td>

                            <td class="amount">
                                {{ number_format((float) $bill->grand_total, 2) }}
                            </td>

                        </tr>

                        <tr class="paid">

                            <td class="label">
                                Paid Amount
                            </td>

                            <td class="amount">
                                {{ number_format((float) $bill->paid_amount, 2) }}
                            </td>

                        </tr>

                        <tr class="due">

                            <td class="label">
                                Due Amount
                            </td>

                            <td class="amount">
                                {{ number_format((float) $bill->due_amount, 2) }}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

            <div class="doc-footer">

                Generated on
                {{ now()->format('d M Y, H:i') }}
                · System-generated document

            </div>

        </div>

    </section>

</body>

</html>
