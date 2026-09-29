<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <link rel="icon" href="{{ asset($configure->logo) }}" type="image/x-icon">

    <link rel="shortcut icon" href="{{ asset($configure->logo) }}" type="image/x-icon">

    <title>
        Requisition #{{ $requisition->requisition_id }}
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
            font-size: 18px;
            letter-spacing: 1px;
            margin-bottom: 5px;
            text-align: center;
        }

        .report .body .sub-title {
            text-align: center;
            font-size: 12px;
            color: #555;
            margin-bottom: 15px;
        }

        .report .body .informations {
            font-size: 12px !important;
            margin-bottom: 20px;
            margin-top: 15px;
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
            margin: 4px 0;
        }

        .report .body .informations .left span,
        .report .body .informations .right span {
            font-weight: 700;
        }

        .report table {
            font-size: 10px !important;
            letter-spacing: 0.5px;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
        }

        th,
        td {
            padding: 5px 4px;
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

        .page-break {
            page-break-after: always;
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

        {{-- Header --}}

        <div class="header">
            <h1>
                {{ $configure->name }}
            </h1>

            <p>
                <span>Office Address:</span>
                {{ $configure->address }}
            </p>

            <p>
                <span>Contact No.:</span>
                {{ $configure->phone }},
                Email:
                {{ $configure->email }}
            </p>
        </div>

        {{-- Body --}}

        <div class="body">

            <h3>
                Project Requisition
            </h3>

            <p class="sub-title">
                #{{ $requisition->requisition_id }}

                &nbsp;|&nbsp;

                Status:
                {{ $requisition->status }}
            </p>

            {{-- Requisition Information --}}

            <div class="informations">

                {{-- Left --}}

                <div class="left">
                    <div>
                        <p>
                            <span>
                                Requisition For:
                            </span>
                        </p>

                        <p>
                            Requisition ID:
                            {{ $requisition->requisition_id }}
                        </p>

                        <p>
                            Date:
                            {{ $requisition->created_at->format('d M, Y h:i A') }}
                        </p>

                        <p>
                            Required Date:

                            @if ($requisition->required_date)

                                @php
                                    $dates = explode(' to ', $requisition->required_date);

                                    $startDate = \Carbon\Carbon::parse(trim($dates[0]))->format('d M, Y');

                                    $endDate = isset($dates[1])
                                        ? \Carbon\Carbon::parse(trim($dates[1]))->format('d M, Y')
                                        : $startDate;
                                @endphp

                                {{ $startDate }}

                                @if ($endDate !== $startDate)
                                    ~ {{ $endDate }}
                                @endif
                            @else
                                N/A

                            @endif
                        </p>
                    </div>
                </div>

                {{-- Right --}}

                <div class="right">
                    <div>
                        <p>
                            <span>
                                Requested By:
                            </span>
                        </p>

                        <p>
                            Name:
                            {{ $requisition->requestedBy?->name ?? 'N/A' }}
                        </p>

                        <p>
                            Employee ID:
                            {{ $requisition->requestedBy?->employee_id ?? 'N/A' }}
                        </p>

                        @if ($requisition->status === 'Approved' && $requisition->approvedBy)
                            <p style="margin-top: 8px;">
                                <span>
                                    Approved By:
                                </span>
                            </p>

                            <p>
                                Name:
                                {{ $requisition->approvedBy?->name ?? 'N/A' }}
                            </p>

                            <p>
                                Employee ID:
                                {{ $requisition->approvedBy?->employee_id ?? 'N/A' }}
                            </p>
                        @endif
                    </div>
                </div>

            </div>

            {{-- Items Table --}}

            @if ($requisition->items->count() > 0)

                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">
                                SL
                            </th>

                            <th style="width: 35%;">
                                Item Name
                            </th>

                            <th style="width: 10%;">
                                Unit
                            </th>

                            <th style="width: 10%;">
                                Qty
                            </th>

                            <th style="width: 12%;">
                                Priority
                            </th>

                            <th style="width: 16%;">
                                Req. Date
                            </th>

                            <th style="width: 12%;">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        @foreach ($requisition->items as $index => $item)
                            <tr>

                                {{-- SL --}}

                                <td>
                                    {{ $index + 1 }}
                                </td>

                                {{-- Product --}}

                                <td class="text-left">

                                    <strong>
                                        {{ $item->product?->name ?? 'N/A' }}
                                    </strong>

                                    @if ($item->product?->code)
                                        <br>

                                        <span
                                            style="
                                            font-size: 9px;
                                            color: #777;
                                        ">
                                            {{ $item->product->code }}
                                        </span>
                                    @endif

                                </td>

                                {{-- Unit --}}

                                <td>
                                    {{ $item->unit ?? 'N/A' }}
                                </td>

                                {{-- Quantity --}}

                                <td>
                                    {{ number_format((float) $item->quantity, 2) }}
                                </td>

                                {{-- Priority --}}

                                <td>
                                    {{ $item->priority ?? 'N/A' }}
                                </td>

                                {{-- Required Date --}}

                                <td>
                                    @if ($item->required_date)
                                        {{ \Carbon\Carbon::parse($item->required_date)->format('d M, Y') }}
                                    @elseif ($requisition->required_date)
                                        @php
                                            $itemRequiredDates = explode(' to ', $requisition->required_date);

                                            $fallbackDate = \Carbon\Carbon::parse(trim($itemRequiredDates[0]))->format(
                                                'd M, Y',
                                            );
                                        @endphp

                                        {{ $fallbackDate }}
                                    @else
                                        —
                                    @endif
                                </td>

                                {{-- Status --}}

                                <td>
                                    {{ $item->status ?? 'N/A' }}
                                </td>

                            </tr>
                        @endforeach

                    </tbody>
                </table>
            @else
                <p
                    style="
                    text-align: center;
                    font-size: 12px;
                    margin-top: 20px;
                ">
                    No items found for this requisition.
                </p>

            @endif

        </div>

    </section>

</body>

</html>
