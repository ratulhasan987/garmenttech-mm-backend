<?php

namespace App\Http\Controllers;

use App\Models\SalesInvoice;
use App\Models\VendorDebitNote;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class FinanceDocumentController extends Controller
{
    public function salesInvoice(SalesInvoice $salesInvoice, string $mode): Response
    {
        abort_unless(auth()->user()?->can('invoice.view') || auth()->user()?->can('finance.receivable.view'), 403);
        abort_unless(in_array($mode, ['stream', 'download'], true), 404);
        $salesInvoice->load(['client', 'warehouse', 'items.product.unit', 'payments']);
        $pdf = Pdf::loadView('pdf.sales-invoice', ['invoice' => $salesInvoice]);
        $filename = "invoice_{$salesInvoice->invoice_no}.pdf";

        return $mode === 'download' ? $pdf->download($filename) : $pdf->stream($filename);
    }

    public function vendorDebitNote(VendorDebitNote $vendorDebitNote, string $mode): Response
    {
        abort_unless(auth()->user()?->can('purchase_return.view') || auth()->user()?->can('finance.receivable.view'), 403);
        abort_unless(in_array($mode, ['stream', 'download'], true), 404);
        $vendorDebitNote->load(['vendor', 'purchaseReturn.items.product', 'purchaseReturn.receivable.transactions']);
        $pdf = Pdf::loadView('pdf.vendor-debit-note', ['debitNote' => $vendorDebitNote]);
        $filename = "vendor_debit_note_{$vendorDebitNote->debit_note_no}.pdf";

        return $mode === 'download' ? $pdf->download($filename) : $pdf->stream($filename);
    }
}
