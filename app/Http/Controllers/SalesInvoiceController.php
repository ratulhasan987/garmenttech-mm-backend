<?php

namespace App\Http\Controllers;

use App\Models\Configure;
use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\ProductCategory;
use App\Models\SalesInvoice;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Tax;
use App\Models\Warehouse;
use App\Services\FinanceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SalesInvoiceController extends Controller
{
    // Invoice list
    public function index(
        Request $request
    ): Response {
        $search =
            trim(
                (string) $request->input(
                    'search',
                    ''
                )
            );

        $status =
            $request->input('status');

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

        $invoices =
            SalesInvoice::query()
                ->with([
                    'client:id,client_no,name',
                    'warehouse:id,code,name',
                ])
                ->when(
                    $search !== '',
                    function ($query) use ($search) {
                        $query->where(
                            function ($query) use ($search) {
                                $query
                                    ->where(
                                        'invoice_no',
                                        'like',
                                        "%{$search}%"
                                    )
                                    ->orWhereHas(
                                        'client',
                                        function ($query) use ($search) {
                                            $query
                                                ->where(
                                                    'name',
                                                    'like',
                                                    "%{$search}%"
                                                )
                                                ->orWhere(
                                                    'client_no',
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
                    fn($query) => $query->where(
                        'status',
                        $status
                    )
                )
                ->latest('id')
                ->paginate(30)
                ->withQueryString();

        return Inertia::render(
            'operations/sales/invoices/index',
            [
                'data' => $invoices,

                'filters' => [
                    'search' => $search,

                    'status' => $status,
                ],
            ]
        );
    }

    // Create page
    public function create(): Response
    {
        $warehouse =
            Warehouse::query()
                ->where(
                    'is_default',
                    true
                )
                ->where(
                    'status',
                    true
                )
                ->select([
                    'id',
                    'code',
                    'name',
                ])
                ->first();

        return Inertia::render(
            'operations/sales/invoices/create',
            [
                'warehouse' => $warehouse,

                ...$this->formOptions(),
            ]
        );
    }

    // Details page
    public function show(
        SalesInvoice $salesInvoice
    ): Response {
        $salesInvoice->load([
            'client:id,client_no,name,company_name,email,phone',

            'warehouse:id,code,name',

            'items.product:id,code,name,unit_id',

            'items.product.unit:id,name',
            'payments:id,sales_invoice_id,payment_no,payment_date,amount,payment_method,reference,remarks',
            'receivable.transactions.createdBy:id,name',
        ]);

        $taxIds =
            $salesInvoice
                ->items
                ->flatMap(
                    fn($item) => $item->tax_ids ??
                        []
                )
                ->map(
                    fn($id) => (int) $id
                )
                ->unique()
                ->values();

        $taxMap =
            Tax::query()
                ->whereIn(
                    'id',
                    $taxIds
                )
                ->get([
                    'id',
                    'name',
                    'rate',
                ])
                ->keyBy('id');

        $items =
            $salesInvoice
                ->items
                ->map(
                    function ($item) use ($taxMap) {
                        $gross =
                            (float) $item->quantity *
                            (float) $item->unit_price;

                        $taxable =
                            max(
                                0,
                                $gross -
                                (float) $item->discount
                            );

                        $taxes =
                            collect(
                                $item->tax_ids ??
                                []
                            )
                                ->map(
                                    function ($taxId) use ($taxMap, $taxable) {
                                        $tax =
                                            $taxMap->get(
                                                (int) $taxId
                                            );

                                        if (!$tax) {
                                            return null;
                                        }

                                        return [
                                            'id' => $tax->id,

                                            'name' => $tax->name,

                                            'rate' => (float) $tax->rate,

                                            'tax_amount' => round(
                                                $taxable *
                                                (float) $tax->rate /
                                                100,
                                                2
                                            ),
                                        ];
                                    }
                                )
                                ->filter()
                                ->values();

                        return [
                            'id' => $item->id,

                            'product_id' => $item->product_id,

                            'code' => $item->product?->code,

                            'name' => $item->product?->name,

                            'unit' => $item->product?->unit?->name,

                            'quantity' => (float) $item->quantity,

                            'unit_price' => (float) $item->unit_price,

                            'discount' => (float) $item->discount,

                            'tax' => (float) $item->tax,

                            'taxes' => $taxes,

                            'line_total' => (float) $item->line_total,
                        ];
                    }
                )
                ->values();

        return Inertia::render(
            'operations/sales/invoices/show',
            [
                'salesInvoice' => [
                    'id' => $salesInvoice->id,

                    'invoice_no' => $salesInvoice->invoice_no,

                    'invoice_date' => $salesInvoice
                        ->invoice_date
                            ?->format('Y-m-d'),

                    'created_at' => $salesInvoice->created_at
                            ?->toISOString(),

                    'status' => $salesInvoice->status,

                    'payment_status' => $salesInvoice->payment_status,

                    'subtotal' => (float) $salesInvoice->subtotal,

                    'discount' => (float) $salesInvoice->discount,

                    'tax' => (float) $salesInvoice->tax,

                    'adjustment_amount' => (float) (
                        $salesInvoice
                            ->adjustment_amount ?? 0
                    ),

                    'grand_total' => (float) $salesInvoice->grand_total,

                    'paid_amount' => (float) $salesInvoice->paid_amount,

                    'due_amount' => (float) $salesInvoice->due_amount,

                    'receivable_id' => $salesInvoice->receivable?->id,

                    'remarks' => $salesInvoice->remarks,

                    'warehouse' => $salesInvoice->warehouse,

                    'client' => $salesInvoice->client,

                    'items' => $items,

                    'transactions' => $salesInvoice->receivable?->transactions?->values() ?? [],
                ],
            ]
        );
    }

    // Edit page
    public function edit(
        SalesInvoice $salesInvoice
    ): Response {
        if (
            $salesInvoice->status !==
            'Pending'
        ) {
            return redirect()
                ->route(
                    'operations.sales.invoices.show',
                    $salesInvoice
                )
                ->with(
                    'notification',
                    [
                        'message' => 'Only pending sales invoices can be edited.',

                        'type' => 'error',
                    ]
                );
        }

        $salesInvoice->load([
            'client:id,client_no,name,company_name,phone',

            'warehouse:id,code,name',

            'items.product:id,code,name,unit_id,sales_tax_ids,sales_price',

            'items.product.unit:id,name',
        ]);

        $stockMap =
            Stock::query()
                ->where(
                    'warehouse_id',
                    $salesInvoice->warehouse_id
                )
                ->whereIn(
                    'item_id',
                    $salesInvoice->items->pluck(
                        'product_id'
                    )
                )
                ->get()
                ->keyBy('item_id');

        $items =
            $salesInvoice
                ->items
                ->map(
                    function ($item) use ($stockMap) {
                        $stock =
                            $stockMap->get(
                                $item->product_id
                            );

                        $available =
                            $stock
                            ? (
                                (float) $stock->quantity -
                                (float) $stock->reserved_quantity +
                                (float) $item->quantity
                            )
                            : (float) $item->quantity;

                        return [
                            'product_id' => $item->product_id,

                            'product_code' => $item->product?->code,

                            'product_name' => $item->product?->name,

                            'quantity' => (float) $item->quantity,

                            'unit_price' => (float) $item->unit_price,

                            'discount' => (float) $item->discount,

                            'tax_ids' => array_map(
                                'intval',
                                $item->tax_ids ??
                                []
                            ),

                            'available_stock' => max(
                                0,
                                $available
                            ),
                        ];
                    }
                )
                ->values();

        return Inertia::render(
            'operations/sales/invoices/edit',
            [
                'warehouse' => $salesInvoice->warehouse,

                ...$this->formOptions(),

                'invoice' => [
                    'id' => $salesInvoice->id,

                    'client_id' => $salesInvoice->client_id,

                    'client' => $salesInvoice->client
                        ? [
                            'id' => $salesInvoice
                                ->client
                                ->id,

                            'client_id' => $salesInvoice
                                ->client
                                ->client_id,

                            'name' => $salesInvoice
                                ->client
                                ->name,

                            'company_name' => $salesInvoice
                                ->client
                                ->company_name,

                            'phone' => $salesInvoice
                                ->client
                                ->phone,

                            'label' => (
                                $salesInvoice
                                    ->client
                                    ->client_id
                                ? $salesInvoice
                                    ->client
                                    ->client_id .
                                ' - '
                                : ''
                            ) .
                                $salesInvoice
                                    ->client
                                    ->name,
                        ]
                        : null,

                    'invoice_date' => $salesInvoice
                        ->invoice_date
                            ?->format('Y-m-d'),

                    'discount' => (float) $salesInvoice->discount,

                    'tax' => (float) $salesInvoice->tax,

                    'adjustment_amount' => (float) (
                        $salesInvoice
                            ->adjustment_amount ?? 0
                    ),

                    'remarks' => $salesInvoice->remarks,

                    'items' => $items,
                ],
            ]
        );
    }

    // Create invoice
    public function store(
        Request $request
    ) {
        $validated =
            $this->validateInvoice(
                $request
            );

        $calculated =
            $this->calculateInvoice(
                $validated
            );

        $salesInvoice =
            DB::transaction(
                function () use ($validated, $calculated) {
                    $warehouse =
                        Warehouse::query()
                            ->where(
                                'is_default',
                                true
                            )
                            ->where(
                                'status',
                                true
                            )
                            ->lockForUpdate()
                            ->first();

                    if (!$warehouse) {
                        throw ValidationException::withMessages([
                            'warehouse' => 'No active default warehouse is configured.',
                        ]);
                    }

                    // Reserve stock for pending invoice
                    $this->reserveStock(
                        $warehouse->id,
                        $calculated['items']
                    );

                    $invoice =
                        SalesInvoice::create([
                            'invoice_no' => $this->generateInvoiceNumber(),

                            'client_id' => $validated['client_id'],

                            'warehouse_id' => $warehouse->id,

                            'invoice_date' => $validated['invoice_date'],

                            'subtotal' => $calculated['subtotal'],

                            'discount' => $calculated['invoice_discount'],

                            'tax' => $calculated['invoice_tax'],

                            'adjustment_amount' => $calculated['adjustment_amount'],

                            'grand_total' => $calculated['grand_total'],

                            'paid_amount' => 0,

                            'due_amount' => $calculated['grand_total'],

                            'status' => 'Pending',

                            'payment_status' => 'unpaid',

                            'remarks' => $validated['remarks'] ??
                                null,
                        ]);

                    foreach (
                        $calculated['items'] as $row
                    ) {
                        $invoice
                            ->items()
                            ->create([
                                'product_id' => $row['product_id'],

                                'quantity' => $row['quantity'],

                                'unit_price' => $row['unit_price'],

                                'discount' => $row['discount'],

                                'tax_ids' => $row['tax_ids'],

                                'tax' => $row['tax'],

                                'line_total' => $row['line_total'],
                            ]);
                    }

                    return $invoice;
                }
            );

        return redirect()
            ->route(
                'operations.sales.invoices.show',
                $salesInvoice
            )
            ->with(
                'notification',
                [
                    'message' => 'Sales invoice created successfully.',
                    'type' => 'success',
                ]
            );
    }

    // Update invoice
    public function update(
        Request $request,
        SalesInvoice $salesInvoice
    ) {
        $validated =
            $this->validateInvoice(
                $request
            );

        $calculated =
            $this->calculateInvoice(
                $validated
            );

        DB::transaction(
            function () use ($salesInvoice, $validated, $calculated) {
                $invoice =
                    SalesInvoice::query()
                        ->with('items')
                        ->lockForUpdate()
                        ->findOrFail(
                            $salesInvoice->id
                        );

                if (
                    $invoice->status !==
                    'Pending'
                ) {
                    throw ValidationException::withMessages([
                        'invoice' => 'Only pending sales invoices can be edited.',
                    ]);
                }

                // Release old reservation
                $this->releaseReservations(
                    $invoice
                );

                // Reserve new quantities
                $this->reserveStock(
                    $invoice->warehouse_id,
                    $calculated['items']
                );

                $invoice->update([
                    'client_id' => $validated['client_id'],

                    'invoice_date' => $validated['invoice_date'],

                    'subtotal' => $calculated['subtotal'],

                    'discount' => $calculated['invoice_discount'],

                    'tax' => $calculated['invoice_tax'],

                    'adjustment_amount' => $calculated['adjustment_amount'],

                    'grand_total' => $calculated['grand_total'],

                    'paid_amount' => 0,

                    'due_amount' => $calculated['grand_total'],

                    'payment_status' => 'unpaid',

                    'remarks' => $validated['remarks'] ??
                        null,
                ]);

                $invoice
                    ->items()
                    ->delete();

                foreach (
                    $calculated['items'] as $row
                ) {
                    $invoice
                        ->items()
                        ->create([
                            'product_id' => $row['product_id'],

                            'quantity' => $row['quantity'],

                            'unit_price' => $row['unit_price'],

                            'discount' => $row['discount'],

                            'tax_ids' => $row['tax_ids'],

                            'tax' => $row['tax'],

                            'line_total' => $row['line_total'],
                        ]);
                }
            }
        );

        return redirect()
            ->route(
                'operations.sales.invoices.show',
                $salesInvoice
            )
            ->with(
                'notification',
                [
                    'message' => 'Sales invoice updated successfully.',

                    'type' => 'success',
                ]
            );
    }

    // Update invoice status
    public function updateStatus(
        Request $request,
        SalesInvoice $salesInvoice
    ) {
        $validated =
            $request->validate([
                'status' => [
                    'required',

                    Rule::in([
                        'Approved',
                        'Rejected',
                    ]),
                ],
            ]);

        DB::transaction(
            function () use ($salesInvoice, $validated) {
                $invoice =
                    SalesInvoice::query()
                        ->with([
                            'items.product.unit',
                        ])
                        ->lockForUpdate()
                        ->findOrFail(
                            $salesInvoice->id
                        );

                if (
                    $invoice->status !==
                    'Pending'
                ) {
                    throw ValidationException::withMessages([
                        'status' => 'Only pending invoices can change status.',
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | Approve
                |--------------------------------------------------------------------------
                |
                | Convert reserved stock into real stock-out.
                |
                */

                if (
                    $validated['status'] ===
                    'Approved'
                ) {
                    $this->consumeReservedStock(
                        $invoice
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Reject
                |--------------------------------------------------------------------------
                |
                | Release the reserved stock.
                |
                */

                if (
                    $validated['status'] ===
                    'Rejected'
                ) {
                    $this->releaseReservations(
                        $invoice
                    );
                }

                $invoice->update([
                    'status' => $validated['status'],
                ]);

                if ($validated['status'] === 'Approved') {
                    app(FinanceService::class)->createReceivableForSalesInvoice($invoice);
                }
            }
        );

        return redirect()
            ->route(
                'operations.sales.invoices.show',
                $salesInvoice
            )
            ->with(
                'notification',
                [
                    'message' => $validated['status'] ===
                        'Approved'
                        ? 'Sales invoice approved successfully. Stock updated.'
                        : 'Sales invoice rejected successfully. Reserved stock released.',

                    'type' => 'success',
                ]
            );
    }

    // Delete invoice
    public function destroy(
        SalesInvoice $salesInvoice
    ) {
        DB::transaction(
            function () use ($salesInvoice) {
                $invoice =
                    SalesInvoice::query()
                        ->with('items')
                        ->lockForUpdate()
                        ->findOrFail(
                            $salesInvoice->id
                        );

                if (
                    $invoice->status !==
                    'Pending'
                ) {
                    throw ValidationException::withMessages([
                        'invoice' => 'Only pending sales invoices can be deleted.',
                    ]);
                }

                $this->releaseReservations(
                    $invoice
                );

                $invoice
                    ->items()
                    ->delete();

                $invoice->delete();
            }
        );

        return redirect()
            ->route(
                'operations.sales.invoices.index'
            )
            ->with(
                'notification',
                [
                    'message' => 'Sales invoice deleted successfully.',

                    'type' => 'success',
                ]
            );
    }

    // Print PDF
    public function streamPdf(
        SalesInvoice $salesInvoice
    ) {
        $salesInvoice->load([
            'client',
            'warehouse',
            'items.product.unit',
            'payments',
        ]);

        $pdf =
            Pdf::loadView(
                'pdf.invoice',
                [
                    'salesInvoice' => $salesInvoice,

                    'configure' => Configure::first(),
                ]
            );

        return $pdf->stream(
            "sales_invoice_{$salesInvoice->invoice_no}.pdf"
        );
    }

    // Download PDF
    public function downloadPdf(
        SalesInvoice $salesInvoice
    ) {
        $salesInvoice->load([
            'client',
            'warehouse',
            'items.product.unit',
            'payments',
        ]);

        $pdf =
            Pdf::loadView(
                'pdf.invoice',
                [
                    'salesInvoice' => $salesInvoice,

                    'configure' => Configure::first(),
                ]
            );

        return $pdf->download(
            "sales_invoice_{$salesInvoice->invoice_no}.pdf"
        );
    }

    // Validate invoice
    private function validateInvoice(
        Request $request
    ): array {
        return $request->validate([
            'client_id' => [
                'required',
                'integer',
                'exists:clients,id',
            ],

            'invoice_date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'discount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'tax' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'adjustment_amount' => [
                'nullable',
                'numeric',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.product_id' => [
                'required',
                'integer',
                'distinct',
                'exists:products,id',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'items.*.unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'items.*.discount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'items.*.tax_ids' => [
                'nullable',
                'array',
            ],

            'items.*.tax_ids.*' => [
                'integer',
                'distinct',
                'exists:taxes,id',
            ],
        ]);
    }

    // Calculate invoice
    private function calculateInvoice(
        array $validated
    ): array {
        $productIds =
            collect(
                $validated['items']
            )
                ->pluck('product_id')
                ->map(
                    fn($id) => (int) $id
                )
                ->unique();

        $products =
            Product::query()
                ->with([
                    'unit:id,name',
                ])
                ->whereIn(
                    'id',
                    $productIds
                )
                ->get()
                ->keyBy('id');

        $taxIds =
            collect(
                $validated['items']
            )
                ->flatMap(
                    fn($item) => $item['tax_ids'] ??
                        []
                )
                ->map(
                    fn($id) => (int) $id
                )
                ->unique();

        $taxRates =
            Tax::query()
                ->whereIn(
                    'id',
                    $taxIds
                )
                ->pluck(
                    'rate',
                    'id'
                );

        $rows =
            [];

        $subtotal =
            0;

        $itemsTotal =
            0;

        foreach (
            $validated['items'] as $index => $item
        ) {
            $product =
                $products->get(
                    (int) $item['product_id']
                );

            if (
                !$product ||
                !$product->status
            ) {
                throw ValidationException::withMessages([
                    "items.{$index}.product_id" => 'Selected product is unavailable.',
                ]);
            }

            $quantity =
                (float) $item['quantity'];

            $unitPrice =
                (float) $item['unit_price'];

            $discount =
                (float) (
                    $item['discount'] ??
                    0
                );

            $gross =
                round(
                    $quantity *
                    $unitPrice,
                    2
                );

            if (
                $discount >
                $gross
            ) {
                throw ValidationException::withMessages([
                    "items.{$index}.discount" => 'Discount cannot exceed item amount.',
                ]);
            }

            /*
            | Invoice Item Taxes
            | Product taxes are only default selections.
            | Users can manually add or remove taxes when creating an invoice.
            */
            $selectedTaxIds = collect(
                $item['tax_ids'] ?? []
            )
                ->map(fn($id) => (int) $id)
                ->unique()
                ->values();


            // No need this...............
            // $productTaxIds =
            //     collect(
            //         $product->sales_tax_ids ??
            //             []
            //     )
            //         ->map(
            //             fn ($id) => (int) $id
            //         );

            // if (
            //     $selectedTaxIds
            //         ->diff(
            //             $productTaxIds
            //         )
            //         ->isNotEmpty()
            // ) {
            //     throw ValidationException::withMessages([
            //         "items.{$index}.tax_ids" => 'Selected tax is not configured for this product.',
            //     ]);
            // }

            $taxable =
                max(
                    0,
                    $gross -
                    $discount
                );

            $taxRate =
                $selectedTaxIds
                    ->sum(
                        fn($taxId) => (float) (
                            $taxRates[$taxId] ??
                            0
                        )
                    );

            $tax =
                round(
                    $taxable *
                    $taxRate /
                    100,
                    2
                );

            $lineTotal =
                round(
                    $taxable +
                    $tax,
                    2
                );

            $subtotal +=
                $gross;

            $itemsTotal +=
                $lineTotal;

            $rows[] = [
                'index' => $index,

                'product_id' => $product->id,

                'product_name' => $product->name,

                'unit' => $product->unit?->name ??
                    '',

                'quantity' => $quantity,

                'unit_price' => $unitPrice,

                'discount' => $discount,

                'tax_ids' => $selectedTaxIds->all(),

                'tax' => $tax,

                'line_total' => $lineTotal,
            ];
        }

        $invoiceDiscount =
            (float) (
                $validated['discount'] ??
                0
            );

        $invoiceTax =
            (float) (
                $validated['tax'] ??
                0
            );

        $adjustmentAmount =
            (float) (
                $validated['adjustment_amount'] ??
                0
            );

        if (
            $invoiceDiscount >
            $itemsTotal
        ) {
            throw ValidationException::withMessages([
                'discount' => 'Invoice discount cannot exceed invoice amount.',
            ]);
        }

        $grandTotal =
            round(
                $itemsTotal -
                $invoiceDiscount +
                $invoiceTax +
                $adjustmentAmount,
                2
            );

        if (
            $grandTotal <
            0
        ) {
            throw ValidationException::withMessages([
                'adjustment_amount' => 'Grand total cannot be negative.',
            ]);
        }

        return [
            'items' => $rows,

            'subtotal' => round(
                $subtotal,
                2
            ),

            'invoice_discount' => $invoiceDiscount,

            'invoice_tax' => $invoiceTax,

            'adjustment_amount' => $adjustmentAmount,

            'grand_total' => round(
                $itemsTotal -
                $invoiceDiscount +
                $invoiceTax,
                2
            ),
        ];
    }

    // Reserve stock
    private function reserveStock(
        int $warehouseId,
        array $rows
    ): void {
        foreach (
            $rows as $row
        ) {
            $stock =
                Stock::query()
                    ->where(
                        'warehouse_id',
                        $warehouseId
                    )
                    ->where(
                        'item_id',
                        $row['product_id']
                    )
                    ->lockForUpdate()
                    ->first();

            $available =
                $stock
                ? (
                    (float) $stock->quantity -
                    (float) $stock->reserved_quantity
                )
                : 0;

            if (
                !$stock ||
                $available <
                $row['quantity']
            ) {
                throw ValidationException::withMessages([
                    "items.{$row['index']}.quantity" => "Insufficient stock for {$row['product_name']}. Available: {$available}. Requested: {$row['quantity']}.",
                ]);
            }

            $stock->reserved_quantity =
                (float) $stock->reserved_quantity +
                $row['quantity'];

            $stock->save();
        }
    }

    // Release reservation
    private function releaseReservations(
        SalesInvoice $invoice
    ): void {
        $invoice->loadMissing(
            'items'
        );

        foreach (
            $invoice->items as $item
        ) {
            $stock =
                Stock::query()
                    ->where(
                        'warehouse_id',
                        $invoice->warehouse_id
                    )
                    ->where(
                        'item_id',
                        $item->product_id
                    )
                    ->lockForUpdate()
                    ->first();

            if (!$stock) {
                continue;
            }

            $stock->reserved_quantity =
                max(
                    0,
                    (float) $stock->reserved_quantity -
                    (float) $item->quantity
                );

            $stock->save();
        }
    }

    // Convert reservation to stock out
    private function consumeReservedStock(
        SalesInvoice $invoice
    ): void {
        $invoice->loadMissing([
            'items.product.unit',
        ]);

        foreach (
            $invoice->items as $item
        ) {
            $quantity =
                (float) $item->quantity;

            if (
                $quantity <= 0
            ) {
                continue;
            }

            // Find stock
            $stock =
                Stock::query()
                    ->where(
                        'warehouse_id',
                        $invoice->warehouse_id
                    )
                    ->where(
                        'item_id',
                        $item->product_id
                    )
                    ->lockForUpdate()
                    ->first();

            if (!$stock) {
                throw ValidationException::withMessages([
                    'stock' => "Stock row not found for {$item->product?->name}.",
                ]);
            }

            // Check physical stock
            if (
                (float) $stock->quantity <
                $quantity
            ) {
                throw ValidationException::withMessages([
                    'stock' => "Insufficient physical stock for {$item->product?->name}.",
                ]);
            }

            // Check reservation
            if (
                (float) $stock->reserved_quantity <
                $quantity
            ) {
                throw ValidationException::withMessages([
                    'stock' => "Reserved stock is inconsistent for {$item->product?->name}.",
                ]);
            }

            // Reduce physical stock
            $stock->quantity =
                round(
                    (float) $stock->quantity -
                    $quantity,
                    2
                );

            // Remove reservation
            $stock->reserved_quantity =
                round(
                    (float) $stock->reserved_quantity -
                    $quantity,
                    2
                );

            $stock->unit =
                $stock->unit
                ?:
                $item->product?->unit?->name
                ?:
                '';

            $stock->save();

            /*
            |--------------------------------------------------------------------------
            | Stock Ledger
            |--------------------------------------------------------------------------
            |
            | Use "Issue" because the existing stock_movements.movement
            | ENUM does not contain "SalesInvoice".
            |
            | SalesInvoice is identified by reference_type/reference_id.
            |
            */

            StockMovement::create([
                'warehouse_id' => $invoice->warehouse_id,

                'item_id' => $item->product_id,

                'unit' => $stock->unit
                    ?: $item->product?->unit?->name
                    ?: '',

                // Negative quantity = Stock Out
                'quantity' => -$quantity,

                // Existing ENUM value
                'movement' => 'Issue',

                // Identify the source document
                'reference_type' => SalesInvoice::class,

                'reference_id' => $invoice->id,

                'remarks' => "Sales Invoice Approved: {$invoice->invoice_no}",

                'created_by' => Auth::id(),
            ]);
        }
    }

    // Form options
    private function formOptions(): array
    {
        return [
            'categories' => ProductCategory::query()
                ->whereNull('parent_id')
                ->select([
                    'id',
                    'name',
                ])
                ->orderBy('name')
                ->get(),

            'subcategories' => ProductCategory::query()
                ->whereNotNull('parent_id')
                ->select([
                    'id',
                    'parent_id',
                    'name',
                ])
                ->orderBy('name')
                ->get(),

            'brands' => ProductBrand::query()
                ->select([
                    'id',
                    'name',
                ])
                ->orderBy('name')
                ->get(),

            'taxes' => Tax::query()
                ->select([
                    'id',
                    'name',
                    'rate',
                ])
                ->orderBy('name')
                ->get(),
        ];
    }

    // Generate invoice number
    private function generateInvoiceNumber(): string
    {
        do {
            $invoiceNumber =
                'SI-' .
                now()->format(
                    'YmdHis'
                ) .
                '-' .
                Str::upper(
                    Str::random(5)
                );
        } while (
            SalesInvoice::query()
                ->where(
                    'invoice_no',
                    $invoiceNumber
                )
                ->exists()
        );

        return $invoiceNumber;
    }
}
