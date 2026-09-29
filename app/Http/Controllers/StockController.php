<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StockController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Product Stock
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request
    ) {

        $this->authorizePermission('stock.list');

        $warehouseId =
            $request->integer(
                'warehouse_id'
            ) ?: null;

        $productId =
            $request->integer(
                'product_id'
            ) ?: null;

        /*
        |--------------------------------------------------------------------------
        | Aggregate Stock By Product
        |--------------------------------------------------------------------------
        */

        $data =
            Stock::query()
                ->join(
                    'products',
                    'products.id',
                    '=',
                    'stocks.item_id'
                )
                ->select([
                    'stocks.item_id',

                    'products.code',

                    'products.name',

                    'products.reorder_level',
                ])
                ->selectRaw(
                    '
                MAX(stocks.unit)
                AS unit
                '
                )
                ->selectRaw(
                    '
                SUM(stocks.quantity)
                AS total_quantity
                '
                )
                ->selectRaw(
                    '
                SUM(stocks.reserved_quantity)
                AS total_reserved_quantity
                '
                )
                ->selectRaw(
                    '
                SUM(
                    stocks.quantity
                    -
                    stocks.reserved_quantity
                )
                AS total_available_quantity
                '
                )
                ->selectRaw(
                    '
                COUNT(DISTINCT CASE
                     WHEN stocks.quantity > 0
                     THEN stocks.warehouse_id
                END)
                AS warehouse_count
                '
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'stocks.warehouse_id',
                        $warehouseId
                    )
                )
                ->when(
                    $productId,
                    fn($query) =>
                    $query->where(
                        'stocks.item_id',
                        $productId
                    )
                )
                ->groupBy([
                    'stocks.item_id',

                    'products.code',

                    'products.name',

                    'products.reorder_level',
                ])
                ->orderBy(
                    'products.name'
                )
                ->paginate(20)
                ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Transform
        |--------------------------------------------------------------------------
        */

        $data->through(
            function ($stock) {
                $availableQuantity =
                    (float) 
                    $stock
                        ->total_available_quantity;

                $reorderLevel =
                    (float) (
                        $stock
                            ->reorder_level
                        ?? 0
                    );

                return [
                    'product_id' =>
                        (int) 
                        $stock
                            ->item_id,

                    'code' =>
                        $stock
                            ->code,

                    'name' =>
                        $stock
                            ->name,

                    'unit' =>
                        $stock
                            ->unit,

                    'total_quantity' =>
                        (float) 
                        $stock
                            ->total_quantity,

                    'total_reserved_quantity' =>
                        (float) 
                        $stock
                            ->total_reserved_quantity,

                    'total_available_quantity' =>
                        $availableQuantity,

                    'warehouse_count' =>
                        (int) 
                        $stock
                            ->warehouse_count,

                    'reorder_level' =>
                        $reorderLevel,

                    'is_reorder' =>
                        $reorderLevel >
                        0
                        &&
                        $availableQuantity <=
                        $reorderLevel,
                ];
            }
        );

        return Inertia::render(
            'operations/inventory/stock/products-stock',
            [
                'data' =>
                    $data,

                'warehouses' =>
                    $this->warehouses(),

                'products' =>
                    $this->products(),

                'filters' => [
                    'warehouse_id' =>
                        $warehouseId,

                    'product_id' =>
                        $productId,
                ],
            ]
        );
    }

    public function showProductStock(
        Product $product
    ) {

        $this->authorizePermission('stock.view');

        /*
        |--------------------------------------------------------------------------
        | Product
        |--------------------------------------------------------------------------
        */

        $product->load([
            'unit:id,name',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Warehouse Stock
        |--------------------------------------------------------------------------
        */

        $stocks =
            Stock::query()
                ->with([
                    'warehouse:id,name',
                ])
                ->where(
                    'item_id',
                    $product->id
                )
                ->where('quantity', '>', 0)
                ->orderBy(
                    'warehouse_id'
                )
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Stock Rows
        |--------------------------------------------------------------------------
        */

        $stockRows =
            $stocks
                ->map(
                    function (Stock $stock) use ($product) {
                        $quantity =
                            (float) 
                            $stock
                                ->quantity;

                        $reservedQuantity =
                            (float) 
                            $stock
                                ->reserved_quantity;

                        $availableQuantity =
                            $quantity
                            -
                            $reservedQuantity;

                        $reorderLevel =
                            (float) (
                                $product
                                    ->reorder_level
                                ?? 0
                            );

                        return [
                            'id' =>
                                $stock->id,

                            'warehouse_id' =>
                                (int) 
                                $stock
                                    ->warehouse_id,

                            'warehouse' =>
                                $stock
                                    ->warehouse
                                ? [
                                    'id' =>
                                        $stock
                                            ->warehouse
                                            ->id,

                                    'name' =>
                                        $stock
                                            ->warehouse
                                            ->name,
                                ]
                                : null,

                            'unit' =>
                                $stock
                                    ->unit
                                ?:
                                $product
                                    ->unit
                                        ?->name,

                            'quantity' =>
                                $quantity,

                            'reserved_quantity' =>
                                $reservedQuantity,

                            'available_quantity' =>
                                $availableQuantity,

                            'is_reorder' =>
                                $reorderLevel >
                                0
                                &&
                                $availableQuantity <=
                                $reorderLevel,
                        ];
                    }
                )
                ->values();

        /*
        |--------------------------------------------------------------------------
        | Totals
        |--------------------------------------------------------------------------
        */

        $totalQuantity =
            $stockRows->sum(
                'quantity'
            );

        $totalReservedQuantity =
            $stockRows->sum(
                'reserved_quantity'
            );

        $totalAvailableQuantity =
            $stockRows->sum(
                'available_quantity'
            );

        $reorderLevel =
            (float) (
                $product
                    ->reorder_level
                ?? 0
            );

        /*
        |--------------------------------------------------------------------------
        | Render
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/inventory/stock/show-product-stock',
            [
                'product' => [
                    'id' =>
                        $product->id,

                    'code' =>
                        $product->code,

                    'name' =>
                        $product->name,

                    'unit' =>
                        $product
                            ->unit
                                ?->name
                        ?? null,

                    'reorder_level' =>
                        $reorderLevel,
                ],

                'summary' => [
                    'warehouse_count' =>
                        $stockRows
                            ->count(),

                    'total_quantity' =>
                        (float) 
                        $totalQuantity,

                    'total_reserved_quantity' =>
                        (float) 
                        $totalReservedQuantity,

                    'total_available_quantity' =>
                        (float) 
                        $totalAvailableQuantity,

                    'is_reorder' =>
                        $reorderLevel >
                        0
                        &&
                        $totalAvailableQuantity <=
                        $reorderLevel,
                ],

                'stocks' =>
                    $stockRows,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reorder Alert
    |--------------------------------------------------------------------------
    */

    public function reorderAlerts(
        Request $request
    ) {

        $this->authorizePermission('stock.reorder');

        $warehouseId =
            $request->integer(
                'warehouse_id'
            ) ?: null;

        $productId =
            $request->integer(
                'product_id'
            ) ?: null;

        /*
        |--------------------------------------------------------------------------
        | Reorder Logic
        |--------------------------------------------------------------------------
        |
        | available_quantity
        |
        | =
        |
        | quantity - reserved_quantity
        |
        | Alert if:
        |
        | available_quantity <= reorder_level
        |
        */

        $data =
            Stock::query()
                ->select(
                    'stocks.*'
                )
                ->join(
                    'products',
                    'products.id',
                    '=',
                    'stocks.item_id'
                )
                ->with([
                    'warehouse:id,name',

                    'product:id,code,name,reorder_level',
                ])
                ->where(
                    'products.reorder_level',
                    '>',
                    0
                )
                ->whereRaw(
                    '
                    (
                        stocks.quantity
                        -
                        stocks.reserved_quantity
                    )
                    <=
                    products.reorder_level
                    '
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'stocks.warehouse_id',
                        $warehouseId
                    )
                )
                ->when(
                    $productId,
                    fn($query) =>
                    $query->where(
                        'stocks.item_id',
                        $productId
                    )
                )
                ->orderByRaw(
                    '
                    (
                        stocks.quantity
                        -
                        stocks.reserved_quantity
                    )
                    ASC
                    '
                )
                ->paginate(20)
                ->withQueryString();

        $data->through(
            function (Stock $stock) {
                $available =
                    (float) 
                    $stock
                        ->available_quantity;

                $reorderLevel =
                    (float) (
                        $stock
                            ->product
                                ?->reorder_level
                        ?? 0
                    );

                return [
                    'id' =>
                        $stock->id,

                    'unit' =>
                        $stock->unit,

                    'quantity' =>
                        (float) 
                        $stock->quantity,

                    'reserved_quantity' =>
                        (float) 
                        $stock
                            ->reserved_quantity,

                    'available_quantity' =>
                        $available,

                    'reorder_level' =>
                        $reorderLevel,

                    'shortage' =>
                        max(
                            0,
                            $reorderLevel
                            -
                            $available
                        ),

                    'warehouse' =>
                        $stock->warehouse
                        ? [
                            'id' =>
                                $stock
                                    ->warehouse
                                    ->id,

                            'name' =>
                                $stock
                                    ->warehouse
                                    ->name,
                        ]
                        : null,

                    'product' =>
                        $stock->product
                        ? [
                            'id' =>
                                $stock
                                    ->product
                                    ->id,

                            'code' =>
                                $stock
                                    ->product
                                    ->code,

                            'name' =>
                                $stock
                                    ->product
                                    ->name,
                        ]
                        : null,
                ];
            }
        );

        return Inertia::render(
            'operations/inventory/stock/reorder-alerts',
            [
                'data' =>
                    $data,

                'warehouses' =>
                    $this->warehouses(),

                'products' =>
                    $this->products(),

                'filters' => [
                    'warehouse_id' =>
                        $warehouseId,

                    'product_id' =>
                        $productId,
                ],
            ]
        );
    }

    /*
|--------------------------------------------------------------------------
| Stock Transfer Index
|--------------------------------------------------------------------------
*/

    public function transfers()
    {

        $this->authorizePermission('stock.transfer');


        $data =
            StockTransfer::query()
                ->with([
                    'fromWarehouse:id,name',

                    'toWarehouse:id,name',

                    'transferredBy:id,name,employee_id',
                ])
                ->withCount(
                    'stockTransferItems'
                )
                ->latest('id')
                ->paginate(20)
                ->withQueryString();

        $data->through(
            function (StockTransfer $transfer) {
                return [
                    'id' =>
                        $transfer->id,

                    'stock_transfer_id' =>
                        $transfer
                            ->stock_transfer_id,

                    'transfer_date' =>
                        optional(
                            $transfer
                                ->transfer_date
                        )->format(
                                'Y-m-d'
                            ),

                    'transportation_cost' =>
                        (float) (
                            $transfer
                                ->transportation_cost
                            ?? 0
                        ),

                    'grand_total' =>
                        (float) (
                            $transfer
                                ->grand_total
                            ?? 0
                        ),

                    'note' =>
                        $transfer->note,

                    'status' =>
                        $transfer->status,

                    'items_count' =>
                        (int) 
                        $transfer
                            ->stock_transfer_items_count,

                    'from_warehouse' =>
                        $transfer
                            ->fromWarehouse
                        ? [
                            'id' =>
                                $transfer
                                    ->fromWarehouse
                                    ->id,

                            'name' =>
                                $transfer
                                    ->fromWarehouse
                                    ->name,
                        ]
                        : null,

                    'to_warehouse' =>
                        $transfer
                            ->toWarehouse
                        ? [
                            'id' =>
                                $transfer
                                    ->toWarehouse
                                    ->id,

                            'name' =>
                                $transfer
                                    ->toWarehouse
                                    ->name,
                        ]
                        : null,

                    'transferred_by' =>
                        $transfer
                            ->transferredBy
                        ? [
                            'id' =>
                                $transfer
                                    ->transferredBy
                                    ->id,

                            'name' =>
                                $transfer
                                    ->transferredBy
                                    ->name,

                            'employee_id' =>
                                $transfer
                                    ->transferredBy
                                    ->employee_id,
                        ]
                        : null,
                ];
            }
        );

        return Inertia::render(
            'operations/inventory/stock/stock-transfers',
            [
                'data' =>
                    $data,
            ]
        );
    }


    public function showStockTransfer(StockTransfer $stockTransfer)
    {

        $this->authorizePermission('stock.transfer');

        $stockTransfer->load([
            'fromWarehouse:id,name,code',
            'toWarehouse:id,name,code',
            'transferredBy:id,name,employee_id',
            'items.product:id,name,code',
        ]);

        return Inertia::render(
            'operations/inventory/stock/show-stock-transfer',
            [
                'stockTransfer' => $stockTransfer,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Stock Transfer Page
    |--------------------------------------------------------------------------
    */

    public function createTransfer()
    {

        $this->authorizePermission('stock.transfer');

        /*
        |--------------------------------------------------------------------------
        | Warehouses
        |--------------------------------------------------------------------------
        */

        $warehouses =
            Warehouse::query()
                ->select([
                    'id',
                    'name',
                ])
                ->where(
                    'status',
                    true
                )
                ->orderBy(
                    'name'
                )
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        $products =
            Product::query()
                ->with([
                    'unit:id,name',
                ])
                ->select([
                    'id',
                    'code',
                    'name',
                    'unit_id',
                ])
                ->orderBy(
                    'name'
                )
                ->get()
                ->map(
                    function (Product $product) {
                        return [
                            'id' =>
                                $product->id,

                            'code' =>
                                $product->code,

                            'name' =>
                                $product->name,

                            'unit' =>
                                $product
                                    ->unit
                                        ?->name
                                ?? '',
                        ];
                    }
                )
                ->values();

        /*
        |--------------------------------------------------------------------------
        | Available Stock
        |--------------------------------------------------------------------------
        |
        | Used by create page so that after selecting source warehouse,
        | only products available in that warehouse are selectable.
        |
        */

        $stocks =
            Stock::query()
                ->select([
                    'id',
                    'warehouse_id',
                    'item_id',
                    'unit',
                    'quantity',
                    'reserved_quantity',
                ])
                ->where(
                    'quantity',
                    '>',
                    0
                )
                ->get()
                ->map(
                    function (Stock $stock) {
                        $availableQuantity =
                            (
                                (float) 
                                $stock->quantity
                            )
                            -
                            (
                                (float) 
                                $stock
                                    ->reserved_quantity
                            );

                        return [
                            'id' =>
                                $stock->id,

                            'warehouse_id' =>
                                (int) 
                                $stock
                                    ->warehouse_id,

                            'item_id' =>
                                (int) 
                                $stock
                                    ->item_id,

                            'unit' =>
                                $stock->unit,

                            'quantity' =>
                                (float) 
                                $stock
                                    ->quantity,

                            'reserved_quantity' =>
                                (float) 
                                $stock
                                    ->reserved_quantity,

                            'available_quantity' =>
                                $availableQuantity,
                        ];
                    }
                )
                ->filter(
                    fn(
                    array $stock
                ) =>
                    $stock[
                        'available_quantity'
                    ] > 0
                )
                ->values();

        return Inertia::render(
            'operations/inventory/stock/create-stock-transfer',
            [
                'warehouses' =>
                    $warehouses,

                'products' =>
                    $products,

                'stocks' =>
                    $stocks,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Store Stock Transfer
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | This method only creates the Stock Transfer document.
    |
    | It does NOT change stock.
    |
    | status = Pending
    |
    */

    public function storeTransfer(
        Request $request
    ) {

        $this->authorizePermission('stock.transfer');

        $validated =
            $request->validate([
                'from_warehouse_id' => [
                    'required',
                    'integer',
                    'exists:warehouses,id',
                ],

                'to_warehouse_id' => [
                    'required',
                    'integer',
                    'different:from_warehouse_id',
                    'exists:warehouses,id',
                ],

                'transfer_date' => [
                    'required',
                    'date_format:Y-m-d',
                ],

                'transportation_cost' => [
                    'nullable',
                    'numeric',
                    'min:0',
                ],

                'note' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],

                'items' => [
                    'required',
                    'array',
                    'min:1',
                ],

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
            ]);

        $transfer =
            DB::transaction(
                function () use ($validated) {
                    /*
                    |--------------------------------------------------------------------------
                    | Validate Source Stock
                    |--------------------------------------------------------------------------
                    |
                    | This is an initial validation only.
                    |
                    | Stock is validated AGAIN while posting because quantities
                    | may change between Create and Post.
                    |
                    */

                    foreach (
                        $validated[
                            'items'
                        ]
                        as $item
                    ) {
                        $stock =
                            Stock::query()
                                ->where(
                                    'warehouse_id',
                                    $validated[
                                        'from_warehouse_id'
                                    ]
                                )
                                ->where(
                                    'item_id',
                                    $item[
                                        'item_id'
                                    ]
                                )
                                ->first();

                        $availableQuantity =
                            $stock
                            ? (
                                (
                                    (float) 
                                    $stock
                                        ->quantity
                                )
                                -
                                (
                                    (float) 
                                    $stock
                                        ->reserved_quantity
                                )
                            )
                            : 0;

                        if (
                            $availableQuantity
                            <
                            (float) 
                            $item[
                                'quantity'
                            ]
                        ) {
                            $product =
                                Product::query()
                                    ->select([
                                        'id',
                                        'name',
                                    ])
                                    ->find(
                                        $item[
                                            'item_id'
                                        ]
                                    );

                            $productName =
                                $product
                                        ?->name
                                ??
                                "Item #{$item['item_id']}";

                            throw ValidationException::withMessages([
                                'items' =>
                                    "Insufficient available stock for {$productName}. Available: {$availableQuantity}, Requested: {$item['quantity']}.",
                            ]);
                        }
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Transportation Cost
                    |--------------------------------------------------------------------------
                    */

                    $transportationCost =
                        (float) (
                            $validated[
                                'transportation_cost'
                            ]
                            ?? 0
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Create Stock Transfer
                    |--------------------------------------------------------------------------
                    */

                    $transfer =
                        StockTransfer::create([
                            'stock_transfer_id' =>
                                $this
                                    ->generateTransferId(),

                            'from_warehouse_id' =>
                                $validated[
                                    'from_warehouse_id'
                                ],

                            'to_warehouse_id' =>
                                $validated[
                                    'to_warehouse_id'
                                ],

                            'transferred_by' =>
                                Auth::id(),

                            'transfer_date' =>
                                $validated[
                                    'transfer_date'
                                ],

                            'transportation_cost' =>
                                $transportationCost,

                            /*
                            |--------------------------------------------------------------------------
                            | Your transfer items no longer contain unit_price.
                            |
                            | Therefore transportation cost is currently the only
                            | monetary value available for grand_total.
                            |--------------------------------------------------------------------------
                            */

                            'grand_total' =>
                                $transportationCost,

                            'note' =>
                                $validated[
                                    'note'
                                ]
                                ?? null,

                            'status' =>
                                'Pending',
                        ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Create Transfer Items
                    |--------------------------------------------------------------------------
                    */

                    foreach (
                        $validated[
                            'items'
                        ]
                        as $item
                    ) {
                        $transfer
                            ->stockTransferItems()
                            ->create([
                                'item_id' =>
                                    $item[
                                        'item_id'
                                    ],

                                'unit' =>
                                    $item[
                                        'unit'
                                    ],

                                'quantity' =>
                                    $item[
                                        'quantity'
                                    ],
                            ]);
                    }

                    return $transfer;
                }
            );

        return to_route(
            'stock-transfers.index'
        )->with(
                'notification',
                [
                    'message' =>
                        "Stock Transfer {$transfer->stock_transfer_id} created successfully.",

                    'type' =>
                        'success',
                ]
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Post Stock Transfer
    |--------------------------------------------------------------------------
    |
    | Pending
    |    ↓
    | Source Stock -
    | TransferOut -
    |
    | Destination Stock +
    | TransferIn +
    |    ↓
    | Posted
    |
    */

    public function postTransfer(
        StockTransfer $stockTransfer
    ) {

        $this->authorizePermission('stock.transfer');

        DB::transaction(
            function () use ($stockTransfer) {
                /*
                |--------------------------------------------------------------------------
                | Lock Transfer
                |--------------------------------------------------------------------------
                */

                $transfer =
                    StockTransfer::query()
                        ->with([
                            'stockTransferItems',
                        ])
                        ->lockForUpdate()
                        ->findOrFail(
                            $stockTransfer->id
                        );

                /*
                |--------------------------------------------------------------------------
                | Only Pending Transfer Can Be Posted
                |--------------------------------------------------------------------------
                */

                if (
                    $transfer->status
                    !==
                    'Pending'
                ) {
                    throw ValidationException::withMessages([
                        'stock_transfer' =>
                            'Only Pending Stock Transfers can be posted.',
                    ]);
                }

                if (
                    $transfer
                        ->from_warehouse_id
                    ===
                    $transfer
                        ->to_warehouse_id
                ) {
                    throw ValidationException::withMessages([
                        'stock_transfer' =>
                            'Source and destination warehouse cannot be the same.',
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | Process Every Item
                |--------------------------------------------------------------------------
                */

                foreach (
                    $transfer
                        ->stockTransferItems
                    as $item
                ) {
                    $quantity =
                        (float) 
                        $item
                            ->quantity;

                    /*
                    |--------------------------------------------------------------------------
                    | Lock Source Stock
                    |--------------------------------------------------------------------------
                    */

                    $sourceStock =
                        Stock::query()
                            ->where(
                                'warehouse_id',
                                $transfer
                                    ->from_warehouse_id
                            )
                            ->where(
                                'item_id',
                                $item
                                    ->item_id
                            )
                            ->lockForUpdate()
                            ->first();

                    $availableQuantity =
                        $sourceStock
                        ? (
                            (
                                (float) 
                                $sourceStock
                                    ->quantity
                            )
                            -
                            (
                                (float) 
                                $sourceStock
                                    ->reserved_quantity
                            )
                        )
                        : 0;

                    /*
                    |--------------------------------------------------------------------------
                    | Validate Source Stock Again
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !$sourceStock
                        ||
                        $availableQuantity
                        <
                        $quantity
                    ) {
                        $product =
                            Product::query()
                                ->select([
                                    'id',
                                    'name',
                                ])
                                ->find(
                                    $item
                                        ->item_id
                                );

                        $productName =
                            $product
                                    ?->name
                            ??
                            "Item #{$item->item_id}";

                        throw ValidationException::withMessages([
                            'stock_transfer' =>
                                "Insufficient available stock for {$productName}. Available: {$availableQuantity}, Requested: {$quantity}.",
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Reduce Source Stock
                    |--------------------------------------------------------------------------
                    */

                    $sourceStock->quantity =
                        (
                            (float) 
                            $sourceStock
                                ->quantity
                        )
                        -
                        $quantity;

                    $sourceStock->save();

                    /*
                    |--------------------------------------------------------------------------
                    | Find Destination Stock
                    |--------------------------------------------------------------------------
                    */

                    $destinationStock =
                        Stock::query()
                            ->where(
                                'warehouse_id',
                                $transfer
                                    ->to_warehouse_id
                            )
                            ->where(
                                'item_id',
                                $item
                                    ->item_id
                            )
                            ->lockForUpdate()
                            ->first();

                    /*
                    |--------------------------------------------------------------------------
                    | Product Has Never Existed In Destination Warehouse
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !$destinationStock
                    ) {
                        $destinationStock =
                            Stock::create([
                                'warehouse_id' =>
                                    $transfer
                                        ->to_warehouse_id,

                                'item_id' =>
                                    $item
                                        ->item_id,

                                'unit' =>
                                    $item
                                        ->unit,

                                'quantity' =>
                                    0,

                                'reserved_quantity' =>
                                    0,
                            ]);

                        $destinationStock =
                            Stock::query()
                                ->whereKey(
                                    $destinationStock
                                        ->id
                                )
                                ->lockForUpdate()
                                ->firstOrFail();
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Increase Destination Stock
                    |--------------------------------------------------------------------------
                    */

                    $destinationStock->unit =
                        $destinationStock
                            ->unit
                        ?:
                        $item
                            ->unit;

                    $destinationStock->quantity =
                        (
                            (float) 
                            $destinationStock
                                ->quantity
                        )
                        +
                        $quantity;

                    $destinationStock->save();

                    /*
                    |--------------------------------------------------------------------------
                    | Transfer Out Movement
                    |--------------------------------------------------------------------------
                    */

                    StockMovement::create([
                        'warehouse_id' =>
                            $transfer
                                ->from_warehouse_id,

                        'item_id' =>
                            $item
                                ->item_id,

                        'unit' =>
                            $item
                                ->unit,

                        'quantity' =>
                            -$quantity,

                        'movement' =>
                            'TransferOut',

                        'reference_type' =>
                            StockTransfer::class,

                        'reference_id' =>
                            $transfer
                                ->id,

                        'remarks' =>
                            "Stock Transfer {$transfer->stock_transfer_id}",

                        'created_by' =>
                            Auth::id(),
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Transfer In Movement
                    |--------------------------------------------------------------------------
                    */

                    StockMovement::create([
                        'warehouse_id' =>
                            $transfer
                                ->to_warehouse_id,

                        'item_id' =>
                            $item
                                ->item_id,

                        'unit' =>
                            $item
                                ->unit,

                        'quantity' =>
                            $quantity,

                        'movement' =>
                            'TransferIn',

                        'reference_type' =>
                            StockTransfer::class,

                        'reference_id' =>
                            $transfer
                                ->id,

                        'remarks' =>
                            "Stock Transfer {$transfer->stock_transfer_id}",

                        'created_by' =>
                            Auth::id(),
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | Update Transfer Status
                |--------------------------------------------------------------------------
                */

                $transfer->update([
                    'status' =>
                        'Posted',
                ]);
            }
        );

        return to_route(
            'stock-transfers.index'
        )->with(
                'notification',
                [
                    'message' =>
                        'Stock Transfer posted successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Stock Transfer
    |--------------------------------------------------------------------------
    |
    | Only Pending transfers can be deleted.
    |
    */

    public function destroyTransfer(
        StockTransfer $stockTransfer
    ) {

        $this->authorizePermission('stock.transfer');

        if (
            $stockTransfer->status
            !==
            'Pending'
        ) {
            return to_route(
                'stock-transfers.index'
            )->with(
                    'notification',
                    [
                        'message' =>
                            'Posted Stock Transfers cannot be deleted.',

                        'type' =>
                            'error',
                    ]
                );
        }

        $stockTransfer->delete();

        return to_route(
            'stock-transfers.index'
        )->with(
                'notification',
                [
                    'message' =>
                        'Stock Transfer deleted successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Stock Transfer ID
    |--------------------------------------------------------------------------
    */

    private function generateTransferId(): string
    {
        do {
            $transferId =
                'ST-'
                .
                now()->format(
                    'Ymd'
                )
                .
                '-'
                .
                Str::upper(
                    Str::random(
                        6
                    )
                );
        } while (
            StockTransfer::query()
                ->where(
                    'stock_transfer_id',
                    $transferId
                )
                ->exists()
        );

        return $transferId;
    }



    /*
    |--------------------------------------------------------------------------
    | Stock Adjustment List
    |--------------------------------------------------------------------------
    */

    public function adjustments()
    {
        $this->authorizePermission('stock.adjustment');

        $data =
            StockAdjustment::query()
                ->with([
                    'warehouse:id,name',

                    'adjustedBy:id,name,employee_id',

                    'items.product:id,code,name',
                ])
                ->latest('id')
                ->paginate(20)
                ->withQueryString();

        $data->through(
            function (StockAdjustment $adjustment) {
                return [
                    'id' =>
                        $adjustment->id,

                    'adjustment_id' =>
                        $adjustment
                            ->adjustment_id,

                    'adjustment_date' =>
                        optional(
                            $adjustment
                                ->adjustment_date
                        )->format(
                                'Y-m-d'
                            ),

                    'reason' =>
                        $adjustment
                            ->reason,

                    'note' =>
                        $adjustment
                            ->note,

                    'status' =>
                        $adjustment
                            ->status,

                    'warehouse' =>
                        $adjustment
                            ->warehouse
                        ? [
                            'id' =>
                                $adjustment
                                    ->warehouse
                                    ->id,

                            'name' =>
                                $adjustment
                                    ->warehouse
                                    ->name,
                        ]
                        : null,

                    'adjusted_by' =>
                        $adjustment
                            ->adjustedBy
                        ? [
                            'id' =>
                                $adjustment
                                    ->adjustedBy
                                    ->id,

                            'name' =>
                                $adjustment
                                    ->adjustedBy
                                    ->name,

                            'employee_id' =>
                                $adjustment
                                    ->adjustedBy
                                    ->employee_id,
                        ]
                        : null,

                    'items' =>
                        $adjustment
                            ->items
                            ->map(
                                fn(
                                StockAdjustmentItem $item
                            ) => [
                                    'id' =>
                                        $item
                                            ->id,

                                    'item_id' =>
                                        (int) 
                                        $item
                                            ->item_id,

                                    'unit' =>
                                        $item
                                            ->unit,

                                    'adjustment_type' =>
                                        $item
                                            ->adjustment_type,

                                    'quantity' =>
                                        (float) 
                                        $item
                                            ->quantity,

                                    'product' =>
                                        $item
                                            ->product
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
                                ]
                            )
                            ->values(),
                ];
            }
        );

        return Inertia::render(
            'operations/inventory/stock/stock-adjustments',
            [
                'data' =>
                    $data,

                'warehouses' =>
                    $this->warehouses(),

                'products' =>
                    $this->products(),
            ]
        );
    }

    public function showAdjustment(StockAdjustment $stockAdjustment)
    {
        $this->authorizePermission('stock.adjustment');

        $stockAdjustment->load([
            'warehouse:id,name,code',
            'adjustedBy:id,name,employee_id',
            'items.product:id,name,code',
        ]);

        return Inertia::render(
            'operations/inventory/stock/show-stock-adjustment',
            [
                'stockAdjustment' => $stockAdjustment,
            ]
        );
    }

    public function createAdjustment()
    {
        $this->authorizePermission('stock.adjustment');

        return Inertia::render('operations/inventory/stock/create-adjustment', [
            'warehouses' =>
                $this->warehouses(),
            'products' =>
                $this->products(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Store Stock Adjustment
    |--------------------------------------------------------------------------
    */

    public function storeAdjustment(
        Request $request
    ) {
        $this->authorizePermission('stock.adjustment');

        $validated =
            $request->validate([
                'warehouse_id' => [
                    'required',
                    'integer',
                    'exists:warehouses,id',
                ],

                'adjustment_date' => [
                    'required',
                    'date_format:Y-m-d',
                ],

                'reason' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'note' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],

                'items' => [
                    'required',
                    'array',
                    'min:1',
                ],

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

                'items.*.adjustment_type' => [
                    'required',

                    Rule::in([
                        'increase',
                        'decrease',
                    ]),
                ],

                'items.*.quantity' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],
            ]);

        $adjustment =
            DB::transaction(
                function () use ($validated) {
                    $adjustment =
                        StockAdjustment::create([
                            'adjustment_id' =>
                                $this
                                    ->generateAdjustmentId(),

                            'warehouse_id' =>
                                $validated[
                                    'warehouse_id'
                                ],

                            'adjusted_by' =>
                                Auth::id(),

                            'adjustment_date' =>
                                $validated[
                                    'adjustment_date'
                                ],

                            'reason' =>
                                $validated[
                                    'reason'
                                ]
                                ?? null,

                            'note' =>
                                $validated[
                                    'note'
                                ]
                                ?? null,

                            'status' =>
                                'draft',
                        ]);

                    foreach (
                        $validated[
                            'items'
                        ]
                        as $item
                    ) {
                        $adjustment
                            ->items()
                            ->create([
                                'item_id' =>
                                    $item[
                                        'item_id'
                                    ],

                                'unit' =>
                                    $item[
                                        'unit'
                                    ],

                                'adjustment_type' =>
                                    $item[
                                        'adjustment_type'
                                    ],

                                'quantity' =>
                                    $item[
                                        'quantity'
                                    ],
                            ]);
                    }

                    return $adjustment;
                }
            );

        return redirect()
            ->route('stock-adjustments.index')
            ->with(
                'notification',
                [
                    'message' =>
                        "Stock Adjustment {$adjustment->adjustment_id} created successfully.",

                    'type' =>
                        'success',
                ]
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Post Stock Adjustment
    |--------------------------------------------------------------------------
    */

    public function postAdjustment(
        StockAdjustment $stockAdjustment
    ) {
        $this->authorizePermission('stock.adjustment');

        DB::transaction(
            function () use ($stockAdjustment) {
                $adjustment =
                    StockAdjustment::query()
                        ->with(
                            'items'
                        )
                        ->lockForUpdate()
                        ->findOrFail(
                            $stockAdjustment->id
                        );

                if (
                    $adjustment->status
                    !==
                    'draft'
                ) {
                    throw ValidationException::withMessages([
                        'stock_adjustment' =>
                            'Only draft Stock Adjustments can be posted.',
                    ]);
                }

                foreach (
                    $adjustment->items
                    as $item
                ) {
                    $quantity =
                        (float) 
                        $item
                            ->quantity;

                    $signedQuantity =
                        $item
                            ->adjustment_type
                        ===
                        'increase'
                        ? $quantity
                        : -$quantity;

                    $stock =
                        Stock::query()
                            ->where(
                                'warehouse_id',
                                $adjustment
                                    ->warehouse_id
                            )
                            ->where(
                                'item_id',
                                $item
                                    ->item_id
                            )
                            ->lockForUpdate()
                            ->first();

                    /*
                    |--------------------------------------------------------------------------
                    | Cannot decrease missing stock
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !$stock
                        &&
                        $signedQuantity
                        <
                        0
                    ) {
                        throw ValidationException::withMessages([
                            'stock_adjustment' =>
                                "No stock exists for Item #{$item->item_id} in this warehouse.",
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Create stock row for increase
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !$stock
                    ) {
                        $stock =
                            Stock::create([
                                'warehouse_id' =>
                                    $adjustment
                                        ->warehouse_id,

                                'item_id' =>
                                    $item
                                        ->item_id,

                                'unit' =>
                                    $item
                                        ->unit,

                                'quantity' =>
                                    0,

                                'reserved_quantity' =>
                                    0,
                            ]);

                        $stock =
                            Stock::query()
                                ->whereKey(
                                    $stock
                                        ->id
                                )
                                ->lockForUpdate()
                                ->firstOrFail();
                    }

                    $available =
                        (float) 
                        $stock
                            ->quantity
                        -
                        (float) 
                        $stock
                            ->reserved_quantity;

                    /*
                    |--------------------------------------------------------------------------
                    | Prevent negative available stock
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $signedQuantity
                        <
                        0
                        &&
                        $available
                        <
                        $quantity
                    ) {
                        $product =
                            Product::query()
                                ->find(
                                    $item
                                        ->item_id
                                );

                        $productName =
                            $product?->name
                            ??
                            "Item #{$item->item_id}";

                        throw ValidationException::withMessages([
                            'stock_adjustment' =>
                                "Adjustment exceeds available stock for {$productName}. Available: {$available}.",
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Update Stock
                    |--------------------------------------------------------------------------
                    */

                    $stock->unit =
                        $stock->unit
                        ?: $item
                            ->unit;

                    $stock->quantity =
                        (float) 
                        $stock
                            ->quantity
                        +
                        $signedQuantity;

                    $stock->save();

                    /*
                    |--------------------------------------------------------------------------
                    | Stock Movement
                    |--------------------------------------------------------------------------
                    */

                    StockMovement::create([
                        'warehouse_id' =>
                            $adjustment
                                ->warehouse_id,

                        'item_id' =>
                            $item
                                ->item_id,

                        'unit' =>
                            $item
                                ->unit,

                        'quantity' =>
                            $signedQuantity,

                        'movement' =>
                            'Adjustment',

                        'reference_type' =>
                            StockAdjustment::class,

                        'reference_id' =>
                            $adjustment
                                ->id,

                        'remarks' =>
                            $adjustment
                                ->reason
                            ? "Stock Adjustment {$adjustment->adjustment_id} - {$adjustment->reason}"
                            : "Stock Adjustment {$adjustment->adjustment_id}",

                        'created_by' =>
                            Auth::id(),
                    ]);
                }

                $adjustment->update([
                    'status' =>
                        'posted',
                ]);
            }
        );

        return redirect()
            ->back()
            ->with(
                'notification',
                [
                    'message' =>
                        'Stock Adjustment posted successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Stock Adjustment
    |--------------------------------------------------------------------------
    */

    public function destroyAdjustment(
        StockAdjustment $stockAdjustment
    ) {
        $this->authorizePermission('stock.adjustment');

        if (
            $stockAdjustment->status
            !==
            'draft'
        ) {
            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Posted Stock Adjustment cannot be deleted.',

                        'type' =>
                            'error',
                    ]
                );
        }

        $stockAdjustment->delete();

        return redirect()
            ->route('stock-adjustments.index')
            ->with(
                'notification',
                [
                    'message' =>
                        'Stock Adjustment deleted successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Stock Ledger
    |--------------------------------------------------------------------------
    */

    public function ledger(
        Request $request
    ) {
        $this->authorizePermission('stock.ledger');

        $validated =
            $request->validate([
                'warehouse_id' => [
                    'nullable',
                    'integer',
                    'exists:warehouses,id',
                ],

                'product_id' => [
                    'nullable',
                    'integer',
                    'exists:products,id',
                ],

                'movement' => [
                    'nullable',

                    Rule::in([
                        'GRN',
                        'Issue',
                        'TransferIn',
                        'TransferOut',
                        'Return',
                        'Adjustment',
                    ]),
                ],

                'from_date' => [
                    'nullable',
                    'date_format:Y-m-d',
                ],

                'to_date' => [
                    'nullable',
                    'date_format:Y-m-d',
                    'after_or_equal:from_date',
                ],
            ]);

        $warehouseId =
            $validated[
                'warehouse_id'
            ]
            ?? null;

        $productId =
            $validated[
                'product_id'
            ]
            ?? null;

        /*
        |--------------------------------------------------------------------------
        | Running Balance
        |--------------------------------------------------------------------------
        |
        | Product and Warehouse filters must be applied BEFORE
        | calculating the running balance.
        |
        | Date / movement filters are applied afterwards.
        |
        */

        $baseQuery =
            DB::table(
                'stock_movements'
            )
                ->select([
                    'stock_movements.id',

                    'stock_movements.warehouse_id',

                    'stock_movements.item_id',

                    'stock_movements.unit',

                    'stock_movements.quantity',

                    'stock_movements.movement',

                    'stock_movements.reference_type',

                    'stock_movements.reference_id',

                    'stock_movements.remarks',

                    'stock_movements.created_by',

                    'stock_movements.created_at',
                ])
                ->selectRaw(
                    '
                    SUM(
                        stock_movements.quantity
                    )
                    OVER (
                        PARTITION BY
                            stock_movements.warehouse_id,
                            stock_movements.item_id

                        ORDER BY
                            stock_movements.created_at,
                            stock_movements.id

                        ROWS BETWEEN
                            UNBOUNDED PRECEDING
                            AND
                            CURRENT ROW
                    )
                    AS running_balance
                    '
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'stock_movements.warehouse_id',
                        $warehouseId
                    )
                )
                ->when(
                    $productId,
                    fn($query) =>
                    $query->where(
                        'stock_movements.item_id',
                        $productId
                    )
                );

        $query =
            DB::query()
                ->fromSub(
                    $baseQuery,
                    'ledger'
                )
                ->leftJoin(
                    'warehouses',
                    'warehouses.id',
                    '=',
                    'ledger.warehouse_id'
                )
                ->leftJoin(
                    'products',
                    'products.id',
                    '=',
                    'ledger.item_id'
                )
                ->leftJoin(
                    'users',
                    'users.id',
                    '=',
                    'ledger.created_by'
                )
                ->select([
                    'ledger.*',

                    'warehouses.name as warehouse_name',

                    'products.code as product_code',

                    'products.name as product_name',

                    'users.name as created_by_name',
                ])
                ->when(
                    $validated[
                        'movement'
                    ]
                    ?? null,
                    fn(
                    $query,
                    $movement
                ) =>
                    $query->where(
                        'ledger.movement',
                        $movement
                    )
                )
                ->when(
                    $validated[
                        'from_date'
                    ]
                    ?? null,
                    fn(
                    $query,
                    $date
                ) =>
                    $query->whereDate(
                        'ledger.created_at',
                        '>=',
                        $date
                    )
                )
                ->when(
                    $validated[
                        'to_date'
                    ]
                    ?? null,
                    fn(
                    $query,
                    $date
                ) =>
                    $query->whereDate(
                        'ledger.created_at',
                        '<=',
                        $date
                    )
                )
                ->orderByDesc(
                    'ledger.created_at'
                )
                ->orderByDesc(
                    'ledger.id'
                );

        $data =
            $query
                ->paginate(25)
                ->withQueryString();

        $data->through(
            function ($row) {
                return [
                    'id' =>
                        (int) 
                        $row->id,

                    'warehouse_id' =>
                        (int) 
                        $row
                            ->warehouse_id,

                    'item_id' =>
                        (int) 
                        $row
                            ->item_id,

                    'warehouse_name' =>
                        $row
                            ->warehouse_name,

                    'product_code' =>
                        $row
                            ->product_code,

                    'product_name' =>
                        $row
                            ->product_name,

                    'unit' =>
                        $row->unit,

                    'quantity' =>
                        (float) 
                        $row
                            ->quantity,

                    'stock_in' =>
                        (float) 
                        $row
                            ->quantity
                        >
                        0
                        ? (float) 
                        $row
                            ->quantity
                        : 0,

                    'stock_out' =>
                        (float) 
                        $row
                            ->quantity
                        <
                        0
                        ? abs(
                            (float) 
                            $row
                                ->quantity
                        )
                        : 0,

                    'running_balance' =>
                        (float) 
                        $row
                            ->running_balance,

                    'movement' =>
                        $row
                            ->movement,

                    'reference_type' =>
                        $row
                            ->reference_type
                        ? class_basename(
                            $row
                                ->reference_type
                        )
                        : null,

                    'reference_id' =>
                        $row
                            ->reference_id
                        ? (int) 
                        $row
                            ->reference_id
                        : null,

                    'remarks' =>
                        $row
                            ->remarks,

                    'created_by_name' =>
                        $row
                            ->created_by_name,

                    'created_at' =>
                        $row
                            ->created_at,
                ];
            }
        );

        return Inertia::render(
            'operations/inventory/stock/stock-ledger',
            [
                'data' =>
                    $data,

                'warehouses' =>
                    $this->warehouses(),

                'products' =>
                    $this->products(),

                'movements' => [
                    'GRN',
                    'Issue',
                    'TransferIn',
                    'TransferOut',
                    'Return',
                    'Adjustment',
                ],

                'filters' => [
                    'warehouse_id' =>
                        $warehouseId,

                    'product_id' =>
                        $productId,

                    'movement' =>
                        $validated[
                            'movement'
                        ]
                        ?? null,

                    'from_date' =>
                        $validated[
                            'from_date'
                        ]
                        ?? null,

                    'to_date' =>
                        $validated[
                            'to_date'
                        ]
                        ?? null,
                ],
            ]
        );
    }



    /*
    |--------------------------------------------------------------------------
    | Generate Adjustment ID
    |--------------------------------------------------------------------------
    */

    private function generateAdjustmentId(): string
    {
        do {
            $id =
                'ADJ-'
                .
                now()->format(
                    'Ymd'
                )
                .
                '-'
                .
                Str::upper(
                    Str::random(6)
                );
        } while (
            StockAdjustment::query()
                ->where(
                    'adjustment_id',
                    $id
                )
                ->exists()
        );

        return $id;
    }

    /*
    |--------------------------------------------------------------------------
    | Warehouses
    |--------------------------------------------------------------------------
    */

    private function warehouses()
    {
        return Warehouse::query()
            ->select([
                'id',
                'name',
            ])
            ->orderBy(
                'name'
            )
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    private function products()
    {
        return Product::query()
            ->with([
                'unit:id,name',
            ])
            ->select([
                'id',
                'code',
                'name',
                'unit_id',
                'reorder_level',
            ])
            ->orderBy(
                'name'
            )
            ->get()
            ->map(
                function (Product $product) {
                    return [
                        'id' =>
                            $product->id,

                        'code' =>
                            $product->code,

                        'name' =>
                            $product->name,

                        'unit' =>
                            $product
                                ->unit
                                    ?->name
                            ?? '',

                        'reorder_level' =>
                            (float) (
                                $product
                                    ->reorder_level
                                ?? 0
                            ),
                    ];
                }
            )
            ->values();
    }
}
