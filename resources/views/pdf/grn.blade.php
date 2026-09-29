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

    <title>GRN</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <style>
        /* General Styles */
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
            /* border: 1px solid #ddd; */
        }

        /* Header Styles */
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

        /* Body Styles */
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
        }

        .report .body .informations .right {
            float: right;
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

        /* Table Styles */
        .report table {
            font-size: 11px !important;
            letter-spacing: 1px;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            padding: 5px;
            letter-spacing: 1px;
            text-align: center;
            word-wrap: break-word;
            border: 1px solid #ddd;
        }

        .report thead {
            color: #000;
        }

        /* Ensure proper table wrapping and width */
        .report table {
            max-width: 100%;
        }

        th,
        td {
            white-space: normal;
        }

        /* Page Breaks */
        .page-break {
            page-break-after: always;
        }

        /* Adjust margins for print (PDF output) */
        @page {
            margin: 20px;
        }

        /* For better print output */
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
    <!-- Report -->
    <section class="report">

        <!-- Report Header -->
        <div class="header">
            <h1>
                {{ $configure?->name ?? config('app.name') }}
            </h1>

            <p>
                <span>Office Address:</span>

                {{ $configure?->address ?? 'N/A' }}
            </p>

            <p>
                <span>Contact No.:</span>

                {{ $configure?->phone ?? 'N/A' }},

                Email:

                {{ $configure?->email ?? 'N/A' }}
            </p>
        </div>
        <!-- Report Header End -->

        <!-- Report Body -->
        <div class="body">

            <h3>
                GRN (Goods Received Note)
            </h3>

            <h3>
                PO No.
                {{ $grn->purchaseOrder?->order_id ?? 'N/A' }}
            </h3>

            <div class="informations">

                <!-- Left Information -->
                <div class="left">
                    <div>

                        <p style="margin-bottom:5px">
                            <span>
                                GRN For:
                            </span>
                        </p>

                        <p>
                            PO No.:
                            {{ $grn->purchaseOrder?->order_id ?? 'N/A' }}
                        </p>

                        <p>
                            GRN No.:
                            {{ $grn->grn_no }}
                        </p>

                        @if ($grn->purchaseOrder?->requisition?->requisition_id)
                            <p>
                                Requisition No.:
                                {{ $grn->purchaseOrder->requisition->requisition_id }}
                            </p>
                        @endif

                        <p>
                            Issue Date:

                            {{ $grn->created_at ? $grn->created_at->format('d M, Y h:i A') : 'N/A' }}
                        </p>

                        <p>
                            Received Date:

                            {{ $grn->received_date ? \Carbon\Carbon::parse($grn->received_date)->format('d M, Y') : 'N/A' }}
                        </p>

                        <p>
                            Vendor:

                            {{ $grn->purchaseOrder?->vendor?->name ?? 'N/A' }}

                            @if ($grn->purchaseOrder?->vendor?->vendor_id)
                                (
                                {{ $grn->purchaseOrder->vendor->vendor_id }}
                                )
                            @endif
                        </p>

                        <p>
                            Warehouse:

                            {{ $grn->warehouse?->name ?? ($grn->purchaseOrder?->warehouse?->name ?? 'N/A') }}
                        </p>

                    </div>
                </div>

                <!-- Right Information -->
                <div class="right">
                    <div>

                        <p style="margin-bottom:5px">
                            <span>
                                Received By:
                            </span>
                        </p>

                        <p>
                            Name:

                            {{ $grn->receivedBy?->name ?? 'N/A' }}
                        </p>

                        <p>
                            Employee ID:

                            {{ $grn->receivedBy?->employee_id ?? 'N/A' }}
                        </p>

                    </div>
                </div>
            </div>

            <!-- Table Start -->

            @if ($grn->items->count() > 0)

                <table class="table table-bordered">
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
                        </tr>
                    </thead>

                    <tbody>

                        @forelse ($grn->items as $index => $item)
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

                                <td>
                                    {{ number_format((float) ($item->quantity ?? 0), 2) }}
                                </td>
                            </tr>

                        @empty

                            <tr>
                                <td colspan="5" class="text-center">
                                    No items found for this GRN.
                                </td>
                            </tr>
                        @endforelse

                    </tbody>
                </table>
            @else
                <p>
                    No items records found for the selected criteria.
                </p>

            @endif

            <!-- Table End -->

        </div>
        <!-- Report Body End -->

    </section>
    <!-- Report End -->
</body>

</html>
