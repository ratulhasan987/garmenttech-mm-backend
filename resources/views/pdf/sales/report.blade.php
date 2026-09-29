<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <title>
        Sales Report
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
        | Report Title
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
            font-weight: bold;
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
            width: 330px;
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
            font-weight: bold;
            background-color: #eeeeee;
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
    */

        $currencyCode =
        $activeCurrency?->currency_code
        ?? 'BDT';

    /*
    |--------------------------------------------------------------------------
    | Report Title
    |--------------------------------------------------------------------------
    */

    $reportTitle =
        match ($report_type) {

            'client' =>
                'Customer Wise Sales Report',

            'warehouse' =>
                'Warehouse Wise Sales Report',

            default =>
                'Date Wise Sales Report',
        };

    /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

    $totalSubtotal =
        (float) $invoices->sum(
            'subtotal'
        );

    $totalDiscount =
        (float) $invoices->sum(
            'discount'
        );

    $totalTax =
        (float) $invoices->sum(
            'tax'
        );

    $totalAdjustment =
        (float) $invoices->sum(
            'adjustment_amount'
        );

    $totalGrand =
        (float) $invoices->sum(
            'grand_total'
        );

    $totalPaid =
        (float) $invoices->sum(
            'paid_amount'
        );

    $totalDue =
        (float) $invoices->sum(
            'due_amount'
        );

    /*
    |--------------------------------------------------------------------------
    | Dynamic Columns
    |--------------------------------------------------------------------------
    |
    | Customer report:
    | Invoice + Warehouse
    |
    | Warehouse report:
    | Invoice + Customer
    |
    | Date report:
    | Invoice + Customer + Warehouse
    |
    */

    $leadingColumnCount =
        1 +
        ($report_type !== 'client' ? 1 : 0) +
        ($report_type !== 'warehouse' ? 1 : 0);

    /*
    | Product, Qty, Price, Discount, Tax, Line Total = 6
    */

    $footerColspan =
        $leadingColumnCount + 6;

    /*
    | + Grand, Paid, Due, Payment = 4
    */

    $totalColumnCount =
        $footerColspan + 4;

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

        @if (
            $configure?->phone &&
            $configure?->email
        )

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
        Approved Sales Invoices
    </p>

</div>


{{--
|--------------------------------------------------------------------------
| Report Information
|--------------------------------------------------------------------------
--}}

<table class="information">

    <tr>

        <td>

            <strong>
                Generated Date:
            </strong>

            {{ now()->format(
                'd F, Y'
            ) }}

            <br>

            <strong>
                From:
            </strong>

            {{ \Carbon\Carbon::parse(
                $start_date
            )->format(
                'd F, Y'
            ) }}

            <br>

            <strong>
                To:
            </strong>

            {{ \Carbon\Carbon::parse(
                $end_date
            )->format(
                'd F, Y'
            ) }}

            <br>

            <strong>
                Total Invoices:
            </strong>

            {{ $invoices->count() }}

        </td>


        <td class="right">

            {{--
            |--------------------------------------------------------------------------
            | Customer Wise
            |--------------------------------------------------------------------------
            --}}

            @if ($report_type === 'client')

                <strong>
                    Customer:
                </strong>

                {{ $client_name ?: 'N/A' }}

                <br>

                <strong>
                    Customer ID:
                </strong>

                {{ $client_code ?: 'N/A' }}

                @if ($client_company)

                    <br>

                    <strong>
                        Company:
                    </strong>

                    {{ $client_company }}

                @endif

                @if ($client_phone)

                    <br>

                    <strong>
                        Phone:
                    </strong>

                    {{ $client_phone }}

                @endif


            {{--
            |--------------------------------------------------------------------------
            | Warehouse Wise
            |--------------------------------------------------------------------------
            --}}

            @elseif ($report_type === 'warehouse')

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
| Invoice Table
|--------------------------------------------------------------------------
--}}

