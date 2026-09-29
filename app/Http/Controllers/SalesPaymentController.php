<?php

namespace App\Http\Controllers;

use App\Models\Configure;
use App\Models\SalesInvoice;
use App\Models\SalesPayment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SalesPaymentController extends Controller
{
    public function index(): Response
    {
        $payments = SalesPayment::query()
            ->with([
                'invoice:id,invoice_no,client_id,grand_total,paid_amount,due_amount,payment_status,status',
                'invoice.client:id,name,client_id,company_name,phone,address',
            ])
            ->latest('id')
            ->paginate(30)
            ->withQueryString();

        $invoices = SalesInvoice::query()
            ->where('status', 'Approved')
            ->where('due_amount', '>', 0)
            ->with([
                'client:id,name',
            ])
            ->select([
                'id',
                'invoice_no',
                'client_id',
                'grand_total',
                'paid_amount',
                'due_amount',
            ])
            ->latest('id')
            ->get();

        return Inertia::render(
            'operations/sales/payments/index',
            [
                'data' => $payments,
                'invoices' => $invoices,
            ]
        );
    }

    public function create(): Response
    {
        $invoices = SalesInvoice::query()
            ->where('status', 'Approved')
            ->where('due_amount', '>', 0)
            ->with([
                'client:id,name',
            ])
            ->select([
                'id',
                'invoice_no',
                'client_id',
                'grand_total',
                'paid_amount',
                'due_amount',
            ])
            ->latest('id')
            ->get();

        return Inertia::render(
            'operations/sales/payments/create',
            [
                'invoices' => $invoices,
            ]
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sales_invoice_id' => [
                'required',
                'integer',
                'exists:sales_invoices,id',
            ],

            'payment_date' => [
                'required',
                'date',
            ],

            'amount' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'payment_method' => [
                'required',
                Rule::in([
                    'cash',
                    'bank',
                    'card',
                    'mobile_banking',
                    'cheque',
                    'other',
                ]),
            ],

            'reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        DB::transaction(function () use ($validated) {
            $invoice = SalesInvoice::query()
                ->whereKey($validated['sales_invoice_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($invoice->status !== 'Approved') {
                throw ValidationException::withMessages([
                    'sales_invoice_id' =>
                        'Payments can only be recorded for Approved invoices.',
                ]);
            }

            $paidAmount = (float) $invoice
                ->payments()
                ->where('status', 'Approved')
                ->sum('amount');

            $currentDue = max(
                (float) $invoice->grand_total - $paidAmount,
                0
            );

            $amount = (float) $validated['amount'];

            if ($amount > $currentDue) {
                throw ValidationException::withMessages([
                    'amount' =>
                        'Payment cannot exceed the current due amount of ' .
                        number_format($currentDue, 2) .
                        '.',
                ]);
            }

            SalesPayment::create([
                'payment_no' =>
                    $this->generatePaymentNo(),

                'sales_invoice_id' =>
                    $invoice->id,

                'payment_date' =>
                    $validated['payment_date'],

                'amount' =>
                    round($amount, 2),

                'payment_method' =>
                    $validated['payment_method'],

                'reference' =>
                    $validated['reference'] ?? null,

                'remarks' =>
                    $validated['remarks'] ?? null,

                'status' =>
                    'Pending',

                'approved_by' =>
                    null,

                'approved_at' =>
                    null,
            ]);

            $this->syncInvoicePayment($invoice);
        });

        return redirect()
            ->route(
                'operations.sales.payments.index'
            )
            ->with([
                'message' =>
                    'Sales payment recorded successfully.',

                'type' =>
                    'success',
            ]);
    }

    public function show(
        SalesPayment $salesPayment
    ): Response {
        $salesPayment->load([
            'invoice:id,invoice_no,invoice_date,client_id,warehouse_id,grand_total,paid_amount,due_amount,payment_status,status',

            'invoice.client:id,name,client_id,company_name,phone,address',

            'invoice.warehouse:id,code,name',

            'approvedBy:id,name,employee_id',
        ]);

        return Inertia::render(
            'operations/sales/payments/show',
            [
                'payment' =>
                    $salesPayment,
            ]
        );
    }

    public function edit(
        SalesPayment $salesPayment
    ): Response {
        if ($salesPayment->status !== 'Pending') {
            return redirect()
                ->route(
                    'operations.sales.payments.show',
                    $salesPayment
                )
                ->with([
                    'message' =>
                        'Only Pending payments can be edited.',

                    'type' =>
                        'error',
                ]);
        }

        $invoices = SalesInvoice::query()
            ->where('status', 'Approved')
            ->with([
                'client:id,name',
            ])
            ->select([
                'id',
                'invoice_no',
                'client_id',
                'grand_total',
                'paid_amount',
                'due_amount',
            ])
            ->latest('id')
            ->get();

        return Inertia::render(
            'operations/sales/payments/edit',
            [
                'payment' =>
                    $salesPayment,

                'invoices' =>
                    $invoices,
            ]
        );
    }

    public function update(
        Request $request,
        SalesPayment $salesPayment
    ) {
        if ($salesPayment->status !== 'Pending') {
            throw ValidationException::withMessages([
                'payment' =>
                    'Only Pending payments can be edited.',
            ]);
        }

        $validated = $request->validate([
            'sales_invoice_id' => [
                'required',
                'integer',
                'exists:sales_invoices,id',
            ],

            'payment_date' => [
                'required',
                'date',
            ],

            'amount' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'payment_method' => [
                'required',
                Rule::in([
                    'cash',
                    'bank',
                    'card',
                    'mobile_banking',
                    'cheque',
                    'other',
                ]),
            ],

            'reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        DB::transaction(function () use (
            $validated,
            $salesPayment
        ) {
            $payment = SalesPayment::query()
                ->whereKey($salesPayment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status !== 'Pending') {
                throw ValidationException::withMessages([
                    'payment' =>
                        'Only Pending payments can be edited.',
                ]);
            }

            $oldInvoice = SalesInvoice::query()
                ->whereKey($payment->sales_invoice_id)
                ->lockForUpdate()
                ->firstOrFail();

            $newInvoice = SalesInvoice::query()
                ->whereKey(
                    $validated['sales_invoice_id']
                )
                ->lockForUpdate()
                ->firstOrFail();

            if ($newInvoice->status !== 'Approved') {
                throw ValidationException::withMessages([
                    'sales_invoice_id' =>
                        'Payment can only be assigned to an Approved invoice.',
                ]);
            }

            $approvedPaidAmount = (float) $newInvoice
                ->payments()
                ->where('status', 'Approved')
                ->sum('amount');

            $currentDue = max(
                (float) $newInvoice->grand_total -
                    $approvedPaidAmount,
                0
            );

            $amount = (float) $validated['amount'];

            if ($amount > $currentDue) {
                throw ValidationException::withMessages([
                    'amount' =>
                        'Payment cannot exceed the current due amount of ' .
                        number_format($currentDue, 2) .
                        '.',
                ]);
            }

            $payment->update([
                'sales_invoice_id' =>
                    $newInvoice->id,

                'payment_date' =>
                    $validated['payment_date'],

                'amount' =>
                    round($amount, 2),

                'payment_method' =>
                    $validated['payment_method'],

                'reference' =>
                    $validated['reference'] ?? null,

                'remarks' =>
                    $validated['remarks'] ?? null,
            ]);

            $this->syncInvoicePayment(
                $oldInvoice
            );

            if (
                $oldInvoice->id !==
                $newInvoice->id
            ) {
                $this->syncInvoicePayment(
                    $newInvoice
                );
            }
        });

        return redirect()
            ->route(
                'operations.sales.payments.show',
                $salesPayment
            )
            ->with([
                'message' =>
                    'Sales payment updated successfully.',

                'type' =>
                    'success',
            ]);
    }

    public function updateStatus(
        Request $request,
        SalesPayment $salesPayment
    ) {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'Approved',
                    'Rejected',
                ]),
            ],
        ]);

        DB::transaction(function () use (
            $validated,
            $salesPayment
        ) {
            $payment = SalesPayment::query()
                ->whereKey($salesPayment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status !== 'Pending') {
                throw ValidationException::withMessages([
                    'status' =>
                        'Only Pending payments can be approved or rejected.',
                ]);
            }

            $invoice = SalesInvoice::query()
                ->whereKey($payment->sales_invoice_id)
                ->lockForUpdate()
                ->firstOrFail();

            $payment->status =
                $validated['status'];

            if (
                $validated['status'] ===
                'Approved'
            ) {
                $payment->approved_by =
                    auth()->id();

                $payment->approved_at =
                    now();
            } else {
                $payment->approved_by =
                    null;

                $payment->approved_at =
                    null;
            }

            $payment->save();

            $this->syncInvoicePayment(
                $invoice
            );
        });

        return redirect()
            ->route(
                'operations.sales.payments.show',
                $salesPayment
            )
            ->with([
                'message' =>
                    'Sales payment status updated successfully.',

                'type' =>
                    'success',
            ]);
    }

    public function destroy(
        SalesPayment $salesPayment
    ) {
        if ($salesPayment->status !== 'Pending') {
            return redirect()
                ->back()
                ->with([
                    'message' =>
                        'Only Pending payments can be deleted.',

                    'type' =>
                        'error',
                ]);
        }

        DB::transaction(function () use (
            $salesPayment
        ) {
            $payment = SalesPayment::query()
                ->whereKey($salesPayment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status !== 'Pending') {
                throw ValidationException::withMessages([
                    'payment' =>
                        'Only Pending payments can be deleted.',
                ]);
            }

            $invoice = SalesInvoice::query()
                ->whereKey($payment->sales_invoice_id)
                ->lockForUpdate()
                ->firstOrFail();

            $payment->delete();

            $this->syncInvoicePayment(
                $invoice
            );
        });

        return redirect()
            ->route(
                'operations.sales.payments.index'
            )
            ->with([
                'message' =>
                    'Sales payment deleted successfully.',

                'type' =>
                    'success',
            ]);
    }

    public function downloadPdf(
        SalesPayment $salesPayment
    ) {
        $salesPayment->load([
            'invoice.client',
            'invoice.warehouse',
            'approvedBy',
        ]);

        $configure = Configure::first();

        $pdf = Pdf::loadView(
            'pdf.sales-payment',
            [
                'payment' =>
                    $salesPayment,

                'configure' =>
                    $configure,
            ]
        );

        return $pdf->download(
            "sales_payment_{$salesPayment->payment_no}.pdf"
        );
    }

    public function streamPdf(
        SalesPayment $salesPayment
    ) {
        $salesPayment->load([
            'invoice.client',
            'invoice.warehouse',
            'approvedBy',
        ]);

        $configure = Configure::first();

        $pdf = Pdf::loadView(
            'pdf.sales-payment',
            [
                'payment' =>
                    $salesPayment,

                'configure' =>
                    $configure,
            ]
        );

        return $pdf->stream(
            "sales_payment_{$salesPayment->payment_no}.pdf"
        );
    }

    private function syncInvoicePayment(
        SalesInvoice $invoice
    ): void {
        $paid = (float) $invoice
            ->payments()
            ->where('status', 'Approved')
            ->sum('amount');

        $grandTotal =
            (float) $invoice->grand_total;

        $due = max(
            $grandTotal - $paid,
            0
        );

        $paymentStatus =
            $paid <= 0
                ? 'unpaid'
                : (
                    $due <= 0
                        ? 'paid'
                        : 'partial'
                );

        $invoice->update([
            'paid_amount' =>
                round($paid, 2),

            'due_amount' =>
                round($due, 2),

            'payment_status' =>
                $paymentStatus,
        ]);
    }

    private function generatePaymentNo(): string
    {
        do {
            $paymentNo =
                'SP-' .
                now()->format('YmdHis') .
                '-' .
                Str::upper(
                    Str::random(5)
                );
        } while (
            SalesPayment::query()
                ->where(
                    'payment_no',
                    $paymentNo
                )
                ->exists()
        );

        return $paymentNo;
    }
}