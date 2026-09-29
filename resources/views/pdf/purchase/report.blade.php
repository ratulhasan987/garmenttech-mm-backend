<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <title>
        Purchase Report
    </title>

    <style>
        @page {
            margin: 18px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #222;
        }

        /*
        |--------------------------------------------------------------------------
        | Header
        |--------------------------------------------------------------------------
        */

        .header {
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 1px solid #999;
        }

        .header h1 {
            margin: 0 0 6px;
            font-size: 21px;
            text-transform: uppercase;
        }

        .header p {
            margin: 2px 0;
            font-size: 9px;
        }

        /*
        |--------------------------------------------------------------------------
        | Title
        |--------------------------------------------------------------------------
        */

        .report-title {
            text-align: center;
            margin: 14px 0;
        }

        .report-title h2 {
            margin: 0 0 4px;
            font-size: 16px;
        }

        .report-title p {
            margin: 0;
            color: #666;
        }

        /*
        |--------------------------------------------------------------------------
        | Information
        |--------------------------------------------------------------------------
        */

        .information {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .information td {
            border: none;
            padding: 2px 0;
            vertical-align: top;
            line-height: 1.5;
        }

        .information .right {
            text-align: right;
        }

        /*
        |--------------------------------------------------------------------------
        | Report Table
        |--------------------------------------------------------------------------
        */

        .report-table {
            width: 100%;
            border-collapse: collapse;
        }

        .report-table th,
        .report-table td {
            border: 1px solid #aaa;
            padding: 4px;
            vertical-align: middle;
            text-align: center;
        }

        .report-table thead th {
            background-color: #eeeeee;
            font-weight: bold;
        }

        .report-table tfoot th {
            background-color: #f5f5f5;
        }

        /*
        |--------------------------------------------------------------------------
        | Helpers
        |--------------------------------------------------------------------------
        */

        .text-left {
            text-align: left !important;
        }

        .text-right {
            text-align: right !important;
        }

        .nowrap {
            white-space: nowrap;
        }

        .muted {
            color: #666;
        }

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        .summary-table {
            width: 350px;
            margin-left: auto;
            margin-top: 15px;
            border-collapse: collapse;
        }

        .summary-table th,
        .summary-table td {
            border: 1px solid #aaa;
            padding: 5px;
        }

        .summary-table th {
            background-color: #f5f5f5;
            text-align: left;
        }

        .summary-table td {
            text-align: right;
        }

        .grand-total-row th,
        .grand-total-row td {
            background-color: #eeeeee;
            font-weight: bold;
        }

        /*
        |--------------------------------------------------------------------------
        | Footer
        |--------------------------------------------------------------------------
        */

        .footer {
            margin-top: 18px;
            text-align: center;
            font-size: 8px;
            color: #777;
        }
    </style>
</head>

<body>

    @php
        /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | Tk is used for BDT because the ৳ glyph may render as a box in DomPDF
    | when a Bengali-compatible font is not embedded.
    |
    */

        $currencySymbol = $activeCurrency?->symbol ?: 'Tk';

        if ($currencySymbol === '৳') {
            $currencySymbol = 'Tk';
        }

        /*
    |--------------------------------------------------------------------------
    | Report Title
    |--------------------------------------------------------------------------
    */

        $reportTitle = match ($report_type) {
            'vendor' => 'Vendor Wise Purchase Report',
            'warehouse' => 'Warehouse Wise Purchase Report',
            default => 'Date Wise Purchase Report',
        };

        /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

        $totalSubtotal = (float) $purchaseOrders->sum('sub_total');

        $totalTax = (float) $purchaseOrders->sum('order_tax');

        $totalDiscount = (float) $purchaseOrders->sum('order_discount');

        $totalShipping = (float) $purchaseOrders->sum('shipping_cost');

        $totalGrand = (float) $purchaseOrders->sum('grand_total');

        /*
    |--------------------------------------------------------------------------
    | Dynamic Columns
    |--------------------------------------------------------------------------
    */

        $leadingColumnCount = 1 + ($report_type !== 'vendor' ? 1 : 0) + ($report_type !== 'warehouse' ? 1 : 0);

        /*
    | Product + Qty + Unit + Price + Tax + Line Total
    */

        $itemColumnCount = 6;

        /*
    | Grand Total
    */

        $totalColumnCount = $leadingColumnCount + $itemColumnCount + 1;
    @endphp


    {{--
|--------------------------------------------------------------------------
| Company Header
|--------------------------------------------------------------------------
--}}

    <div class="header">

        <h1>
            {{ $configure?->name ?? config('app.name') }}
        </h1>

        @if ($configure?->address)
            <p>
                <strong>
                    Office Address:
                </strong>

                {{ $configure->address }}
            </p>
        @endif

        <p>
            @if ($configure?->phone)
                <strong>
                    Contact:
                </strong>

                {{ $configure->phone }}
            @endif

            @if ($configure?->phone && $configure?->email)
                &nbsp; | &nbsp;
            @endif

            @if ($configure?->email)
                <strong>
                    Email:
                </strong>

                {{ $configure->email }}
            @endif
        </p>

    </div>


    {{--
|--------------------------------------------------------------------------
| Report Title
|--------------------------------------------------------------------------
--}}

    <div class="report-title">

        <h2>
            {{ $reportTitle }}
        </h2>

        <p>
            Approved Purchase Orders
        </p>

    </div>


    {{--
|--------------------------------------------------------------------------
| Information
|--------------------------------------------------------------------------
--}}

    <table class="information">

        <tr>

            <td>

                <strong>
                    Generated Date:
                </strong>

                {{ now()->format('d F, Y') }}

                <br>

                <strong>
                    From:
                </strong>

                {{ \Carbon\Carbon::parse($start_date)->format('d F, Y') }}

                <br>

                <strong>
                    To:
                </strong>

                {{ \Carbon\Carbon::parse($end_date)->format('d F, Y') }}

                <br>

                <strong>
                    Total Purchase Orders:
                </strong>

                {{ $purchaseOrders->count() }}

            </td>


            <td class="right">

                @if ($report_type === 'vendor')
                    <strong>
                        Vendor:
                    </strong>

                    {{ $vendor_name ?: 'N/A' }}

                    <br>

                    <strong>
                        Vendor ID:
                    </strong>

                    {{ $vendor_code ?: 'N/A' }}
                @elseif($report_type === 'warehouse')
                    <strong>
                        Warehouse:
                    </strong>

                    {{ $warehouse_name ?: 'N/A' }}

                    <br>

                    <strong>
                        Warehouse Code:
                    </strong>

                    {{ $warehouse_code ?: 'N/A' }}
                @endif

            </td>

        </tr>

    </table>


    {{--
|--------------------------------------------------------------------------
| Purchase Table
|--------------------------------------------------------------------------
--}}

    <table class="report-table">

        <thead>

            <tr>

                <th>
                    PO No / Date
                </th>

                @if ($report_type !== 'vendor')
                    <th>
                        Vendor
                    </th>
                @endif

                @if ($report_type !== 'warehouse')
                    <th>
                        Warehouse
                    </th>
                @endif

                <th>
                    Product
                </th>

                <th>
                    Qty
                </th>

                <th>
                    Unit
                </th>

                <th>
                    Unit Price
                </th>

                <th>
                    Tax
                </th>

                <th>
                    Line Total
                </th>

                <th>
                    Grand Total
                </th>

            </tr>

        </thead>


        <tbody>

            @forelse($purchaseOrders as $purchaseOrder)

                @php
                    $itemCount = $purchaseOrder->purchaseItems->count();
                @endphp


                @if ($itemCount > 0)
                    @foreach ($purchaseOrder->purchaseItems as $index => $item)
                        <tr>

                            @if ($index === 0)
                                {{-- Purchase Order --}}

                                <td rowspan="{{ $itemCount }}" class="nowrap">
                                    <strong>
                                        {{ $purchaseOrder->order_id }}
                                    </strong>

                                    <br>

                                    <span class="muted">
                                        {{ \Carbon\Carbon::parse($purchaseOrder->order_date)->format('d M Y') }}
                                    </span>
                                </td>


                                {{-- Vendor --}}

                                @if ($report_type !== 'vendor')
                                    <td rowspan="{{ $itemCount }}">

                                        <strong>
                                            {{ $purchaseOrder->vendor?->name ?? 'N/A' }}
                                        </strong>

                                        <br>

                                        <span class="muted">
                                            {{ $purchaseOrder->vendor?->vendor_id ?? '—' }}
                                        </span>

                                    </td>
                                @endif


                                {{-- Warehouse --}}

                                @if ($report_type !== 'warehouse')
                                    <td rowspan="{{ $itemCount }}">

                                        <strong>
                                            {{ $purchaseOrder->warehouse?->name ?? 'N/A' }}
                                        </strong>

                                        <br>

                                        <span class="muted">
                                            {{ $purchaseOrder->warehouse?->code ?? '—' }}
                                        </span>

                                    </td>
                                @endif
                            @endif


                            {{-- Product --}}

                            <td class="text-left">

                                <strong>
                                    {{ $item->product?->name ?? 'N/A' }}
                                </strong>

                                @if ($item->product?->code)
                                    <br>

                                    <span class="muted">
                                        {{ $item->product->code }}
                                    </span>
                                @endif

                            </td>


                            {{-- Quantity --}}

                            <td class="nowrap">

                                {{ number_format((float) $item->quantity, 2) }}

                            </td>


                            {{-- Unit --}}

                            <td>

                                {{ $item->unit ?: 'N/A' }}

                            </td>


                            {{-- Unit Price --}}

                            <td class="nowrap">

                                {{ $currencySymbol }}

                                {{ number_format((float) $item->unit_price, 2) }}

                            </td>


                            {{-- Tax --}}

                            <td class="nowrap">

                                {{ $currencySymbol }}

                                {{ number_format((float) $item->tax_amount, 2) }}

                            </td>


                            {{-- Line Total --}}

                            <td class="nowrap">

                                {{ $currencySymbol }}

                                {{ number_format((float) $item->line_total, 2) }}

                            </td>


                            {{-- PO Grand Total --}}

                            @if ($index === 0)
                                <td rowspan="{{ $itemCount }}" class="nowrap">

                                    <strong>

                                        {{ $currencySymbol }}

                                        {{ number_format((float) $purchaseOrder->grand_total, 2) }}

                                    </strong>

                                </td>
                            @endif

                        </tr>
                    @endforeach
                @else
                    <tr>

                        <td class="nowrap">

                            <strong>
                                {{ $purchaseOrder->order_id }}
                            </strong>

                            <br>

                            <span class="muted">
                                {{ \Carbon\Carbon::parse($purchaseOrder->order_date)->format('d M Y') }}
                            </span>

                        </td>


                        @if ($report_type !== 'vendor')
                            <td>
                                {{ $purchaseOrder->vendor?->name ?? 'N/A' }}
                            </td>
                        @endif


                        @if ($report_type !== 'warehouse')
                            <td>
                                {{ $purchaseOrder->warehouse?->name ?? 'N/A' }}
                            </td>
                        @endif


                        <td colspan="6">
                            No purchase items found
                        </td>


                        <td class="nowrap">

                            {{ $currencySymbol }}

                            {{ number_format((float) $purchaseOrder->grand_total, 2) }}

                        </td>

                    </tr>
                @endif


            @empty

                <tr>

                    <td colspan="{{ $totalColumnCount }}"
                        style="
                        text-align: center;
                        padding: 18px;
                    ">
                        No approved purchase orders found
                        for the selected report.
                    </td>

                </tr>

            @endforelse

        </tbody>

    </table>


    {{--
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
--}}

    @if ($purchaseOrders->isNotEmpty())
        <table class="summary-table">

            <tr>

                <th>
                    Subtotal
                </th>

                <td>

                    {{ $currencySymbol }}

                    {{ number_format($totalSubtotal, 2) }}

                </td>

            </tr>


            <tr>

                <th>
                    Order Tax
                </th>

                <td>

                    {{ $currencySymbol }}

                    {{ number_format($totalTax, 2) }}

                </td>

            </tr>


            <tr>

                <th>
                    Order Discount
                </th>

                <td>

                    {{ $currencySymbol }}

                    {{ number_format($totalDiscount, 2) }}

                </td>

            </tr>


            <tr>

                <th>
                    Shipping Cost
                </th>

                <td>

                    {{ $currencySymbol }}

                    {{ number_format($totalShipping, 2) }}

                </td>

            </tr>


            <tr class="grand-total-row">

                <th>
                    Grand Total
                </th>

                <td>

                    {{ $currencySymbol }}

                    {{ number_format($totalGrand, 2) }}

                </td>

            </tr>

        </table>
    @endif


    {{--
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
--}}

    <div class="footer">

        Generated from

        {{ $configure?->name ?? config('app.name') }}

        on

        {{ now()->format('d F Y, h:i A') }}

    </div>

</body>

</html>
