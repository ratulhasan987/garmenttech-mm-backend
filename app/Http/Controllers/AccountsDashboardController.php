<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\GoodsReceivedNote;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReturn;
use App\Models\Requisition;
use App\Models\SalesInvoice;
use App\Models\Stock;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AccountsDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'range' => [
                'nullable',
                'in:today,yesterday,last_7_days,this_month,last_month,this_year,custom',
            ],

            'from' => [
                'nullable',
                'date',
            ],

            'to' => [
                'nullable',
                'date',
                'after_or_equal:from',
            ],

            'warehouse_id' => [
                'nullable',
                'integer',
                'exists:warehouses,id',
            ],
        ]);

        $range = $request->input(
            'range',
            'this_month'
        );

        $warehouseId =
            $request->integer(
                'warehouse_id'
            ) ?: null;

        [
            $from,
            $to,
        ] = $this->resolveDateRange(
                    $range,
                    $request->input('from'),
                    $request->input('to')
                );

        [
            $previousFrom,
            $previousTo,
        ] = $this->getPreviousPeriod(
                    $from,
                    $to
                );

        return Inertia::render(
            'dashboard/accounts-dashboard',
            [
                'filters' => [
                    'range' =>
                        $range,

                    'from' =>
                        $from->toDateString(),

                    'to' =>
                        $to->toDateString(),

                    'warehouse_id' =>
                        $warehouseId,

                    'label' =>
                        $this->getRangeLabel(
                            $from,
                            $to
                        ),
                ],

                'warehouses' =>
                    Warehouse::query()
                        ->orderBy('name')
                        ->get([
                            'id',
                            'name',
                        ]),

                'stats' =>
                    $this->getStats(
                        $from,
                        $to,
                        $previousFrom,
                        $previousTo,
                        $warehouseId
                    ),

                'salesPurchaseChart' =>
                    $this->getSalesPurchaseChart(
                        $from,
                        $to,
                        $warehouseId
                    ),

                'inventory' =>
                    $this->getInventorySummary(
                        $warehouseId
                    ),

                'lowStockProducts' =>
                    $this->getLowStockProducts(
                        $warehouseId
                    ),

                'pendingApprovals' =>
                    $this->getPendingApprovals(
                        $warehouseId
                    ),

                'recentTransactions' =>
                    $this->getRecentTransactions(
                        $warehouseId
                    ),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Dashboard Stats
    |--------------------------------------------------------------------------
    */

    private function getStats(
        Carbon $from,
        Carbon $to,
        Carbon $previousFrom,
        Carbon $previousTo,
        ?int $warehouseId
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Current Sales
        |--------------------------------------------------------------------------
        */

        $salesQuery =
            SalesInvoice::query()
                ->where(
                    'status',
                    'Approved'
                )
                ->whereBetween(
                    'invoice_date',
                    [
                        $from->toDateString(),
                        $to->toDateString(),
                    ]
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                );

        $totalSales =
            (float) (
            clone $salesQuery
            )->sum(
                    'grand_total'
                );

        $receivable =
            (float) (
            clone $salesQuery
            )
                ->where(
                    'due_amount',
                    '>',
                    0
                )
                ->sum(
                    'due_amount'
                );

        $unpaidInvoices =
            (
            clone $salesQuery
            )
                ->where(
                    'due_amount',
                    '>',
                    0
                )
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Previous Sales
        |--------------------------------------------------------------------------
        */

        $previousSales =
            (float) 
            SalesInvoice::query()
                ->where(
                    'status',
                    'Approved'
                )
                ->whereBetween(
                    'invoice_date',
                    [
                        $previousFrom->toDateString(),
                        $previousTo->toDateString(),
                    ]
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                )
                ->sum(
                    'grand_total'
                );

        /*
        |--------------------------------------------------------------------------
        | Current Purchase
        |--------------------------------------------------------------------------
        */

        $purchaseQuery =
            PurchaseOrder::query()
                ->where(
                    'status',
                    'Approved'
                )
                ->whereBetween(
                    'order_date',
                    [
                        $from->toDateString(),
                        $to->toDateString(),
                    ]
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                );

        $totalPurchase =
            (float) (
            clone $purchaseQuery
            )->sum(
                    'grand_total'
                );

        /*
        |--------------------------------------------------------------------------
        | Previous Purchase
        |--------------------------------------------------------------------------
        */

        $previousPurchase =
            (float) 
            PurchaseOrder::query()
                ->where(
                    'status',
                    'Approved'
                )
                ->whereBetween(
                    'order_date',
                    [
                        $previousFrom->toDateString(),
                        $previousTo->toDateString(),
                    ]
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                )
                ->sum(
                    'grand_total'
                );

        /*
        |--------------------------------------------------------------------------
        | Vendor Payable
        |--------------------------------------------------------------------------
        */

        $billQuery =
            Bill::query()
                ->whereBetween(
                    'bill_date',
                    [
                        $from->toDateString(),
                        $to->toDateString(),
                    ]
                )
                ->where(
                    'due_amount',
                    '>',
                    0
                )
                ->when(
                    $warehouseId,
                    function ($query) use ($warehouseId) {
                        $query->whereHas(
                            'purchaseOrder',
                            fn($purchaseOrder) =>
                            $purchaseOrder->where(
                                'warehouse_id',
                                $warehouseId
                            )
                        );
                    }
                );

        $payable =
            (float) (
            clone $billQuery
            )->sum(
                    'due_amount'
                );

        $unpaidBills =
            (
            clone $billQuery
            )->count();

        /*
        |--------------------------------------------------------------------------
        | Stock
        |--------------------------------------------------------------------------
        */

        $stockQuery =
            Stock::query()
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                );

        $stockProducts =
            (
            clone $stockQuery
            )
                ->where(
                    'quantity',
                    '>',
                    0
                )
                ->distinct()
                ->count(
                    'item_id'
                );

        $lowStockProducts =
            $this->lowStockBaseQuery(
                $warehouseId
            )->count();

        /*
        |--------------------------------------------------------------------------
        | Pending Operations
        |--------------------------------------------------------------------------
        */

        $pendingPurchaseOrders =
            PurchaseOrder::query()
                ->where(
                    'status',
                    'Pending'
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                )
                ->count();

        $pendingGrns =
            GoodsReceivedNote::query()
                ->where(
                    'status',
                    'Pending'
                )
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                )
                ->count();

        return [
            'total_sales' =>
                $totalSales,

            'total_purchase' =>
                $totalPurchase,

            'receivable' =>
                $receivable,

            'payable' =>
                $payable,

            'unpaid_invoices' =>
                $unpaidInvoices,

            'unpaid_bills' =>
                $unpaidBills,

            'stock_products' =>
                $stockProducts,

            'low_stock_products' =>
                $lowStockProducts,

            'pending_purchase_orders' =>
                $pendingPurchaseOrders,

            'pending_grns' =>
                $pendingGrns,

            'sales_change' =>
                $this->percentageChange(
                    $totalSales,
                    $previousSales
                ),

            'purchase_change' =>
                $this->percentageChange(
                    $totalPurchase,
                    $previousPurchase
                ),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Sales vs Purchase Chart
    |--------------------------------------------------------------------------
    */

    private function getSalesPurchaseChart(
        Carbon $from,
        Carbon $to,
        ?int $warehouseId
    ): array {
        $useDaily =
            $from->diffInDays(
                $to
            ) <= 31;

        /*
        |--------------------------------------------------------------------------
        | Sales Data
        |--------------------------------------------------------------------------
        */

        if ($useDaily) {
            $sales =
                SalesInvoice::query()
                    ->selectRaw(
                        'DATE(invoice_date) as period'
                    )
                    ->selectRaw(
                        'SUM(grand_total) as total'
                    )
                    ->where(
                        'status',
                        'Approved'
                    )
                    ->whereBetween(
                        'invoice_date',
                        [
                            $from->toDateString(),
                            $to->toDateString(),
                        ]
                    )
                    ->when(
                        $warehouseId,
                        fn($query) =>
                        $query->where(
                            'warehouse_id',
                            $warehouseId
                        )
                    )
                    ->groupByRaw(
                        'DATE(invoice_date)'
                    )
                    ->pluck(
                        'total',
                        'period'
                    );
        } else {
            $sales =
                SalesInvoice::query()
                    ->selectRaw(
                        "DATE_FORMAT(invoice_date, '%Y-%m') as period"
                    )
                    ->selectRaw(
                        'SUM(grand_total) as total'
                    )
                    ->where(
                        'status',
                        'Approved'
                    )
                    ->whereBetween(
                        'invoice_date',
                        [
                            $from->toDateString(),
                            $to->toDateString(),
                        ]
                    )
                    ->when(
                        $warehouseId,
                        fn($query) =>
                        $query->where(
                            'warehouse_id',
                            $warehouseId
                        )
                    )
                    ->groupByRaw(
                        "DATE_FORMAT(invoice_date, '%Y-%m')"
                    )
                    ->pluck(
                        'total',
                        'period'
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Purchase Data
        |--------------------------------------------------------------------------
        */

        if ($useDaily) {
            $purchases =
                PurchaseOrder::query()
                    ->selectRaw(
                        'DATE(order_date) as period'
                    )
                    ->selectRaw(
                        'SUM(grand_total) as total'
                    )
                    ->whereNotIn(
                        'status',
                        [
                            'Pending',
                            'Cancelled',
                        ]
                    )
                    ->whereBetween(
                        'order_date',
                        [
                            $from->toDateString(),
                            $to->toDateString(),
                        ]
                    )
                    ->when(
                        $warehouseId,
                        fn($query) =>
                        $query->where(
                            'warehouse_id',
                            $warehouseId
                        )
                    )
                    ->groupByRaw(
                        'DATE(order_date)'
                    )
                    ->pluck(
                        'total',
                        'period'
                    );
        } else {
            $purchases =
                PurchaseOrder::query()
                    ->selectRaw(
                        "DATE_FORMAT(order_date, '%Y-%m') as period"
                    )
                    ->selectRaw(
                        'SUM(grand_total) as total'
                    )
                    ->whereNotIn(
                        'status',
                        [
                            'Pending',
                            'Cancelled',
                        ]
                    )
                    ->whereBetween(
                        'order_date',
                        [
                            $from->toDateString(),
                            $to->toDateString(),
                        ]
                    )
                    ->when(
                        $warehouseId,
                        fn($query) =>
                        $query->where(
                            'warehouse_id',
                            $warehouseId
                        )
                    )
                    ->groupByRaw(
                        "DATE_FORMAT(order_date, '%Y-%m')"
                    )
                    ->pluck(
                        'total',
                        'period'
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Build Chart
        |--------------------------------------------------------------------------
        */

        $chart = [];

        if ($useDaily) {
            $cursor =
                $from->copy()
                    ->startOfDay();

            $lastDate =
                $to->copy()
                    ->startOfDay();

            while (
                $cursor->lte(
                    $lastDate
                )
            ) {
                $key =
                    $cursor->format(
                        'Y-m-d'
                    );

                $chart[] = [
                    'key' =>
                        $key,

                    'label' =>
                        $cursor->format(
                            'd M'
                        ),

                    'sales' =>
                        round(
                            (float) (
                                $sales[$key]
                                ?? 0
                            ),
                            2
                        ),

                    'purchase' =>
                        round(
                            (float) (
                                $purchases[$key]
                                ?? 0
                            ),
                            2
                        ),
                ];

                $cursor->addDay();
            }
        } else {
            $cursor =
                $from->copy()
                    ->startOfMonth();

            $lastMonth =
                $to->copy()
                    ->startOfMonth();

            while (
                $cursor->lte(
                    $lastMonth
                )
            ) {
                $key =
                    $cursor->format(
                        'Y-m'
                    );

                $chart[] = [
                    'key' =>
                        $key,

                    'label' =>
                        $cursor->format(
                            'M Y'
                        ),

                    'sales' =>
                        round(
                            (float) (
                                $sales[$key]
                                ?? 0
                            ),
                            2
                        ),

                    'purchase' =>
                        round(
                            (float) (
                                $purchases[$key]
                                ?? 0
                            ),
                            2
                        ),
                ];

                $cursor->addMonth();
            }
        }

        return $chart;
    }

    /*
    |--------------------------------------------------------------------------
    | Inventory Summary
    |--------------------------------------------------------------------------
    */

    private function getInventorySummary(
        ?int $warehouseId
    ): array {
        $query =
            Stock::query()
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                );

        $totalQuantity =
            (float) (
            clone $query
            )->sum(
                    'quantity'
                );

        $reservedQuantity =
            (float) (
            clone $query
            )->sum(
                    'reserved_quantity'
                );

        $availableQuantity =
            (float) (
            clone $query
            )
                ->selectRaw(
                    '
                    COALESCE(
                        SUM(
                            quantity - reserved_quantity
                        ),
                        0
                    ) as total
                    '
                )
                ->value(
                    'total'
                );

        $outOfStock =
            (
            clone $query
            )
                ->whereRaw(
                    '
                    (
                        quantity - reserved_quantity
                    ) <= 0
                    '
                )
                ->count();

        $lowStock =
            $this->lowStockBaseQuery(
                $warehouseId
            )->count();

        return [
            'total_quantity' =>
                $totalQuantity,

            'reserved_quantity' =>
                $reservedQuantity,

            'available_quantity' =>
                $availableQuantity,

            'low_stock' =>
                $lowStock,

            'out_of_stock' =>
                $outOfStock,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Low Stock Products
    |--------------------------------------------------------------------------
    */

    private function lowStockBaseQuery(
        ?int $warehouseId
    ): Builder {
        return Stock::query()
            ->join(
                'products',
                'stocks.item_id',
                '=',
                'products.id'
            )
            ->when(
                $warehouseId,
                fn($query) =>
                $query->where(
                    'stocks.warehouse_id',
                    $warehouseId
                )
            )
            ->whereRaw(
                '
                COALESCE(
                    products.reorder_level,
                    0
                ) > 0
                '
            )
            ->whereRaw(
                '
                (
                    stocks.quantity
                    - stocks.reserved_quantity
                )
                <= products.reorder_level
                '
            );
    }

    private function getLowStockProducts(
        ?int $warehouseId
    ): Collection {
        return $this
            ->lowStockBaseQuery(
                $warehouseId
            )
            ->join(
                'warehouses',
                'stocks.warehouse_id',
                '=',
                'warehouses.id'
            )
            ->select([
                'stocks.id',
                'stocks.item_id',
                'stocks.unit',
                'stocks.quantity',
                'stocks.reserved_quantity',
                'products.code as product_code',
                'products.name as product_name',
                'products.reorder_level',
                'warehouses.name as warehouse_name',
            ])
            ->selectRaw(
                '
                (
                    stocks.quantity
                    - stocks.reserved_quantity
                )
                as available_quantity
                '
            )
            ->orderByRaw(
                '
                (
                    stocks.quantity
                    - stocks.reserved_quantity
                ) ASC
                '
            )
            ->limit(
                8
            )
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Pending Approvals
    |--------------------------------------------------------------------------
    */

    private function getPendingApprovals(
        ?int $warehouseId
    ): array {
        return [
            [
                'key' =>
                    'requisition',

                'label' =>
                    'Purchase Requisition',

                'count' =>
                    Requisition::query()
                        ->where(
                            'status',
                            'Pending'
                        )
                        ->count(),
            ],

            [
                'key' =>
                    'purchase_order',

                'label' =>
                    'Purchase Order',

                'count' =>
                    PurchaseOrder::query()
                        ->where(
                            'status',
                            'Pending'
                        )
                        ->when(
                            $warehouseId,
                            fn($query) =>
                            $query->where(
                                'warehouse_id',
                                $warehouseId
                            )
                        )
                        ->count(),
            ],

            [
                'key' =>
                    'grn',

                'label' =>
                    'Goods Receive',

                'count' =>
                    GoodsReceivedNote::query()
                        ->where(
                            'status',
                            'Pending'
                        )
                        ->when(
                            $warehouseId,
                            fn($query) =>
                            $query->where(
                                'warehouse_id',
                                $warehouseId
                            )
                        )
                        ->count(),
            ],

            [
                'key' =>
                    'sales_invoice',

                'label' =>
                    'Sales Invoice',

                'count' =>
                    SalesInvoice::query()
                        ->where(
                            'status',
                            'Pending'
                        )
                        ->when(
                            $warehouseId,
                            fn($query) =>
                            $query->where(
                                'warehouse_id',
                                $warehouseId
                            )
                        )
                        ->count(),
            ],

            [
                'key' =>
                    'purchase_return',

                'label' =>
                    'Purchase Return',

                'count' =>
                    PurchaseReturn::query()
                        ->where(
                            'status',
                            'Draft'
                        )
                        ->when(
                            $warehouseId,
                            fn($query) =>
                            $query->where(
                                'warehouse_id',
                                $warehouseId
                            )
                        )
                        ->count(),
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Recent Transactions
    |--------------------------------------------------------------------------
    */

    private function getRecentTransactions(
        ?int $warehouseId
    ): array {
        $transactions =
            collect();

        /*
        |--------------------------------------------------------------------------
        | Sales Invoice
        |--------------------------------------------------------------------------
        */

        $sales =
            SalesInvoice::query()
                ->with([
                    'client',
                ])
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                )
                ->latest(
                    'invoice_date'
                )
                ->limit(
                    6
                )
                ->get();

        foreach (
            $sales
            as $invoice
        ) {
            $date =
                Carbon::parse(
                    $invoice->invoice_date
                );

            $transactions->push([
                'id' =>
                    'sale-' . $invoice->id,

                'type' =>
                    'Sale',

                'reference' =>
                    $invoice->invoice_no,

                'party' =>
                    $invoice->client?->name
                    ?? '—',

                'amount' =>
                    (float) 
                    $invoice->grand_total,

                'status' =>
                    $invoice->status,

                'date' =>
                    $date->format(
                        'd M Y'
                    ),

                'timestamp' =>
                    $date->timestamp,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Purchase Orders
        |--------------------------------------------------------------------------
        */

        $purchaseOrders =
            PurchaseOrder::query()
                ->with([
                    'vendor',
                ])
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                )
                ->latest(
                    'order_date'
                )
                ->limit(
                    6
                )
                ->get();

        foreach (
            $purchaseOrders
            as $purchaseOrder
        ) {
            $date =
                Carbon::parse(
                    $purchaseOrder->order_date
                );

            $transactions->push([
                'id' =>
                    'purchase-' .
                    $purchaseOrder->id,

                'type' =>
                    'Purchase',

                'reference' =>
                    $purchaseOrder->order_id,

                'party' =>
                    $purchaseOrder->vendor?->name
                    ?? '—',

                'amount' =>
                    (float) 
                    $purchaseOrder->grand_total,

                'status' =>
                    $purchaseOrder->status,

                'date' =>
                    $date->format(
                        'd M Y'
                    ),

                'timestamp' =>
                    $date->timestamp,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Bills
        |--------------------------------------------------------------------------
        */

        $bills =
            Bill::query()
                ->with([
                    'vendor',
                    'purchaseOrder',
                ])
                ->when(
                    $warehouseId,
                    function ($query) use ($warehouseId) {
                        $query->whereHas(
                            'purchaseOrder',
                            fn($purchaseOrder) =>
                            $purchaseOrder->where(
                                'warehouse_id',
                                $warehouseId
                            )
                        );
                    }
                )
                ->latest(
                    'bill_date'
                )
                ->limit(
                    6
                )
                ->get();

        foreach (
            $bills
            as $bill
        ) {
            $date =
                Carbon::parse(
                    $bill->bill_date
                );

            $transactions->push([
                'id' =>
                    'bill-' . $bill->id,

                'type' =>
                    'Bill',

                'reference' =>
                    $bill->bill_no,

                'party' =>
                    $bill->vendor?->name
                    ?? '—',

                'amount' =>
                    (float) 
                    $bill->grand_total,

                'status' =>
                    $bill->payment_status,

                'date' =>
                    $date->format(
                        'd M Y'
                    ),

                'timestamp' =>
                    $date->timestamp,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Purchase Returns
        |--------------------------------------------------------------------------
        */

        $returns =
            PurchaseReturn::query()
                ->with([
                    'vendor',
                ])
                ->when(
                    $warehouseId,
                    fn($query) =>
                    $query->where(
                        'warehouse_id',
                        $warehouseId
                    )
                )
                ->latest(
                    'return_date'
                )
                ->limit(
                    6
                )
                ->get();

        foreach (
            $returns
            as $return
        ) {
            $date =
                Carbon::parse(
                    $return->return_date
                );

            $transactions->push([
                'id' =>
                    'return-' .
                    $return->id,

                'type' =>
                    'Purchase Return',

                'reference' =>
                    $return->return_no,

                'party' =>
                    $return->vendor?->name
                    ?? '—',

                'amount' =>
                    (float) 
                    $return->grand_total,

                'status' =>
                    $return->status,

                'date' =>
                    $date->format(
                        'd M Y'
                    ),

                'timestamp' =>
                    $date->timestamp,
            ]);
        }

        return $transactions
            ->sortByDesc(
                'timestamp'
            )
            ->take(
                10
            )
            ->values()
            ->map(
                function ($transaction) {
                    unset(
                        $transaction[
                            'timestamp'
                        ]
                    );

                    return $transaction;
                }
            )
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Date Range
    |--------------------------------------------------------------------------
    */

    private function resolveDateRange(
        string $range,
        ?string $customFrom,
        ?string $customTo
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Important
        |--------------------------------------------------------------------------
        |
        | Use Carbon::now() instead of Laravel's now() helper here.
        |
        | In your application, now() is returning CarbonImmutable.
        | The dashboard uses mutable Carbon because chart generation uses
        | addDay() and addMonth().
        |
        */

        $today =
            Carbon::now();

        return match (
        $range
        ) {
            'today' => [
                $today
                    ->copy()
                    ->startOfDay(),

                $today
                    ->copy()
                    ->endOfDay(),
            ],

            'yesterday' => [
                $today
                    ->copy()
                    ->subDay()
                    ->startOfDay(),

                $today
                    ->copy()
                    ->subDay()
                    ->endOfDay(),
            ],

            'last_7_days' => [
                $today
                    ->copy()
                    ->subDays(
                        6
                    )
                    ->startOfDay(),

                $today
                    ->copy()
                    ->endOfDay(),
            ],

            'last_month' => [
                $today
                    ->copy()
                    ->subMonthNoOverflow()
                    ->startOfMonth()
                    ->startOfDay(),

                $today
                    ->copy()
                    ->subMonthNoOverflow()
                    ->endOfMonth()
                    ->endOfDay(),
            ],

            'this_year' => [
                $today
                    ->copy()
                    ->startOfYear()
                    ->startOfDay(),

                $today
                    ->copy()
                    ->endOfDay(),
            ],

            'custom' => [
                $customFrom
                ? Carbon::parse(
                    $customFrom
                )->startOfDay()
                : $today
                    ->copy()
                    ->startOfMonth()
                    ->startOfDay(),

                $customTo
                ? Carbon::parse(
                    $customTo
                )->endOfDay()
                : $today
                    ->copy()
                    ->endOfDay(),
            ],

            default => [
                $today
                    ->copy()
                    ->startOfMonth()
                    ->startOfDay(),

                $today
                    ->copy()
                    ->endOfDay(),
            ],
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Previous Period
    |--------------------------------------------------------------------------
    */

    private function getPreviousPeriod(
        Carbon $from,
        Carbon $to
    ): array {
        $days =
            $from->diffInDays(
                $to
            ) + 1;

        $previousTo =
            $from->copy()
                ->subDay()
                ->endOfDay();

        $previousFrom =
            $previousTo
                ->copy()
                ->subDays(
                    $days - 1
                )
                ->startOfDay();

        return [
            $previousFrom,
            $previousTo,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Percentage Change
    |--------------------------------------------------------------------------
    */

    private function percentageChange(
        float $current,
        float $previous
    ): float {
        if (
            $previous <= 0
        ) {
            return $current > 0
                ? 100
                : 0;
        }

        return round(
            (
                (
                    $current
                    - $previous
                )
                / $previous
            )
            * 100,
            1
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Range Label
    |--------------------------------------------------------------------------
    */

    private function getRangeLabel(
        Carbon $from,
        Carbon $to
    ): string {
        if (
            $from->isSameDay(
                $to
            )
        ) {
            return $from->format(
                'd M Y'
            );
        }

        return sprintf(
            '%s - %s',
            $from->format(
                'd M Y'
            ),
            $to->format(
                'd M Y'
            )
        );
    }
}