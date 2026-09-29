<?php

namespace App\Http\Controllers;

use App\Models\Configure;
use App\Models\Product;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\SalesReturn;
use App\Models\SalesReturnItem;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;

class SalesReturnController extends Controller
{
    public function index(
        Request $request
    ): Response {
        $search = trim(
            (string) $request->input(
                'search',
                ''
            )
        );

        $status = $request->input('status');

        if (
            !in_array(
                $status,
                [
                    'Pending',
                    'Approved',
                    'Rejected',
                ],
                true
            )
        ) {
            $status = null;
        }

        $returns = SalesReturn::query()
            ->with([
                'invoice:id,invoice_no,client_id,warehouse_id,invoice_date',
                'invoice.client:id,name,client_no',
                'warehouse:id,code,name',
                'items:id,sales_return_id,sales_invoice_item_id,product_id,quantity,unit_price,line_total',
                'items.product:id,code,name',
            ])
            ->when(
                $search !== '',
                function ($query) use ($search) {
                    $query->where(
                        function ($query) use ($search) {
                            $query
                                ->where(
                                    'return_no',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhereHas(
                                    'invoice',
                                    function ($query) use ($search) {
                                        $query->where(
                                            'invoice_no',
                                            'like',
                                            "%{$search}%"
                                        );
                                    }
                                )
                                ->orWhereHas(
                                    'invoice.client',
                                    function ($query) use ($search) {
                                        $query
                                            ->where(
                                                'name',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'client_id',
                                                'like',
                                                "%{$search}%"
                                            );
                                    }
                                );
                        }
                    );
                }
            )
            ->when(
                $status,
                fn($query) =>
                    $query->where(
                        'status',
                        $status
                    )
            )
            ->latest('id')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render(
            'operations/sales/returns/index',
            [
                'data' => $returns,

                'filters' => [
                    'search' => $search,
                    'status' => $status,
                ],
            ]
        );
    }

    public function create(
        Request $request
    ): Response {
        return Inertia::render(
            'operations/sales/returns/create',
            [
                'salesReturn' => null,
                'mode' => 'create',
            ]
        );
    }


    public function show(
        SalesReturn $salesReturn
    ): Response {
        $salesReturn->load([
            'invoice.client',
            'invoice.warehouse',
            'warehouse',
            'items.product.unit',
            'items.invoiceItem',
        ]);

        return Inertia::render(
            'operations/sales/returns/show',
            [
                'salesReturn' => $salesReturn,
            ]
        );
    }

    public function edit(
        SalesReturn $salesReturn
    ): Response {
        if (
            $salesReturn->status !==
            'Pending'
        ) {
            return redirect()
                ->route(
                    'operations.sales.returns.show',
                    $salesReturn
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Only pending sales returns can be edited.',

                        'type' =>
                            'error',
                    ]
                );
        }

        $salesReturn->load([
            'invoice.client',
            'invoice.warehouse',
            'items.product.unit',
            'items.invoiceItem',
        ]);

        $invoice =
            SalesInvoice::query()
                ->whereKey(
                    $salesReturn
                        ->sales_invoice_id
                )
                ->with([
                    'client',
                    'warehouse',
                    'items.product.unit',
                ])
                ->firstOrFail();

        $invoiceItemIds =
            $invoice
                ->items
                ->pluck('id')
                ->all();

        $returnedQuantities =
            $this->returnedQuantities(
                $invoiceItemIds,
                $salesReturn->id
            );

        $invoice->items->each(
            function (SalesInvoiceItem $item) use ($returnedQuantities) {
                $sold =
                    (float) $item->quantity;

                $returned =
                    (float) (
                        $returnedQuantities[
                            $item->id
                        ] ?? 0
                    );

                $item->setAttribute(
                    'available_quantity',
                    max(
                        0,
                        $sold -
                        $returned
                    )
                );

                $item->setAttribute(
                    'returned_quantity',
                    $returned
                );
            }
        );

        return Inertia::render(
            'operations/sales/returns/edit',
            [
                'salesReturn' =>
                    $salesReturn,

                'invoice' =>
                    $invoice,

                'mode' =>
                    'edit',
            ]
        );
    }

