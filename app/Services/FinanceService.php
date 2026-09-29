<?php

namespace App\Services;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use App\Models\Bill;
use App\Models\BillPayment;
use App\Models\FinanceTransaction;
use App\Models\PurchaseReturn;
use App\Models\SalesInvoice;
use App\Models\SalesPayment;
use App\Models\SalesReturn;
use App\Models\VendorDebitNote;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FinanceService
{
    public function createReceivableForSalesInvoice(SalesInvoice $invoice): AccountsReceivable
    {
        return AccountsReceivable::query()->firstOrCreate(
            ['source_type' => 'sales_invoice', 'source_id' => $invoice->id],
            [
                'client_id' => $invoice->client_id,
                'document_no' => $invoice->invoice_no,
                'document_date' => $invoice->invoice_date,
                'due_date' => $invoice->invoice_date,
                'amount' => $invoice->grand_total,
                'received_amount' => 0,
                'balance' => $invoice->grand_total,
                'status' => 'open',
            ],
        );
    }

    public function createPayableForBill(Bill $bill): AccountsPayable
    {
        return AccountsPayable::query()->updateOrCreate(
            ['bill_id' => $bill->id],
            [
                'vendor_id' => $bill->vendor_id,
                'document_no' => $bill->bill_no,
                'document_date' => $bill->bill_date,
                'due_date' => $bill->due_date ?? $bill->bill_date,
                'amount' => $bill->grand_total,
                'paid_amount' => $bill->paid_amount,
                'balance' => $bill->due_amount,
                'status' => $this->status((float) $bill->paid_amount, (float) $bill->due_amount),
            ],
        );
    }

    public function createVendorReceivableForPurchaseReturn(PurchaseReturn $purchaseReturn): AccountsReceivable
    {
        $debitNote = VendorDebitNote::query()->firstOrCreate(
            ['purchase_return_id' => $purchaseReturn->id],
            [
                'debit_note_no' => $this->number('VDN'),
                'vendor_id' => $purchaseReturn->vendor_id,
                'debit_note_date' => $purchaseReturn->return_date,
                'due_date' => $purchaseReturn->return_date,
                'subtotal' => $purchaseReturn->subtotal,
                'tax_amount' => $purchaseReturn->tax_amount,
                'grand_total' => $purchaseReturn->grand_total,
                'created_by' => Auth::id(),
            ],
        );

        return AccountsReceivable::query()->firstOrCreate(
            ['source_type' => 'purchase_return', 'source_id' => $purchaseReturn->id],
            [
                'vendor_id' => $purchaseReturn->vendor_id,
                'document_no' => $debitNote->debit_note_no,
                'document_date' => $debitNote->debit_note_date,
                'due_date' => $debitNote->due_date,
                'amount' => $debitNote->grand_total,
                'received_amount' => 0,
                'balance' => $debitNote->grand_total,
                'status' => 'open',
            ],
        );
    }

    /** @param array{transaction_date:string,amount:numeric-string|int|float,payment_method:string,reference?:?string,remarks?:?string} $data */
    public function collectReceivable(AccountsReceivable $receivable, array $data): FinanceTransaction
    {
        return DB::transaction(function () use ($receivable, $data) {
            $receivable = AccountsReceivable::query()->lockForUpdate()->findOrFail($receivable->id);
            $amount = round((float) $data['amount'], 2);
            $this->ensureValidAmount($amount, (float) $receivable->balance, 'collection');

            $payment = null;
            if ($receivable->source_type === 'sales_invoice') {
                $invoice = SalesInvoice::query()->lockForUpdate()->findOrFail($receivable->source_id);
                $payment = SalesPayment::create([
                    'payment_no' => $this->number('SP'),
                    'sales_invoice_id' => $invoice->id,
                    'payment_date' => $data['transaction_date'],
                    'amount' => $amount,
                    'payment_method' => $data['payment_method'],
                    'reference' => $data['reference'] ?? null,
                    'remarks' => $data['remarks'] ?? null,
                ]);
                $this->syncSalesInvoice($invoice);
            }

            $transaction = $this->transaction(
                direction: 'inflow',
                type: $receivable->source_type === 'sales_invoice' ? 'customer_collection' : 'vendor_collection',
                amount: $amount,
                date: $data['transaction_date'],
                partyType: $receivable->client_id ? 'customer' : 'vendor',
                partyId: (int) ($receivable->client_id ?? $receivable->vendor_id),
                receivable: $receivable,
                payment: $payment,
                data: $data,
            );

            $this->syncReceivable($receivable);

            return $transaction;
        });
    }

    /** @param array{transaction_date:string,amount:numeric-string|int|float,payment_method:string,reference?:?string,remarks?:?string,account_id?:?int} $data */
    public function payPayable(AccountsPayable $payable, array $data): FinanceTransaction
    {
        return DB::transaction(function () use ($payable, $data) {
            $payable = AccountsPayable::query()->lockForUpdate()->findOrFail($payable->id);
            $amount = round((float) $data['amount'], 2);
            $this->ensureValidAmount($amount, (float) $payable->balance, 'payment');
            $bill = Bill::query()->lockForUpdate()->findOrFail($payable->bill_id);

            $payment = BillPayment::create([
                'bill_id' => $bill->id,
                'date' => $data['transaction_date'],
                'pay_amount' => $amount,
                'account_id' => $data['account_id'] ?? null,
                'reference' => $data['reference'] ?? null,
                'description' => $data['remarks'] ?? null,
                'created_by' => Auth::id(),
            ]);

            $this->syncBill($bill);
            $transaction = $this->transaction('outflow', 'vendor_payment', $amount, $data['transaction_date'], 'vendor', $payable->vendor_id, null, $payable, $payment, $data);
            $this->syncPayable($payable);

            return $transaction;
        });
    }

    public function syncSalesPaymentTransaction(SalesPayment $payment): void
    {
        $invoice = $payment->invoice()->firstOrFail();
        $receivable = $this->createReceivableForSalesInvoice($invoice);
        $this->transaction('inflow', 'customer_collection', (float) $payment->amount, $payment->payment_date->toDateString(), 'customer', $invoice->client_id, $receivable, null, $payment, [
            'payment_method' => $payment->payment_method,
            'reference' => $payment->reference,
            'remarks' => $payment->remarks,
        ]);
        $this->syncReceivable($receivable);
    }

    public function syncBillPaymentTransaction(BillPayment $payment): void
    {
        $bill = $payment->bill()->firstOrFail();
        $payable = $this->createPayableForBill($bill);
        $this->transaction('outflow', 'vendor_payment', (float) $payment->pay_amount, $payment->date->toDateString(), 'vendor', $bill->vendor_id, null, $payable, $payment, [
            'payment_method' => $payment->account_id ? 'bank' : 'cash',
            'reference' => $payment->reference,
            'remarks' => $payment->description,
        ]);
        $this->syncPayable($payable);
    }

    /** @param array{transaction_date:string,amount:numeric-string|int|float,payment_method:string,reference?:?string,remarks?:?string} $data */
    public function recordSalesReturnRefund(SalesReturn $salesReturn, array $data): FinanceTransaction
    {
        return DB::transaction(function () use ($salesReturn, $data) {
            $salesReturn = SalesReturn::query()->with('invoice')->lockForUpdate()->findOrFail($salesReturn->id);
            if ($salesReturn->status !== 'Approved') {
                throw ValidationException::withMessages(['sales_return_id' => 'Only approved sales returns can be refunded.']);
            }
            $refunded = (float) $salesReturn->financeTransactions()->where('transaction_type', 'customer_refund')->sum('amount');
            $remaining = round(max(0, (float) $salesReturn->total_amount - $refunded), 2);
            $amount = round((float) $data['amount'], 2);
            $this->ensureValidAmount($amount, $remaining, 'refund');

            return FinanceTransaction::create([
                'transaction_no' => $this->number('FT'),
                'transaction_date' => $data['transaction_date'],
                'direction' => 'outflow',
                'transaction_type' => 'customer_refund',
                'sales_return_id' => $salesReturn->id,
                'party_type' => 'customer',
                'party_id' => $salesReturn->invoice->client_id,
                'amount' => $amount,
                'payment_method' => $data['payment_method'],
                'reference' => $data['reference'] ?? null,
                'remarks' => $data['remarks'] ?? null,
                'created_by' => Auth::id(),
            ]);
        });
    }

    public function removePaymentTransaction(Model $payment): void
    {
        $transaction = FinanceTransaction::query()->where('payment_type', $payment->getMorphClass())->where('payment_id', $payment->getKey())->first();
        if (! $transaction) {
            return;
        }
        $receivable = $transaction->receivable;
        $payable = $transaction->payable;
        $transaction->delete();
        if ($receivable) {
            $this->syncReceivable($receivable);
        }
        if ($payable) {
            $this->syncPayable($payable);
        }
    }

    public function syncReceivable(AccountsReceivable $receivable): void
    {
        $received = round((float) $receivable->transactions()->where('direction', 'inflow')->sum('amount'), 2);
        $balance = round(max(0, (float) $receivable->amount - $received), 2);
        $receivable->update(['received_amount' => $received, 'balance' => $balance, 'status' => $this->status($received, $balance)]);
    }

    public function syncPayable(AccountsPayable $payable): void
    {
        $paid = round((float) $payable->transactions()->where('direction', 'outflow')->sum('amount'), 2);
        $balance = round(max(0, (float) $payable->amount - $paid), 2);
        $payable->update(['paid_amount' => $paid, 'balance' => $balance, 'status' => $this->status($paid, $balance)]);
    }

    private function syncSalesInvoice(SalesInvoice $invoice): void
    {
        $paid = round((float) $invoice->payments()->sum('amount'), 2);
        $due = round(max(0, (float) $invoice->grand_total - $paid), 2);
        $invoice->update(['paid_amount' => $paid, 'due_amount' => $due, 'payment_status' => $due <= 0 ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid')]);
    }

    private function syncBill(Bill $bill): void
    {
        $paid = round((float) $bill->payments()->sum('pay_amount'), 2);
        $due = round(max(0, (float) $bill->grand_total - $paid), 2);
        $bill->update(['paid_amount' => $paid, 'due_amount' => $due, 'payment_status' => $due <= 0 ? 'Paid' : ($paid > 0 ? 'Partial-paid' : 'Due')]);
    }

    /** @param array<string, mixed> $data */
    private function transaction(string $direction, string $type, float $amount, string $date, string $partyType, int $partyId, ?AccountsReceivable $receivable = null, ?AccountsPayable $payable = null, ?Model $payment = null, array $data = []): FinanceTransaction
    {
        $values = [
            'transaction_no' => $this->number('FT'),
            'transaction_date' => $date,
            'direction' => $direction,
            'transaction_type' => $type,
            'accounts_receivable_id' => $receivable?->id,
            'accounts_payable_id' => $payable?->id,
            'party_type' => $partyType,
            'party_id' => $partyId,
            'payment_type' => $payment?->getMorphClass(),
            'payment_id' => $payment?->getKey(),
            'amount' => $amount,
            'payment_method' => $data['payment_method'] ?? null,
            'reference' => $data['reference'] ?? null,
            'remarks' => $data['remarks'] ?? null,
            'created_by' => Auth::id(),
        ];

        if ($payment) {
            $transaction = FinanceTransaction::query()->firstOrNew([
                'payment_type' => $payment->getMorphClass(),
                'payment_id' => $payment->getKey(),
            ]);
            if ($transaction->exists) {
                unset($values['transaction_no']);
            }
            $transaction->fill($values)->save();

            return $transaction;
        }

        return FinanceTransaction::create($values);
    }

    private function ensureValidAmount(float $amount, float $balance, string $label): void
    {
        if ($amount <= 0 || $amount > $balance) {
            throw ValidationException::withMessages(['amount' => "The {$label} amount must be greater than zero and cannot exceed the remaining balance of " . number_format($balance, 2) . '.']);
        }
    }

    private function status(float $settled, float $balance): string
    {
        return $balance <= 0 ? 'closed' : ($settled > 0 ? 'partial' : 'open');
    }

    private function number(string $prefix): string
    {
        return $prefix . '-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(4));
    }
}