<table class="report-table">

    <thead>

        <tr>

            <th>
                Invoice No / Date
            </th>

            {{--
            |--------------------------------------------------------------------------
            | Customer
            |--------------------------------------------------------------------------
            --}}

            @if ($report_type !== 'client')

                <th>
                    Customer
                </th>

            @endif

            {{--
            |--------------------------------------------------------------------------
            | Warehouse
            |--------------------------------------------------------------------------
            --}}

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
                Unit Price ({{ $currencyCode }})
            </th>

            <th>
                Discount ({{ $currencyCode }})
            </th>

            <th>
                Tax ({{ $currencyCode }})
            </th>

            <th>
                Line Total ({{ $currencyCode }})
            </th>

            <th>
                Grand Total ({{ $currencyCode }})
            </th>

            <th>
                Paid ({{ $currencyCode }})
            </th>

            <th>
                Due ({{ $currencyCode }})
            </th>

            <th>
                Payment
            </th>

        </tr>

    </thead>


    <tbody>

        @forelse (
            $invoices
            as $invoice
        )

            @php

                $itemCount =
                    $invoice
                        ->items
                        ->count();

            @endphp


            {{--
            |--------------------------------------------------------------------------
            | Invoice Has Items
            |--------------------------------------------------------------------------
            --}}

            @if ($itemCount > 0)

                @foreach (
                    $invoice->items
                    as $index =>
                    $item
                )

                    <tr>

                        @if ($index === 0)

                            {{--
                            |--------------------------------------------------------------------------
                            | Invoice
                            |--------------------------------------------------------------------------
                            --}}

                            <td
                                rowspan="{{ $itemCount }}"
                                class="nowrap"
                            >

                                <strong>
                                    {{ $invoice->invoice_no }}
                                </strong>

                                <br>

                                <span class="muted">

                                    {{ \Carbon\Carbon::parse(
                                        $invoice->invoice_date
                                    )->format(
                                        'd M Y'
                                    ) }}

                                </span>

                            </td>


                            {{--
                            |--------------------------------------------------------------------------
                            | Customer
                            |--------------------------------------------------------------------------
                            --}}

                            @if ($report_type !== 'client')

                                <td
                                    rowspan="{{ $itemCount }}"
                                >

                                    <strong>

                                        {{ $invoice->client?->name ?? 'N/A' }}

                                    </strong>

                                    <br>

                                    <span class="muted">

                                        {{ $invoice->client?->client_no ?? '—' }}

                                    </span>

                                </td>

                            @endif


                            {{--
                            |--------------------------------------------------------------------------
                            | Warehouse
                            |--------------------------------------------------------------------------
                            --}}

                            @if ($report_type !== 'warehouse')

                                <td
                                    rowspan="{{ $itemCount }}"
                                >

                                    <strong>

                                        {{ $invoice->warehouse?->name ?? 'N/A' }}

                                    </strong>

                                    <br>

                                    <span class="muted">

                                        {{ $invoice->warehouse?->code ?? '—' }}

                                    </span>

                                </td>

                            @endif

                        @endif


                        {{--
                        |--------------------------------------------------------------------------
                        | Product
                        |--------------------------------------------------------------------------
                        --}}

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


                        {{--
                        |--------------------------------------------------------------------------
                        | Quantity
                        |--------------------------------------------------------------------------
                        --}}

                        <td class="nowrap">

                            {{ number_format(
                                (float) $item->quantity,
                                2
                            ) }}

                            @if (
                                $item->product
                                    ?->unit
                                    ?->name
                            )

                                {{ $item
                                    ->product
                                    ->unit
                                    ->name }}

                            @endif

                        </td>


                        {{--
                        |--------------------------------------------------------------------------
                        | Unit Price
                        |--------------------------------------------------------------------------
                        --}}

                        <td class="nowrap">

                            {{ number_format(
                                (float) $item->unit_price,
                                2
                            ) }}

                        </td>


                        {{--
                        |--------------------------------------------------------------------------
                        | Discount
                        |--------------------------------------------------------------------------
                        --}}

                        <td class="nowrap">

                            {{ number_format(
                                (float) $item->discount,
                                2
                            ) }}

                        </td>


                        {{--
                        |--------------------------------------------------------------------------
                        | Tax
                        |--------------------------------------------------------------------------
                        --}}

                        <td class="nowrap">

                            {{ number_format(
                                (float) $item->tax,
                                2
                            ) }}

                        </td>


                        {{--
                        |--------------------------------------------------------------------------
                        | Line Total
                        |--------------------------------------------------------------------------
                        --}}

                        <td class="nowrap">

                            {{ number_format(
                                (float) $item->line_total,
                                2
                            ) }}

                        </td>


                        {{--
                        |--------------------------------------------------------------------------
                        | Invoice Totals
                        |--------------------------------------------------------------------------
                        --}}

                        @if ($index === 0)

                            <td
                                rowspan="{{ $itemCount }}"
                                class="nowrap"
                            >

                                <strong>

                                    {{ number_format(
                                        (float) $invoice->grand_total,
                                        2
                                    ) }}

                                </strong>

                            </td>


                            <td
                                rowspan="{{ $itemCount }}"
                                class="nowrap"
                            >

                                {{ number_format(
                                    (float) $invoice->paid_amount,
                                    2
                                ) }}

                            </td>


                            <td
                                rowspan="{{ $itemCount }}"
                                class="nowrap"
                            >

                                {{ number_format(
                                    (float) $invoice->due_amount,
                                    2
                                ) }}

                            </td>


                            <td
                                rowspan="{{ $itemCount }}"
                            >

                                {{ ucfirst(
                                    $invoice->payment_status
                                    ?? 'unpaid'
                                ) }}

                            </td>

                        @endif

                    </tr>

                @endforeach


            {{--
            |--------------------------------------------------------------------------
            | Invoice Has No Items
            |--------------------------------------------------------------------------
            --}}

            @else

                <tr>

                    <td class="nowrap">

                        <strong>
                            {{ $invoice->invoice_no }}
                        </strong>

                        <br>

                        <span class="muted">

                            {{ \Carbon\Carbon::parse(
                                $invoice->invoice_date
                            )->format(
                                'd M Y'
                            ) }}

                        </span>

                    </td>


                    @if ($report_type !== 'client')

                        <td>

                            {{ $invoice->client?->name ?? 'N/A' }}

                        </td>

                    @endif


                    @if ($report_type !== 'warehouse')

                        <td>

                            {{ $invoice->warehouse?->name ?? 'N/A' }}

                        </td>

                    @endif


                    <td
                        colspan="6"
                    >
                        No invoice items found
                    </td>


                    <td class="nowrap">

                        {{ number_format(
                            (float) $invoice->grand_total,
                            2
                        ) }}

                    </td>


                    <td class="nowrap">

                        {{ number_format(
                            (float) $invoice->paid_amount,
                            2
                        ) }}

                    </td>


                    <td class="nowrap">

                        {{ number_format(
                            (float) $invoice->due_amount,
                            2
                        ) }}

                    </td>


                    <td>

                        {{ ucfirst(
                            $invoice->payment_status
                            ?? 'unpaid'
                        ) }}

                    </td>

                </tr>

            @endif


        @empty

            <tr>

                <td
                    colspan="{{ $totalColumnCount }}"
                    style="
                        text-align: center;
                        padding: 15px;
                    "
                >

                    No approved sales invoices
                    found for the selected report.

                </td>

            </tr>

        @endforelse

    </tbody>


    {{--
    |--------------------------------------------------------------------------
    | Table Footer
    |--------------------------------------------------------------------------
    --}}

    @if ($invoices->isNotEmpty())

        <tfoot>

            <tr>

                <th
                    colspan="{{ $footerColspan }}"
                    class="text-right"
                >
                    Total Summary:
                </th>

                <th class="nowrap">

                    {{ number_format(
                        $totalGrand,
                        2
                    ) }}

                </th>

                <th class="nowrap">

                    {{ number_format(
                        $totalPaid,
                        2
                    ) }}

                </th>

                <th class="nowrap">

                    {{ number_format(
                        $totalDue,
                        2
                    ) }}

                </th>

                <th>
                    —
                </th>

            </tr>

        </tfoot>

    @endif

