<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <title>
        Stock Report
    </title>

    <style>
        @page {
            margin: 20px;
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
            margin-bottom: 15px;
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
        | Main Table
        |--------------------------------------------------------------------------
        */

        .report-table {
            width: 100%;
            border-collapse: collapse;
        }

        .report-table th,
        .report-table td {
            border: 1px solid #aaa;
            padding: 5px;
            vertical-align: middle;
            text-align: center;
        }

        .report-table thead th {
            background-color: #eeeeee;
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
        | Status
        |--------------------------------------------------------------------------
        */

        .status {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }

        .status-in {
            background-color: #d1e7dd;
            color: #0f5132;
        }

        .status-low {
            background-color: #fff3cd;
            color: #664d03;
        }

        .status-out {
            background-color: #f8d7da;
            color: #842029;
        }

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        .summary-wrapper {
            margin-top: 18px;
            width: 100%;
        }

        .summary-left {
            width: 48%;
            display: inline-block;
            vertical-align: top;
        }

        .summary-right {
            width: 48%;
            display: inline-block;
            margin-left: 3%;
            vertical-align: top;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-table th,
        .summary-table td {
            border: 1px solid #aaa;
            padding: 5px;
        }

        .summary-table th {
            background: #f5f5f5;
            text-align: left;
        }

        .summary-table td {
            text-align: right;
        }

        /*
        |--------------------------------------------------------------------------
        | Footer
        |--------------------------------------------------------------------------
        */

        .footer {
            margin-top: 20px;
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
    | Report Title
    |--------------------------------------------------------------------------
    */

        $reportTitle = match ($report_type) {
            'warehouse' => 'Warehouse Wise Stock Report',
            'product' => 'Product Wise Stock Report',
            default => 'All Current Stock Report',
        };

        /*
    |--------------------------------------------------------------------------
    | Stock Status Counters
    |--------------------------------------------------------------------------
    */

        $inStockCount = 0;
        $lowStockCount = 0;
        $outOfStockCount = 0;

        /*
    |--------------------------------------------------------------------------
    | Unit Summary
    |--------------------------------------------------------------------------
    */

        $unitSummary = $stocks
            ->groupBy(function ($stock) {
                return $stock->unit ?: $stock->product?->unit?->name ?: 'N/A';
            })
            ->map(function ($rows) {
                $physical = $rows->sum(function ($stock) {
                    return (float) $stock->quantity;
                });

                $reserved = $rows->sum(function ($stock) {
                    return (float) $stock->reserved_quantity;
                });

                return [
                    'physical' => $physical,
                    'reserved' => $reserved,
                    'available' => $physical - $reserved,
                ];
            });
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
            Current Inventory Position
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

                {{ now()->format('d F, Y') }}

                <br>

                <strong>
                    Generated Time:
                </strong>

                {{ now()->format('h:i A') }}

                <br>

                <strong>
                    Stock Lines:
                </strong>

                {{ $stocks->count() }}
            </td>


            <td class="right">

                @if ($report_type === 'warehouse')
                    <strong>
                        Warehouse:
                    </strong>

                    {{ $warehouse_name ?: 'N/A' }}

                    <br>

                    <strong>
                        Warehouse Code:
                    </strong>

                    {{ $warehouse_code ?: 'N/A' }}
                @elseif($report_type === 'product')
                    <strong>
                        Product:
                    </strong>

                    {{ $product_name ?: 'N/A' }}

                    <br>

                    <strong>
                        Product Code:
                    </strong>

                    {{ $product_code ?: 'N/A' }}

                    <br>

                    <strong>
                        Unit:
                    </strong>

                    {{ $product_unit ?: 'N/A' }}

                    <br>

                    <strong>
                        Reorder Level:
                    </strong>

                    {{ number_format($product_reorder_level, 2) }}
                @endif

            </td>

        </tr>

    </table>


    {{--
|--------------------------------------------------------------------------
| Stock Table
|--------------------------------------------------------------------------
--}}

    <table class="report-table">

        <thead>

            <tr>

                <th>
                    SL
                </th>

                <th>
                    Warehouse
                </th>

                <th>
                    Product
                </th>

                <th>
                    Unit
                </th>

                <th>
                    Physical Qty
                </th>

                <th>
                    Reserved Qty
                </th>

                <th>
                    Available Qty
                </th>

                <th>
                    Reorder Level
                </th>

                <th>
                    Status
                </th>

            </tr>

        </thead>


        <tbody>

            @forelse($stocks as $index => $stock)
                @php
                    $physical = (float) $stock->quantity;

                    $reserved = (float) $stock->reserved_quantity;

                    $available = $physical - $reserved;

                    $reorderLevel = (float) ($stock->product?->reorder_level ?? 0);

                    $unit = $stock->unit ?: $stock->product?->unit?->name ?: 'N/A';

                    if ($available <= 0) {
                        $status = 'Out of Stock';
                        $statusClass = 'status-out';

                        $outOfStockCount++;
                    } elseif ($reorderLevel > 0 && $available <= $reorderLevel) {
                        $status = 'Low Stock';
                        $statusClass = 'status-low';

                        $lowStockCount++;
                    } else {
                        $status = 'In Stock';
                        $statusClass = 'status-in';

                        $inStockCount++;
                    }
                @endphp

                <tr>

                    {{-- SL --}}

                    <td>
                        {{ $index + 1 }}
                    </td>


                    {{-- Warehouse --}}

                    <td>
                        <strong>
                            {{ $stock->warehouse?->name ?? 'N/A' }}
                        </strong>

                        @if ($stock->warehouse?->code)
                            <br>

                            <span class="muted">
                                {{ $stock->warehouse->code }}
                            </span>
                        @endif
                    </td>


                    {{-- Product --}}

                    <td class="text-left">
                        <strong>
                            {{ $stock->product?->name ?? 'N/A' }}
                        </strong>

                        @if ($stock->product?->code)
                            <br>

                            <span class="muted">
                                {{ $stock->product->code }}
                            </span>
                        @endif
                    </td>


                    {{-- Unit --}}

                    <td>
                        {{ $unit }}
                    </td>


                    {{-- Physical --}}

                    <td class="nowrap">
                        {{ number_format($physical, 2) }}
                    </td>


                    {{-- Reserved --}}

                    <td class="nowrap">
                        {{ number_format($reserved, 2) }}
                    </td>


                    {{-- Available --}}

                    <td class="nowrap">
                        <strong>
                            {{ number_format($available, 2) }}
                        </strong>
                    </td>


                    {{-- Reorder --}}

                    <td class="nowrap">
                        {{ number_format($reorderLevel, 2) }}
                    </td>


                    {{-- Status --}}

                    <td>
                        <span class="status {{ $statusClass }}">
                            {{ $status }}
                        </span>
                    </td>

                </tr>

            @empty

                <tr>
                    <td colspan="9"
                        style="
                        text-align: center;
                        padding: 18px;
                    ">
                        No stock records found for the selected report.
                    </td>
                </tr>
            @endforelse

        </tbody>

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

        {{ now()->format('d F Y, h:i A') }}

    </div>

</body>

</html>
