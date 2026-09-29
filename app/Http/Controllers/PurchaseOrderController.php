<?php

namespace App\Http\Controllers;

use App\Actions\File;
use App\Models\Configure;
use App\Models\Currency;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\PurchaseOrder;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\Tax;
use App\Models\Vendor;
use App\Models\Warehouse;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class PurchaseOrderController extends Controller
{
    private const ACTIVE_PO_STATUSES = [
        'Pending',
        'Approved',
        'Partial',
        'Received',
    ];

    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();

            return $next($request);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {

        $this->authorizePermission('purchase_order.list');

        $query = PurchaseOrder::query()
            ->with([
                'purchaseItems',
                'vendor:id,vendor_id,name',
                'requisition:id,requisition_id,required_date,status',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Purchase Order Filter
        |--------------------------------------------------------------------------
        */

        if ($request->filled('order_id')) {
            $query->where(
                'order_id',
                $request->input('order_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Status Filter
        |--------------------------------------------------------------------------
        */

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->input('status')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Date Range
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('start_date') &&
            $request->filled('end_date')
        ) {
            $startDate = Carbon::parse(
                $request->input('start_date')
            )->startOfDay();

            $endDate = Carbon::parse(
                $request->input('end_date')
            )->endOfDay();

            $query->whereBetween(
                'created_at',
                [
                    $startDate,
                    $endDate,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        $sorting =
            $request->input(
                'sorting',
                'desc'
            ) === 'asc'
            ? 'asc'
            : 'desc';

        $query->orderBy(
            'created_at',
            $sorting
        );

        /*
        |--------------------------------------------------------------------------
        | Count
        |--------------------------------------------------------------------------
        */

        $numberOfPurchaseOrders =
            (clone $query)->count();

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $purchaseOrders =
            $query
                ->paginate(30)
                ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Currency
        |--------------------------------------------------------------------------
        */

        $activeCurrency =
            Currency::query()
                ->where(
                    'is_active',
                    true
                )
                ->first();

        /*
        |--------------------------------------------------------------------------
        | Inertia
        |--------------------------------------------------------------------------
        */

        $hasFilters =
            $request->filled('order_id') ||
            $request->filled('status') ||
            $request->filled('sorting') ||
            $request->filled('start_date') ||
            $request->filled('end_date');

        return Inertia::render(
            'operations/purchase-order/index',
            [
                'data' =>
                    $purchaseOrders,

                'numberOfPurchaseOrders' =>
                    $numberOfPurchaseOrders,

                'activeCurrency' =>
                    $activeCurrency,

                'hasFilters' =>
                    $hasFilters,

                'filters' => [
                    'order_id' =>
                        $request->input(
                            'order_id'
                        ),

                    'status' =>
                        $request->input(
                            'status'
                        ),

                    'sorting' =>
                        $sorting,
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function create()
    {

        $this->authorizePermission('purchase_order.create');

        return Inertia::render(
            'operations/purchase-order/create-purchase-order',
            [
                'warehouses' => Warehouse::query()
                    ->select(['id', 'name'])
                    ->where(
                        'status',
                        1
                    )
                    ->orderBy('name')
                    ->get(),

                'vendors' => Vendor::query()
                    ->select(['id', 'name'])
                    ->orderBy('name')
                    ->get(),

                'taxes' => Tax::query()
                    ->select(['id', 'name', 'rate'])
                    ->orderBy('name')
                    ->get(),

                'activeCurrency' => Currency::query()
                    ->where('is_active', true)
                    ->select(['id', 'symbol'])
                    ->first(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {

        $this->authorizePermission('purchase_order.create');


        $validated = $this->validatePurchaseOrder($request);

        $isRequisitionBased =
            $validated['purchase_mode'] === 'requisition';

        $uploadedDocument = null;

        try {
            if ($request->hasFile('document')) {
                $uploadedDocument = File::upload(
                    $request->file('document'),
                    'Purchase'
                );
            }

            $purchaseOrder = DB::transaction(
                function () use ($validated, $isRequisitionBased, $uploadedDocument) {
                    $requisition = null;

                    if ($isRequisitionBased) {
                        $requisition = Requisition::query()
                            ->with('items')
                            ->lockForUpdate()
                            ->findOrFail(
                                $validated['requisition_id']
                            );

                        if (
                            $requisition->status !==
                            'Approved'
                        ) {
                            throw ValidationException::withMessages([
                                'requisition_id' =>
                                    'Only an Approved requisition can be used to create a Purchase Order.',
                            ]);
                        }
                    }

                    $lineRows = $this->prepareLineRows(
                        $validated['items'],
                        $isRequisitionBased,
                        $requisition?->id
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Sub Total
                    |--------------------------------------------------------------------------
                    */

                    $subTotal = round(
                        collect($lineRows)
                            ->sum('line_sub_total'),
                        2
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Total Tax
                    |--------------------------------------------------------------------------
                    |
                    | Each row tax_amount contains the total of all selected
                    | taxes for that purchase item.
                    |
                    */

                    $orderTax = round(
                        collect($lineRows)
                            ->sum('tax_amount'),
                        2
                    );

                    $shippingCost = (float) (
                        $validated['shipping_cost'] ?? 0
                    );

                    $orderDiscount = (float) (
                        $validated['order_discount'] ?? 0
                    );

                    $grandTotal = round(
                        $subTotal +
                        $orderTax -
                        $orderDiscount +
                        $shippingCost,
                        2
                    );

                    if ($grandTotal < 0) {
                        throw ValidationException::withMessages([
                            'order_discount' =>
                                'Order discount cannot make the grand total negative.',
                        ]);
                    }

                    $purchaseOrder = PurchaseOrder::create([
                        'order_id' =>
                            $this->generateOrderId(),

                        'requisition_id' =>
                            $isRequisitionBased
                            ? $requisition?->id
                            : null,

                        'is_requisition_based' =>
                            $isRequisitionBased,

                        'vendor_id' =>
                            $validated['vendor_id'],

                        'warehouse_id' =>
                            $validated['warehouse_id'],

                        'sub_total' =>
                            $subTotal,

                        'order_tax' =>
                            $orderTax,

                        'order_discount' =>
                            $orderDiscount,

                        'shipping_cost' =>
                            $shippingCost,

                        'grand_total' =>
                            $grandTotal,

                        'order_date' =>
                            $validated['order_date'],

                        'expected_delivery' =>
                            $validated['expected_delivery']
                            ?? null,

                        'document' =>
                            $uploadedDocument,

                        'note' =>
                            $validated['note']
                            ?? null,

                        'status' =>
                            'Pending',

                        'created_by' =>
                            Auth::id(),
                    ]);

                    $affectedRequisitionItemIds = [];

                    foreach ($lineRows as $row) {
                        PurchaseItem::create([
                            'purchase_order_id' =>
                                $purchaseOrder->id,

                            'requisition_item_id' =>
                                $row['requisition_item_id'],

                            /*
                            |----------------------------------------------------------
                            | item_id = products.id
                            |----------------------------------------------------------
                            */

                            'item_id' =>
                                $row['item_id'],

                            'unit' =>
                                $row['unit'],

                            'quantity' =>
                                $row['quantity'],

                            'unit_price' =>
                                $row['unit_price'],

                            /*
                            |----------------------------------------------------------
                            | Multiple Taxes
                            |----------------------------------------------------------
                            |
                            | Stored in purchase_items.taxes JSON column.
                            |
                            */

                            'taxes' =>
                                $row['taxes'],

                            /*
                            |----------------------------------------------------------
                            | Total Tax Amount
                            |----------------------------------------------------------
                            */

                            'tax_amount' =>
                                $row['tax_amount'],

                            'line_total' =>
                                $row['line_total'],

                            'warehouse_id' =>
                                $validated['warehouse_id'],
                        ]);

                        if ($row['requisition_item_id']) {
                            $affectedRequisitionItemIds[] =
                                $row['requisition_item_id'];
                        }
                    }

                    $this->refreshRequisitionItemStatuses(
                        $affectedRequisitionItemIds
                    );

                    return $purchaseOrder;
                }
            );

            return redirect()
                ->route('purchase.order.index')
                ->with('notification', [
                    'message' =>
                        "Purchase Order {$purchaseOrder->order_id} created successfully.",
                    'type' =>
                        'success',
                ]);
        } catch (ValidationException $exception) {
            if ($uploadedDocument) {
                File::deleteFile(
                    $uploadedDocument
                );
            }

            throw $exception;
        } catch (Throwable $exception) {
            if ($uploadedDocument) {
                File::deleteFile(
                    $uploadedDocument
                );
            }

            Log::error(
                'Purchase Order creation failed.',
                [
                    'message' =>
                        $exception->getMessage(),

                    'user_id' =>
                        Auth::id(),

                    'exception' =>
                        $exception,
                ]
            );

            return redirect()
                ->back()
                ->withInput()
                ->with('notification', [
                    'message' =>
                        'Failed to create Purchase Order. Please try again.',
                    'type' =>
                        'error',
                ]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Approved Requisition Search
    |--------------------------------------------------------------------------
    */

    public function getApprovedRequisitions(Request $request)
    {
        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        $requisitions = Requisition::query()
            ->where(
                'status',
                'Approved'
            )
            ->whereHas(
                'items',
                function ($query) {
                    $query->whereIn(
                        'status',
                        [
                            'Approved',
                            'Procured',
                        ]
                    );
                }
            )
            ->withCount('items')
            ->when(
                $keyword !== '',
                function ($query) use ($keyword) {
                    $query->where(
                        function ($query) use ($keyword) {
                            $query
                                ->where(
                                    'requisition_id',
                                    'like',
                                    "%{$keyword}%"
                                )
                                ->orWhere(
                                    'purpose',
                                    'like',
                                    "%{$keyword}%"
                                );
                        }
                    );
                }
            )
            ->select([
                'id',
                'requisition_id',
                'required_date',
                'status',
            ])
            ->latest('id')
            ->limit(20)
            ->get()
            ->filter(
                function (Requisition $requisition) {
                    return $this
                        ->requisitionHasRemainingQuantity(
                            $requisition->id
                        );
                }
            )
            ->values()
            ->map(
                function (Requisition $requisition) {
                    return [
                        'id' =>
                            $requisition->id,

                        'requisition_id' =>
                            $requisition->requisition_id,

                        'required_date' =>
                            $requisition->required_date,

                        'label' =>
                            $requisition->requisition_id,
                    ];
                }
            );

        return response()
            ->json(
                $requisitions
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Requisition Items For PO
    |--------------------------------------------------------------------------
    */

    public function getRequisitionItemsForPo(
        Request $request
    ) {
        $validated =
            $request->validate([
                'requisition_id' => [
                    'required',
                    'integer',
                    'exists:requisitions,id',
                ],
            ]);

        $requisition =
            Requisition::query()
                ->with([
                    'items.product:id,code,name,unit_id,purchase_price,purchase_tax_ids',

                    'items.product.unit:id,name',
                ])
                ->findOrFail(
                    $validated['requisition_id']
                );

        if (
            $requisition->status !==
            'Approved'
        ) {
            return response()->json([
                'meta' =>
                    null,

                'items' =>
                    [],
            ]);
        }

        $items =
            $requisition
                ->items
                ->whereIn(
                    'status',
                    [
                        'Approved',
                        'Procured',
                    ]
                )
                ->map(
                    function (RequisitionItem $item) {
                        $alreadyOrdered =
                            $this
                                ->orderedQuantityForRequisitionItem(
                                    $item->id
                                );

                        $requestedQuantity =
                            (float) $item
                                ->quantity;

                        $remainingQuantity =
                            max(
                                0,
                                $requestedQuantity -
                                $alreadyOrdered
                            );

                        if (
                            $remainingQuantity <=
                            0
                        ) {
                            return null;
                        }

                        $product =
                            $item->product;

                        return [
                            'requisition_item_id' =>
                                $item->id,

                            'product_id' =>
                                $item->product_id,

                            'item_id' =>
                                $item->product_id,

                            'code' =>
                                $product?->code
                                ?? '',

                            'name' =>
                                $product?->name
                                ?? 'N/A',

                            'unit' =>
                                $item->unit
                                ?: (
                                    $product
                                        ?->unit
                                            ?->name
                                    ?? ''
                                ),

                            'previously_requisitioned' =>
                                (float) $item
                                    ->previously_requisitioned,

                            'requested_quantity' =>
                                $requestedQuantity,

                            'required_date' =>
                                $item->required_date,

                            'priority' =>
                                $item->priority,

                            'status' =>
                                $item->status,

                            'already_ordered' =>
                                (float) $alreadyOrdered,

                            'remaining_quantity' =>
                                (float) $remainingQuantity,

                            /*
                            |--------------------------------------------------------------------------
                            | Product Purchase Defaults
                            |--------------------------------------------------------------------------
                            */

                            'purchase_price' =>
                                (float) (
                                    $product
                                            ?->purchase_price
                                    ?? 0
                                ),

                            'purchase_tax_ids' =>
                                $product
                                        ?->purchase_tax_ids
                                ?? [],
                        ];
                    }
                )
                ->filter()
                ->values();

        return response()->json([
            'meta' => [
                'id' =>
                    $requisition->id,

                'requisition_id' =>
                    $requisition
                        ->requisition_id,

                'status' =>
                    $requisition->status,

                'total_items' =>
                    $items->count(),
            ],

            'items' =>
                $items,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {

        $this->authorizePermission('purchase_order.view');


        $purchaseOrder = PurchaseOrder::query()
            ->with([
                'purchaseItems',
                'vendor:id,vendor_id,name',
                'createdBy:id,employee_id,name',
                'warehouse:id,name',
                'requisition:id,requisition_id,required_date,status',
            ])
            ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        $productIds = $purchaseOrder
            ->purchaseItems
            ->pluck('item_id')
            ->filter()
            ->unique()
            ->values();

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->get([
                'id',
                'code',
                'name',
            ])
            ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Purchase Items
        |--------------------------------------------------------------------------
        */

        $purchaseItems = $purchaseOrder
            ->purchaseItems
            ->map(function (PurchaseItem $item) use ($products) {
                $product = $products->get(
                    $item->item_id
                );

                /*
                |--------------------------------------------------------------------------
                | Multiple Taxes
                |--------------------------------------------------------------------------
                */

                $taxes = $item->taxes;

                if (is_string($taxes)) {
                    $taxes = json_decode(
                        $taxes,
                        true
                    ) ?: [];
                }

                if (!is_array($taxes)) {
                    $taxes = [];
                }

                return [
                    'id' =>
                        $item->id,

                    'item_id' =>
                        (int) $item->item_id,

                    'code' =>
                        $product?->code ?? '',

                    'name' =>
                        $product?->name ?? 'N/A',

                    'unit' =>
                        $item->unit,

                    'quantity' =>
                        (float) $item->quantity,

                    'unit_price' =>
                        (float) $item->unit_price,

                    'taxes' =>
                        collect($taxes)
                            ->map(function ($tax) {
                                return [
                                    'tax_id' =>
                                        isset($tax['tax_id'])
                                        ? (int) $tax['tax_id']
                                        : null,

                                    'name' =>
                                        $tax['name'] ?? 'Tax',

                                    'rate' =>
                                        (float) (
                                            $tax['rate'] ?? 0
                                        ),

                                    'tax_amount' =>
                                        (float) (
                                            $tax['tax_amount'] ?? 0
                                        ),
                                ];
                            })
                            ->values()
                            ->all(),

                    'tax_amount' =>
                        (float) (
                            $item->tax_amount ?? 0
                        ),

                    'line_total' =>
                        (float) (
                            $item->line_total
                            ?? (
                                (
                                    (float) $item->quantity *
                                    (float) $item->unit_price
                                ) +
                                (float) (
                                    $item->tax_amount ?? 0
                                )
                            )
                        ),
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Currency
        |--------------------------------------------------------------------------
        */

        $activeCurrency = Currency::query()
            ->where(
                'is_active',
                true
            )
            ->select([
                'id',
                'symbol',
                'exchange_rate',
            ])
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/purchase-order/show-purchase-order',
            [
                'purchaseOrder' => [
                    'id' =>
                        $purchaseOrder->id,

                    'order_id' =>
                        $purchaseOrder->order_id,

                    'is_requisition_based' =>
                        (bool) $purchaseOrder
                            ->is_requisition_based,

                    'status' =>
                        $purchaseOrder->status,

                    'order_date' =>
                        $purchaseOrder->order_date,

                    'created_at' =>
                        $purchaseOrder->created_at
                                ?->toISOString(),

                    'warehouse' =>
                        $purchaseOrder->warehouse
                        ? [
                            'id' =>
                                $purchaseOrder
                                    ->warehouse
                                    ->id,

                            'name' =>
                                $purchaseOrder
                                    ->warehouse
                                    ->name,
                        ]
                        : null,

                    'vendor' =>
                        $purchaseOrder->vendor
                        ? [
                            'id' =>
                                $purchaseOrder
                                    ->vendor
                                    ->id,

                            'vendor_id' =>
                                $purchaseOrder
                                    ->vendor
                                    ->vendor_id,

                            'name' =>
                                $purchaseOrder
                                    ->vendor
                                    ->name,
                        ]
                        : null,

                    'requisition' =>
                        $purchaseOrder->requisition
                        ? [
                            'id' =>
                                $purchaseOrder
                                    ->requisition
                                    ->id,

                            'requisition_id' =>
                                $purchaseOrder
                                    ->requisition
                                    ->requisition_id,

                            'required_date' =>
                                $purchaseOrder
                                    ->requisition
                                    ->required_date,

                            'status' =>
                                $purchaseOrder
                                    ->requisition
                                    ->status,
                        ]
                        : null,

                    /*
                    |--------------------------------------------------------------------------
                    | Issued By
                    |--------------------------------------------------------------------------
                    |
                    | Department intentionally excluded.
                    |
                    */

                    'issued_by' =>
                        $purchaseOrder->createdBy
                        ? [
                            'id' =>
                                $purchaseOrder
                                    ->createdBy
                                    ->id,

                            'name' =>
                                $purchaseOrder
                                    ->createdBy
                                    ->name,

                            'employee_id' =>
                                $purchaseOrder
                                    ->createdBy
                                    ->employee_id,
                        ]
                        : null,

                    'note' =>
                        $purchaseOrder->note,

                    'document' =>
                        $purchaseOrder->document,

                    'purchase_items' =>
                        $purchaseItems,

                    'sub_total' =>
                        (float) (
                            $purchaseOrder
                                ->sub_total ?? 0
                        ),

                    'order_tax' =>
                        (float) (
                            $purchaseOrder
                                ->order_tax ?? 0
                        ),

                    'order_discount' =>
                        (float) (
                            $purchaseOrder
                                ->order_discount ?? 0
                        ),

                    'shipping_cost' =>
                        (float) (
                            $purchaseOrder
                                ->shipping_cost ?? 0
                        ),

                    'grand_total' =>
                        (float) (
                            $purchaseOrder
                                ->grand_total ?? 0
                        ),
                ],

                'activeCurrency' =>
                    $activeCurrency,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    /*
 |--------------------------------------------------------------------------
 | Edit
 |--------------------------------------------------------------------------
 */

    public function edit($id)
    {

        $this->authorizePermission('purchase_order.edit');


        $purchaseOrder = PurchaseOrder::query()
            ->with([
                'purchaseItems',
                'requisition:id,requisition_id,required_date,status',
            ])
            ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Only Pending Purchase Order Can Be Edited
        |--------------------------------------------------------------------------
        */

        if (
            $purchaseOrder->status !==
            'Pending'
        ) {
            return redirect()
                ->route(
                    'purchase.order.show',
                    $purchaseOrder->id
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Only Pending Purchase Orders can be edited.',

                        'type' =>
                            'error',
                    ]
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Product Information
        |--------------------------------------------------------------------------
        */

        $productIds = $purchaseOrder
            ->purchaseItems
            ->pluck('item_id')
            ->filter()
            ->unique()
            ->values();

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->get([
                'id',
                'code',
                'name',
            ])
            ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Requisition Items
        |--------------------------------------------------------------------------
        |
        | These are used by the edit screen when the PO is requisition based.
        |
        | Important:
        | Current Purchase Order is excluded from ordered quantity so that its
        | own quantity does not reduce the maximum quantity while editing.
        |
        */

        $requisitionItems = collect();

        if (
            $purchaseOrder->is_requisition_based &&
            $purchaseOrder->requisition_id
        ) {
            $requisition = Requisition::query()
                ->with([
                    'items.product:id,code,name,unit_id',
                    'items.product.unit:id,name',
                ])
                ->findOrFail(
                    $purchaseOrder->requisition_id
                );

            $requisitionItems = $requisition
                ->items
                ->whereIn(
                    'status',
                    [
                        'Approved',
                        'Procured',
                    ]
                )
                ->map(
                    function (RequisitionItem $item) use ($purchaseOrder) {
                        /*
                        |--------------------------------------------------------------------------
                        | Exclude Current PO
                        |--------------------------------------------------------------------------
                        */

                        $alreadyOrdered =
                            $this->orderedQuantityForRequisitionItem(
                                $item->id,
                                $purchaseOrder->id
                            );

                        $requestedQuantity =
                            (float) $item->quantity;

                        $remainingQuantity = max(
                            0,
                            $requestedQuantity -
                            $alreadyOrdered
                        );

                        if ($remainingQuantity <= 0) {
                            return null;
                        }

                        $product =
                            $item->product;

                        return [
                            'requisition_item_id' =>
                                $item->id,

                            'item_id' =>
                                $item->product_id,

                            'code' =>
                                $product?->code ?? '',

                            'name' =>
                                $product?->name ?? 'N/A',

                            'unit' =>
                                $item->unit
                                ?: (
                                    $product?->unit?->name
                                    ?? ''
                                ),

                            'requested_quantity' =>
                                $requestedQuantity,

                            'already_ordered' =>
                                (float) $alreadyOrdered,

                            'remaining_quantity' =>
                                (float) $remainingQuantity,

                            'suggested_rate' =>
                                0,
                        ];
                    }
                )
                ->filter()
                ->values();
        }

        /*
        |--------------------------------------------------------------------------
        | Existing Purchase Items
        |--------------------------------------------------------------------------
        */

        $purchaseItems = $purchaseOrder
            ->purchaseItems
            ->map(
                function (PurchaseItem $purchaseItem) use ($products, $purchaseOrder) {
                    $product =
                        $products->get(
                            $purchaseItem->item_id
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Existing Taxes
                    |--------------------------------------------------------------------------
                    */

                    $taxSnapshot =
                        $purchaseItem->taxes;

                    if (is_string($taxSnapshot)) {
                        $taxSnapshot =
                            json_decode(
                                $taxSnapshot,
                                true
                            ) ?: [];
                    }

                    if (!is_array($taxSnapshot)) {
                        $taxSnapshot = [];
                    }

                    $taxIds = collect(
                        $taxSnapshot
                    )
                        ->pluck('tax_id')
                        ->filter(
                            fn($taxId) =>
                            $taxId !== null
                        )
                        ->map(
                            fn($taxId) =>
                            (string) $taxId
                        )
                        ->values()
                        ->all();

                    /*
                    |--------------------------------------------------------------------------
                    | Maximum Quantity
                    |--------------------------------------------------------------------------
                    */

                    $maxQuantity =
                        null;

                    if (
                        $purchaseItem->requisition_item_id
                    ) {
                        $requisitionItem =
                            RequisitionItem::query()
                                ->find(
                                    $purchaseItem
                                        ->requisition_item_id
                                );

                        if ($requisitionItem) {
                            $alreadyOrdered =
                                $this
                                    ->orderedQuantityForRequisitionItem(
                                        $requisitionItem->id,
                                        $purchaseOrder->id
                                    );

                            $maxQuantity = max(
                                0,
                                (float) $requisitionItem
                                    ->quantity -
                                $alreadyOrdered
                            );
                        }
                    }

                    return [
                        'id' =>
                            $purchaseItem->id,

                        'requisition_item_id' =>
                            $purchaseItem
                                ->requisition_item_id,

                        'item_id' =>
                            (int) $purchaseItem
                                ->item_id,

                        'code' =>
                            $product?->code ?? '',

                        'name' =>
                            $product?->name ?? 'N/A',

                        'unit' =>
                            $purchaseItem->unit,

                        'quantity' =>
                            (float) $purchaseItem
                                ->quantity,

                        'max_quantity' =>
                            $maxQuantity,

                        'unit_price' =>
                            (float) $purchaseItem
                                ->unit_price,

                        /*
                        |--------------------------------------------------------------------------
                        | Multiple Taxes
                        |--------------------------------------------------------------------------
                        */

                        'tax_ids' =>
                            $taxIds,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/purchase-order/edit-purchase-order',
            [
                'purchaseOrder' => [
                    'id' =>
                        $purchaseOrder->id,

                    'order_id' =>
                        $purchaseOrder->order_id,

                    'requisition_id' =>
                        $purchaseOrder->requisition_id,

                    'is_requisition_based' =>
                        (bool) $purchaseOrder
                            ->is_requisition_based,

                    'warehouse_id' =>
                        $purchaseOrder->warehouse_id,

                    'vendor_id' =>
                        $purchaseOrder->vendor_id,

                    'order_date' =>
                        $purchaseOrder->order_date,

                    'expected_delivery' =>
                        $purchaseOrder
                            ->expected_delivery,

                    'document' =>
                        $purchaseOrder->document,

                    'shipping_cost' =>
                        (string) (
                            $purchaseOrder
                                ->shipping_cost
                            ?? ''
                        ),

                    'order_discount' =>
                        (string) (
                            $purchaseOrder
                                ->order_discount
                            ?? ''
                        ),

                    'note' =>
                        $purchaseOrder->note ?? '',

                    'status' =>
                        $purchaseOrder->status,

                    'requisition' =>
                        $purchaseOrder->requisition
                        ? [
                            'id' =>
                                $purchaseOrder
                                    ->requisition
                                    ->id,

                            'requisition_id' =>
                                $purchaseOrder
                                    ->requisition
                                    ->requisition_id,

                            'required_date' =>
                                $purchaseOrder
                                    ->requisition
                                    ->required_date,

                            'label' =>
                                $purchaseOrder
                                    ->requisition
                                    ->requisition_id,
                        ]
                        : null,

                    'purchase_items' =>
                        $purchaseItems,
                ],

                /*
                |--------------------------------------------------------------------------
                | Current Requisition Items
                |--------------------------------------------------------------------------
                */

                'requisitionItems' =>
                    $requisitionItems,

                /*
                |--------------------------------------------------------------------------
                | Existing Create/Edit Options
                |--------------------------------------------------------------------------
                */

                'warehouses' =>
                    Warehouse::query()
                        ->select([
                            'id',
                            'name',
                        ])
                        ->orderBy('name')
                        ->get(),

                'vendors' =>
                    Vendor::query()
                        ->select([
                            'id',
                            'name',
                        ])
                        ->orderBy('name')
                        ->get(),

                'taxes' =>
                    Tax::query()
                        ->select([
                            'id',
                            'name',
                            'rate',
                        ])
                        ->orderBy('name')
                        ->get(),

                'activeCurrency' =>
                    Currency::query()
                        ->where(
                            'is_active',
                            true
                        )
                        ->select([
                            'id',
                            'symbol',
                        ])
                        ->first(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        $id
    ) {

        $this->authorizePermission('purchase_order.edit');


        $purchaseOrder =
            PurchaseOrder::query()
                ->with(
                    'purchaseItems'
                )
                ->findOrFail(
                    $id
                );

        if (
            $purchaseOrder->status !==
            'Pending'
        ) {
            throw ValidationException::withMessages([
                'status' =>
                    'Only Pending Purchase Orders can be updated.',
            ]);
        }

        $validated =
            $this->validatePurchaseOrder(
                $request
            );

        $isRequisitionBased =
            $validated['purchase_mode'] ===
            'requisition';

        $oldDocument =
            $purchaseOrder->document;

        $newDocument =
            null;

        try {
            if (
                $request->hasFile(
                    'document'
                )
            ) {
                $newDocument =
                    File::upload(
                        $request->file(
                            'document'
                        ),
                        'Purchase'
                    );
            }

            DB::transaction(
                function () use ($purchaseOrder, $validated, $isRequisitionBased, $oldDocument, $newDocument, $request) {
                    $lockedPurchaseOrder =
                        PurchaseOrder::query()
                            ->with(
                                'purchaseItems'
                            )
                            ->lockForUpdate()
                            ->findOrFail(
                                $purchaseOrder->id
                            );

                    if (
                        $lockedPurchaseOrder->status !==
                        'Pending'
                    ) {
                        throw ValidationException::withMessages([
                            'status' =>
                                'Only Pending Purchase Orders can be updated.',
                        ]);
                    }

                    $oldRequisitionItemIds =
                        $lockedPurchaseOrder
                            ->purchaseItems
                            ->pluck(
                                'requisition_item_id'
                            )
                            ->filter()
                            ->unique()
                            ->values()
                            ->all();

                    $requisition =
                        null;

                    if (
                        $isRequisitionBased
                    ) {
                        $requisition =
                            Requisition::query()
                                ->lockForUpdate()
                                ->findOrFail(
                                    $validated[
                                        'requisition_id'
                                    ]
                                );

                        if (
                            $requisition->status !==
                            'Approved'
                        ) {
                            throw ValidationException::withMessages([
                                'requisition_id' =>
                                    'Only an Approved requisition can be used to update a Purchase Order.',
                            ]);
                        }
                    }

                    $lineRows =
                        $this->prepareLineRows(
                            $validated['items'],
                            $isRequisitionBased,
                            $requisition?->id,
                            $lockedPurchaseOrder->id
                        );

                    $subTotal = round(
                        collect($lineRows)
                            ->sum(
                                'line_sub_total'
                            ),
                        2
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Total Multiple Taxes
                    |--------------------------------------------------------------------------
                    */

                    $orderTax = round(
                        collect($lineRows)
                            ->sum(
                                'tax_amount'
                            ),
                        2
                    );

                    $shippingCost =
                        (float) (
                            $validated[
                                'shipping_cost'
                            ] ??
                            0
                        );

                    $orderDiscount =
                        (float) (
                            $validated[
                                'order_discount'
                            ] ??
                            0
                        );

                    $grandTotal = round(
                        $subTotal +
                        $orderTax -
                        $orderDiscount +
                        $shippingCost,
                        2
                    );

                    if (
                        $grandTotal <
                        0
                    ) {
                        throw ValidationException::withMessages([
                            'order_discount' =>
                                'Order discount cannot make the grand total negative.',
                        ]);
                    }

                    $removeDocument =
                        $request->boolean(
                            'remove_document'
                        );

                    $documentPath =
                        $newDocument
                        ?: (
                            $removeDocument
                            ? null
                            : $oldDocument
                        );

                    $lockedPurchaseOrder
                        ->update([
                            'requisition_id' =>
                                $isRequisitionBased
                                ? $requisition?->id
                                : null,

                            'is_requisition_based' =>
                                $isRequisitionBased,

                            'vendor_id' =>
                                $validated[
                                    'vendor_id'
                                ],

                            'warehouse_id' =>
                                $validated[
                                    'warehouse_id'
                                ],

                            'sub_total' =>
                                $subTotal,

                            'order_tax' =>
                                $orderTax,

                            'order_discount' =>
                                $orderDiscount,

                            'shipping_cost' =>
                                $shippingCost,

                            'grand_total' =>
                                $grandTotal,

                            'order_date' =>
                                $validated[
                                    'order_date'
                                ],

                            'expected_delivery' =>
                                $validated[
                                    'expected_delivery'
                                ]
                                ?? null,

                            'document' =>
                                $documentPath,

                            'note' =>
                                $validated[
                                    'note'
                                ]
                                ?? null,
                        ]);

                    $lockedPurchaseOrder
                        ->purchaseItems()
                        ->delete();

                    $newRequisitionItemIds =
                        [];

                    foreach (
                        $lineRows
                        as $row
                    ) {
                        PurchaseItem::create([
                            'purchase_order_id' =>
                                $lockedPurchaseOrder->id,

                            'requisition_item_id' =>
                                $row[
                                    'requisition_item_id'
                                ],

                            'item_id' =>
                                $row[
                                    'item_id'
                                ],

                            'unit' =>
                                $row[
                                    'unit'
                                ],

                            'quantity' =>
                                $row[
                                    'quantity'
                                ],

                            'unit_price' =>
                                $row[
                                    'unit_price'
                                ],

                            /*
                            |----------------------------------------------------------
                            | Multiple Taxes JSON
                            |----------------------------------------------------------
                            */

                            'taxes' =>
                                $row[
                                    'taxes'
                                ],

                            /*
                            |----------------------------------------------------------
                            | Total Tax
                            |----------------------------------------------------------
                            */

                            'tax_amount' =>
                                $row[
                                    'tax_amount'
                                ],

                            'line_total' =>
                                $row[
                                    'line_total'
                                ],

                            'warehouse_id' =>
                                $validated[
                                    'warehouse_id'
                                ],
                        ]);

                        if (
                            $row[
                                'requisition_item_id'
                            ]
                        ) {
                            $newRequisitionItemIds[] =
                                $row[
                                    'requisition_item_id'
                                ];
                        }
                    }

                    $this
                        ->refreshRequisitionItemStatuses(
                            array_merge(
                                $oldRequisitionItemIds,
                                $newRequisitionItemIds
                            )
                        );
                }
            );

            if (
                $newDocument &&
                $oldDocument &&
                $newDocument !==
                $oldDocument
            ) {
                File::deleteFile(
                    $oldDocument
                );
            } elseif (
                $request->boolean(
                    'remove_document'
                ) &&
                $oldDocument &&
                !$newDocument
            ) {
                File::deleteFile(
                    $oldDocument
                );
            }

            return redirect()
                ->route(
                    'purchase.order.index'
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Purchase Order updated successfully.',

                        'type' =>
                            'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            if (
                $newDocument
            ) {
                File::deleteFile(
                    $newDocument
                );
            }

            throw $exception;
        } catch (
            Throwable $exception
        ) {
            if (
                $newDocument
            ) {
                File::deleteFile(
                    $newDocument
                );
            }

            Log::error(
                'Purchase Order update failed.',
                [
                    'purchase_order_id' =>
                        $purchaseOrder->id,

                    'message' =>
                        $exception
                            ->getMessage(),

                    'user_id' =>
                        Auth::id(),

                    'exception' =>
                        $exception,
                ]
            );

            return redirect()
                ->back()
                ->withInput()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Failed to update Purchase Order. Please try again.',

                        'type' =>
                            'error',
                    ]
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {

        $this->authorizePermission('purchase_order.delete');


        try {
            $document =
                null;

            DB::transaction(
                function () use ($id, &$document) {
                    $purchaseOrder =
                        PurchaseOrder::query()
                            ->with(
                                'purchaseItems'
                            )
                            ->lockForUpdate()
                            ->findOrFail(
                                $id
                            );

                    if (
                        $purchaseOrder->status !==
                        'Pending'
                    ) {
                        throw ValidationException::withMessages([
                            'purchase_order' =>
                                'Only Pending Purchase Orders can be deleted.',
                        ]);
                    }

                    $requisitionItemIds =
                        $purchaseOrder
                            ->purchaseItems
                            ->pluck(
                                'requisition_item_id'
                            )
                            ->filter()
                            ->unique()
                            ->values()
                            ->all();

                    $document =
                        $purchaseOrder
                            ->document;

                    $purchaseOrder
                        ->purchaseItems()
                        ->delete();

                    $purchaseOrder
                        ->delete();

                    $this
                        ->refreshRequisitionItemStatuses(
                            $requisitionItemIds
                        );
                }
            );

            if (
                $document
            ) {
                File::deleteFile(
                    $document
                );
            }

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Purchase Order deleted successfully.',

                        'type' =>
                            'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            return redirect()
                ->back()
                ->withErrors(
                    $exception->errors()
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            collect(
                                $exception
                                    ->errors()
                            )
                                ->flatten()
                                ->first(),

                        'type' =>
                            'error',
                    ]
                );
        } catch (
            Throwable $exception
        ) {
            Log::error(
                'Purchase Order delete failed.',
                [
                    'purchase_order_id' =>
                        $id,

                    'message' =>
                        $exception
                            ->getMessage(),

                    'user_id' =>
                        Auth::id(),

                    'exception' =>
                        $exception,
                ]
            );

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Failed to delete Purchase Order. Please try again.',

                        'type' =>
                            'error',
                    ]
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request)
    {

        $this->authorizePermission('purchase_order.status');


        $validated =
            $request->validate([
                'id' => [
                    'required',
                    'integer',
                    'exists:purchase_orders,id',
                ],

                'status' => [
                    'required',
                    Rule::in([
                        'Approved',
                        'Cancelled',
                    ]),
                ],
            ]);

        $result =
            DB::transaction(
                function () use ($validated) {
                    $purchaseOrder =
                        PurchaseOrder::query()
                            ->with(
                                'purchaseItems'
                            )
                            ->lockForUpdate()
                            ->findOrFail(
                                $validated[
                                    'id'
                                ]
                            );

                    if (
                        $purchaseOrder->status !==
                        'Pending'
                    ) {
                        throw ValidationException::withMessages([
                            'status' =>
                                'Only Pending Purchase Orders can be approved or cancelled.',
                        ]);
                    }

                    $purchaseOrder
                        ->update([
                            'status' =>
                                $validated[
                                    'status'
                                ],
                        ]);

                    $requisitionItemIds =
                        $purchaseOrder
                            ->purchaseItems
                            ->pluck(
                                'requisition_item_id'
                            )
                            ->filter()
                            ->unique()
                            ->values()
                            ->all();

                    $this
                        ->refreshRequisitionItemStatuses(
                            $requisitionItemIds
                        );

                    return [
                        'message' =>
                            "Purchase Order marked as {$purchaseOrder->status}.",

                        'status' =>
                            $purchaseOrder->status,
                    ];
                }
            );

        return response()
            ->json(
                $result
            );
    }

    /*
    |--------------------------------------------------------------------------
    | PDF
    |--------------------------------------------------------------------------
    */

    public function downloadPdf($id)
    {
        $data =
            $this->purchaseOrderPdfData(
                $id
            );

        $pdf =
            Pdf::loadView(
                'pdf.purchase',
                $data
            );

        return $pdf->download(
            'purchase_order_' .
            $data[
                'purchaseOrder'
            ]->order_id .
            '.pdf'
        );
    }

    public function streamPdf($id)
    {
        $data =
            $this->purchaseOrderPdfData(
                $id
            );

        $pdf =
            Pdf::loadView(
                'pdf.purchase',
                $data
            );

        return $pdf->stream(
            'purchase_order_' .
            $data[
                'purchaseOrder'
            ]->order_id .
            '.pdf'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Purchase Order Suggestion Search
    |--------------------------------------------------------------------------
    */

    public function getPurchaseOrders(Request $request)
    {
        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        $purchaseOrders =
            PurchaseOrder::query()
                ->select([
                    'id',
                    'order_id',
                ])
                ->when(
                    $keyword !== '',
                    fn($query) =>
                    $query->where(
                        'order_id',
                        'like',
                        "%{$keyword}%"
                    )
                )
                ->orderByDesc(
                    'id'
                )
                ->limit(20)
                ->get();

        return response()
            ->json(
                $purchaseOrders
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function validatePurchaseOrder(Request $request): array
    {
        return $request->validate([
            'purchase_mode' => [
                'required',
                Rule::in([
                    'requisition',
                    'free',
                ]),
            ],

            'requisition_id' => [
                'nullable',
                'integer',

                Rule::requiredIf(
                    fn() =>
                    $request->input(
                        'purchase_mode'
                    ) ===
                    'requisition'
                ),

                'exists:requisitions,id',
            ],

            'warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,id',
            ],

            'vendor_id' => [
                'required',
                'integer',
                'exists:vendors,id',
            ],

            'order_date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'expected_delivery' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:order_date',
            ],

            'document' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120',
            ],

            'remove_document' => [
                'nullable',
                'boolean',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.requisition_item_id' => [
                'nullable',
                'integer',
                'exists:requisition_items,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | item_id = products.id
            |--------------------------------------------------------------------------
            */

            'items.*.item_id' => [
                'required',
                'integer',
                'distinct',
                'exists:products,id',
            ],

            'items.*.unit' => [
                'required',
                'string',
                'max:50',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'items.*.unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            /*
            |--------------------------------------------------------------------------
            | Multiple Taxes
            |--------------------------------------------------------------------------
            |
            | Frontend:
            |
            | tax_ids: [1, 2, 3]
            |
            */

            'items.*.tax_ids' => [
                'nullable',
                'array',
            ],

            'items.*.tax_ids.*' => [
                'integer',
                'exists:taxes,id',
            ],

            'shipping_cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'order_discount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare Purchase Item Lines
    |--------------------------------------------------------------------------
    */

    private function prepareLineRows(
        array $items,
        bool $isRequisitionBased,
        ?int $requisitionId,
        ?int $excludePurchaseOrderId = null
    ): array {
        $rows = [];

        foreach (
            $items
            as $index => $item
        ) {
            $product =
                Product::query()
                    ->select([
                        'id',
                        'name',
                    ])
                    ->findOrFail(
                        $item[
                            'item_id'
                        ]
                    );

            $requisitionItemId =
                $item[
                    'requisition_item_id'
                ] ??
                null;

            /*
            |--------------------------------------------------------------------------
            | Requisition Validation
            |--------------------------------------------------------------------------
            */

            if (
                $isRequisitionBased
            ) {
                if (
                    !$requisitionItemId
                ) {
                    throw ValidationException::withMessages([
                        "items.{$index}.requisition_item_id" =>
                            'Requisition item is required for a requisition-based Purchase Order.',
                    ]);
                }

                $requisitionItem =
                    RequisitionItem::query()
                        ->lockForUpdate()
                        ->findOrFail(
                            $requisitionItemId
                        );

                if (
                    (int) $requisitionItem
                        ->requisition_id !==
                    (int) $requisitionId
                ) {
                    throw ValidationException::withMessages([
                        "items.{$index}.requisition_item_id" =>
                            'This item does not belong to the selected requisition.',
                    ]);
                }

                $requisitionProductId =
                    $requisitionItem
                        ->product_id
                    ?: $requisitionItem
                        ->item_id;

                if (
                    (int) $requisitionProductId !==
                    (int) $item[
                        'item_id'
                    ]
                ) {
                    throw ValidationException::withMessages([
                        "items.{$index}.item_id" =>
                            'The selected product does not match the requisition item.',
                    ]);
                }

                $alreadyOrdered =
                    $this
                        ->orderedQuantityForRequisitionItem(
                            $requisitionItem->id,
                            $excludePurchaseOrderId
                        );

                $remaining = max(
                    0,
                    (float) $requisitionItem
                        ->quantity -
                    $alreadyOrdered
                );

                if (
                    (float) $item[
                        'quantity'
                    ] >
                    $remaining +
                    0.0001
                ) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" =>
                            "Quantity for {$product->name} cannot exceed remaining quantity ({$remaining}).",
                    ]);
                }
            } elseif (
                $requisitionItemId
            ) {
                throw ValidationException::withMessages([
                    "items.{$index}.requisition_item_id" =>
                        'Free Purchase items cannot be linked to a requisition item.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Quantity / Price
            |--------------------------------------------------------------------------
            */

            $quantity =
                (float) $item[
                    'quantity'
                ];

            $unitPrice =
                (float) $item[
                    'unit_price'
                ];

            /*
            |--------------------------------------------------------------------------
            | Line Sub Total
            |--------------------------------------------------------------------------
            */

            $lineSubTotal = round(
                $quantity *
                $unitPrice,
                2
            );

            /*
            |--------------------------------------------------------------------------
            | Multiple Taxes
            |--------------------------------------------------------------------------
            */

            $taxIds =
                array_values(
                    array_unique(
                        array_map(
                            'intval',
                            $item[
                                'tax_ids'
                            ] ??
                            []
                        )
                    )
                );

            $taxDetails =
                [];

            $taxAmount =
                0;

            if (
                count(
                    $taxIds
                ) >
                0
            ) {
                /*
                |--------------------------------------------------------------------------
                | Fetch Selected Taxes
                |--------------------------------------------------------------------------
                */

                $taxModels =
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
                        ->keyBy(
                            'id'
                        );

                /*
                |--------------------------------------------------------------------------
                | Calculate Each Tax
                |--------------------------------------------------------------------------
                */

                foreach (
                    $taxIds
                    as $taxId
                ) {
                    $tax =
                        $taxModels->get(
                            $taxId
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Safety
                    |--------------------------------------------------------------------------
                    |
                    | Validation already checks this, but this protects against
                    | unexpected data changes between validation and execution.
                    |
                    */

                    if (
                        !$tax
                    ) {
                        throw ValidationException::withMessages([
                            "items.{$index}.tax_ids" =>
                                'One or more selected taxes are invalid.',
                        ]);
                    }

                    $rate =
                        (float) $tax->rate;

                    /*
                    |--------------------------------------------------------------------------
                    | Tax Amount
                    |--------------------------------------------------------------------------
                    |
                    | Every selected tax is calculated independently from:
                    |
                    | quantity * unit_price
                    |
                    */

                    $singleTaxAmount =
                        round(
                            (
                                $lineSubTotal *
                                $rate
                            ) /
                            100,
                            2
                        );

                    $taxAmount +=
                        $singleTaxAmount;

                    /*
                    |--------------------------------------------------------------------------
                    | Tax Snapshot
                    |--------------------------------------------------------------------------
                    */

                    $taxDetails[] = [
                        'tax_id' =>
                            (int) $tax->id,

                        'name' =>
                            $tax->name,

                        'rate' =>
                            $rate,

                        'tax_amount' =>
                            $singleTaxAmount,
                    ];
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Total Tax
            |--------------------------------------------------------------------------
            */

            $taxAmount =
                round(
                    $taxAmount,
                    2
                );

            /*
            |--------------------------------------------------------------------------
            | Line Total
            |--------------------------------------------------------------------------
            */

            $lineTotal =
                round(
                    $lineSubTotal +
                    $taxAmount,
                    2
                );

            /*
            |--------------------------------------------------------------------------
            | Row
            |--------------------------------------------------------------------------
            */

            $rows[] = [
                'requisition_item_id' =>
                    $isRequisitionBased
                    ? $requisitionItemId
                    : null,

                'item_id' =>
                    (int) $item[
                        'item_id'
                    ],

                'unit' =>
                    $item[
                        'unit'
                    ],

                'quantity' =>
                    $quantity,

                'unit_price' =>
                    $unitPrice,

                /*
                |--------------------------------------------------------------------------
                | Multiple Tax Snapshot
                |--------------------------------------------------------------------------
                */

                'taxes' =>
                    $taxDetails,

                /*
                |--------------------------------------------------------------------------
                | Sum of all taxes
                |--------------------------------------------------------------------------
                */

                'tax_amount' =>
                    $taxAmount,

                'line_sub_total' =>
                    $lineSubTotal,

                'line_total' =>
                    $lineTotal,
            ];
        }

        return $rows;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Order ID
    |--------------------------------------------------------------------------
    */

    private function generateOrderId(): string
    {
        $year =
            now()->format(
                'Y'
            );

        $lastPurchaseOrder =
            PurchaseOrder::query()
                ->where(
                    'order_id',
                    'like',
                    "PO{$year}%"
                )
                ->lockForUpdate()
                ->latest(
                    'id'
                )
                ->first();

        $prefix =
            'PO' .
            $year;

        $lastNumber =
            $lastPurchaseOrder
            ? (int) substr(
                $lastPurchaseOrder
                    ->order_id,
                strlen(
                    $prefix
                )
            )
            : 0;

        return $prefix .
            sprintf(
                '%05d',
                $lastNumber +
                1
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Ordered Quantity
    |--------------------------------------------------------------------------
    */

    private function orderedQuantityForRequisitionItem(
        int $requisitionItemId,
        ?int $excludePurchaseOrderId = null
    ): float {
        $query =
            PurchaseItem::query()
                ->where(
                    'requisition_item_id',
                    $requisitionItemId
                )
                ->whereHas(
                    'purchaseOrder',
                    function ($query) use ($excludePurchaseOrderId) {
                        $query->whereIn(
                            'status',
                            [
                                'Pending',
                                'Approved',
                                'Partial',
                                'Received',
                            ]
                        );

                        if (
                            $excludePurchaseOrderId !==
                            null
                        ) {
                            $query->where(
                                'id',
                                '!=',
                                $excludePurchaseOrderId
                            );
                        }
                    }
                );

        return (float) $query
            ->sum(
                'quantity'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Requisition Remaining Quantity
    |--------------------------------------------------------------------------
    */

    private function requisitionHasRemainingQuantity(
        int $requisitionId
    ): bool {
        $items =
            RequisitionItem::query()
                ->where(
                    'requisition_id',
                    $requisitionId
                )
                ->whereIn(
                    'status',
                    [
                        'Approved',
                        'Procured',
                    ]
                )
                ->get([
                    'id',
                    'quantity',
                ]);

        foreach (
            $items
            as $item
        ) {
            $ordered =
                $this
                    ->orderedQuantityForRequisitionItem(
                        $item->id
                    );

            if (
                (float) $item->quantity >
                $ordered
            ) {
                return true;
            }
        }

        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh Requisition Item Status
    |--------------------------------------------------------------------------
    */

    private function refreshRequisitionItemStatuses(
        array $requisitionItemIds
    ): void {
        foreach (
            array_unique(
                array_filter(
                    $requisitionItemIds
                )
            )
            as $id
        ) {
            $requisitionItem =
                RequisitionItem::query()
                    ->find(
                        $id
                    );

            if (
                !$requisitionItem
            ) {
                continue;
            }

            $ordered =
                $this
                    ->orderedQuantityForRequisitionItem(
                        $requisitionItem->id
                    );

            $status =
                $ordered >=
                (float) $requisitionItem
                    ->quantity
                ? 'Procured'
                : 'Approved';

            if (
                $requisitionItem
                    ->status !==
                $status
            ) {
                $requisitionItem
                    ->update([
                        'status' =>
                            $status,
                    ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PDF Data
    |--------------------------------------------------------------------------
    */

    private function purchaseOrderPdfData(
        int $id
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Purchase Order
        |--------------------------------------------------------------------------
        */

        $purchaseOrder =
            PurchaseOrder::query()
                ->with([
                    'purchaseItems',

                    'vendor:id,vendor_id,name',

                    /*
                    |--------------------------------------------------------------------------
                    | Department intentionally not loaded
                    |--------------------------------------------------------------------------
                    */

                    'createdBy:id,employee_id,name',

                    'warehouse:id,name',

                    /*
                    |--------------------------------------------------------------------------
                    | No BOQ / Project relation
                    |--------------------------------------------------------------------------
                    */

                    'requisition:id,requisition_id,required_date,status',
                ])
                ->findOrFail(
                    $id
                );

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        |
        | purchase_items.item_id = products.id
        |
        */

        $productIds =
            $purchaseOrder
                ->purchaseItems
                ->pluck(
                    'item_id'
                )
                ->filter()
                ->unique()
                ->values();

        $products =
            Product::query()
                ->whereIn(
                    'id',
                    $productIds
                )
                ->get([
                    'id',
                    'code',
                    'name',
                ])
                ->keyBy(
                    'id'
                );

        /*
        |--------------------------------------------------------------------------
        | Prepare Purchase Items For PDF
        |--------------------------------------------------------------------------
        */

        $purchaseOrder
            ->purchaseItems
            ->each(
                function (PurchaseItem $item) use ($products) {
                    $product =
                        $products->get(
                            $item->item_id
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Product Information
                    |--------------------------------------------------------------------------
                    */

                    $item->setAttribute(
                        'product_name',
                        $product?->name
                        ?? 'N/A'
                    );

                    $item->setAttribute(
                        'product_code',
                        $product?->code
                        ?? ''
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Multiple Taxes
                    |--------------------------------------------------------------------------
                    */

                    $taxes =
                        $item->taxes;

                    /*
                    |--------------------------------------------------------------------------
                    | Fallback if model cast is missing
                    |--------------------------------------------------------------------------
                    */

                    if (
                        is_string(
                            $taxes
                        )
                    ) {
                        $taxes =
                            json_decode(
                                $taxes,
                                true
                            ) ?: [];
                    }

                    if (
                        !is_array(
                            $taxes
                        )
                    ) {
                        $taxes =
                            [];
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Normalize Tax Snapshot
                    |--------------------------------------------------------------------------
                    */

                    $taxes =
                        collect(
                            $taxes
                        )
                            ->map(
                                function ($tax) {
                                    return [
                                        'tax_id' =>
                                            isset(
                                            $tax[
                                                'tax_id'
                                            ]
                                        )
                                            ? (int) $tax[
                                                'tax_id'
                                            ]
                                            : null,

                                        'name' =>
                                            $tax[
                                                'name'
                                            ]
                                            ?? 'Tax',

                                        'rate' =>
                                            (float) (
                                                $tax[
                                                    'rate'
                                                ]
                                                ?? 0
                                            ),

                                        'tax_amount' =>
                                            (float) (
                                                $tax[
                                                    'tax_amount'
                                                ]
                                                ?? 0
                                            ),
                                    ];
                                }
                            )
                            ->values()
                            ->all();

                    $item->setAttribute(
                        'pdf_taxes',
                        $taxes
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Line Sub Total
                    |--------------------------------------------------------------------------
                    */

                    $lineSubTotal =
                        round(
                            (float) $item->quantity *
                            (float) $item->unit_price,
                            2
                        );

                    $item->setAttribute(
                        'line_sub_total',
                        $lineSubTotal
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Line Total
                    |--------------------------------------------------------------------------
                    */

                    $lineTotal =
                        $item->line_total !==
                        null
                        ? (float) $item
                            ->line_total
                        : (
                            $lineSubTotal +
                            (float) (
                                $item
                                    ->tax_amount
                                ?? 0
                            )
                        );

                    $item->setAttribute(
                        'pdf_line_total',
                        $lineTotal
                    );
                }
            );

        /*
        |--------------------------------------------------------------------------
        | Active Currency
        |--------------------------------------------------------------------------
        */

        $activeCurrency =
            Currency::query()
                ->where(
                    'is_active',
                    true
                )
                ->select([
                    'id',
                    'symbol',
                    'currency_code',
                    'exchange_rate',
                ])
                ->first();

        /*
        |--------------------------------------------------------------------------
        | Company Configuration
        |--------------------------------------------------------------------------
        */

        $configure =
            Configure::query()
                ->first();

        return [
            'purchaseOrder' =>
                $purchaseOrder,

            'activeCurrency' =>
                $activeCurrency,

            'configure' =>
                $configure,
        ];
    }
}