    public function store(
        Request $request
    ) {
        $validated =
            $this->validateReturnRequest(
                $request
            );

        DB::transaction(
            function () use ($validated) {
                $invoice =
                    SalesInvoice::query()
                        ->lockForUpdate()
                        ->findOrFail(
                            $validated[
                                'sales_invoice_id'
                            ]
                        );

                $this->ensureInvoiceCanBeReturned(
                    $invoice
                );

                $prepared =
                    $this->prepareReturnItems(
                        $invoice,
                        $validated['items']
                    );

                $salesReturn =
                    SalesReturn::create([
                        'return_no' =>
                            $this->generateReturnNumber(),

                        'sales_invoice_id' =>
                            $invoice->id,

                        'warehouse_id' =>
                            $invoice->warehouse_id,

                        'return_date' =>
                            $validated[
                                'return_date'
                            ],

                        'total_amount' =>
                            $prepared['total'],

                        'status' =>
                            'Pending',

                        'remarks' =>
                            $validated[
                                'remarks'
                            ] ??
                            null,
                    ]);

                $salesReturn
                    ->items()
                    ->createMany(
                        $prepared['rows']
                    );
            }
        );

        return redirect()
            ->route(
                'operations.sales.returns.index'
            )
            ->with(
                'notification',
                [
                    'message' =>
                        'Sales return created successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    public function update(
        Request $request,
        SalesReturn $salesReturn
    ) {
        if (
            $salesReturn->status !==
            'Pending'
        ) {
            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Only pending sales returns can be edited.',

                        'type' =>
                            'error',
                    ]
                );
        }

        $validated =
            $this->validateReturnRequest(
                $request
            );

        DB::transaction(
            function () use ($validated, $salesReturn) {
                $return =
                    SalesReturn::query()
                        ->lockForUpdate()
                        ->findOrFail(
                            $salesReturn->id
                        );

                if (
                    $return->status !==
                    'Pending'
                ) {
                    throw ValidationException::withMessages([
                        'status' =>
                            'Only pending sales returns can be edited.',
                    ]);
                }

                $invoice =
                    SalesInvoice::query()
                        ->lockForUpdate()
                        ->findOrFail(
                            $return
                                ->sales_invoice_id
                        );

                $this->ensureInvoiceCanBeReturned(
                    $invoice
                );

                if (
                    (int) $validated[
                        'sales_invoice_id'
                    ] !==
                    (int) $return
                        ->sales_invoice_id
                ) {
                    throw ValidationException::withMessages([
                        'sales_invoice_id' =>
                            'The sales invoice cannot be changed while editing a return.',
                    ]);
                }

                $prepared =
                    $this->prepareReturnItems(
                        $invoice,
                        $validated['items'],
                        $return->id
                    );

                $return->update([
                    'return_date' =>
                        $validated[
                            'return_date'
                        ],

                    'total_amount' =>
                        $prepared['total'],

                    'remarks' =>
                        $validated[
                            'remarks'
                        ] ??
                        null,
                ]);

                $return
                    ->items()
                    ->delete();

                $return
                    ->items()
                    ->createMany(
                        $prepared['rows']
                    );
            }
        );

        return redirect()
            ->route(
                'operations.sales.returns.show',
                $salesReturn
            )
            ->with(
                'notification',
                [
                    'message' =>
                        'Sales return updated successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    public function updateStatus(
        Request $request,
        SalesReturn $salesReturn
    ) {
        $validated =
            $request->validate([
                'status' => [
                    'required',
                    'string',
                    'in:Approved,Rejected',
                ],
            ]);

        DB::transaction(
            function () use ($salesReturn, $validated) {
                $return =
                    SalesReturn::query()
                        ->with([
                            'invoice',
                            'items.product.unit',
                            'items.invoiceItem',
                        ])
                        ->lockForUpdate()
                        ->findOrFail(
                            $salesReturn->id
                        );

                if (
                    $return->status !==
                    'Pending'
                ) {
                    throw ValidationException::withMessages([
                        'status' =>
                            'Only pending sales returns can be approved or rejected.',
                    ]);
                }

                if (
                    $validated[
                        'status'
                    ] ===
                    'Rejected'
                ) {
                    $return->update([
                        'status' =>
                            'Rejected',
                    ]);

                    return;
                }

                $invoice =
                    SalesInvoice::query()
                        ->lockForUpdate()
                        ->findOrFail(
                            $return
                                ->sales_invoice_id
                        );

                $this->ensureInvoiceCanBeReturned(
                    $invoice
                );

                $return->loadMissing(
                    'items'
                );

                $this->validateApprovedReturnItems(
                    $invoice,
                    $return
                );

                $this->postReturnToStock(
                    $return
                );

                $return->update([
                    'status' =>
                        'Approved',
                ]);
            }
        );

        return redirect()
            ->back()
            ->with(
                'notification',
                [
                    'message' =>
                        $validated['status'] ===
                        'Approved'
                        ? 'Sales return approved and stock updated successfully.'
                        : 'Sales return rejected successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    public function destroy(
        SalesReturn $salesReturn
    ) {
        if (
            $salesReturn->status !==
            'Pending'
        ) {
            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Only pending sales returns can be deleted.',

                        'type' =>
                            'error',
                    ]
                );
        }

        DB::transaction(
            function () use ($salesReturn) {
                $salesReturn
                    ->items()
                    ->delete();

                $salesReturn
                    ->delete();
            }
        );

        return redirect()
            ->route(
                'operations.sales.returns.index'
            )
            ->with(
                'notification',
                [
                    'message' =>
                        'Sales return deleted successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    public function downloadPdf(
        SalesReturn $salesReturn
    ) {
        $salesReturn->load([
            'invoice.client',
            'invoice.warehouse',
            'warehouse',
            'items.product.unit',
            'items.invoiceItem',
        ]);

        $pdf =
            Pdf::loadView(
                'pdf.sales-return',
                [
                    'salesReturn' =>
                        $salesReturn,

                    'configure' =>
                        Configure::first(),
                ]
            );

        return $pdf->download(
            "sales_return_{$salesReturn->return_no}.pdf"
        );
    }

    public function streamPdf(
        SalesReturn $salesReturn
    ) {
        $salesReturn->load([
            'invoice.client',
            'invoice.warehouse',
            'warehouse',
            'items.product.unit',
            'items.invoiceItem',
        ]);

        $pdf =
            Pdf::loadView(
                'pdf.sales-return',
                [
                    'salesReturn' =>
                        $salesReturn,

                    'configure' =>
                        Configure::first(),
                ]
            );

        return $pdf->stream(
            "sales_return_{$salesReturn->return_no}.pdf"
        );
    }

    private function validateReturnRequest(
        Request $request
    ): array {
        return $request->validate([
            'sales_invoice_id' => [
                'required',
                'integer',
                'exists:sales_invoices,id',
            ],

            'return_date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.sales_invoice_item_id' => [
                'required',
                'integer',
                'distinct',
                'exists:sales_invoice_items,id',
            ],

            'items.*.return_quantity' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);
    }

    private function ensureInvoiceCanBeReturned(
        SalesInvoice $invoice
    ): void {
        if (
            $invoice->status !==
            'Approved'
        ) {
            throw ValidationException::withMessages([
                'sales_invoice_id' =>
                    'Only approved sales invoices can be returned.',
            ]);
        }
    }

    private function prepareReturnItems(
        SalesInvoice $invoice,
        array $inputItems,
        ?int $ignoreReturnId = null
    ): array {
        $positiveItems =
            collect($inputItems)
                ->map(
                    fn($item) => [
                        'sales_invoice_item_id' =>
                            (int) $item[
                                'sales_invoice_item_id'
                            ],

                        'return_quantity' =>
                            (float) $item[
                                'return_quantity'
                            ],
                    ]
                )
                ->filter(
                    fn($item) =>
                        $item[
                            'return_quantity'
                        ] > 0
                )
                ->values();

        if (
            $positiveItems->isEmpty()
        ) {
            throw ValidationException::withMessages([
                'items' =>
                    'Please enter a return quantity for at least one product.',
            ]);
        }

        $invoiceItemIds =
            $positiveItems
                ->pluck(
                    'sales_invoice_item_id'
                )
                ->all();

        $invoiceItems =
            SalesInvoiceItem::query()
                ->where(
                    'sales_invoice_id',
                    $invoice->id
                )
                ->whereIn(
                    'id',
                    $invoiceItemIds
                )
                ->with(
                    'product.unit'
                )
                ->lockForUpdate()
                ->get()
                ->keyBy(
                    'id'
                );

        if (
            $invoiceItems->count() !==
            count(
                $invoiceItemIds
            )
        ) {
            throw ValidationException::withMessages([
                'items' =>
                    'One or more selected products do not belong to this sales invoice.',
            ]);
        }

        $alreadyReturned =
            $this->returnedQuantities(
                $invoiceItemIds,
                $ignoreReturnId
            );

        $rows = [];
        $total = 0;

        foreach (
            $positiveItems
            as $index =>
            $input
        ) {
            $invoiceItem =
                $invoiceItems->get(
                    $input[
                        'sales_invoice_item_id'
                    ]
                );

            $soldQuantity =
                (float) $invoiceItem
                    ->quantity;

            $previousReturned =
                (float) (
                    $alreadyReturned[
                        $invoiceItem->id
                    ] ??
                    0
                );

            $availableQuantity =
                max(
                    0,
                    $soldQuantity -
                    $previousReturned
                );

            $returnQuantity =
                (float) $input[
                    'return_quantity'
                ];

            if (
                $returnQuantity >
                $availableQuantity +
                0.00001
            ) {
                throw ValidationException::withMessages([
                    "items.{$index}.return_quantity" =>
                        "Return quantity cannot exceed available quantity {$availableQuantity}.",
                ]);
            }

            $unitPrice =
                (float) $invoiceItem
                    ->unit_price;

            $lineTotal =
                round(
                    $returnQuantity *
                    $unitPrice,
                    2
                );

            $total +=
                $lineTotal;

            $rows[] = [
                'sales_invoice_item_id' =>
                    $invoiceItem->id,

                'product_id' =>
                    $invoiceItem->product_id,

                'quantity' =>
                    $returnQuantity,

                'unit_price' =>
                    $unitPrice,

                'line_total' =>
                    $lineTotal,
            ];
        }

        return [
            'rows' =>
                $rows,

            'total' =>
                round(
                    $total,
                    2
                ),
        ];
    }

    private function returnedQuantities(
        array $invoiceItemIds,
        ?int $ignoreReturnId = null
    ) {
        return SalesReturnItem::query()
            ->whereIn(
                'sales_invoice_item_id',
                $invoiceItemIds
            )
            ->when(
                $ignoreReturnId,
                fn($query) =>
                    $query->where(
                        'sales_return_id',
                        '!=',
                        $ignoreReturnId
                    )
            )
            ->whereHas(
                'salesReturn',
                fn($query) =>
                    $query->where(
                        'status',
                        '!=',
                        'Rejected'
                    )
            )
            ->selectRaw(
                'sales_invoice_item_id, SUM(quantity) as returned_quantity'
            )
            ->groupBy(
                'sales_invoice_item_id'
            )
            ->pluck(
                'returned_quantity',
                'sales_invoice_item_id'
            );
    }

    private function validateApprovedReturnItems(
        SalesInvoice $invoice,
        SalesReturn $salesReturn
    ): void {
        $invoiceItemIds =
            $salesReturn
                ->items
                ->pluck(
                    'sales_invoice_item_id'
                )
                ->all();

        $invoiceItems =
            SalesInvoiceItem::query()
                ->where(
                    'sales_invoice_id',
                    $invoice->id
                )
                ->whereIn(
                    'id',
                    $invoiceItemIds
                )
                ->lockForUpdate()
                ->get()
                ->keyBy(
                    'id'
                );

        if (
            $invoiceItems->count() !==
            count(
                $invoiceItemIds
            )
        ) {
            throw ValidationException::withMessages([
                'items' =>
                    'One or more return items do not belong to the sales invoice.',
            ]);
        }

        $alreadyReturned =
            $this->returnedQuantities(
                $invoiceItemIds,
                $salesReturn->id
            );

        foreach (
            $salesReturn->items
            as $index =>
            $item
        ) {
            $invoiceItem =
                $invoiceItems->get(
                    $item
                        ->sales_invoice_item_id
                );

            $soldQuantity =
                (float) $invoiceItem
                    ->quantity;

            $previousReturned =
                (float) (
                    $alreadyReturned[
                        $invoiceItem->id
                    ] ??
                    0
                );

            $available =
                max(
                    0,
                    $soldQuantity -
                    $previousReturned
                );

            $quantity =
                (float) $item
                    ->quantity;

            if (
                $quantity <= 0
            ) {
                throw ValidationException::withMessages([
                    "items.{$index}.quantity" =>
                        'Return quantity must be greater than zero.',
                ]);
            }

            if (
                $quantity >
                $available +
                0.00001
            ) {
                throw ValidationException::withMessages([
                    "items.{$index}.quantity" =>
                        "Return quantity cannot exceed available quantity {$available}.",
                ]);
            }
        }
    }

    private function postReturnToStock(
        SalesReturn $salesReturn
    ): void {
        $salesReturn->loadMissing([
            'items.product.unit',
        ]);

        foreach (
            $salesReturn->items
            as $item
        ) {
            $quantity =
                (float) $item
                    ->quantity;

            if (
                $quantity <= 0
            ) {
                continue;
            }

            $stock =
                Stock::query()
                    ->where(
                        'warehouse_id',
                        $salesReturn
                            ->warehouse_id
                    )
                    ->where(
                        'item_id',
                        $item
                            ->product_id
                    )
                    ->lockForUpdate()
                    ->first();

            if (
                !$stock
            ) {
                $stock =
                    Stock::create([
                        'warehouse_id' =>
                            $salesReturn
                                ->warehouse_id,

                        'item_id' =>
                            $item
                                ->product_id,

                        'unit' =>
                            $item
                                ->product
                                ?->unit
                                    ?->name
                            ?? '',

                        'quantity' =>
                            0,

                        'reserved_quantity' =>
                            0,
                    ]);

                $stock =
                    Stock::query()
                        ->whereKey(
                            $stock->id
                        )
                        ->lockForUpdate()
                        ->firstOrFail();
            }

            $stock->unit =
                $stock->unit
                ?:
                $item
                    ->product
                    ?->unit
                        ?->name
                ?:
                '';

            $stock->quantity =
                (float) $stock
                    ->quantity +
                $quantity;

            $stock->save();

            StockMovement::create([
                'warehouse_id' =>
                    $salesReturn
                        ->warehouse_id,

                'item_id' =>
                    $item
                        ->product_id,

                'unit' =>
                    $stock
                        ->unit,

                'quantity' =>
                    $quantity,

                'movement' =>
                    'SalesReturn',

                'reference_type' =>
                    SalesReturn::class,

                'reference_id' =>
                    $salesReturn->id,

                'remarks' =>
                    "Sales Return Approved: {$salesReturn->return_no}",

                'created_by' =>
                    Auth::id(),
            ]);
        }
    }

    public function searchInvoices(
        Request $request
    ): JsonResponse {
        $validated =
            $request->validate([
                'keyword' => [
                    'nullable',
                    'string',
                    'max:150',
                ],
            ]);

        $keyword =
            trim(
                (string) (
                    $validated['keyword'] ??
                    ''
                )
            );

        return response()->json(
            $this->getSearchInvoices(
                $keyword
            )
        );
    }

    private function getSearchInvoices(
        string $keyword
    ) {
        $invoices =
            SalesInvoice::query()
                ->where(
                    'status',
                    'Approved'
                )
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            function ($query) use ($keyword) {
                                $query
                                    ->where(
                                        'invoice_no',
                                        'like',
                                        '%' .
                                        $keyword .
                                        '%'
                                    )
                                    ->orWhereHas(
                                        'client',
                                        function ($query) use ($keyword) {
                                            $query
                                                ->where(
                                                    'name',
                                                    'like',
                                                    '%' .
                                                    $keyword .
                                                    '%'
                                                )
                                                ->orWhere(
                                                    'client_no',
                                                    'like',
                                                    '%' .
                                                    $keyword .
                                                    '%'
                                                );
                                        }
                                    );
                            }
                        );
                    }
                )
                ->with([
                    'client:id,name,client_no,company_name,phone',

                    'warehouse:id,code,name',

                    'items' =>
                        function ($query) {
                            $query
                                ->select([
                                    'id',
                                    'sales_invoice_id',
                                    'product_id',
                                    'quantity',
                                    'unit_price',
                                ])
                                ->with([
                                    'product:id,code,name,unit_id',

                                    'product.unit:id,name',
                                ]);
                        },
                ])
                ->latest('id')
                ->limit(50)
                ->get();

        $invoiceItemIds =
            $invoices
                ->flatMap(
                    fn(
                    SalesInvoice $invoice
                ) =>
                        $invoice->items
                            ->pluck('id')
                )
                ->unique()
                ->values()
                ->all();

        $returnedQuantities = [];

        if (
            !empty(
            $invoiceItemIds
        )
        ) {
            $returnedQuantities =
                SalesReturnItem::query()
                    ->whereIn(
                        'sales_invoice_item_id',
                        $invoiceItemIds
                    )
                    ->whereHas(
                        'salesReturn',
                        function ($query) {
                            $query->where(
                                'status',
                                '!=',
                                'Rejected'
                            );
                        }
                    )
                    ->selectRaw(
                        'sales_invoice_item_id, SUM(quantity) as returned_quantity'
                    )
                    ->groupBy(
                        'sales_invoice_item_id'
                    )
                    ->pluck(
                        'returned_quantity',
                        'sales_invoice_item_id'
                    )
                    ->toArray();
        }

        return $invoices
            ->map(
                function (SalesInvoice $invoice) use ($returnedQuantities) {
                    $items =
                        $invoice
                            ->items
                            ->map(
                                function (SalesInvoiceItem $item) use ($returnedQuantities) {
                                    $soldQuantity =
                                        (float)
                                        $item->quantity;

                                    $returnedQuantity =
                                        (float) (
                                            $returnedQuantities[
                                                $item->id
                                            ] ?? 0
                                        );

                                    $availableQuantity =
                                        max(
                                            0,
                                            $soldQuantity -
                                            $returnedQuantity
                                        );

                                    return [
                                        'id' =>
                                            $item->id,

                                        'product_id' =>
                                            $item
                                                ->product_id,

                                        'product' =>
                                            $item->product
                                            ? [
                                                'id' =>
                                                    $item
                                                        ->product
                                                        ->id,

                                                'code' =>
                                                    $item
                                                        ->product
                                                        ->code,

                                                'name' =>
                                                    $item
                                                        ->product
                                                        ->name,
                                            ]
                                            : null,

                                        'sold_quantity' =>
                                            $soldQuantity,

                                        'returned_quantity' =>
                                            $returnedQuantity,

                                        'available_quantity' =>
                                            $availableQuantity,

                                        'unit_price' =>
                                            (float)
                                            $item
                                                ->unit_price,

                                        'unit' =>
                                            $item
                                                ->product
                                                ?->unit
                                                    ?->name ??
                                            '',
                                    ];
                                }
                            )
                            ->filter(
                                fn(
                                $item
                            ) =>
                                    $item[
                                        'available_quantity'
                                    ] > 0
                            )
                            ->values();

                    return [
                        'id' =>
                            $invoice->id,

                        'invoice_no' =>
                            $invoice->invoice_no,

                        'invoice_date' =>
                            $invoice->invoice_date,

                        'warehouse_id' =>
                            $invoice
                                ->warehouse_id,

                        'client' =>
                            $invoice->client
                            ? [
                                'id' =>
                                    $invoice
                                        ->client
                                        ->id,

                                'name' =>
                                    $invoice
                                        ->client
                                        ->name,

                                'client_id' =>
                                    $invoice
                                        ->client
                                        ->client_id,

                                'company_name' =>
                                    $invoice
                                        ->client
                                        ->company_name,

                                'phone' =>
                                    $invoice
                                        ->client
                                        ->phone,

                                'address' =>
                                    $invoice
                                        ->client
                                        ->address,
                            ]
                            : null,

                        'warehouse' =>
                            $invoice->warehouse
                            ? [
                                'id' =>
                                    $invoice
                                        ->warehouse
                                        ->id,

                                'code' =>
                                    $invoice
                                        ->warehouse
                                        ->code,

                                'name' =>
                                    $invoice
                                        ->warehouse
                                        ->name,
                            ]
                            : null,

                        'label' =>
                            $invoice
                                ->invoice_no .
                            (
                                $invoice->client
                                ? ' - ' .
                                (
                                    $invoice
                                        ->client
                                        ->client_id
                                    ? $invoice
                                        ->client
                                        ->client_id .
                                    ' - '
                                    : ''
                                ) .
                                $invoice
                                    ->client
                                    ->name
                                : ''
                            ),

                        'items' =>
                            $items,
                    ];
                }
            )
            ->filter(
                fn(
                $invoice
            ) =>
                    $invoice['items']
                        ->count() > 0
            )
            ->take(20)
            ->values();
    }


    private function generateReturnNumber(): string
    {
        $prefix =
            'SR-' .
            now()->format(
                'Ymd'
            ) .
            '-';

        $lastReturn =
            SalesReturn::query()
                ->where(
                    'return_no',
                    'like',
                    $prefix . '%'
                )
                ->orderByDesc(
                    'id'
                )
                ->lockForUpdate()
                ->first();

        $nextNumber =
            1;

        if (
            $lastReturn &&
            preg_match(
                '/(\d{4})$/',
                $lastReturn
                    ->return_no,
                $matches
            )
        ) {
            $nextNumber =
                (int) $matches[1] +
                1;
        }

        do {
            $returnNumber =
                $prefix .
                str_pad(
                    (string) $nextNumber,
                    4,
                    '0',
                    STR_PAD_LEFT
                );

            $nextNumber++;
        } while (
            SalesReturn::query()
                ->where(
                    'return_no',
                    $returnNumber
                )
                ->exists()
        );

        return $returnNumber;
    }
}
