<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Product;
use App\Models\Vendor;
use App\Models\Warehouse;
use App\Models\PurchaseOrder;
use App\Models\PurchaseItem;
use App\Models\PurchaseReturnItem;
use App\Models\PurchaseReturn;
use App\Services\InventoryStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\FinanceService;
use App\Models\Stock;
use App\Models\StockMovement;

class PurchaseReturnController extends Controller
{

    private const RETURNABLE_PO_STATUSES = [
        'Received',
        'Partial',
    ];

    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {

        $returns =
            PurchaseReturn::query()
            ->with([
                'vendor:id,vendor_id,name',

                'warehouse:id,name',

                'purchaseOrder:id,order_id',

            ])
            ->when(
                $request->search,
                function ($query) use ($request) {

                    $query->where(
                        'return_no',
                        'like',
                        "%{$request->search}%"
                    )

                        ->orWhereHas(
                            'vendor',
                            function ($q) use ($request) {

                                $q->where(
                                    'name',
                                    'like',
                                    "%{$request->search}%"
                                );
                            }
                        )

                        ->orWhereHas(
                            'purchaseOrder',
                            function ($q) use ($request) {

                                $q->where(
                                    'order_id',
                                    'like',
                                    "%{$request->search}%"
                                );
                            }
                        );
                }
            )
            ->when(
                $request->status,
                fn($q) =>
                $q->where(
                    'status',
                    $request->status
                )
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();



        return Inertia::render(
            'operations/purchase-return/index',
            [

                'returns' => $returns,


                'filters' =>
                $request->only([
                    'search',
                    'status'
                ])

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

        return Inertia::render(
            'operations/purchase-return/create-purchase-return',
            [

                'vendors' =>
                Vendor::select(
                    'id',
                    'vendor_id',
                    'name'
                )
                    ->orderBy('name')
                    ->get(),



                'warehouses' =>
                Warehouse::where(
                    'status',
                    true
                )
                    ->select(
                        'id',
                        'name'
                    )
                    ->orderBy('name')
                    ->get(),

            ]
        );
    }







    /*
    |--------------------------------------------------------------------------
    | Purchase Order Search
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
            ->whereIn(
                'status',
                self::RETURNABLE_PO_STATUSES
            )
            ->whereNotNull(
                'warehouse_id'
            )
            ->whereHas(
                'purchaseItems.goodsReceivedNoteItems'
            )
            ->with([
                'vendor:id,vendor_id,name',

                'warehouse:id,name',
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
        | Remove PO Where All Received Quantity Already Returned
        |--------------------------------------------------------------------------
        */

        $purchaseOrders =
            $purchaseOrders
            ->filter(function (PurchaseOrder $purchaseOrder) {


                foreach ($purchaseOrder->purchaseItems as $item) {


                    $receivedQuantity =
                        $item
                        ->goodsReceivedNoteItems
                        ->sum('quantity');


                    if ($receivedQuantity > 0) {

                        return true;
                    }
                }


                return false;
            })
            ->take(20)
            ->map(
                function (PurchaseOrder $purchaseOrder) {


                    return [

                        'id' =>
                        $purchaseOrder->id,


                        'order_id' =>
                        $purchaseOrder->order_id,


                        'label' =>
                        $purchaseOrder->order_id,


                        'secondary' =>
                        $purchaseOrder
                            ->vendor
                            ?->name
                            ?? '',


                        'status' =>
                        $purchaseOrder->status,


                        'order_date' =>
                        $purchaseOrder->order_date,


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
    | Load Purchase Order Items
    |--------------------------------------------------------------------------
    */

    public function getPurchaseOrderItems(
        Request $request
    ) {

        $purchaseOrderId =
            $request->integer(
                'purchase_order_id'
            );


        $purchaseOrder =
            PurchaseOrder::query()
            ->with([

                'vendor:id,vendor_id,name',

                'warehouse:id,name',

                'purchaseItems.product:id,code,name',

                'purchaseItems.goodsReceivedNoteItems:id,purchase_item_id,quantity',

            ])
            ->findOrFail(
                $purchaseOrderId
            );



        /*
        |--------------------------------------------------------------------------
        | Already Returned Quantity
        |--------------------------------------------------------------------------
        */

        $returnedQuantities =
            PurchaseReturnItem::query()

            ->whereIn(
                'product_id',
                $purchaseOrder
                    ->purchaseItems
                    ->pluck('item_id')
            )

            ->whereHas(
                'purchaseReturn',
                function ($query) use ($purchaseOrder) {

                    $query->where(
                        'purchase_order_id',
                        $purchaseOrder->id
                    );
                }
            )

            ->selectRaw(
                'product_id, SUM(quantity) as total'
            )

            ->groupBy(
                'product_id'
            )

            ->pluck(
                'total',
                'product_id'
            );



        return response()->json([


            'meta' => [

                'id' =>
                $purchaseOrder->id,


                'order_id' =>
                $purchaseOrder->order_id,


                'vendor' =>
                $purchaseOrder->vendor,


                'warehouse' =>
                $purchaseOrder->warehouse,

            ],



            'items' =>

            $purchaseOrder
                ->purchaseItems

                ->map(
                    function ($item) use ($returnedQuantities) {


                        $receivedQuantity =
                            $item
                            ->goodsReceivedNoteItems
                            ->sum('quantity');



                        $returnedQuantity =
                            (float) (
                                $returnedQuantities[$item->item_id]
                                ?? 0
                            );



                        $returnableQuantity =
                            max(
                                0,
                                $receivedQuantity -
                                    $returnedQuantity
                            );



                        return [

                            'purchase_item_id' =>
                            $item->id,


                            'product_id' =>
                            $item->item_id,


                            'item_id' =>
                            $item->item_id,


                            'code' =>
                            $item->product?->code,


                            'name' =>
                            $item->product?->name,


                            'unit' =>
                            $item->unit,


                            'po_quantity' =>
                            (float) $item->quantity,


                            'received_quantity' =>
                            (float) $receivedQuantity,


                            'returned_quantity' =>
                            (float) $returnedQuantity,


                            'quantity' =>
                            (float) $returnableQuantity,


                            'unit_price' =>
                            (float) $item->unit_price,


                            'tax_amount' =>
                            (float) (
                                $item->tax_amount
                                ?? 0
                            ),


                            'line_total' =>
                            (float)
                            (
                                $returnableQuantity *
                                $item->unit_price
                            ),

                        ];
                    }
                )

                ->filter(
                    fn($item) =>
                    $item['quantity'] > 0
                )

                ->values(),


        ]);
    }





    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ) {


        $data =
            $request->validate([


                'purchase_order_id' =>
                [
                    'required',
                    'exists:purchase_orders,id'
                ],


                'bill_id' =>
                [
                    'nullable',
                    'exists:bills,id'
                ],


                'vendor_id' =>
                [
                    'required',
                    'exists:vendors,id'
                ],



                'warehouse_id' =>
                [
                    'required',
                    'exists:warehouses,id'
                ],



                'return_date' =>
                [
                    'required',
                    'date'
                ],



                'document' =>
                [
                    'nullable',
                    'file'
                ],



                'note' =>
                [
                    'nullable',
                    'string'
                ],



                'items' =>
                [
                    'required',
                    'array',
                    'min:1'
                ],



                'items.*.product_id' =>
                [
                    'required',
                    'exists:products,id'
                ],



                'items.*.quantity' =>
                [
                    'required',
                    'numeric',
                    'min:.01'
                ],



                'items.*.unit_price' =>
                [
                    'required',
                    'numeric'
                ],

            ]);





        DB::transaction(function () use ($request, $data) {



            $document = null;



            if (
                $request->hasFile('document')
            ) {

                $document =
                    File::upload(
                        $request->file('document'),
                        'PurchaseReturn'
                    );
            }



            $subtotal = 0;



            foreach (
                $data['items']
                as
                $item
            ) {

                $subtotal +=
                    $item['quantity']
                    *
                    $item['unit_price'];
            }





            $return =
                PurchaseReturn::create([


                    'return_no' =>
                    'PR-'
                        .
                        now()
                        ->format(
                            'YmdHis'
                        ),



                    'purchase_order_id' =>
                    $data['purchase_order_id'],



                    'bill_id' =>
                    $data['bill_id']
                        ??
                        null,



                    'vendor_id' =>
                    $data['vendor_id'],



                    'warehouse_id' =>
                    $data['warehouse_id'],



                    'return_date' =>
                    $data['return_date'],



                    'subtotal' =>
                    $subtotal,



                    'grand_total' =>
                    $subtotal,



                    'document' =>
                    $document,



                    'note' =>
                    $data['note']
                        ??
                        null,



                    'created_by' =>
                    auth()->id(),


                    'status' =>
                    'Draft'


                ]);





            foreach (
                $data['items']
                as
                $item
            ) {

                $return
                    ->items()
                    ->create([


                        'product_id' =>
                        $item['product_id'],


                        'quantity' =>
                        $item['quantity'],


                        'unit_price' =>
                        $item['unit_price'],


                        'line_total' =>
                        $item['quantity']
                            *
                            $item['unit_price'],


                    ]);
            }
        });



        return redirect()
            ->route(
                'purchase-returns.index'
            );
    }





    /*
    |--------------------------------------------------------------------------
    | Approve
    |--------------------------------------------------------------------------
    */

    public function approve(
        PurchaseReturn $purchaseReturn
    ) {

        abort_if(
            $purchaseReturn->status !== 'Draft',
            403
        );



        DB::transaction(function () use ($purchaseReturn) {



            $purchaseReturn
                ->load('items');



            foreach (
                $purchaseReturn->items
                as
                $item
            ) {

                app(
                    InventoryStockService::class
                )
                    ->removeStock(

                        $purchaseReturn->warehouse_id,

                        $item->product_id,

                        $item->quantity,

                        'PurchaseReturn',

                        $purchaseReturn->id

                    );
            }




            Ledger::create([


                'party_type' =>
                'Vendor',


                'party_id' =>
                $purchaseReturn->vendor_id,


                'transaction_type' =>
                'PurchaseReturn',


                'transaction_id' =>
                $purchaseReturn->id,


                'date' =>
                $purchaseReturn->return_date,


                'amount' =>
                $purchaseReturn->grand_total,


                'nature' =>
                'debit',


            ]);





            $purchaseReturn->update([


                'status' =>
                'Approved',


                'approved_by' =>
                auth()->id(),


            ]);
        });



        return back();
    }





    /*
    |--------------------------------------------------------------------------
    | Destroy
    |--------------------------------------------------------------------------
    */

    public function destroy(
        PurchaseReturn $purchaseReturn
    ) {

        abort_if(
            $purchaseReturn->status !== 'Draft',
            403
        );



        $purchaseReturn
            ->items()
            ->delete();



        $purchaseReturn
            ->delete();



        return back();
    }

    public function edit(
        PurchaseReturn $purchaseReturn
    ) {
        abort_if(
            $purchaseReturn->status !== 'Draft',
            403,
            'Only draft purchase return can be edited.'
        );


        $purchaseReturn->load([
            'vendor:id,vendor_id,name',

            'warehouse:id,name',

            'purchaseOrder:id,order_id',

            'items.product:id,code,name',
        ]);


        return inertia(
            'operations/purchase-return/edit-purchase-return',
            [
                'purchaseReturn' =>
                $purchaseReturn,
            ]
        );
    }

    public function update(
        Request $request,
        PurchaseReturn $purchaseReturn
    ) {

        abort_if(
            $purchaseReturn->status !== 'Draft',
            403,
            'Only draft purchase return can be updated.'
        );


        $validated =
            $request->validate([

                'return_date' =>
                [
                    'required',
                    'date',
                ],


                'vendor_id' =>
                [
                    'required',
                    'exists:vendors,id',
                ],


                'warehouse_id' =>
                [
                    'required',
                    'exists:warehouses,id',
                ],


                'note' =>
                [
                    'nullable',
                    'string',
                ],


                'items' =>
                [
                    'required',
                    'array',
                    'min:1',
                ],


                'items.*.product_id' =>
                [
                    'required',
                    'exists:products,id',
                ],


                'items.*.quantity' =>
                [
                    'required',
                    'numeric',
                    'gt:0',
                ],


                'items.*.unit_price' =>
                [
                    'required',
                    'numeric',
                    'gte:0',
                ],


                'items.*.tax_amount' =>
                [
                    'nullable',
                    'numeric',
                    'gte:0',
                ],


                'items.*.line_total' =>
                [
                    'required',
                    'numeric',
                    'gte:0',
                ],

            ]);



        DB::transaction(
            function () use ($validated, $purchaseReturn) {


                $subtotal =
                    collect(
                        $validated['items']
                    )
                    ->sum(
                        'line_total'
                    );


                $purchaseReturn->update([

                    'vendor_id' =>
                    $validated['vendor_id'],


                    'warehouse_id' =>
                    $validated['warehouse_id'],


                    'return_date' =>
                    $validated['return_date'],


                    'subtotal' =>
                    $subtotal,


                    'grand_total' =>
                    $subtotal,


                    'note' =>
                    $validated['note'] ?? null,

                ]);



                $purchaseReturn
                    ->items()
                    ->delete();



                foreach (
                    $validated['items']
                    as $item
                ) {

                    $purchaseReturn
                        ->items()
                        ->create([

                            'product_id' =>
                            $item['product_id'],


                            'quantity' =>
                            $item['quantity'],


                            'unit_price' =>
                            $item['unit_price'],


                            'tax_amount' =>
                            $item['tax_amount'] ?? 0,


                            'line_total' =>
                            $item['line_total'],

                        ]);
                }
            }
        );


        return redirect()
            ->route(
                'purchase-returns.show',
                $purchaseReturn
            )
            ->with(
                'success',
                'Purchase return updated successfully.'
            );
    }

    public function show(
        PurchaseReturn $purchaseReturn
    ) {

        $purchaseReturn->load([

            /*
            |--------------------------------------------------------------------------
            | Header Data
            |--------------------------------------------------------------------------
            */

            'vendor:id,vendor_id,name,phone,address',

            'warehouse:id,name',


            /*
            |--------------------------------------------------------------------------
            | Related Purchase Order
            |--------------------------------------------------------------------------
            */

            'purchaseOrder:id,order_id',


            /*
            |--------------------------------------------------------------------------
            | Items
            |--------------------------------------------------------------------------
            */

            'items.product:id,code,name',


            /*
            |--------------------------------------------------------------------------
            | Users
            |--------------------------------------------------------------------------
            */

            'createdBy:id,name,employee_id',

            'approvedBy:id,name,employee_id',

            'debitNote:id,purchase_return_id,debit_note_no',

            'receivable:id,source_type,source_id',

        ]);



        return inertia(
            'operations/purchase-return/show-purchase-return',
            [

                'purchaseReturn' =>
                $purchaseReturn,

            ]
        );
    }



    public function updateStatus(
        Request $request,
        PurchaseReturn $purchaseReturn
    ) {

        if (
            $purchaseReturn->status !== 'Draft'
        ) {

            return back()
                ->with(
                    'error',
                    'Only draft purchase return status can be changed.'
                );
        }



        $validated =
            $request->validate([

                'status' => [
                    'required',
                    'in:Approved,Cancelled',
                ],

            ]);



        DB::transaction(function () use ($validated, $purchaseReturn) {


            /*
            |--------------------------------------------------------------------------
            | Cancelled
            |--------------------------------------------------------------------------
            */

            if (
                $validated['status'] === 'Cancelled'
            ) {


                $purchaseReturn->update([

                    'status' =>
                    'Cancelled',

                ]);


                return;
            }



            /*
            |--------------------------------------------------------------------------
            | Approved
            |--------------------------------------------------------------------------
            */


            $purchaseReturn->load([
                'bill',
                'items',
            ]);



            /*
            |--------------------------------------------------------------------------
            | Reverse Stock
            |--------------------------------------------------------------------------
            */


            $this->postPurchaseReturn($purchaseReturn);

            /*
            |--------------------------------------------------------------------------
            | Update Purchase Return Status
            |--------------------------------------------------------------------------
            */


            $purchaseReturn->update([

                'status' =>
                'Approved',


                'approved_by' =>
                auth()->id(),

            ]);

            app(FinanceService::class)
                ->createVendorReceivableForPurchaseReturn($purchaseReturn);
        });



        return back()
            ->with(
                'success',
                'Purchase return approved successfully.'
            );
    }


    private function postPurchaseReturn(
        PurchaseReturn $purchaseReturn
    ): void {


        $purchaseReturn->load([
            'items',
            'warehouse',
        ]);



        foreach (
            $purchaseReturn->items as $item
        ) {


            $stock =
                Stock::query()
                ->where(
                    'warehouse_id',
                    $purchaseReturn->warehouse_id
                )
                ->where(
                    'item_id',
                    $item->product_id
                )
                ->first();



            if (
                !$stock
            ) {

                throw new \Exception(
                    "Stock not found for product ID {$item->product_id}"
                );
            }



            /*
            |--------------------------------------------------------------------------
            | Check Available Stock
            |--------------------------------------------------------------------------
            */


            if (
                $stock->quantity <
                $item->quantity
            ) {

                throw new \Exception(
                    "Insufficient stock for product ID {$item->product_id}"
                );
            }



            /*
            |--------------------------------------------------------------------------
            | Reduce Stock
            |--------------------------------------------------------------------------
            */


            $stock->decrement(
                'quantity',
                $item->quantity
            );



            /*
            |--------------------------------------------------------------------------
            | Create Stock Movement
            |--------------------------------------------------------------------------
            */


            StockMovement::create([

                'warehouse_id' =>
                $purchaseReturn->warehouse_id,


                'item_id' =>
                $item->product_id,


                'unit' =>
                $item->product?->unit?->name,


                'quantity' =>
                -1 * $item->quantity,


                'movement' =>
                'PurchaseReturn',


                'reference_type' =>
                PurchaseReturn::class,


                'reference_id' =>
                $purchaseReturn->id,


                'remarks' =>
                "Purchase Return {$purchaseReturn->return_no}",


                'created_by' =>
                auth()->id(),

            ]);
        }
    }
}
