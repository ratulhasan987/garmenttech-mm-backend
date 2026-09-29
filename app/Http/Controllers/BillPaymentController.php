<?php

namespace App\Http\Controllers;

use App\Actions\File;
use App\Models\Bill;
use App\Models\BillPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;
use App\Models\Configure;
use Barryvdh\DomPDF\Facade\Pdf;


class BillPaymentController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        Bill $bill
    ) {

        $this->authorizePermission("bill_payment.create");

        $validated =
            $this->validatePayment(
                $request
            );

        $uploadedAttachment =
            null;

        try {
            /*
            |--------------------------------------------------------------------------
            | Upload Attachment
            |--------------------------------------------------------------------------
            */

            if (
                $request->hasFile(
                    'attachment'
                )
            ) {
                $uploadedAttachment =
                    File::upload(
                        $request->file(
                            'attachment'
                        ),
                        'BillPayment'
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Create Payment
            |--------------------------------------------------------------------------
            */

            DB::transaction(
                function () use ($bill, $validated, $uploadedAttachment) {
                    /*
                    |--------------------------------------------------------------------------
                    | Lock Bill
                    |--------------------------------------------------------------------------
                    |
                    | Every payment operation locks the Bill row.
                    |
                    | This prevents two users from paying the same remaining amount at
                    | the same time.
                    |
                    */

                    $lockedBill =
                        Bill::query()
                            ->lockForUpdate()
                            ->findOrFail(
                                $bill->id
                            );

                    /*
                    |--------------------------------------------------------------------------
                    | Current Paid Amount
                    |--------------------------------------------------------------------------
                    */

                    $currentPaid =
                        round(
                            (float) $lockedBill
                                ->payments()
                                ->sum(
                                    'pay_amount'
                                ),
                            2
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Remaining Payable
                    |--------------------------------------------------------------------------
                    */

                    $remainingAmount =
                        round(
                            max(
                                0,
                                (float) $lockedBill
                                    ->grand_total -
                                $currentPaid
                            ),
                            2
                        );

                    if (
                        $remainingAmount <= 0
                    ) {
                        throw ValidationException::withMessages([
                            'pay_amount' =>
                                'This bill has already been fully paid.',
                        ]);
                    }

                    $payAmount =
                        round(
                            (float) $validated[
                                'pay_amount'
                            ],
                            2
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Prevent Overpayment
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $payAmount >
                        $remainingAmount
                    ) {
                        throw ValidationException::withMessages([
                            'pay_amount' =>
                                'Payment amount cannot be greater than the remaining due amount of ' .
                                number_format(
                                    $remainingAmount,
                                    2
                                ) .
                                '.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Create
                    |--------------------------------------------------------------------------
                    */

                    BillPayment::create([
                        'bill_id' =>
                            $lockedBill->id,

                        'date' =>
                            Carbon::parse(
                                $validated[
                                    'date'
                                ]
                            )->startOfDay(),

                        'pay_amount' =>
                            $payAmount,

                        'account_id' =>
                            $validated[
                                'account_id'
                            ] ?? null,

                        'reference' =>
                            $validated[
                                'reference'
                            ] ?? null,

                        'created_by' =>
                            Auth::id(),

                        'description' =>
                            $validated[
                                'description'
                            ] ?? null,

                        'attachment' =>
                            $uploadedAttachment,
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Refresh Bill
                    |--------------------------------------------------------------------------
                    */

                    $this->syncBillPaymentTotals(
                        $lockedBill
                    );
                }
            );

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            "Payment added successfully for bill {$bill->bill_no}.",

                        'type' =>
                            'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            /*
            |--------------------------------------------------------------------------
            | Remove Uploaded File If Database Operation Failed
            |--------------------------------------------------------------------------
            */

            if (
                $uploadedAttachment
            ) {
                File::deleteFile(
                    $uploadedAttachment
                );
            }

            throw $exception;
        } catch (
            Throwable $exception
        ) {
            if (
                $uploadedAttachment
            ) {
                File::deleteFile(
                    $uploadedAttachment
                );
            }

            Log::error(
                'Bill payment creation failed.',
                [
                    'bill_id' =>
                        $bill->id,

                    'user_id' =>
                        Auth::id(),

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
                            'Failed to add bill payment. Please try again.',

                        'type' =>
                            'error',
                    ]
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Bill $bill,
        BillPayment $payment
    ) {

        $this->authorizePermission("bill_payment.edit");

        /*
        |--------------------------------------------------------------------------
        | Ensure Payment Belongs To This Bill
        |--------------------------------------------------------------------------
        */

        abort_unless(
            (int) $payment->bill_id ===
            (int) $bill->id,
            404
        );

        $validated =
            $this->validatePayment(
                $request
            );

        $oldAttachment =
            $payment->attachment;

        $newAttachment =
            null;

        try {
            /*
            |--------------------------------------------------------------------------
            | New Attachment
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
                        'BillPayment'
                    );
            }

            DB::transaction(
                function () use ($bill, $payment, $validated, $request, $newAttachment) {
                    /*
                    |--------------------------------------------------------------------------
                    | Lock Bill
                    |--------------------------------------------------------------------------
                    */

                    $lockedBill =
                        Bill::query()
                            ->lockForUpdate()
                            ->findOrFail(
                                $bill->id
                            );

                    /*
                    |--------------------------------------------------------------------------
                    | Lock Payment
                    |--------------------------------------------------------------------------
                    */

                    $lockedPayment =
                        BillPayment::query()
                            ->where(
                                'bill_id',
                                $lockedBill->id
                            )
                            ->lockForUpdate()
                            ->findOrFail(
                                $payment->id
                            );

                    /*
                    |--------------------------------------------------------------------------
                    | Paid Amount Except Current Payment
                    |--------------------------------------------------------------------------
                    */

                    $otherPaid =
                        round(
                            (float) $lockedBill
                                ->payments()
                                ->where(
                                    'id',
                                    '!=',
                                    $lockedPayment
                                        ->id
                                )
                                ->sum(
                                    'pay_amount'
                                ),
                            2
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Maximum Allowed For Current Payment
                    |--------------------------------------------------------------------------
                    */

                    $maximumAllowed =
                        round(
                            max(
                                0,
                                (float) $lockedBill
                                    ->grand_total -
                                $otherPaid
                            ),
                            2
                        );

                    $payAmount =
                        round(
                            (float) $validated[
                                'pay_amount'
                            ],
                            2
                        );

                    if (
                        $payAmount >
                        $maximumAllowed
                    ) {
                        throw ValidationException::withMessages([
                            'pay_amount' =>
                                'Payment amount cannot be greater than ' .
                                number_format(
                                    $maximumAllowed,
                                    2
                                ) .
                                '.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Attachment
                    |--------------------------------------------------------------------------
                    */

                    $attachment =
                        $lockedPayment
                            ->attachment;

                    if (
                        $request->boolean(
                            'remove_attachment'
                        )
                    ) {
                        $attachment =
                            null;
                    }

                    if (
                        $newAttachment
                    ) {
                        $attachment =
                            $newAttachment;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Update Payment
                    |--------------------------------------------------------------------------
                    */

                    $lockedPayment->update([
                        'date' =>
                            Carbon::parse(
                                $validated[
                                    'date'
                                ]
                            )->startOfDay(),

                        'pay_amount' =>
                            $payAmount,

                        'account_id' =>
                            $validated[
                                'account_id'
                            ] ?? null,

                        'reference' =>
                            $validated[
                                'reference'
                            ] ?? null,

                        'description' =>
                            $validated[
                                'description'
                            ] ?? null,

                        'attachment' =>
                            $attachment,
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Refresh Bill
                    |--------------------------------------------------------------------------
                    */

                    $this->syncBillPaymentTotals(
                        $lockedBill
                    );
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Delete Old Attachment After DB Commit
            |--------------------------------------------------------------------------
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
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Bill payment updated successfully.',

                        'type' =>
                            'success',
                    ]
                );
        } catch (
            ValidationException $exception
        ) {
            if (
                $newAttachment
            ) {
                File::deleteFile(
                    $newAttachment
                );
            }

            throw $exception;
        } catch (
            Throwable $exception
        ) {
            if (
                $newAttachment
            ) {
                File::deleteFile(
                    $newAttachment
                );
            }

            Log::error(
                'Bill payment update failed.',
                [
                    'bill_id' =>
                        $bill->id,

                    'payment_id' =>
                        $payment->id,

                    'user_id' =>
                        Auth::id(),

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
                            'Failed to update bill payment. Please try again.',

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

    public function destroy(
        Bill $bill,
        BillPayment $payment
    ) {

    $this->authorizePermission("bill_payment.delete");

        abort_unless(
            (int) $payment->bill_id ===
            (int) $bill->id,
            404
        );

        $attachment =
            null;

        try {
            DB::transaction(
                function () use ($bill, $payment, &$attachment) {
                    /*
                    |--------------------------------------------------------------------------
                    | Lock Bill
                    |--------------------------------------------------------------------------
                    */

                    $lockedBill =
                        Bill::query()
                            ->lockForUpdate()
                            ->findOrFail(
                                $bill->id
                            );

                    /*
                    |--------------------------------------------------------------------------
                    | Lock Payment
                    |--------------------------------------------------------------------------
                    */

                    $lockedPayment =
                        BillPayment::query()
                            ->where(
                                'bill_id',
                                $lockedBill->id
                            )
                            ->lockForUpdate()
                            ->findOrFail(
                                $payment->id
                            );

                    $attachment =
                        $lockedPayment
                            ->attachment;

                    /*
                    |--------------------------------------------------------------------------
                    | Delete
                    |--------------------------------------------------------------------------
                    */

                    $lockedPayment
                        ->delete();

                    /*
                    |--------------------------------------------------------------------------
                    | Recalculate Bill
                    |--------------------------------------------------------------------------
                    */

                    $this->syncBillPaymentTotals(
                        $lockedBill
                    );
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Delete Attachment
            |--------------------------------------------------------------------------
            */

            if (
                $attachment
            ) {
                File::deleteFile(
                    $attachment
                );
            }

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Bill payment deleted successfully.',

                        'type' =>
                            'success',
                    ]
                );
        } catch (
            Throwable $exception
        ) {
            Log::error(
                'Bill payment delete failed.',
                [
                    'bill_id' =>
                        $bill->id,

                    'payment_id' =>
                        $payment->id,

                    'user_id' =>
                        Auth::id(),

                    'message' =>
                        $exception
                            ->getMessage(),

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
                            'Failed to delete bill payment.',

                        'type' =>
                            'error',
                    ]
                );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate
    |--------------------------------------------------------------------------
    */

    private function validatePayment(
        Request $request
    ): array {
        return $request->validate([
            'date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'pay_amount' => [
                'required',
                'numeric',
                'gt:0',
            ],

            /*
            |--------------------------------------------------------------------------
            | account_id
            |--------------------------------------------------------------------------
            |
            | Your existing bill_payments table has only an unsignedBigInteger
            | account_id and no FK was supplied, therefore exists:accounts,id is
            | intentionally not used yet.
            |
            */

            'account_id' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
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
    }

    /*
    |--------------------------------------------------------------------------
    | Sync Bill Payment Totals
    |--------------------------------------------------------------------------
    |
    | payment_status is NEVER supplied by frontend.
    |
    | It is derived from:
    |
    | grand_total
    | paid_amount
    | due_amount
    |
    */

    private function syncBillPaymentTotals(
        Bill $bill
    ): void {
        $grandTotal =
            round(
                (float) $bill
                    ->grand_total,
                2
            );

        $paidAmount =
            round(
                (float) $bill
                    ->payments()
                    ->sum(
                        'pay_amount'
                    ),
                2
            );

        /*
        |--------------------------------------------------------------------------
        | Defensive Guard
        |--------------------------------------------------------------------------
        */

        $paidAmount =
            min(
                $paidAmount,
                $grandTotal
            );

        $dueAmount =
            round(
                max(
                    0,
                    $grandTotal -
                    $paidAmount
                ),
                2
            );

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (
            $paidAmount <= 0
        ) {
            $paymentStatus =
                'Due';
        } elseif (
            $dueAmount <= 0
        ) {
            $paymentStatus =
                'Paid';
        } else {
            $paymentStatus =
                'Partial-paid';
        }

        /*
        |--------------------------------------------------------------------------
        | Update Bill
        |--------------------------------------------------------------------------
        */

        $bill->update([
            'paid_amount' =>
                $paidAmount,

            'due_amount' =>
                $dueAmount,

            'payment_status' =>
                $paymentStatus,
        ]);
    }

    public function downloadPdf($id)
    {
        $bill =
            Bill::query()
                ->with([
                    /*
                    |--------------------------------------------------------------------------
                    | Bill Information
                    |--------------------------------------------------------------------------
                    */

                    'vendor:id,vendor_id,name',

                    'purchaseOrder:id,order_id',

                    'goodsReceivedNote:id,grn_no',

                    'createdBy:id,name,employee_id',

                    /*
                    |--------------------------------------------------------------------------
                    | Payments
                    |--------------------------------------------------------------------------
                    */

                    'payments' => function ($query) {
                        $query
                            ->orderByDesc('date')
                            ->orderByDesc('id');
                    },

                    'payments.createdBy:id,name,employee_id',
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
                'pdf.bill-payment',
                $data
            );

        return $pdf->download(
            "bill_payment_{$bill->bill_no}.pdf"
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
                    /*
                    |--------------------------------------------------------------------------
                    | Bill Information
                    |--------------------------------------------------------------------------
                    */

                    'vendor:id,vendor_id,name',

                    'purchaseOrder:id,order_id',

                    'goodsReceivedNote:id,grn_no',

                    'createdBy:id,name,employee_id',

                    /*
                    |--------------------------------------------------------------------------
                    | Payments
                    |--------------------------------------------------------------------------
                    */

                    'payments' => function ($query) {
                        $query
                            ->orderByDesc('date')
                            ->orderByDesc('id');
                    },

                    'payments.createdBy:id,name,employee_id',
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
                'pdf.bill-payment',
                $data
            );

        return $pdf->stream(
            "bill_payment_{$bill->bill_no}.pdf"
        );
    }
}
