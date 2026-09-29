<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="icon" href="{{ asset($configure->logo) }}" type="image/x-icon">
    <link rel="shortcut icon" href="{{ asset($configure->logo) }}" type="image/x-icon">
    <title>PO {{ $purchaseOrder->order_id }}</title>

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
            font-size: 12px;
        }

        .report {
            max-width: 100%;
            margin: 0 auto;
            padding: 30px;
            background-color: #fff;
        }

        .report .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }

        .report .header h1 {
            margin-bottom: 5px;
            font-size: 22px;
            letter-spacing: 1px;
            color: #333;
        }

        .report .header p {
            font-size: 12px;
            padding: 2px 0;
            color: #333;
        }

        .report .header p span {
            font-weight: 700;
        }

        .report .body {
            margin-top: 20px;
        }

        .report .body h3 {
            font-size: 16px;
            letter-spacing: 1px;
            margin-bottom: 4px;
            text-align: center;
            text-transform: uppercase;
        }

        .report .body .status-line {
            text-align: center;
            font-size: 11px;
            margin-bottom: 16px;
            color: #555;
        }

        .report .body .informations {
            font-size: 11px;
            margin-bottom: 16px;
            margin-top: 10px;
        }

        .report .body .informations::after {
            content: "";
            clear: both;
            display: table;
        }

        .report .body .informations .left {
            float: left;
            width: 55%;
        }

        .report .body .informations .right {
            float: right;
            width: 40%;
            text-align: right;
        }

        .report .body .informations .left div,
        .report .body .informations .right div {
            margin: 3px 0;
        }

        .report .body .informations .left span,
        .report .body .informations .right span {
            font-weight: 700;
        }

        .req-box {
            clear: both;
            margin-top: 10px;
            padding: 8px 10px;
            border-left: 3px solid #0d6efd;
            background: #f8f9fa;
            font-size: 11px;
        }

        .report table {
            font-size: 10px;
            letter-spacing: 0.3px;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            margin-top: 12px;
        }

        th {
            padding: 6px 5px;
            text-align: left;
            border: 1px solid #ddd;
            background: #f1f3f5;
            font-weight: 700;
        }

        td {
            padding: 5px;
            text-align: left;
            word-wrap: break-word;
            border: 1px solid #ddd;
        }

        tfoot td {
            text-align: right;
            font-weight: 600;
        }

        tfoot td.label {
            text-align: right;
        }

        tfoot td.value {
            text-align: right;
            white-space: nowrap;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .note {
            margin-top: 12px;
            font-size: 11px;
        }

        .signatures {
            margin-top: 40px;
            width: 100%;
            border-collapse: collapse;
        }

        .signatures td {
            border: none;
            width: 33%;
            text-align: center;
            vertical-align: top;
            padding-top: 30px;
        }

        .sig-line {
            border-top: 1px solid #333;
            margin: 0 20px;
            padding-top: 6px;
            font-size: 11px;
        }

        .doc-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 8px;
        }

        @page {
            margin: 16mm 12mm;
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
                padding: 10px;
            }
        }
    </style>
</head>

