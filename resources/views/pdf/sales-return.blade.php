<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <title>
        Sales Return
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
            margin-bottom: 8px;
        }

        .summary {
            width: 40%;
            float: right;
            margin-top: 20px;
        }

        .summary td {
            padding: 7px;
        }

        .signature {
            margin-top: 80px;
        }

        .status {
            font-weight: bold;
        }

        .small {
            font-size: 10px;
            color: #666;
        }
    </style>
</head>

<body>

    <table class="header">
        <tr>
            <td style="border: 0;">
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
                style="border: 0;"
            >
                <h2>
                    SALES RETURN
                </h2>

                <strong>
                    Return No:
                </strong>

                {{ $salesReturn->return_no }}

                <br>

                <strong>
                    Date:
                </strong>

                {{ $salesReturn->return_date?->format('d M Y') }}
            </td>
        </tr>
    </table>

    <div class="section-title">
        Return Information
    </div>

    <table>
        <tr>
            <td>
                <strong>
                    Return No:
                </strong>

                {{ $salesReturn->return_no }}

                <br>

                <strong>
                    Sales Invoice:
                </strong>

                {{ $salesReturn->invoice?->invoice_no ?? '-' }}

                <br>

                <strong>
                    Invoice Date:
                </strong>

                {{ $salesReturn->invoice?->invoice_date?->format('d M Y') ?? '-' }}
            </td>

            <td>
                <strong>
                    Return Date:
                </strong>

                {{ $salesReturn->return_date?->format('d M Y') }}

                <br>

                <strong>
                    Status:
                </strong>

                <span class="status">
                    {{ $salesReturn->status }}
                </span>

                <br>

                <strong>
                    Warehouse:
                </strong>

                {{ $salesReturn->warehouse?->name
                    ?? $salesReturn->invoice?->warehouse?->name
                    ?? '-' }}
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

                {{ $salesReturn->invoice?->client?->name ?? '-' }}

                <br>

                @if($salesReturn->invoice?->client?->company_name)
                    <strong>
                        Company:
                    </strong>

                    {{ $salesReturn->invoice->client->company_name }}

                    <br>
                @endif

                <strong>
                    Customer ID:
                </strong>

                {{ $salesReturn->invoice?->client?->client_id ?? '-' }}

                <br>

                <strong>
                    Phone:
                </strong>

                {{ $salesReturn->invoice?->client?->phone ?? '-' }}

                <br>

                <strong>
                    Address:
                </strong>

                {{ $salesReturn->invoice?->client?->address ?? '-' }}
            </td>

            <td>
                <strong>
                    Warehouse:
                </strong>

                {{ $salesReturn->warehouse?->name
                    ?? $salesReturn->invoice?->warehouse?->name
                    ?? '-' }}

                <br>

                <strong>
                    Warehouse Code:
                </strong>

                {{ $salesReturn->warehouse?->code
                    ?? $salesReturn->invoice?->warehouse?->code
                    ?? '-' }}

                <br>

                <strong>
                    Return Amount:
                </strong>

                {{ number_format($salesReturn->total_amount, 2) }}
            </td>
        </tr>
    </table>

    <div class="section-title">
        Returned Products
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">
                    SL
                </th>

                <th>
                    Product
                </th>

                <th>
                    Unit
                </th>

                <th width="12%">
                    Quantity
                </th>

                <th width="15%">
                    Unit Price
                </th>

                <th width="15%">
                    Total
                </th>
            </tr>
        </thead>

        <tbody>

            @forelse($salesReturn->items as $index => $item)

                <tr>
                    <td class="text-center">
                        {{ $index + 1 }}
                    </td>

                    <td>
                        {{ $item->product?->name ?? '-' }}

                        @if($item->product?->code)
                            <br>

                            <span class="small">
                                {{ $item->product->code }}
                            </span>
                        @endif
                    </td>

                    <td>
                        {{ $item->product?->unit?->name ?? '-' }}
                    </td>

                    <td class="text-right">
                        {{ number_format($item->quantity, 2) }}
                    </td>

                    <td class="text-right">
                        {{ number_format($item->unit_price, 2) }}
                    </td>

                    <td class="text-right">
                        {{ number_format($item->line_total, 2) }}
                    </td>
                </tr>

            @empty

                <tr>
                    <td
                        colspan="6"
                        class="text-center"
                    >
                        No return items found.
                    </td>
                </tr>

            @endforelse

        </tbody>
    </table>

    <table class="summary">

        <tr>
            <td>
                Total Quantity
            </td>

            <td class="text-right">
                {{ number_format(
                    $salesReturn->items->sum('quantity'),
                    2
                ) }}
            </td>
        </tr>

        <tr>
            <td>
                <strong>
                    Return Total
                </strong>
            </td>

            <td class="text-right">
                <strong>
                    {{ number_format(
                        $salesReturn->total_amount,
                        2
                    ) }}
                </strong>
            </td>
        </tr>

    </table>

    <br style="clear: both">

    @if($salesReturn->remarks)

        <div class="section-title">
            Remarks
        </div>

        <p>
            {{ $salesReturn->remarks }}
        </p>

    @endif

    <div class="signature">

        <table>

            <tr>

                <td
                    class="text-center"
                    style="border: 0;"
                >
                    __________________________

                    <br>

                    Prepared By
                </td>

                <td
                    class="text-center"
                    style="border: 0;"
                >
                    __________________________

                    <br>

                    Customer Signature
                </td>

                <td
                    class="text-center"
                    style="border: 0;"
                >
                    __________________________

                    <br>

                    Authorized Signature
                </td>

            </tr>

        </table>

    </div>

</body>
</html>