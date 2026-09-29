<?php

namespace App\Http\Controllers;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use App\Models\FinanceTransaction;
use App\Models\SalesReturn;
use App\Services\FinanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function payables(Request $request): Response
    {
        $this->authorizePermission('finance.payable.list');
        $data = AccountsPayable::query()->with(['vendor:id,vendor_id,name', 'bill:id,bill_no'])
            ->when($request->string('search')->trim()->value(), fn($query, $search) => $query->where(fn($query) => $query->where('document_no', 'like', "%{$search}%")->orWhereHas('vendor', fn($query) => $query->where('name', 'like', "%{$search}%"))))
            ->when($request->input('status'), fn($query, $status) => $query->where('status', $status))
            ->when($request->input('from'), fn($query, $from) => $query->whereDate('document_date', '>=', $from))
            ->when($request->input('to'), fn($query, $to) => $query->whereDate('document_date', '<=', $to))
            ->latest('id')->paginate(30)->withQueryString();

        return Inertia::render('finance/payables/index', ['data' => $data, 'filters' => $request->only('search', 'status', 'from', 'to')]);
    }

    public function payable(AccountsPayable $payable): Response
    {
        $this->authorizePermission('finance.payable.view');
        $payable->load(['vendor:id,vendor_id,name,phone,address', 'bill', 'transactions.createdBy:id,name']);

        return Inertia::render('finance/payables/show', ['payable' => $payable]);
    }

    public function pay(Request $request, AccountsPayable $payable, FinanceService $finance): RedirectResponse
    {
        $this->authorizePermission('finance.payable.pay');
        $data = $request->validate($this->paymentRules());
        $finance->payPayable($payable, $data);

        return back()->with('notification', ['message' => 'Payable payment recorded successfully.', 'type' => 'success']);
    }

    public function receivables(Request $request): Response
    {
        $this->authorizePermission('finance.receivable.list');
        $data = AccountsReceivable::query()->with(['client:id,client_no,name', 'vendor:id,vendor_id,name'])
            ->when($request->string('search')->trim()->value(), fn($query, $search) => $query->where(fn($query) => $query->where('document_no', 'like', "%{$search}%")->orWhereHas('client', fn($query) => $query->where('name', 'like', "%{$search}%"))->orWhereHas('vendor', fn($query) => $query->where('name', 'like', "%{$search}%"))))
            ->when($request->input('status'), fn($query, $status) => $query->where('status', $status))
            ->when($request->input('source_type'), fn($query, $source) => $query->where('source_type', $source))
            ->when($request->input('from'), fn($query, $from) => $query->whereDate('document_date', '>=', $from))
            ->when($request->input('to'), fn($query, $to) => $query->whereDate('document_date', '<=', $to))
            ->latest('id')->paginate(30)->withQueryString();

        return Inertia::render('finance/receivables/index', ['data' => $data, 'filters' => $request->only('search', 'status', 'source_type', 'from', 'to')]);
    }

    public function receivable(AccountsReceivable $receivable): Response
    {
        $this->authorizePermission('finance.receivable.view');
        $receivable->load(['client:id,client_no,name,phone', 'vendor:id,vendor_id,name,phone,address', 'transactions.createdBy:id,name']);

        return Inertia::render('finance/receivables/show', ['receivable' => $receivable]);
    }

    public function collect(Request $request, AccountsReceivable $receivable, FinanceService $finance): RedirectResponse
    {
        $this->authorizePermission('finance.receivable.collect');
        $data = $request->validate($this->paymentRules());
        $finance->collectReceivable($receivable, $data);

        return back()->with('notification', ['message' => 'Receivable collection recorded successfully.', 'type' => 'success']);
    }

    public function transactions(Request $request): Response
    {
        $this->authorizePermission('finance.transaction.list');
        $data = FinanceTransaction::query()->with(['receivable:id,document_no', 'payable:id,document_no', 'createdBy:id,name'])
            ->when($request->string('search')->trim()->value(), fn($query, $search) => $query->where(fn($query) => $query->where('transaction_no', 'like', "%{$search}%")->orWhere('reference', 'like', "%{$search}%")))
            ->when($request->input('direction'), fn($query, $direction) => $query->where('direction', $direction))
            ->when($request->input('transaction_type'), fn($query, $type) => $query->where('transaction_type', $type))
            ->when($request->input('payment_method'), fn($query, $method) => $query->where('payment_method', $method))
            ->when($request->input('from'), fn($query, $from) => $query->whereDate('transaction_date', '>=', $from))
            ->when($request->input('to'), fn($query, $to) => $query->whereDate('transaction_date', '<=', $to))
            ->latest('transaction_date')->latest('id')->paginate(30)->withQueryString();

        $returns = SalesReturn::query()->where('status', 'Approved')->with(['invoice.client:id,name'])->withSum(['financeTransactions as refunded_amount' => fn($query) => $query->where('transaction_type', 'customer_refund')], 'amount')->latest('id')->get()->filter(fn($return) => (float) $return->total_amount > (float) $return->refunded_amount)->values();

        return Inertia::render('finance/transactions/index', ['data' => $data, 'filters' => $request->only('search', 'direction', 'transaction_type', 'payment_method', 'from', 'to'), 'salesReturns' => $returns]);
    }

    public function refund(Request $request, SalesReturn $salesReturn, FinanceService $finance): RedirectResponse
    {
        $this->authorizePermission('finance.transaction.list');
        $finance->recordSalesReturnRefund($salesReturn, $request->validate($this->paymentRules()));

        return back()->with('notification', ['message' => 'Customer refund recorded successfully.', 'type' => 'success']);
    }

    public function profitLoss(Request $request): Response
    {
        $this->authorizePermission('finance.profit_loss.view');
        $request->validate(['from' => ['nullable', 'date'], 'to' => ['nullable', 'date', 'after_or_equal:from']]);
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());
        $base = FinanceTransaction::query()->whereBetween('transaction_date', [$from, $to]);
        $inflow = (clone $base)->where('direction', 'inflow')->sum('amount');
        $outflow = (clone $base)->where('direction', 'outflow')->sum('amount');
        $breakdown = (clone $base)->selectRaw('transaction_type, direction, SUM(amount) as total')->groupBy('transaction_type', 'direction')->get();

        return Inertia::render('finance/profit-loss/index', ['from' => $from, 'to' => $to, 'inflow' => (float) $inflow, 'outflow' => (float) $outflow, 'net' => (float) $inflow - (float) $outflow, 'breakdown' => $breakdown]);
    }

    private function paymentRules(): array
    {
        return [
            'transaction_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'payment_method' => ['required', 'string', 'max:30'],
            'reference' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'account_id' => ['nullable', 'integer'],
        ];
    }
}