<body>

    @php
        $isReqBased = (bool) $purchaseOrder->is_requisition_based;

        $rate = $activeCurrency->exchange_rate ?? 1;

        $code = $activeCurrency->currency_code ?? 'USD';
    @endphp

    <section class="report">

        {{-- Header --}}

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

                @if ($configure->email)
                    , Email:
                    {{ $configure->email }}
                @endif
            </p>

        </div>

        <div class="body">

            <h3>
                Purchase Order
            </h3>

            <div class="status-line">

                #{{ $purchaseOrder->order_id }}

                &nbsp;|&nbsp;

                Status:

                <strong>
                    {{ $purchaseOrder->status ?? 'Pending' }}
                </strong>

                &nbsp;|&nbsp;

                {{ $isReqBased ? 'Requisition Based' : 'Free Purchase' }}

            </div>

            <div class="informations">

                <div class="left">

                    <div>

                        <p style="margin-bottom:4px">
                            <span>
                                PO Details
                            </span>
                        </p>

                        <p>
                            PO No:
                            #{{ $purchaseOrder->order_id }}
                        </p>

                        <p>
                            Order Date:

                            {{ $purchaseOrder->order_date ? \Carbon\Carbon::parse($purchaseOrder->order_date)->format('d M, Y') : 'N/A' }}
                        </p>

                        <p>
                            Created:

                            {{ $purchaseOrder->created_at?->format('d M, Y h:i A') ?? 'N/A' }}
                        </p>

                        <p>
                            Warehouse:

                            {{ $purchaseOrder->warehouse->name ?? 'N/A' }}
                        </p>

                        <p>
                            Vendor:

                            {{ $purchaseOrder->vendor->name ?? 'N/A' }}

                            @if ($purchaseOrder->vendor)
                                (#{{ $purchaseOrder->vendor->vendor_id ?? '' }})
                            @endif
                        </p>

                    </div>

                </div>

                <div class="right">

                    <div>

                        <p style="margin-bottom:4px">
                            <span>
                                Issued By
                            </span>
                        </p>

                        <p>
                            Name:

                            {{ $purchaseOrder->createdBy->name ?? 'N/A' }}
                        </p>

                        <p>
                            Employee ID:

                            {{ $purchaseOrder->createdBy->employee_id ?? 'N/A' }}
                        </p>

                    </div>

                </div>

            </div>

            {{-- Requisition --}}

            @if ($isReqBased && $purchaseOrder->requisition)
                <div class="req-box">

                    <strong>
                        Requisition:
                    </strong>

                    {{ $purchaseOrder->requisition->requisition_id }}

                </div>
            @endif

            {{-- Purchase Items --}}

            @if ($purchaseOrder->purchaseItems->count() > 0)

                <table>

                    <thead>

                        <tr>

                            <th style="width: 5%">
                                SL
                            </th>

                            <th>
                                Item Name
                            </th>

                            <th style="width: 12%">
                                Quantity
                            </th>

                            <th style="width: 12%">
                                Unit Price
                            </th>

                            <th style="width: 14%">
                                Tax
                            </th>

                            <th style="width: 13%">
                                Line Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        @foreach ($purchaseOrder->purchaseItems as $index => $item)
                            @php
                                /*
                            |--------------------------------------------------------------------------
                            | Product
                            |--------------------------------------------------------------------------
                            */

                                $itemName = $item->product_name ?? 'N/A';

                                /*
                            |--------------------------------------------------------------------------
                            | Line
                            |--------------------------------------------------------------------------
                            */

                                $lineSub = (float) $item->quantity * (float) $item->unit_price;

                                $taxAmt = (float) ($item->tax_amount ?? 0);

                                $lineTot = (float) ($item->line_total ?? $lineSub + $taxAmt);

                                /*
                            |--------------------------------------------------------------------------
                            | Multiple Taxes
                            |--------------------------------------------------------------------------
                            */

                                $itemTaxes = $item->pdf_taxes ?? [];
                            @endphp

                            <tr>

                                <td class="text-center">
                                    {{ $index + 1 }}
                                </td>

                                <td>
                                    {{ $itemName }}
                                </td>

                                <td>

                                    {{ number_format($item->quantity, 2) }}

                                    ({{ $item->unit }})

                                </td>

                                <td class="text-right">

                                    {{ $code }}

                                    {{ number_format($item->unit_price * $rate, 2) }}

                                </td>

                                <td class="text-right">

                                    @if (count($itemTaxes) > 0)
                                        @foreach ($itemTaxes as $taxIndex => $tax)
                                            {{ number_format((float) ($tax['rate'] ?? 0), 2) }}%

                                            ({{ number_format(((float) ($tax['tax_amount'] ?? 0)) * $rate, 2) }})
                                            @if ($taxIndex < count($itemTaxes) - 1)
                                                <br>
                                            @endif
                                        @endforeach
                                    @else
                                        —
                                    @endif

                                </td>

                                <td class="text-right">

                                    {{ $code }}

                                    {{ number_format($lineTot * $rate, 2) }}

                                </td>

                            </tr>
                        @endforeach

                    </tbody>

                    <tfoot>

                        <tr>

                            <td colspan="4"></td>

                            <td class="label">
                                Sub Total (excl. tax)
                            </td>

                            <td class="value">

                                {{ $code }}

                                {{ number_format(
                                    ($purchaseOrder->sub_total ?? $purchaseOrder->purchaseItems->sum(fn($i) => $i->quantity * $i->unit_price)) * $rate,
                                    2,
                                ) }}

                            </td>

                        </tr>

                        <tr>

                            <td colspan="4"></td>

                            <td class="label">
                                Total Tax
                            </td>

                            <td class="value">

                                {{ $code }}

                                {{ number_format(($purchaseOrder->order_tax ?? 0) * $rate, 2) }}

                            </td>

                        </tr>

                        <tr>

                            <td colspan="4"></td>

                            <td class="label">
                                Discount
                            </td>

                            <td class="value">

                                {{ $code }}

                                {{ number_format(($purchaseOrder->order_discount ?? 0) * $rate, 2) }}

                            </td>

                        </tr>

                        <tr>

                            <td colspan="4"></td>

                            <td class="label">
                                Shipping
                            </td>

                            <td class="value">

                                {{ $code }}

                                {{ number_format(($purchaseOrder->shipping_cost ?? 0) * $rate, 2) }}

                            </td>

                        </tr>

                        <tr>

                            <td colspan="4"></td>

                            <td class="label">
                                <strong>
                                    Grand Total
                                </strong>
                            </td>

                            <td class="value">

                                <strong>

                                    {{ $code }}

                                    {{ number_format(($purchaseOrder->grand_total ?? 0) * $rate, 2) }}

                                </strong>

                            </td>

                        </tr>

                    </tfoot>

                </table>
            @else
                <p
                    style="
                    text-align:center;
                    margin-top: 20px;
                ">
                    No items found for this purchase order.
                </p>

            @endif

            @if ($purchaseOrder->note)
                <div class="note">

                    <strong>
                        Note:
                    </strong>

                    {{ $purchaseOrder->note }}

                </div>
            @endif

            {{-- Signatures --}}

            <table class="signatures">

                <tr>

                    <td>
                        <div class="sig-line">
                            Prepared By
                        </div>
                    </td>

                    <td>
                        <div class="sig-line">
                            Checked By
                        </div>
                    </td>

                    <td>
                        <div class="sig-line">
                            Approved By
                        </div>
                    </td>

                </tr>

            </table>

            <div class="doc-footer">

                Generated on
                {{ now()->format('d M Y, H:i') }}
                · System-generated document

            </div>

        </div>

    </section>

</body>

</html>
