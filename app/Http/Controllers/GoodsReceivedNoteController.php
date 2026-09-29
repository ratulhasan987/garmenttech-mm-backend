<?php

namespace App\Http\Controllers;

use App\Actions\File;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Configure;
use App\Models\Currency;
use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedNoteItem;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\PurchaseOrder;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Services\FinanceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class GoodsReceivedNoteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | PO Statuses Allowed For GRN
    |--------------------------------------------------------------------------
    */

    private const RECEIVABLE_PO_STATUSES = [
        'Approved',
        'Partial',
    ];

    /*
    |--------------------------------------------------------------------------
    | GRN Statuses That Reserve PO Quantity
    |--------------------------------------------------------------------------
    |
    | Pending is intentionally included.
    |
    | Example:
    |
    | PO Qty      = 100
    | Pending GRN = 80
    |
    | Another GRN can only receive 20.
    |
    */

    private const RESERVED_GRN_STATUSES = [
        'Pending',
        'Approved',
    ];

    /*
    |--------------------------------------------------------------------------
    | Attachment Limits
    |--------------------------------------------------------------------------
    */

    private const MAX_ATTACHMENTS = 5;

    private const MAX_TOTAL_ATTACHMENT_SIZE =
        30 * 1024 * 1024;

    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {

        $this->authorizePermission('grn.list');

        $query = GoodsReceivedNote::query()
            ->with([
                'purchaseOrder:id,order_id,requisition_id,vendor_id,warehouse_id,status',
                'purchaseOrder.requisition:id,requisition_id',
                'purchaseOrder.vendor:id,vendor_id,name',
                'warehouse:id,name',
                'receivedBy:id,name,employee_id',
                'approvedBy:id,name,employee_id',
                'bill:id,goods_received_note_id,bill_no,grand_total,payment_status',
            ]);

        /*
        |--------------------------------------------------------------------------
        | GRN Number
        |--------------------------------------------------------------------------
        */

        if ($request->filled('grn_no')) {
            $query->where(
                'grn_no',
                'like',
                '%'.trim(
                    $request->input('grn_no')
                ).'%'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Purchase Order
        |--------------------------------------------------------------------------
        */

        if ($request->filled('purchase_order_id')) {
            $query->where(
                'purchase_order_id',
                $request->input('purchase_order_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Status
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
        | Received Date Range
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('start_date') &&
            $request->filled('end_date')
        ) {
            $startDate = Carbon::parse(
                $request->input('start_date')
            )->format('Y-m-d');

            $endDate = Carbon::parse(
                $request->input('end_date')
            )->format('Y-m-d');

            $query->whereBetween(
                'received_date',
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

        $sort =
            $request->input(
                'sorting',
                'desc'
            ) === 'asc'
            ? 'asc'
            : 'desc';

        $query->orderBy(
            'created_at',
            $sort
        );

        /*
        |--------------------------------------------------------------------------
        | Count
        |--------------------------------------------------------------------------
        */

        $numberOfGrns =
            (clone $query)->count();

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $grns = $query
            ->paginate(30)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $filters = [
            'grn_no' => $request->input('grn_no'),

            'purchase_order_id' => $request->input('purchase_order_id'),

            'status' => $request->input('status'),

            'start_date' => $request->input('start_date'),

            'end_date' => $request->input('end_date'),

            'sorting' => $request->input(
                'sorting',
                'desc'
            ),
        ];

        $hasFilters = collect($filters)
            ->except('sorting')
            ->filter(
                fn ($value) => $value !== null &&
                    $value !== ''
            )
            ->isNotEmpty();

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

        return Inertia::render(
            'operations/grn/index',
            [
                'grns' => $grns,

                'numberOfGrns' => $numberOfGrns,

                'filters' => $filters,

                'hasFilters' => $hasFilters,

                'activeCurrency' => $activeCurrency,
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
        $this->authorizePermission('grn.create');

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

        return Inertia::render(
            'operations/grn/create-grn',
            [
                'activeCurrency' => $activeCurrency,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Search Purchase Orders
    |--------------------------------------------------------------------------
    |
    | Only Approved / Partial POs having remaining quantities.
    |
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
                ->whereIn(
                    'status',
                    self::RECEIVABLE_PO_STATUSES
                )
                ->whereNotNull(
                    'warehouse_id'
                )
                ->with([
                    'vendor:id,vendor_id,name',
                    'warehouse:id,name',
                    'purchaseItems:id,purchase_order_id,item_id,quantity',
                ])
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            function ($query) use ($keyword) {
                                $query
                                    ->where(
                                        'order_id',
                                        'like',
                                        "%{$keyword}%"
                                    )
                                    ->orWhereHas(
                                        'vendor',
                                        function ($vendorQuery) use ($keyword) {
                                            $vendorQuery->where(
                                                'name',
                                                'like',
                                                "%{$keyword}%"
                                            );
                                        }
                                    );
                            }
                        );
                    }
                )
                ->latest('id')
                ->limit(50)
                ->get([
                    'id',
                    'order_id',
                    'vendor_id',
                    'warehouse_id',
                    'status',
                    'order_date',
                ]);

        /*
        |--------------------------------------------------------------------------
        | Purchase Item IDs
        |--------------------------------------------------------------------------
        */

        $purchaseItemIds =
            $purchaseOrders
                ->pluck('purchaseItems')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->values();

        /*
        |--------------------------------------------------------------------------
        | Pending + Approved Reserved Quantities
        |--------------------------------------------------------------------------
        */

        $reserved =
            $this->reservedQuantityMap(
                $purchaseItemIds
            );

        /*
        |--------------------------------------------------------------------------
        | Only PO Having At Least One Remaining Item
        |--------------------------------------------------------------------------
        */

        $purchaseOrders =
            $purchaseOrders
                ->filter(
                    function (PurchaseOrder $purchaseOrder) use ($reserved) {
                        return $purchaseOrder
                            ->purchaseItems
                            ->contains(
                                function (PurchaseItem $item) use ($reserved) {
                                    $alreadyReserved =
                                        (float) (
                                            $reserved[$item->id]
                                            ?? 0
                                        );

                                    $remaining =
                                        (float) $item->quantity -
                                        $alreadyReserved;

                                    return $remaining >
                                        0.00001;
                                }
                            );
                    }
                )
                ->take(20)
                ->map(
                    function (PurchaseOrder $purchaseOrder) {
                        return [
                            'id' => $purchaseOrder->id,

                            'order_id' => $purchaseOrder->order_id,

                            'label' => $purchaseOrder->order_id,

                            'secondary' => $purchaseOrder
                                ->vendor
                                ?->name
                                ?? '',

                            'status' => $purchaseOrder->status,

                            'order_date' => $purchaseOrder->order_date,

                            'vendor' => $purchaseOrder->vendor
                                ? [
                                    'id' => $purchaseOrder
                                        ->vendor
                                        ->id,

                                    'vendor_id' => $purchaseOrder
                                        ->vendor
                                        ->vendor_id,

                                    'name' => $purchaseOrder
                                        ->vendor
                                        ->name,
                                ]
                                : null,

                            'warehouse' => $purchaseOrder->warehouse
                                ? [
                                    'id' => $purchaseOrder
                                        ->warehouse
                                        ->id,

                                    'name' => $purchaseOrder
                                        ->warehouse
                                        ->name,
                                ]
                                : null,
                        ];
                    }
                )
                ->values();

        return response()->json(
            $purchaseOrders
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Compatibility Alias
    |--------------------------------------------------------------------------
    */

    public function getProjectPurchaseOrders(
        Request $request
    ) {
        return $this->getPurchaseOrders(
            $request
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get PO Items For GRN
    |--------------------------------------------------------------------------
    */

    public function getPoItemsForGrn(
        Request $request
    ) {
        $validated =
            $request->validate([
                'purchase_order_id' => 'required|integer|exists:purchase_orders,id',

                'exclude_grn_id' => 'nullable|integer|exists:goods_received_notes,id',
            ]);

        $purchaseOrder =
            PurchaseOrder::query()
                ->with([
                    'purchaseItems',
                    'vendor:id,vendor_id,name',
                    'warehouse:id,name',
                ])
                ->findOrFail(
                    $validated['purchase_order_id']
                );

        /*
        |--------------------------------------------------------------------------
        | Status Check
        |--------------------------------------------------------------------------
        */

        $this->assertPurchaseOrderReceivable(
            $purchaseOrder
        );

        /*
        |--------------------------------------------------------------------------
        | Warehouse Required
        |--------------------------------------------------------------------------
        */

        if (
            ! $purchaseOrder->warehouse_id
        ) {
            return response()->json(
                [
                    'message' => 'The selected Purchase Order does not have a warehouse.',
                ],
                422
            );
        }

        $excludeGrnId =
            isset(
                $validated['exclude_grn_id']
            )
            ? (int) $validated['exclude_grn_id']
            : null;

        /*
        |--------------------------------------------------------------------------
        | Edit GRN Must Belong To Same PO
        |--------------------------------------------------------------------------
        */

        if ($excludeGrnId) {
            $validGrn =
                GoodsReceivedNote::query()
                    ->whereKey(
                        $excludeGrnId
                    )
                    ->where(
                        'purchase_order_id',
                        $purchaseOrder->id
                    )
                    ->exists();

            if (! $validGrn) {
                return response()->json(
                    [
                        'message' => 'The selected GRN does not belong to this Purchase Order.',
                    ],
                    422
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        $productIds =
            $purchaseOrder
                ->purchaseItems
                ->pluck('item_id')
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
                ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Reserved Quantities
        |--------------------------------------------------------------------------
        */

        $purchaseItemIds =
            $purchaseOrder
                ->purchaseItems
                ->pluck('id')
                ->values();

        $reserved =
            $this->reservedQuantityMap(
                $purchaseItemIds,
                $excludeGrnId
            );

        /*
        |--------------------------------------------------------------------------
        | Items
        |--------------------------------------------------------------------------
        */

        $items =
            $purchaseOrder
                ->purchaseItems
                ->map(
                    function (PurchaseItem $item) use ($products, $reserved) {
                        $alreadyReceived =
                            (float) (
                                $reserved[$item->id]
                                ?? 0
                            );

                        $poQuantity =
                            (float) $item->quantity;

                        $remainingQuantity =
                            max(
                                0,
                                $poQuantity -
                                    $alreadyReceived
                            );

                        if (
                            $remainingQuantity <=
                            0.00001
                        ) {
                            return null;
                        }

                        $product =
                            $products->get(
                                $item->item_id
                            );

                        return [
                            'purchase_item_id' => $item->id,

                            'item_id' => (int) $item->item_id,

                            'code' => $product?->code
                                ?? '',

                            'name' => $product?->name
                                ?? 'N/A',

                            'unit' => $item->unit,

                            'po_quantity' => $poQuantity,

                            'already_received' => $alreadyReceived,

                            'remaining_quantity' => $remainingQuantity,

                            /*
                            |--------------------------------------------------------------------------
                            | Default quantity = all remaining
                            |--------------------------------------------------------------------------
                            */

                            'quantity' => $remainingQuantity,

                            'unit_price' => (float) $item->unit_price,

                            'taxes' => $this->normalizeTaxes(
                                $item->taxes
                            ),

                            'tax_amount' => (float) (
                                $item->tax_amount
                                ?? 0
                            ),

                            'line_total' => (float) (
                                $item->line_total
                                ?? 0
                            ),
                        ];
                    }
                )
                ->filter()
                ->values();

        return response()->json([
            'meta' => [
                'id' => $purchaseOrder->id,

                'order_id' => $purchaseOrder->order_id,

                'status' => $purchaseOrder->status,

                'vendor' => $purchaseOrder->vendor
                    ? [
                        'id' => $purchaseOrder
                            ->vendor
                            ->id,

                        'vendor_id' => $purchaseOrder
                            ->vendor
                            ->vendor_id,

                        'name' => $purchaseOrder
                            ->vendor
                            ->name,
                    ]
                    : null,

                'warehouse' => $purchaseOrder->warehouse
                    ? [
                        'id' => $purchaseOrder
                            ->warehouse
                            ->id,

                        'name' => $purchaseOrder
                            ->warehouse
                            ->name,
                    ]
                    : null,
            ],

            'items' => $items,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    |
    | Creating GRN:
    |
    | - No stock update
    | - No bill generation
    |
    | Those happen only on approval.
    |
    */

    public function store(
        Request $request
    ) {

        $this->authorizePermission('grn.create');

        $validated =
            $this->validateGrn(
                $request
            );

        $uploadedAttachments = [];

        try {
            /*
            |--------------------------------------------------------------------------
            | Upload Attachments
            |--------------------------------------------------------------------------
            */

            $files =
                $this->getAttachmentFiles(
                    $request
                );

            if (
                ! empty($files)
            ) {
                $uploadedAttachments =
                    $this->uploadAttachments(
                        $files
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | DB Transaction
            |--------------------------------------------------------------------------
            */

            $grn =
                DB::transaction(
                    function () use ($validated, $uploadedAttachments) {
                        /*
                        |--------------------------------------------------------------------------
                        | Purchase Order
                        |--------------------------------------------------------------------------
                        */

                        $purchaseOrder =
                            PurchaseOrder::query()
                                ->lockForUpdate()
                                ->findOrFail(
                                    $validated['purchase_order_id']
                                );

                        $this->assertPurchaseOrderReceivable(
                            $purchaseOrder
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Warehouse
                        |--------------------------------------------------------------------------
                        */

                        if (
                            ! $purchaseOrder
                                ->warehouse_id
                        ) {
                            throw ValidationException::withMessages([
                                'purchase_order_id' => 'The selected Purchase Order does not have a warehouse.',
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Purchase Item IDs
                        |--------------------------------------------------------------------------
                        */

                        $submittedPurchaseItemIds =
                            collect(
                                $validated['items']
                            )
                                ->pluck(
                                    'purchase_item_id'
                                )
                                ->map(
                                    fn ($id) => (int) $id
                                )
                                ->values();

                        /*
                        |--------------------------------------------------------------------------
                        | Purchase Items
                        |--------------------------------------------------------------------------
                        */

                        $purchaseItems =
                            PurchaseItem::query()
                                ->where(
                                    'purchase_order_id',
                                    $purchaseOrder->id
                                )
                                ->whereIn(
                                    'id',
                                    $submittedPurchaseItemIds
                                )
                                ->lockForUpdate()
                                ->get()
                                ->keyBy('id');

                        /*
                        |--------------------------------------------------------------------------
                        | Quantity Validation
                        |--------------------------------------------------------------------------
                        */

                        $this->assertItemsCanBeReceived(
                            $validated['items'],
                            $purchaseOrder,
                            $purchaseItems
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | Create GRN
                        |--------------------------------------------------------------------------
                        */

                        $grn =
                            GoodsReceivedNote::create([
                                'grn_no' => $this->generateGrnNo(),

                                'purchase_order_id' => $purchaseOrder->id,

                                'warehouse_id' => $purchaseOrder->warehouse_id,

                                'received_date' => $validated['received_date'],

                                'received_by' => Auth::id(),

                                'status' => 'Pending',

                                'approved_by' => null,

                                /*
                                |--------------------------------------------------------------------------
                                | TEXT column + model array cast
                                |--------------------------------------------------------------------------
                                */

                                'attachments' => ! empty($uploadedAttachments)
                                    ? $uploadedAttachments
                                    : null,

                                'note' => $validated['note']
                                    ?? null,
                            ]);

                        /*
                        |--------------------------------------------------------------------------
                        | GRN Items
                        |--------------------------------------------------------------------------
                        */

                        foreach (
                            $validated['items'] as $submittedItem
                        ) {
                            $purchaseItem =
                                $purchaseItems->get(
                                    (int) $submittedItem['purchase_item_id']
                                );

                            GoodsReceivedNoteItem::create([
                                'goods_received_note_id' => $grn->id,

                                'purchase_item_id' => $purchaseItem->id,

                                /*
                                |--------------------------------------------------------------------------
                                | Always from PO
                                |--------------------------------------------------------------------------
                                */

                                'item_id' => $purchaseItem->item_id,

                                'unit' => $purchaseItem->unit,

                                'quantity' => round(
                                    (float) $submittedItem['quantity'],
                                    2
                                ),
                            ]);
                        }

                        return $grn;
                    }
                );

            return redirect()
                ->route(
                    'grn.index'
                )
                ->with(
                    'notification',
                    [
                        'message' => "GRN {$grn->grn_no} created successfully.",

                        'type' => 'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            /*
            |--------------------------------------------------------------------------
            | Delete Files Uploaded Before Failed Transaction
            |--------------------------------------------------------------------------
            */

            $this->deleteAttachments(
                $uploadedAttachments
            );

            throw $exception;
        } catch (
            Throwable $exception
        ) {
            $this->deleteAttachments(
                $uploadedAttachments
            );

            Log::error(
                'GRN creation failed.',
                [
                    'message' => $exception->getMessage(),

                    'user_id' => Auth::id(),

                    'exception' => $exception,
                ]
            );

            return redirect()
                ->back()
                ->withInput()
                ->with(
                    'notification',
                    [
                        'message' => 'Failed to create GRN. Please try again.',

                        'type' => 'error',
                    ]
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    public function edit($id)
    {

        $this->authorizePermission('grn.edit');

        $grn =
            GoodsReceivedNote::query()
                ->with([
                    'purchaseOrder.vendor:id,vendor_id,name',
                    'purchaseOrder.warehouse:id,name',
                    'warehouse:id,name',
                    'items.purchaseItem',
                    'items.product:id,code,name',
                ])
                ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Pending Only
        |--------------------------------------------------------------------------
        */

        if (
            $grn->status !==
            'Pending'
        ) {
            return redirect()
                ->route(
                    'grn.index'
                )
                ->with(
                    'notification',
                    [
                        'message' => 'Only Pending GRNs can be edited.',

                        'type' => 'error',
                    ]
                );
        }

        $activeCurrency =
            Currency::query()
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

        return Inertia::render(
            'operations/grn/edit-grn',
            [
                'grn' => $this->transformGrn(
                    $grn
                ),

                'activeCurrency' => $activeCurrency,
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

        $this->authorizePermission('grn.edit');

        $validated =
            $this->validateGrn(
                $request
            );

        $newAttachments = [];

        $attachmentsToDelete = [];

        try {
            /*
            |--------------------------------------------------------------------------
            | Upload New Attachments
            |--------------------------------------------------------------------------
            */

            $files =
                $this->getAttachmentFiles(
                    $request
                );

            if (
                ! empty($files)
            ) {
                $newAttachments =
                    $this->uploadAttachments(
                        $files
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Transaction
            |--------------------------------------------------------------------------
            */

            DB::transaction(
                function () use ($validated, $id, $newAttachments, &$attachmentsToDelete) {
                    /*
                    |--------------------------------------------------------------------------
                    | GRN
                    |--------------------------------------------------------------------------
                    */

                    $grn =
                        GoodsReceivedNote::query()
                            ->lockForUpdate()
                            ->findOrFail(
                                $id
                            );

                    /*
                    |--------------------------------------------------------------------------
                    | Pending Only
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $grn->status !==
                        'Pending'
                    ) {
                        throw ValidationException::withMessages([
                            'grn' => 'Only Pending GRNs can be edited.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Purchase Order
                    |--------------------------------------------------------------------------
                    */

                    $purchaseOrder =
                        PurchaseOrder::query()
                            ->lockForUpdate()
                            ->findOrFail(
                                $validated['purchase_order_id']
                            );

                    $this->assertPurchaseOrderReceivable(
                        $purchaseOrder
                    );

                    if (
                        ! $purchaseOrder
                            ->warehouse_id
                    ) {
                        throw ValidationException::withMessages([
                            'purchase_order_id' => 'The selected Purchase Order does not have a warehouse.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Submitted PO Items
                    |--------------------------------------------------------------------------
                    */

                    $submittedPurchaseItemIds =
                        collect(
                            $validated['items']
                        )
                            ->pluck(
                                'purchase_item_id'
                            )
                            ->map(
                                fn ($itemId) => (int) $itemId
                            )
                            ->values();

                    /*
                    |--------------------------------------------------------------------------
                    | Purchase Items
                    |--------------------------------------------------------------------------
                    */

                    $purchaseItems =
                        PurchaseItem::query()
                            ->where(
                                'purchase_order_id',
                                $purchaseOrder->id
                            )
                            ->whereIn(
                                'id',
                                $submittedPurchaseItemIds
                            )
                            ->lockForUpdate()
                            ->get()
                            ->keyBy('id');

                    /*
                    |--------------------------------------------------------------------------
                    | Validate Quantities
                    |--------------------------------------------------------------------------
                    |
                    | Current GRN is excluded.
                    |
                    */

                    $this->assertItemsCanBeReceived(
                        $validated['items'],
                        $purchaseOrder,
                        $purchaseItems,
                        $grn->id
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Current Attachments
                    |--------------------------------------------------------------------------
                    */

                    $existingAttachments =
                        $this->normalizeAttachments(
                            $grn->attachments
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Requested Removals
                    |--------------------------------------------------------------------------
                    |
                    | Only existing paths can be removed.
                    |
                    */

                    $requestedRemovals =
                        collect(
                            $validated['remove_attachments']
                                ?? []
                        )
                            ->filter(
                                fn ($path) => is_string($path) &&
                                    in_array(
                                        $path,
                                        $existingAttachments,
                                        true
                                    )
                            )
                            ->unique()
                            ->values()
                            ->all();

                    /*
                    |--------------------------------------------------------------------------
                    | Files To Physically Delete After Commit
                    |--------------------------------------------------------------------------
                    */

                    $attachmentsToDelete =
                        $requestedRemovals;

                    /*
                    |--------------------------------------------------------------------------
                    | Existing Files Kept
                    |--------------------------------------------------------------------------
                    */

                    $remainingAttachments =
                        array_values(
                            array_filter(
                                $existingAttachments,
                                fn ($path) => ! in_array(
                                    $path,
                                    $requestedRemovals,
                                    true
                                )
                            )
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Existing + Newly Uploaded
                    |--------------------------------------------------------------------------
                    */

                    $finalAttachments =
                        array_values(
                            array_unique([
                                ...$remainingAttachments,
                                ...$newAttachments,
                            ])
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Max Total Attachments
                    |--------------------------------------------------------------------------
                    */

                    if (
                        count(
                            $finalAttachments
                        ) >
                        self::MAX_ATTACHMENTS
                    ) {
                        throw ValidationException::withMessages([
                            'attachments' => 'Maximum '.
                                self::MAX_ATTACHMENTS.
                                ' attachments are allowed.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Update GRN
                    |--------------------------------------------------------------------------
                    */

                    $grn->update([
                        'purchase_order_id' => $purchaseOrder->id,

                        'warehouse_id' => $purchaseOrder->warehouse_id,

                        'received_date' => $validated['received_date'],

                        'attachments' => ! empty($finalAttachments)
                            ? $finalAttachments
                            : null,

                        'note' => $validated['note']
                            ?? null,
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Replace Items
                    |--------------------------------------------------------------------------
                    */

                    $grn
                        ->items()
                        ->delete();

                    foreach (
                        $validated['items'] as $submittedItem
                    ) {
                        $purchaseItem =
                            $purchaseItems->get(
                                (int) $submittedItem['purchase_item_id']
                            );

                        GoodsReceivedNoteItem::create([
                            'goods_received_note_id' => $grn->id,

                            'purchase_item_id' => $purchaseItem->id,

                            'item_id' => $purchaseItem->item_id,

                            'unit' => $purchaseItem->unit,

                            'quantity' => round(
                                (float) $submittedItem['quantity'],
                                2
                            ),
                        ]);
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Delete Removed Physical Files After Successful DB Commit
            |--------------------------------------------------------------------------
            */

            $this->deleteAttachments(
                $attachmentsToDelete
            );

            return redirect()
                ->route(
                    'grn.index'
                )
                ->with(
                    'notification',
                    [
                        'message' => 'GRN updated successfully.',

                        'type' => 'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            /*
            |--------------------------------------------------------------------------
            | New Files Are Not Saved In DB If Transaction Failed
            |--------------------------------------------------------------------------
            */

            $this->deleteAttachments(
                $newAttachments
            );

            throw $exception;
        } catch (
            Throwable $exception
        ) {
            $this->deleteAttachments(
                $newAttachments
            );

            Log::error(
                'GRN update failed.',
                [
                    'grn_id' => $id,

                    'message' => $exception->getMessage(),

                    'user_id' => Auth::id(),

                    'exception' => $exception,
                ]
            );

            return redirect()
                ->back()
                ->withInput()
                ->with(
                    'notification',
                    [
                        'message' => 'Failed to update GRN. Please try again.',

                        'type' => 'error',
                    ]
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {

        $this->authorizePermission('grn.view');

        $grn =
            GoodsReceivedNote::query()
                ->with([
                    'purchaseOrder.vendor:id,vendor_id,name',
                    'purchaseOrder.warehouse:id,name',
                    'purchaseOrder.requisition:id,requisition_id',
                    'warehouse:id,name',
                    'receivedBy:id,name,employee_id',
                    'approvedBy:id,name,employee_id',
                    'items.purchaseItem',
                    'items.product:id,code,name',
                    'bill.items',
                ])
                ->findOrFail($id);

        $activeCurrency =
            Currency::query()
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

        return Inertia::render(
            'operations/grn/show-grn',
            [
                'grn' => $this->transformGrn(
                    $grn
                ),

                'activeCurrency' => $activeCurrency,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    |
    | Pending → Approved
    | Pending → Rejected
    |
    | Approve:
    |
    | 1. Stock IN
    | 2. Stock Movement
    | 3. Bill
    | 4. Bill Items
    | 5. GRN Approved
    | 6. PO Partial / Received
    |
    */

    public function updateStatus(
        Request $request
    ) {

        $this->authorizePermission('grn.status');

        $validated =
            $request->validate([
                'id' => 'required|integer|exists:goods_received_notes,id',

                'status' => 'required|in:Approved,Rejected',
            ]);

        try {
            $result =
                DB::transaction(
                    function () use ($validated) {
                        /*
                        |--------------------------------------------------------------------------
                        | GRN
                        |--------------------------------------------------------------------------
                        */

                        $grn =
                            GoodsReceivedNote::query()
                                ->lockForUpdate()
                                ->findOrFail(
                                    $validated['id']
                                );

                        /*
                        |--------------------------------------------------------------------------
                        | Pending Only
                        |--------------------------------------------------------------------------
                        */

                        if (
                            $grn->status !==
                            'Pending'
                        ) {
                            throw ValidationException::withMessages([
                                'status' => "This GRN is already {$grn->status}. Status cannot be changed.",
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Reject
                        |--------------------------------------------------------------------------
                        */

                        if (
                            $validated['status'] ===
                            'Rejected'
                        ) {
                            $grn->update([
                                'status' => 'Rejected',

                                /*
                                |--------------------------------------------------------------------------
                                | Migration currently has approved_by only.
                                | This stores the decision user.
                                |--------------------------------------------------------------------------
                                */

                                'approved_by' => Auth::id(),
                            ]);

                            return [
                                'message' => 'GRN Rejected successfully.',

                                'status' => 'Rejected',

                                'bill' => null,
                            ];
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Warehouse
                        |--------------------------------------------------------------------------
                        */

                        if (
                            ! $grn->warehouse_id
                        ) {
                            throw ValidationException::withMessages([
                                'warehouse_id' => 'Cannot approve GRN without a warehouse.',
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | PO
                        |--------------------------------------------------------------------------
                        */

                        $purchaseOrder =
                            PurchaseOrder::query()
                                ->lockForUpdate()
                                ->findOrFail(
                                    $grn->purchase_order_id
                                );

                        $this->assertPurchaseOrderReceivable(
                            $purchaseOrder
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | GRN Items
                        |--------------------------------------------------------------------------
                        */

                        $grnItems =
                            GoodsReceivedNoteItem::query()
                                ->where(
                                    'goods_received_note_id',
                                    $grn->id
                                )
                                ->lockForUpdate()
                                ->get();

                        if (
                            $grnItems->isEmpty()
                        ) {
                            throw ValidationException::withMessages([
                                'items' => 'Cannot approve a GRN without items.',
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Purchase Items
                        |--------------------------------------------------------------------------
                        */

                        $purchaseItemIds =
                            $grnItems
                                ->pluck(
                                    'purchase_item_id'
                                )
                                ->unique()
                                ->values();

                        $purchaseItems =
                            PurchaseItem::query()
                                ->where(
                                    'purchase_order_id',
                                    $purchaseOrder->id
                                )
                                ->whereIn(
                                    'id',
                                    $purchaseItemIds
                                )
                                ->lockForUpdate()
                                ->get()
                                ->keyBy('id');

                        if (
                            $purchaseItems->count() !==
                            $purchaseItemIds->count()
                        ) {
                            throw ValidationException::withMessages([
                                'items' => 'One or more GRN items no longer belong to the selected Purchase Order.',
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Revalidate Received Quantity
                        |--------------------------------------------------------------------------
                        */

                        foreach (
                            $grnItems as $grnItem
                        ) {
                            $purchaseItem =
                                $purchaseItems->get(
                                    $grnItem
                                        ->purchase_item_id
                                );

                            if (
                                ! $purchaseItem
                            ) {
                                throw ValidationException::withMessages([
                                    'items' => 'Purchase Order item not found.',
                                ]);
                            }

                            /*
                            |--------------------------------------------------------------------------
                            | Product Match
                            |--------------------------------------------------------------------------
                            */

                            if (
                                (int) $grnItem->item_id !==
                                (int) $purchaseItem->item_id
                            ) {
                                throw ValidationException::withMessages([
                                    'items' => 'GRN product does not match the Purchase Order product.',
                                ]);
                            }

                            /*
                            |--------------------------------------------------------------------------
                            | Already Approved
                            |--------------------------------------------------------------------------
                            */

                            $alreadyApproved =
                                $this
                                    ->approvedQuantityForPurchaseItem(
                                        $purchaseItem->id,
                                        $grn->id
                                    );

                            $remainingForApproval =
                                max(
                                    0,
                                    (float) $purchaseItem->quantity -
                                        $alreadyApproved
                                );

                            if (
                                (float) $grnItem->quantity >
                                $remainingForApproval +
                                0.00001
                            ) {
                                throw ValidationException::withMessages([
                                    'items' => "Received quantity exceeds the remaining quantity for Purchase Item #{$purchaseItem->id}.",
                                ]);
                            }
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Duplicate Bill Protection
                        |--------------------------------------------------------------------------
                        */

                        if (
                            Bill::query()
                                ->where(
                                    'goods_received_note_id',
                                    $grn->id
                                )
                                ->exists()
                        ) {
                            throw ValidationException::withMessages([
                                'bill' => 'A bill has already been generated for this GRN.',
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Stock IN
                        |--------------------------------------------------------------------------
                        */

                        foreach (
                            $grnItems as $grnItem
                        ) {
                            /*
                            |--------------------------------------------------------------------------
                            | Existing Stock
                            |--------------------------------------------------------------------------
                            */

                            $stock =
                                Stock::query()
                                    ->where(
                                        'warehouse_id',
                                        $grn->warehouse_id
                                    )
                                    ->where(
                                        'item_id',
                                        $grnItem->item_id
                                    )
                                    ->lockForUpdate()
                                    ->first();

                            /*
                            |--------------------------------------------------------------------------
                            | New Stock Row
                            |--------------------------------------------------------------------------
                            */

                            if (! $stock) {
                                $stock =
                                    Stock::create([
                                        'warehouse_id' => $grn->warehouse_id,

                                        'item_id' => $grnItem->item_id,

                                        'unit' => $grnItem->unit,

                                        'quantity' => 0,

                                        'reserved_quantity' => 0,
                                    ]);
                            }

                            /*
                            |--------------------------------------------------------------------------
                            | Increase Quantity
                            |--------------------------------------------------------------------------
                            */

                            $stock->increment(
                                'quantity',
                                (float) $grnItem->quantity
                            );

                            /*
                            |--------------------------------------------------------------------------
                            | Stock Movement
                            |--------------------------------------------------------------------------
                            */

                            StockMovement::create([
                                'warehouse_id' => $grn->warehouse_id,

                                'item_id' => $grnItem->item_id,

                                'unit' => $grnItem->unit,

                                /*
                                |--------------------------------------------------------------------------
                                | Positive = inbound
                                |--------------------------------------------------------------------------
                                */

                                'quantity' => (float) $grnItem->quantity,

                                'movement' => 'GRN',

                                'reference_type' => GoodsReceivedNote::class,

                                'reference_id' => $grn->id,

                                'remarks' => "GRN Approved: {$grn->grn_no}",

                                'created_by' => Auth::id(),
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Generate Bill
                        |--------------------------------------------------------------------------
                        */

                        $bill =
                            $this->generateBillForGrn(
                                $grn,
                                $purchaseOrder,
                                $grnItems,
                                $purchaseItems
                            );

                        app(FinanceService::class)->createPayableForBill($bill);

                        /*
                        |--------------------------------------------------------------------------
                        | Approve GRN
                        |--------------------------------------------------------------------------
                        */

                        $grn->update([
                            'status' => 'Approved',

                            'approved_by' => Auth::id(),
                        ]);

                        /*
                        |--------------------------------------------------------------------------
                        | Refresh PO Status
                        |--------------------------------------------------------------------------
                        */

                        $this->refreshPurchaseOrderStatus(
                            $purchaseOrder->id
                        );

                        return [
                            'message' => 'GRN Approved successfully. Stock updated and bill generated.',

                            'status' => 'Approved',

                            'bill' => [
                                'id' => $bill->id,

                                'bill_no' => $bill->bill_no,
                            ],
                        ];
                    }
                );

            return response()->json(
                $result
            );
        } catch (
            ValidationException $exception
        ) {
            return response()->json(
                [
                    'message' => collect(
                        $exception->errors()
                    )
                        ->flatten()
                        ->first()
                        ?? 'Validation failed.',

                    'errors' => $exception->errors(),
                ],
                422
            );
        } catch (
            Throwable $exception
        ) {
            Log::error(
                'GRN status update failed.',
                [
                    'grn_id' => $validated['id']
                        ?? null,

                    'message' => $exception->getMessage(),

                    'user_id' => Auth::id(),

                    'exception' => $exception,
                ]
            );

            return response()->json(
                [
                    'message' => 'Failed to update GRN status.',
                ],
                500
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

        $this->authorizePermission('grn.delete');

        $attachments = [];

        try {
            DB::transaction(
                function () use ($id, &$attachments) {
                    $grn =
                        GoodsReceivedNote::query()
                            ->lockForUpdate()
                            ->findOrFail(
                                $id
                            );

                    /*
                    |--------------------------------------------------------------------------
                    | Pending Only
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $grn->status !==
                        'Pending'
                    ) {
                        throw ValidationException::withMessages([
                            'grn' => 'Only Pending GRNs can be deleted.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Attachment Paths
                    |--------------------------------------------------------------------------
                    */

                    $attachments =
                        $this->normalizeAttachments(
                            $grn->attachments
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | GRN Items
                    |--------------------------------------------------------------------------
                    */

                    $grn
                        ->items()
                        ->delete();

                    /*
                    |--------------------------------------------------------------------------
                    | GRN
                    |--------------------------------------------------------------------------
                    */

                    $grn->delete();
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Delete Physical Files
            |--------------------------------------------------------------------------
            */

            $this->deleteAttachments(
                $attachments
            );

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' => 'GRN deleted successfully.',

                        'type' => 'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' => collect(
                            $exception->errors()
                        )
                            ->flatten()
                            ->first()
                            ?? 'Unable to delete GRN.',

                        'type' => 'error',
                    ]
                );
        } catch (
            Throwable $exception
        ) {
            Log::error(
                'GRN deletion failed.',
                [
                    'grn_id' => $id,

                    'message' => $exception->getMessage(),

                    'user_id' => Auth::id(),

                    'exception' => $exception,
                ]
            );

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' => 'Failed to delete GRN.',

                        'type' => 'error',
                    ]
                );
        }
    }

    /*
|--------------------------------------------------------------------------
| Download PDF
|--------------------------------------------------------------------------
*/

    public function downloadPdf($id)
    {
        $grn =
            GoodsReceivedNote::query()
                ->with([
                    'purchaseOrder.vendor:id,vendor_id,name',
                    'purchaseOrder.warehouse:id,name',
                    'purchaseOrder.requisition:id,requisition_id',

                    'warehouse:id,name',

                    'receivedBy:id,name,employee_id',

                    'approvedBy:id,name,employee_id',

                    'items.purchaseItem',

                    'items.product:id,code,name',

                    'bill',
                ])
                ->findOrFail(
                    $id
                );

        $data = [
            'grn' => $grn,

            'configure' => Configure::first(),
        ];

        $pdf =
            Pdf::loadView(
                'pdf.grn',
                $data
            );

        return $pdf->download(
            "grn_{$grn->grn_no}.pdf"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Stream PDF
    |--------------------------------------------------------------------------
    */

    public function streamPdf($id)
    {
        $grn =
            GoodsReceivedNote::query()
                ->with([
                    'purchaseOrder.vendor:id,vendor_id,name',
                    'purchaseOrder.warehouse:id,name',
                    'purchaseOrder.requisition:id,requisition_id',

                    'warehouse:id,name',

                    'receivedBy:id,name,employee_id',

                    'approvedBy:id,name,employee_id',

                    'items.purchaseItem',

                    'items.product:id,code,name',

                    'bill',
                ])
                ->findOrFail(
                    $id
                );

        $data = [
            'grn' => $grn,

            'configure' => Configure::first(),
        ];

        $pdf =
            Pdf::loadView(
                'pdf.grn',
                $data
            );

        return $pdf->stream(
            "grn_{$grn->grn_no}.pdf"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate GRN
    |--------------------------------------------------------------------------
    */

    private function validateGrn(
        Request $request
    ): array {
        $validated =
            $request->validate([
                'purchase_order_id' => 'required|integer|exists:purchase_orders,id',

                'received_date' => 'required|date_format:Y-m-d',

                /*
                |--------------------------------------------------------------------------
                | New Attachments
                |--------------------------------------------------------------------------
                */

                'attachments' => 'nullable|array|max:'.
                    self::MAX_ATTACHMENTS,

                'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,xls,xlsx|max:10240',

                /*
                |--------------------------------------------------------------------------
                | Existing Attachments Removed During Edit
                |--------------------------------------------------------------------------
                */

                'remove_attachments' => 'nullable|array',

                'remove_attachments.*' => 'nullable|string|max:2048',

                'note' => 'nullable|string|max:2000',

                'items' => 'required|array|min:1',

                'items.*.purchase_item_id' => 'required|integer|distinct|exists:purchase_items,id',

                'items.*.quantity' => 'required|numeric|gt:0',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Maximum Combined Upload Size
        |--------------------------------------------------------------------------
        */

        $files =
            $this->getAttachmentFiles(
                $request
            );

        $totalSize =
            collect($files)
                ->sum(
                    fn ($file) => (int) $file->getSize()
                );

        if (
            $totalSize >
            self::MAX_TOTAL_ATTACHMENT_SIZE
        ) {
            throw ValidationException::withMessages([
                'attachments' => 'Total attachment size cannot exceed 30 MB.',
            ]);
        }

        return $validated;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Uploaded Attachment Files
    |--------------------------------------------------------------------------
    */

    private function getAttachmentFiles(
        Request $request
    ): array {
        $files =
            $request->file(
                'attachments',
                []
            );

        if (! $files) {
            return [];
        }

        if (
            ! is_array($files)
        ) {
            return [
                $files,
            ];
        }

        return array_values(
            array_filter(
                $files
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Attachments
    |--------------------------------------------------------------------------
    |
    | Images:
    | File::fileUpload()
    |
    | PDF / Excel:
    | File::upload()
    |
    */

    private function uploadAttachments(
        array $files
    ): array {
        $attachments = [];

        foreach (
            $files as $file
        ) {
            $extension =
                strtolower(
                    $file
                        ->getClientOriginalExtension()
                );

            /*
            |--------------------------------------------------------------------------
            | Images
            |--------------------------------------------------------------------------
            */

            if (
                in_array(
                    $extension,
                    [
                        'jpg',
                        'jpeg',
                        'png',
                    ],
                    true
                )
            ) {
                $filePath =
                    File::fileUpload(
                        $file,
                        'GRN'
                    );
            } else {
                /*
                |--------------------------------------------------------------------------
                | PDF / Excel
                |--------------------------------------------------------------------------
                */

                $filePath =
                    File::upload(
                        $file,
                        'GRN'
                    );
            }

            if ($filePath) {
                $attachments[] =
                    $filePath;
            }
        }

        return $attachments;
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Attachments
    |--------------------------------------------------------------------------
    |
    | Works with:
    |
    | array cast
    | JSON string
    | previous single path
    |
    */

    private function normalizeAttachments(
        mixed $attachments
    ): array {
        if (
            empty($attachments)
        ) {
            return [];
        }

        /*
        |--------------------------------------------------------------------------
        | Already Array
        |--------------------------------------------------------------------------
        */

        if (
            is_array(
                $attachments
            )
        ) {
            return array_values(
                array_filter(
                    $attachments,
                    fn ($path) => is_string($path) &&
                        $path !== ''
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | JSON String
        |--------------------------------------------------------------------------
        */

        if (
            is_string(
                $attachments
            )
        ) {
            $decoded =
                json_decode(
                    $attachments,
                    true
                );

            if (
                is_array(
                    $decoded
                )
            ) {
                return array_values(
                    array_filter(
                        $decoded,
                        fn ($path) => is_string($path) &&
                            $path !== ''
                    )
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Backward Compatibility With Single Path
            |--------------------------------------------------------------------------
            */

            return [
                $attachments,
            ];
        }

        return [];
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Attachments
    |--------------------------------------------------------------------------
    */

    private function deleteAttachments(
        array $attachments
    ): void {
        foreach (
            $attachments as $attachment
        ) {
            if (
                ! $attachment ||
                ! is_string($attachment)
            ) {
                continue;
            }

            try {
                File::deleteFile(
                    $attachment
                );
            } catch (
                Throwable $exception
            ) {
                /*
                |--------------------------------------------------------------------------
                | File cleanup failure must not rollback successful DB operation.
                |--------------------------------------------------------------------------
                */

                Log::warning(
                    'Failed to delete GRN attachment.',
                    [
                        'attachment' => $attachment,

                        'message' => $exception->getMessage(),
                    ]
                );
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Assert PO Receivable
    |--------------------------------------------------------------------------
    */

    private function assertPurchaseOrderReceivable(
        PurchaseOrder $purchaseOrder
    ): void {
        if (
            ! in_array(
                $purchaseOrder->status,
                self::RECEIVABLE_PO_STATUSES,
                true
            )
        ) {
            throw ValidationException::withMessages([
                'purchase_order_id' => 'Only Approved or Partial Purchase Orders can be received.',
            ]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Submitted Items
    |--------------------------------------------------------------------------
    */

    private function assertItemsCanBeReceived(
        array $submittedItems,
        PurchaseOrder $purchaseOrder,
        Collection $purchaseItems,
        ?int $excludeGrnId = null
    ): void {
        /*
        |--------------------------------------------------------------------------
        | All Submitted Items Must Belong To PO
        |--------------------------------------------------------------------------
        */

        if (
            $purchaseItems->count() !==
            count(
                $submittedItems
            )
        ) {
            throw ValidationException::withMessages([
                'items' => 'One or more selected items do not belong to the selected Purchase Order.',
            ]);
        }

        foreach (
            $submittedItems as $submittedItem
        ) {
            $purchaseItemId =
                (int) $submittedItem['purchase_item_id'];

            $purchaseItem =
                $purchaseItems->get(
                    $purchaseItemId
                );

            if (
                ! $purchaseItem
            ) {
                throw ValidationException::withMessages([
                    'items' => "Purchase Item #{$purchaseItemId} does not belong to Purchase Order {$purchaseOrder->order_id}.",
                ]);
            }

            $quantity =
                round(
                    (float) $submittedItem['quantity'],
                    2
                );

            /*
            |--------------------------------------------------------------------------
            | Already Reserved
            |--------------------------------------------------------------------------
            */

            $alreadyReserved =
                $this
                    ->reservedQuantityForPurchaseItem(
                        $purchaseItem->id,
                        $excludeGrnId
                    );

            $remaining =
                max(
                    0,
                    (float) $purchaseItem->quantity -
                        $alreadyReserved
                );

            if (
                $quantity >
                $remaining +
                0.00001
            ) {
                throw ValidationException::withMessages([
                    'items' => "Quantity for Purchase Item #{$purchaseItem->id} exceeds remaining PO quantity ({$remaining}).",
                ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Reserved Quantity Map
    |--------------------------------------------------------------------------
    */

    private function reservedQuantityMap(
        Collection $purchaseItemIds,
        ?int $excludeGrnId = null
    ): Collection {
        if (
            $purchaseItemIds->isEmpty()
        ) {
            return collect();
        }

        $query =
            GoodsReceivedNoteItem::query()
                ->join(
                    'goods_received_notes',
                    'goods_received_notes.id',
                    '=',
                    'goods_received_note_items.goods_received_note_id'
                )
                ->whereIn(
                    'goods_received_note_items.purchase_item_id',
                    $purchaseItemIds
                )
                ->whereIn(
                    'goods_received_notes.status',
                    self::RESERVED_GRN_STATUSES
                );

        if (
            $excludeGrnId !==
            null
        ) {
            $query->where(
                'goods_received_notes.id',
                '!=',
                $excludeGrnId
            );
        }

        return $query
            ->selectRaw(
                '
                goods_received_note_items.purchase_item_id,
                SUM(goods_received_note_items.quantity) as reserved_quantity
                '
            )
            ->groupBy(
                'goods_received_note_items.purchase_item_id'
            )
            ->pluck(
                'reserved_quantity',
                'purchase_item_id'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Reserved Quantity
    |--------------------------------------------------------------------------
    */

    private function reservedQuantityForPurchaseItem(
        int $purchaseItemId,
        ?int $excludeGrnId = null
    ): float {
        $query =
            GoodsReceivedNoteItem::query()
                ->where(
                    'purchase_item_id',
                    $purchaseItemId
                )
                ->whereHas(
                    'goodsReceivedNote',
                    function ($query) use ($excludeGrnId) {
                        $query->whereIn(
                            'status',
                            self::RESERVED_GRN_STATUSES
                        );

                        if (
                            $excludeGrnId !==
                            null
                        ) {
                            $query->where(
                                'id',
                                '!=',
                                $excludeGrnId
                            );
                        }
                    }
                );

        return (float)
            $query->sum(
                'quantity'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Approved Quantity
    |--------------------------------------------------------------------------
    */

    private function approvedQuantityForPurchaseItem(
        int $purchaseItemId,
        ?int $excludeGrnId = null
    ): float {
        $query =
            GoodsReceivedNoteItem::query()
                ->where(
                    'purchase_item_id',
                    $purchaseItemId
                )
                ->whereHas(
                    'goodsReceivedNote',
                    function ($query) use ($excludeGrnId) {
                        $query->where(
                            'status',
                            'Approved'
                        );

                        if (
                            $excludeGrnId !==
                            null
                        ) {
                            $query->where(
                                'id',
                                '!=',
                                $excludeGrnId
                            );
                        }
                    }
                );

        return (float)
            $query->sum(
                'quantity'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Bill
    |--------------------------------------------------------------------------
    */

    private function generateBillForGrn(
        GoodsReceivedNote $grn,
        PurchaseOrder $purchaseOrder,
        Collection $grnItems,
        Collection $purchaseItems
    ): Bill {
        $billLines = [];

        $subTotal = 0;

        $totalTax = 0;

        /*
        |--------------------------------------------------------------------------
        | Bill Lines
        |--------------------------------------------------------------------------
        */

        foreach (
            $grnItems as $grnItem
        ) {
            $purchaseItem =
                $purchaseItems->get(
                    $grnItem->purchase_item_id
                );

            if (
                ! $purchaseItem
            ) {
                throw ValidationException::withMessages([
                    'bill' => 'Purchase item not found while generating bill.',
                ]);
            }

            $quantity =
                (float) $grnItem->quantity;

            $unitPrice =
                (float) $purchaseItem->unit_price;

            /*
            |--------------------------------------------------------------------------
            | Line Subtotal
            |--------------------------------------------------------------------------
            */

            $lineSubTotal =
                round(
                    $quantity *
                        $unitPrice,
                    2
                );

            /*
            |--------------------------------------------------------------------------
            | Taxes
            |--------------------------------------------------------------------------
            */

            $purchaseTaxes =
                $this->normalizeTaxes(
                    $purchaseItem->taxes
                );

            $billTaxes = [];

            $lineTaxAmount = 0;

            foreach (
                $purchaseTaxes as $purchaseTax
            ) {
                $rate =
                    (float) (
                        $purchaseTax['rate']
                        ?? 0
                    );

                $taxAmount =
                    round(
                        $lineSubTotal *
                            $rate /
                            100,
                        2
                    );

                $lineTaxAmount +=
                    $taxAmount;

                $billTaxes[] = [
                    'tax_id' => $purchaseTax['tax_id']
                        ?? null,

                    'name' => $purchaseTax['name']
                        ?? 'Tax',

                    'rate' => $rate,

                    'tax_amount' => $taxAmount,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Older PO Fallback
            |--------------------------------------------------------------------------
            */

            if (
                empty($billTaxes) &&
                (float) (
                    $purchaseItem->tax_amount
                    ?? 0
                ) > 0 &&
                (float) $purchaseItem->quantity >
                0
            ) {
                $lineTaxAmount =
                    round(
                        (
                            (float) $purchaseItem
                                ->tax_amount
                        ) *
                            (
                                $quantity /
                                (float) $purchaseItem
                                    ->quantity
                            ),
                        2
                    );
            }

            $lineTaxAmount =
                round(
                    $lineTaxAmount,
                    2
                );

            $lineTotal =
                round(
                    $lineSubTotal +
                        $lineTaxAmount,
                    2
                );

            $subTotal +=
                $lineSubTotal;

            $totalTax +=
                $lineTaxAmount;

            $billLines[] = [
                'grn_item' => $grnItem,

                'purchase_item' => $purchaseItem,

                'quantity' => $quantity,

                'unit_price' => $unitPrice,

                'taxes' => $billTaxes,

                'tax_amount' => $lineTaxAmount,

                'line_total' => $lineTotal,
            ];
        }

        $subTotal =
            round(
                $subTotal,
                2
            );

        $totalTax =
            round(
                $totalTax,
                2
            );

        /*
        |--------------------------------------------------------------------------
        | Previously Allocated PO Header Amounts
        |--------------------------------------------------------------------------
        */

        $previousBills =
            Bill::query()
                ->where(
                    'purchase_order_id',
                    $purchaseOrder->id
                )
                ->get([
                    'total_discount',
                    'shipping_cost',
                ]);

        $alreadyAllocatedDiscount =
            round(
                (float)
                $previousBills->sum(
                    'total_discount'
                ),
                2
            );

        $alreadyAllocatedShipping =
            round(
                (float)
                $previousBills->sum(
                    'shipping_cost'
                ),
                2
            );

        $poDiscount =
            round(
                (float) (
                    $purchaseOrder
                        ->order_discount
                    ?? 0
                ),
                2
            );

        $poShipping =
            round(
                (float) (
                    $purchaseOrder
                        ->shipping_cost
                    ?? 0
                ),
                2
            );

        $remainingDiscount =
            max(
                0,
                round(
                    $poDiscount -
                        $alreadyAllocatedDiscount,
                    2
                )
            );

        $remainingShipping =
            max(
                0,
                round(
                    $poShipping -
                        $alreadyAllocatedShipping,
                    2
                )
            );

        /*
        |--------------------------------------------------------------------------
        | Final Receipt
        |--------------------------------------------------------------------------
        */

        $isFinalReceipt =
            $this
                ->isFinalReceiptAfterApproval(
                    $purchaseOrder,
                    $grnItems
                );

        /*
        |--------------------------------------------------------------------------
        | Allocate Header Discount / Shipping
        |--------------------------------------------------------------------------
        */

        if ($isFinalReceipt) {
            $allocatedDiscount =
                $remainingDiscount;

            $allocatedShipping =
                $remainingShipping;
        } else {
            $poSubTotal =
                (float) (
                    $purchaseOrder
                        ->sub_total
                    ?? 0
                );

            $ratio =
                $poSubTotal > 0
                ? $subTotal /
                $poSubTotal
                : 0;

            $allocatedDiscount =
                min(
                    $remainingDiscount,
                    round(
                        $poDiscount *
                            $ratio,
                        2
                    )
                );

            $allocatedShipping =
                min(
                    $remainingShipping,
                    round(
                        $poShipping *
                            $ratio,
                        2
                    )
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Grand Total
        |--------------------------------------------------------------------------
        */

        $grandTotal =
            round(
                $subTotal +
                    $totalTax -
                    $allocatedDiscount +
                    $allocatedShipping,
                2
            );

        /*
        |--------------------------------------------------------------------------
        | Bill
        |--------------------------------------------------------------------------
        */

        $bill =
            Bill::create([
                'bill_no' => $this->generateBillNo(),

                'goods_received_note_id' => $grn->id,

                'purchase_order_id' => $purchaseOrder->id,

                'vendor_id' => $purchaseOrder->vendor_id,

                'sub_total' => $subTotal,

                'total_tax' => $totalTax,

                'total_discount' => $allocatedDiscount,

                'shipping_cost' => $allocatedShipping,

                'grand_total' => $grandTotal,

                'paid_amount' => 0,

                'due_amount' => $grandTotal,

                'payment_status' => 'Due',

                'bill_date' => $grn->received_date,

                'due_date' => null,

                /*
                |--------------------------------------------------------------------------
                | Bill attachments are separate from GRN attachments.
                |--------------------------------------------------------------------------
                */

                'attachments' => null,

                'created_by' => Auth::id(),
            ]);

        /*
        |--------------------------------------------------------------------------
        | Bill Items
        |--------------------------------------------------------------------------
        */

        foreach (
            $billLines as $line
        ) {
            $grnItem =
                $line['grn_item'];

            $purchaseItem =
                $line['purchase_item'];

            BillItem::create([
                'bill_id' => $bill->id,

                'goods_received_note_item_id' => $grnItem->id,

                'purchase_item_id' => $purchaseItem->id,

                'item_id' => $grnItem->item_id,

                'unit' => $grnItem->unit,

                'quantity' => $line['quantity'],

                'unit_price' => $line['unit_price'],

                /*
                |--------------------------------------------------------------------------
                | PO discount is header-level.
                |--------------------------------------------------------------------------
                */

                'discount' => 0,

                'taxes' => $line['taxes'],

                'total_tax' => $line['tax_amount'],

                'total_amount' => $line['line_total'],
            ]);
        }

        return $bill;
    }

    /*
    |--------------------------------------------------------------------------
    | Is Final Receipt
    |--------------------------------------------------------------------------
    */

    private function isFinalReceiptAfterApproval(
        PurchaseOrder $purchaseOrder,
        Collection $currentGrnItems
    ): bool {
        $purchaseItems =
            PurchaseItem::query()
                ->where(
                    'purchase_order_id',
                    $purchaseOrder->id
                )
                ->get();

        $currentQuantities =
            $currentGrnItems
                ->groupBy(
                    'purchase_item_id'
                )
                ->map(
                    fn ($items) => (float) $items->sum(
                        'quantity'
                    )
                );

        foreach (
            $purchaseItems as $purchaseItem
        ) {
            $alreadyApproved =
                $this
                    ->approvedQuantityForPurchaseItem(
                        $purchaseItem->id
                    );

            $currentQuantity =
                (float) (
                    $currentQuantities[$purchaseItem->id]
                    ?? 0
                );

            $receivedAfterApproval =
                $alreadyApproved +
                $currentQuantity;

            if (
                $receivedAfterApproval +
                0.00001 <
                (float) $purchaseItem->quantity
            ) {
                return false;
            }
        }

        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh PO Status
    |--------------------------------------------------------------------------
    |
    | Approved → Partial → Received
    |
    */

    private function refreshPurchaseOrderStatus(
        int $purchaseOrderId
    ): void {
        $purchaseOrder =
            PurchaseOrder::query()
                ->lockForUpdate()
                ->findOrFail(
                    $purchaseOrderId
                );

        if (
            $purchaseOrder->status ===
            'Cancelled'
        ) {
            return;
        }

        $purchaseItems =
            PurchaseItem::query()
                ->where(
                    'purchase_order_id',
                    $purchaseOrder->id
                )
                ->get();

        if (
            $purchaseItems->isEmpty()
        ) {
            return;
        }

        $anyReceived = false;

        $allReceived = true;

        foreach (
            $purchaseItems as $purchaseItem
        ) {
            $approvedQuantity =
                $this
                    ->approvedQuantityForPurchaseItem(
                        $purchaseItem->id
                    );

            if (
                $approvedQuantity >
                0.00001
            ) {
                $anyReceived = true;
            }

            if (
                $approvedQuantity +
                0.00001 <
                (float) $purchaseItem->quantity
            ) {
                $allReceived = false;
            }
        }

        if ($allReceived) {
            $purchaseOrder->update([
                'status' => 'Received',
            ]);

            return;
        }

        if ($anyReceived) {
            $purchaseOrder->update([
                'status' => 'Partial',
            ]);

            return;
        }

        $purchaseOrder->update([
            'status' => 'Approved',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Taxes
    |--------------------------------------------------------------------------
    */

    private function normalizeTaxes(
        mixed $taxes
    ): array {
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
            ! is_array(
                $taxes
            )
        ) {
            return [];
        }

        return collect(
            $taxes
        )
            ->map(
                function ($tax) {
                    if (
                        ! is_array(
                            $tax
                        )
                    ) {
                        return null;
                    }

                    return [
                        'tax_id' => isset(
                            $tax['tax_id']
                        )
                            ? (int)
                            $tax[
                                'tax_id'
                            ]
                            : null,

                        'name' => $tax['name']
                            ?? 'Tax',

                        'rate' => (float) (
                            $tax['rate']
                            ?? 0
                        ),

                        'tax_amount' => (float) (
                            $tax['tax_amount']
                            ?? 0
                        ),
                    ];
                }
            )
            ->filter()
            ->values()
            ->all();
    }

    /*
    |--------------------------------------------------------------------------
    | Generate GRN Number
    |--------------------------------------------------------------------------
    */

    private function generateGrnNo(): string
    {
        $year =
            now()->format('Y');

        $prefix =
            "GRN-{$year}";

        $lastGrn =
            GoodsReceivedNote::query()
                ->where(
                    'grn_no',
                    'like',
                    "{$prefix}%"
                )
                ->lockForUpdate()
                ->latest('id')
                ->first();

        $lastNumber =
            $lastGrn
            ? (int) substr(
                $lastGrn->grn_no,
                strlen(
                    $prefix
                )
            )
            : 0;

        return $prefix.
            sprintf(
                '%03d',
                $lastNumber + 1
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Bill Number
    |--------------------------------------------------------------------------
    */

    private function generateBillNo(): string
    {
        $year =
            now()->format('Y');

        $prefix =
            "BILL-{$year}";

        $lastBill =
            Bill::query()
                ->where(
                    'bill_no',
                    'like',
                    "{$prefix}%"
                )
                ->lockForUpdate()
                ->latest('id')
                ->first();

        $lastNumber =
            $lastBill
            ? (int) substr(
                $lastBill->bill_no,
                strlen(
                    $prefix
                )
            )
            : 0;

        return $prefix.
            sprintf(
                '%03d',
                $lastNumber + 1
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Transform GRN For Inertia
    |--------------------------------------------------------------------------
    */

    private function transformGrn(
        GoodsReceivedNote $grn
    ): array {
        $purchaseOrder =
            $grn->purchaseOrder;

        return [
            'id' => $grn->id,

            'grn_no' => $grn->grn_no,

            'purchase_order_id' => $grn->purchase_order_id,

            'warehouse_id' => $grn->warehouse_id,

            'received_date' => $grn->received_date
                ? Carbon::parse(
                    $grn->received_date
                )->format('Y-m-d')
                : null,

            'status' => $grn->status,

            /*
            |--------------------------------------------------------------------------
            | Attachments
            |--------------------------------------------------------------------------
            */

            'attachments' => $this->normalizeAttachments(
                $grn->attachments
            ),

            'note' => $grn->note,

            'created_at' => $grn->created_at
                ?->toISOString(),

            /*
            |--------------------------------------------------------------------------
            | Purchase Order
            |--------------------------------------------------------------------------
            */

            'purchase_order' => $purchaseOrder
                ? [
                    'id' => $purchaseOrder->id,

                    'order_id' => $purchaseOrder->order_id,

                    'status' => $purchaseOrder->status,

                    'requisition' => $purchaseOrder
                        ->relationLoaded(
                            'requisition'
                        ) &&
                        $purchaseOrder
                            ->requisition
                        ? [
                            'id' => $purchaseOrder
                                ->requisition
                                ->id,

                            'requisition_id' => $purchaseOrder
                                ->requisition
                                ->requisition_id,
                        ]
                        : null,

                    'vendor' => $purchaseOrder->vendor
                        ? [
                            'id' => $purchaseOrder
                                ->vendor
                                ->id,

                            'vendor_id' => $purchaseOrder
                                ->vendor
                                ->vendor_id,

                            'name' => $purchaseOrder
                                ->vendor
                                ->name,
                        ]
                        : null,

                    'warehouse' => $purchaseOrder->warehouse
                        ? [
                            'id' => $purchaseOrder
                                ->warehouse
                                ->id,

                            'name' => $purchaseOrder
                                ->warehouse
                                ->name,
                        ]
                        : null,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | Warehouse
            |--------------------------------------------------------------------------
            */

            'warehouse' => $grn->warehouse
                ? [
                    'id' => $grn->warehouse->id,

                    'name' => $grn->warehouse->name,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | Received By
            |--------------------------------------------------------------------------
            */

            'received_by' => $grn->receivedBy
                ? [
                    'id' => $grn->receivedBy->id,

                    'name' => $grn->receivedBy->name,

                    'employee_id' => $grn->receivedBy
                        ->employee_id,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | Approved By
            |--------------------------------------------------------------------------
            */

            'approved_by' => $grn->approvedBy
                ? [
                    'id' => $grn->approvedBy->id,

                    'name' => $grn->approvedBy->name,

                    'employee_id' => $grn->approvedBy
                        ->employee_id,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | Items
            |--------------------------------------------------------------------------
            */

            'items' => $grn
                ->items
                ->map(
                    function (GoodsReceivedNoteItem $item) {
                        return [
                            'id' => $item->id,

                            'purchase_item_id' => $item
                                ->purchase_item_id,

                            'item_id' => (int) $item->item_id,

                            'code' => $item
                                ->product
                                ?->code
                                ?? '',

                            'name' => $item
                                ->product
                                ?->name
                                ?? 'N/A',

                            'unit' => $item->unit,

                            'quantity' => (float) $item
                                ->quantity,

                            'unit_price' => (float) (
                                $item
                                    ->purchaseItem
                                    ?->unit_price
                                ?? 0
                            ),

                            'taxes' => $this->normalizeTaxes(
                                $item
                                    ->purchaseItem
                                    ?->taxes
                            ),

                            'tax_amount' => (float) (
                                $item
                                    ->purchaseItem
                                    ?->tax_amount
                                ?? 0
                            ),
                        ];
                    }
                )
                ->values(),

            /*
            |--------------------------------------------------------------------------
            | Bill
            |--------------------------------------------------------------------------
            */

            'bill' => $grn->bill
                ? [
                    'id' => $grn->bill->id,

                    'bill_no' => $grn->bill->bill_no,

                    'sub_total' => (float) $grn
                        ->bill
                        ->sub_total,

                    'total_tax' => (float) $grn
                        ->bill
                        ->total_tax,

                    'total_discount' => (float) $grn
                        ->bill
                        ->total_discount,

                    'shipping_cost' => (float) $grn
                        ->bill
                        ->shipping_cost,

                    'grand_total' => (float) $grn
                        ->bill
                        ->grand_total,

                    'paid_amount' => (float) $grn
                        ->bill
                        ->paid_amount,

                    'due_amount' => (float) $grn
                        ->bill
                        ->due_amount,

                    'payment_status' => $grn
                        ->bill
                        ->payment_status,
                ]
                : null,
        ];
    }

    public function getGrns(Request $request)
    {
        $this->authorizePermission('grn.list');

        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        return GoodsReceivedNote::query()
            ->select([
                'id',
                'grn_no',
                'purchase_order_id',
                'received_date',
                'status',
            ])
            ->with([
                'purchaseOrder:id,order_id',
            ])
            ->when(
                $keyword,
                function ($query) use ($keyword) {
                    $query->where(
                        'grn_no',
                        'like',
                        '%'.$keyword.'%'
                    );
                }
            )
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($grn) {
                return [
                    'id' => $grn->id,

                    'grn_no' => $grn->grn_no,

                    'purchase_order_id' => $grn->purchase_order_id,

                    'order_id' => $grn->purchaseOrder?->order_id,

                    'received_date' => $grn->received_date,

                    'status' => $grn->status,
                ];
            });
    }
}
