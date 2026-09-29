<?php

namespace App\Http\Controllers;

use App\Services\FinanceService;

use App\Actions\File;
use App\Models\Bill;
use App\Models\Currency;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;
use App\Models\Configure;
use Barryvdh\DomPDF\Facade\Pdf;

class BillController extends Controller
{ /* |-------------------------------------------------------------------------- | Index |-------------------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorizePermission("bill.list");
        $query = Bill::query()->with([
            'vendor:id,vendor_id,name',
            'purchaseOrder:id,order_id',
            'goodsReceivedNote:id,grn_no',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Bill No
        |--------------------------------------------------------------------------
        */

        if ($request->filled('bill_no')) {
            $billNo =
                trim(
                    (string) $request->input(
                        'bill_no'
                    )
                );

            $query->where(
                'bill_no',
                'like',
                "%{$billNo}%"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Payment Status
        |--------------------------------------------------------------------------
        */

        if ($request->filled('payment_status')) {
            $query->where(
                'payment_status',
                $request->input(
                    'payment_status'
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        $query->orderByDesc(
            'created_at'
        );

        /*
        |--------------------------------------------------------------------------
        | Count
        |--------------------------------------------------------------------------
        */

        $numberOfBills =
            (clone $query)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $bills =
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
            ->select([
                'id',
                'symbol',
                'exchange_rate',
            ])
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $hasFilters =
            $request->filled(
                'bill_no'
            ) ||
            $request->filled(
                'payment_status'
            );

        /*
        |--------------------------------------------------------------------------
        | Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/bill/index',
            [
                'data' =>
                $bills,

                'numberOfBills' =>
                $numberOfBills,

                'activeCurrency' =>
                $activeCurrency,

                'hasFilters' =>
                $hasFilters,

                'filters' => [
                    'bill_no' =>
                    $request->input(
                        'bill_no'
                    ),

                    'payment_status' =>
                    $request->input(
                        'payment_status'
                    ),
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {

        $this->authorizePermission("bill.view");


        $bill =
            Bill::query()
            ->with([
                'vendor:id,vendor_id,name',

                'purchaseOrder',

                'goodsReceivedNote',

                'createdBy:id,name,employee_id',

                'items.product:id,code,name',

                'items.purchaseItem',

                'items.goodsReceivedNoteItem',

                /*
                    |--------------------------------------------------------------------------
                    | Payments
                    |--------------------------------------------------------------------------
                    */

                'payments' =>
                function ($query) {
                    $query
                        ->orderByDesc(
                            'date'
                        )
                        ->orderByDesc(
                            'id'
                        );
                },

                'payments.createdBy:id,name,employee_id',
                'payments.financeTransaction:id,payment_type,payment_id,transaction_no',
            ])
            ->findOrFail(
                $id
            );

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
            'operations/bill/show-bill',
            [
                'bill' =>
                $this->billData(
                    $bill
                ),

                'canEdit' =>
                $this->canEdit(
                    $bill
                ),

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

    public function edit($id)
    {
        $this->authorizePermission("bill.edit");

        $bill =
            Bill::query()
            ->with([
                'vendor:id,vendor_id,name',

                'purchaseOrder',

                'goodsReceivedNote',

                'createdBy:id,name,employee_id',

                'items.product:id,code,name',
            ])
            ->findOrFail(
                $id
            );

        /*
        |--------------------------------------------------------------------------
        | Editing Guard
        |--------------------------------------------------------------------------
        |
        | Do not allow editing once a payment has started.
        |
        */

        if (!$this->canEdit($bill)) {
            return redirect()
                ->route(
                    'bill.show',
                    $bill->id
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                        'This bill cannot be edited because payment has already started.',

                        'type' =>
                        'error',
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
            'operations/bill/edit-bill',
            [
                'bill' =>
                $this->billData(
                    $bill
                ),

                'activeCurrency' =>
                $activeCurrency,
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

        $this->authorizePermission("bill.edit");


        $bill =
            Bill::query()
            ->findOrFail(
                $id
            );

        /*
        |--------------------------------------------------------------------------
        | Editing Guard
        |--------------------------------------------------------------------------
        */

        if (!$this->canEdit($bill)) {
            throw ValidationException::withMessages([
                'bill' =>
                'This bill cannot be edited because payment has already started.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validated =
            $request->validate([
                'bill_date' => [
                    'required',
                    'date_format:Y-m-d',
                ],

                'due_date' => [
                    'nullable',
                    'date_format:Y-m-d',
                    'after_or_equal:bill_date',
                ],

                'attachment' => [
                    'nullable',
                    'file',
                    'mimes:jpeg,jpg,png,pdf',
                    'max:5120',
                ],

                'remove_attachment' => [
                    'nullable',
                    'boolean',
                ],
            ]);

        $oldAttachment =
            $bill->attachments;

        $newAttachment =
            null;

        try {
            /*
            |--------------------------------------------------------------------------
            | Upload New Attachment
            |--------------------------------------------------------------------------
            */

            if (
                $request->hasFile(
                    'attachment'
                )
            ) {
                $newAttachment =
                    File::upload(
                        $request->file(
                            'attachment'
                        ),
                        'Bill'
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Update
            |--------------------------------------------------------------------------
            */

            DB::transaction(
                function () use ($bill, $validated, $request, $newAttachment) {
                    $lockedBill =
                        Bill::query()
                        ->lockForUpdate()
                        ->findOrFail(
                            $bill->id
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Recheck After Lock
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !$this->canEdit(
                            $lockedBill
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'bill' =>
                            'This bill cannot be edited because payment has already started.',
                        ]);
                    }

                    $attachment =
                        $lockedBill
                        ->attachments;

                    /*
                    |--------------------------------------------------------------------------
                    | Remove Existing
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $request->boolean(
                            'remove_attachment'
                        )
                    ) {
                        $attachment =
                            null;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Replace Existing
                    |--------------------------------------------------------------------------
                    */

                    if ($newAttachment) {
                        $attachment =
                            $newAttachment;
                    }

                    $lockedBill->update([
                        'bill_date' =>
                        $validated['bill_date'],

                        'due_date' =>
                        $validated['due_date'] ?? null,

                        'attachments' =>
                        $attachment,
                    ]);

                    app(FinanceService::class)->createPayableForBill($lockedBill);
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Delete Old File
            |--------------------------------------------------------------------------
            |
            | Delete only after successful database update.
            |
            */

            if (
                $oldAttachment &&
                (
                    $newAttachment ||
                    $request->boolean(
                        'remove_attachment'
                    )
                )
            ) {
                File::deleteFile(
                    $oldAttachment
                );
            }

            return redirect()
                ->route(
                    'bill.show',
                    $bill->id
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                        "Bill {$bill->bill_no} updated successfully.",

                        'type' =>
                        'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            /*
            |--------------------------------------------------------------------------
            | Cleanup Newly Uploaded File
            |--------------------------------------------------------------------------
            */

            if ($newAttachment) {
                File::deleteFile(
                    $newAttachment
                );
            }

            throw $exception;
        } catch (
            Throwable $exception
        ) {
            /*
            |--------------------------------------------------------------------------
            | Cleanup Newly Uploaded File
            |--------------------------------------------------------------------------
            */

            if ($newAttachment) {
                File::deleteFile(
                    $newAttachment
                );
            }

            Log::error(
                'Bill update failed.',
                [
                    'bill_id' =>
                    $bill->id,

                    'message' =>
                    $exception
                        ->getMessage(),

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
                        'Failed to update bill. Please try again.',

                        'type' =>
                        'error',
                    ]
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Can Edit
    |--------------------------------------------------------------------------
    |
    | Bill source values are generated from GRN.
    |
    | Editing is allowed only before any payment.
    |
    */

    private function canEdit(
        Bill $bill
    ): bool {
        return
            $bill->payment_status ===
            'Due' &&
            (float) $bill
                ->paid_amount <=
            0;
    }

    /*
    |--------------------------------------------------------------------------
    | Bill Data
    |--------------------------------------------------------------------------
    */

    private function billData(
        Bill $bill
    ): array {
        return [
            'id' =>
            $bill->id,

            'bill_no' =>
            $bill->bill_no,

            'goods_received_note_id' =>
            $bill
                ->goods_received_note_id,

            'purchase_order_id' =>
            $bill
                ->purchase_order_id,

            'vendor_id' =>
            $bill->vendor_id,

            /*
            |--------------------------------------------------------------------------
            | Amounts
            |--------------------------------------------------------------------------
            */

            'sub_total' =>
            (float) $bill
                ->sub_total,

            'total_tax' =>
            (float) $bill
                ->total_tax,

            'total_discount' =>
            (float) $bill
                ->total_discount,

            'shipping_cost' =>
            (float) $bill
                ->shipping_cost,

            'grand_total' =>
            (float) $bill
                ->grand_total,

            'paid_amount' =>
            (float) $bill
                ->paid_amount,

            'due_amount' =>
            (float) $bill
                ->due_amount,

            'payment_status' =>
            $bill
                ->payment_status,

            /*
            |--------------------------------------------------------------------------
            | Dates
            |--------------------------------------------------------------------------
            */

            'bill_date' =>
            $bill
                ->bill_date
                ?->format(
                    'Y-m-d'
                ),

            'due_date' =>
            $bill
                ->due_date
                ?->format(
                    'Y-m-d'
                ),

            'created_at' =>
            $bill
                ->created_at
                ?->toISOString(),

            /*
            |--------------------------------------------------------------------------
            | Attachment
            |--------------------------------------------------------------------------
            */

            'attachments' =>
            $bill
                ->attachments,

            /*
            |--------------------------------------------------------------------------
            | Vendor
            |--------------------------------------------------------------------------
            */

            'vendor' =>
            $bill->vendor
                ? [
                    'id' =>
                    $bill
                        ->vendor
                        ->id,

                    'vendor_id' =>
                    $bill
                        ->vendor
                        ->vendor_id,

                    'name' =>
                    $bill
                        ->vendor
                        ->name,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | Purchase Order
            |--------------------------------------------------------------------------
            */

            'purchase_order' =>
            $bill->purchaseOrder
                ? [
                    'id' =>
                    $bill
                        ->purchaseOrder
                        ->id,

                    'order_id' =>
                    $bill
                        ->purchaseOrder
                        ->order_id,

                    'status' =>
                    $bill
                        ->purchaseOrder
                        ->status ??
                        null,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | GRN
            |--------------------------------------------------------------------------
            */

            'goods_received_note' =>
            $bill
                ->goodsReceivedNote
                ? [
                    'id' =>
                    $bill
                        ->goodsReceivedNote
                        ->id,

                    'grn_no' =>
                    $bill
                        ->goodsReceivedNote
                        ->grn_no,

                    'status' =>
                    $bill
                        ->goodsReceivedNote
                        ->status ??
                        null,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | Created By
            |--------------------------------------------------------------------------
            */

            'created_by_user' =>
            $bill
                ->createdBy
                ? [
                    'id' =>
                    $bill
                        ->createdBy
                        ->id,

                    'name' =>
                    $bill
                        ->createdBy
                        ->name,

                    'employee_id' =>
                    $bill
                        ->createdBy
                        ->employee_id,
                ]
                : null,

            /*
            |--------------------------------------------------------------------------
            | Bill Items
            |--------------------------------------------------------------------------
            */

            'items' =>
            $bill
                ->items
                ->map(
                    function ($item) {
                        $taxes =
                            $item
                            ->taxes;

                        if (
                            !is_array(
                                $taxes
                            )
                        ) {
                            $taxes =
                                [];
                        }

                        return [
                            'id' =>
                            $item->id,

                            'goods_received_note_item_id' =>
                            $item
                                ->goods_received_note_item_id,

                            'purchase_item_id' =>
                            $item
                                ->purchase_item_id,

                            'item_id' =>
                            (int) $item
                                ->item_id,

                            'code' =>
                            $item
                                ->product
                                ?->code ??
                                '',

                            'name' =>
                            $item
                                ->product
                                ?->name ??
                                'N/A',

                            'unit' =>
                            $item
                                ->unit,

                            'quantity' =>
                            (float) $item
                                ->quantity,

                            'unit_price' =>
                            (float) $item
                                ->unit_price,

                            'discount' =>
                            (float) $item
                                ->discount,

                            'taxes' =>
                            collect(
                                $taxes
                            )
                                ->map(
                                    function ($tax) {
                                        return [
                                            'tax_id' =>
                                            isset(
                                                $tax['tax_id']
                                            )
                                                ? (int) $tax['tax_id']
                                                : null,

                                            'name' =>
                                            $tax['name'] ??
                                                'Tax',

                                            'rate' =>
                                            (float) (
                                                $tax['rate'] ??
                                                0
                                            ),

                                            'tax_amount' =>
                                            (float) (
                                                $tax['tax_amount'] ??
                                                0
                                            ),
                                        ];
                                    }
                                )
                                ->values()
                                ->all(),

                            'total_tax' =>
                            (float) $item
                                ->total_tax,

                            'total_amount' =>
                            (float) $item
                                ->total_amount,
                        ];
                    }
                )
                ->values()
                ->all(),

            /*
            |--------------------------------------------------------------------------
            | Payments
            |--------------------------------------------------------------------------
            */

            'payments' =>
            $bill
                ->payments
                ->map(
                    function ($payment) {
                        return [
                            'id' =>
                            $payment->id,

                            'date' =>
                            $payment
                                ->date
                                ?->format(
                                    'Y-m-d'
                                ),

                            'pay_amount' =>
                            (float) (
                                $payment
                                ->pay_amount ??
                                0
                            ),

                            'account_id' =>
                            $payment
                                ->account_id,

                            'reference' =>
                            $payment
                                ->reference,

                            'transaction_no' =>
                            $payment
                                ->financeTransaction
                                ?->transaction_no,

                            'description' =>
                            $payment
                                ->description,

                            'attachment' =>
                            $payment
                                ->attachment,

                            'created_at' =>
                            $payment
                                ->created_at
                                ?->toISOString(),

                            'created_by_user' =>
                            $payment
                                ->createdBy
                                ? [
                                    'id' =>
                                    $payment
                                        ->createdBy
                                        ->id,

                                    'name' =>
                                    $payment
                                        ->createdBy
                                        ->name,

                                    'employee_id' =>
                                    $payment
                                        ->createdBy
                                        ->employee_id,
                                ]
                                : null,
                        ];
                    }
                )
                ->values()
                ->all(),
        ];
    }

    /*
|--------------------------------------------------------------------------
| Download PDF
|--------------------------------------------------------------------------
*/

    public function downloadPdf($id)
    {
        $bill =
            Bill::query()
            ->with([
                'vendor:id,vendor_id,name',

                'purchaseOrder:id,order_id,requisition_id,warehouse_id',

                'purchaseOrder.requisition:id,requisition_id',

                'purchaseOrder.warehouse:id,name',

                'goodsReceivedNote:id,grn_no,warehouse_id,received_date',

                'goodsReceivedNote.warehouse:id,name',

                'createdBy:id,name,employee_id',

                'items.product:id,code,name',

                'items.purchaseItem',

                'items.goodsReceivedNoteItem',
            ])
            ->findOrFail(
                $id
            );

        $data = [
            'bill' =>
            $bill,

            'configure' =>
            Configure::first(),
        ];

        $pdf =
            Pdf::loadView(
                'pdf.bill',
                $data
            );

        return $pdf->download(
            "bill_{$bill->bill_no}.pdf"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Stream PDF
    |--------------------------------------------------------------------------
    */

    public function streamPdf($id)
    {
        $bill =
            Bill::query()
            ->with([
                'vendor:id,vendor_id,name',

                'purchaseOrder:id,order_id,requisition_id,warehouse_id',

                'purchaseOrder.requisition:id,requisition_id',

                'purchaseOrder.warehouse:id,name',

                'goodsReceivedNote:id,grn_no,warehouse_id,received_date',

                'goodsReceivedNote.warehouse:id,name',

                'createdBy:id,name,employee_id',

                'items.product:id,code,name',

                'items.purchaseItem',

                'items.goodsReceivedNoteItem',
            ])
            ->findOrFail(
                $id
            );

        $data = [
            'bill' =>
            $bill,

            'configure' =>
            Configure::first(),
        ];

        $pdf =
            Pdf::loadView(
                'pdf.bill',
                $data
            );

        return $pdf->stream(
            "bill_{$bill->bill_no}.pdf"
        );
    }

    public function getBills(Request $request)
    {
        $this->authorizePermission('bill.list');

        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        return Bill::query()
            ->select([
                'id',
                'bill_no',
                'purchase_order_id',
                'goods_received_note_id',
            ])
            ->with([
                'purchaseOrder:id,order_id',
                'goodsReceivedNote:id,grn_no',
            ])
            ->when(
                $keyword,
                function ($query) use ($keyword) {
                    $query->where(
                        'bill_no',
                        'like',
                        '%' . $keyword . '%'
                    );
                }
            )
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($bill) {
                return [
                    'id' =>
                        $bill->id,

                    'bill_no' =>
                        $bill->bill_no,

                    'purchase_order_id' =>
                        $bill->purchase_order_id,

                    'order_id' =>
                        $bill->purchaseOrder?->order_id,

                    'goods_received_note_id' =>
                        $bill->goods_received_note_id,

                    'grn_no' =>
                        $bill->goodsReceivedNote?->grn_no,
                ];
            });
    }
}