</table>


{{--
|--------------------------------------------------------------------------
| Financial Summary
|--------------------------------------------------------------------------
--}}

<table class="summary-table">

    <tr>

        <th>
            Subtotal ({{ $currencyCode }})
        </th>

        <td>

            {{ number_format(
                $totalSubtotal,
                2
            ) }}

        </td>

    </tr>


    <tr>

        <th>
            Discount ({{ $currencyCode }})
        </th>

        <td>


            {{ number_format(
                $totalDiscount,
                2
            ) }}

        </td>

    </tr>


    <tr>

        <th>
            Tax ({{ $currencyCode }})
        </th>

        <td>

            {{ number_format(
                $totalTax,
                2
            ) }}

        </td>

    </tr>


    <tr>

        <th>
            Adjustment ({{ $currencyCode }})
        </th>

        <td>

            {{ number_format(
                $totalAdjustment,
                2
            ) }}

        </td>

    </tr>


    <tr class="grand-total-row">

        <th>
            Grand Total ({{ $currencyCode }})
        </th>

        <td>

            {{ number_format(
                $totalGrand,
                2
            ) }}

        </td>

    </tr>


    <tr>

        <th>
            Paid Amount ({{ $currencyCode }})
        </th>

        <td>

            {{ number_format(
                $totalPaid,
                2
            ) }}

        </td>

    </tr>


    <tr>

        <th>
            Due Amount ({{ $currencyCode }})
        </th>

        <td>

            {{ number_format(
                $totalDue,
                2
            ) }}

        </td>

    </tr>

</table>


{{--
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
--}}

<div class="footer">

    Generated from

    {{ $configure?->name ?? config('app.name') }}

    on

    {{ now()->format(
        'd F Y, h:i A'
    ) }}

</div>

</body>

</html>
