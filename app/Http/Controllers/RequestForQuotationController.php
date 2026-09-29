<?php

namespace App\Http\Controllers;

use App\Models\Configure;
use App\Models\Currency;
use App\Models\Project;
use App\Models\RequestForQuotation;
use App\Models\RequestForQuotationItem;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDF;
use App\Exports\RfqCompareExport;
use Maatwebsite\Excel\Facades\Excel;

class RequestForQuotationController extends Controller
{
    public function index(Request $request)
    {
        $query = RequestForQuotation::with([
            'project:id,name',
            'vendor:id,vendor_id,name',
            'requisition:id,requisition_id',
            'items',
        ])->withCount('items');

        if ($request->filled('rfq_no')) {
            $query->where('rfq_no', 'like', '%' . $request->rfq_no . '%');
        }
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->sorting === 'asc') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->latest();
        }

        $rows = $query->paginate(30)->withQueryString();
        $projects = Project::select('id', 'name')->orderBy('name')->get();

        return view('pages.rfq.index', compact('rows', 'projects'));
    }

    public function create()
    {
        $projects = Project::select('id', 'name')->orderBy('name')->get();
        $vendors = Vendor::select('id', 'name')->orderBy('name')->get();
        $rfq = null;

        return view('pages.rfq.create_and_edit', compact('projects', 'vendors', 'rfq'));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'project_id'           => 'required|exists:projects,id',
                'vendor_id'            => 'required|exists:vendors,id',
                'requisition_id'       => 'nullable|exists:requisitions,id',
                'is_requisition_based' => 'nullable|boolean',
                'required_date'        => 'nullable|date',
                'submitted_date'       => 'nullable|date',
                'notes'                => 'nullable|string',
                'items'                => 'required|array|min:1',
                'items.*.requisition_item_id' => 'nullable|exists:requisition_items,id',
                'items.*.type'         => 'required|in:Material,Equipment',
                'items.*.item_id'      => 'nullable|integer',
                'items.*.description'  => 'required|string|max:500',
                'items.*.unit'         => 'nullable|string|max:50',
                'items.*.quantity'     => 'required|numeric|min:0.01',
                'items.*.unit_price'   => 'nullable|numeric|min:0',
                'items.*.delivery_days'=> 'nullable|integer|min:0',
                'items.*.remarks'      => 'nullable|string',
            ]);

            $isReqBased = (bool) ($validated['is_requisition_based'] ?? false);
            if ($isReqBased && empty($validated['requisition_id'])) {
                return response()->json(['message' => 'Requisition is required.'], 422);
            }

            DB::beginTransaction();

            $year = date('Y');
            $last = RequestForQuotation::where('rfq_no', 'like', "RFQ-{$year}%")->latest('id')->first();
            $num  = $last ? ((int) substr($last->rfq_no, -5)) + 1 : 1;

            $rfq = RequestForQuotation::create([
                'rfq_no'               => sprintf('RFQ-%s%05d', $year, $num),
                'project_id'           => $validated['project_id'],
                'requisition_id'       => $validated['requisition_id'] ?? null,
                'is_requisition_based' => $isReqBased,
                'vendor_id'            => $validated['vendor_id'],
                'required_date'        => $validated['required_date'] ?? null,
                'submitted_date'       => $validated['submitted_date'] ?? null,
                'status'               => 'Draft',
                'notes'                => $validated['notes'] ?? null,
                'created_by'           => Auth::id(),
            ]);

            foreach ($validated['items'] as $row) {
                $qty   = (float) $row['quantity'];
                $price = (float) ($row['unit_price'] ?? 0);
                RequestForQuotationItem::create([
                    'request_for_quotation_id' => $rfq->id,
                    'requisition_item_id'      => $row['requisition_item_id'] ?? null,
                    'type'                     => $row['type'],
                    'item_id'                  => $row['item_id'] ?? null,
                    'description'              => $row['description'],
                    'unit'                     => $row['unit'] ?? null,
                    'quantity'                 => $qty,
                    'unit_price'               => $price,
                    'amount'                   => round($qty * $price, 2),
                    'delivery_days'            => $row['delivery_days'] ?? null,
                    'remarks'                  => $row['remarks'] ?? null,
                    'is_selected'              => true,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'RFQ saved successfully',
                'id'      => $rfq->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('RFQ store: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $rfq = RequestForQuotation::with([
            'project',
            'vendor',
            'requisition',
            'items',
            'createdBy',
            'approvedBy',
        ])->findOrFail($id);

        return view('pages.rfq.show', compact('rfq'));
    }

    public function edit($id)
    {
        $rfq = RequestForQuotation::with('items')->findOrFail($id);

        if (! $rfq->isEditable()) {
            return redirect()->route('rfq.show', $id)
                ->with('error', 'Only Draft/Pending RFQ can be edited.');
        }

        $projects = Project::select('id', 'name')->orderBy('name')->get();
        $vendors = Vendor::select('id', 'name')->orderBy('name')->get();

        return view('pages.rfq.create_and_edit', compact('rfq', 'projects', 'vendors'));
    }

    public function update(Request $request, $id)
    {
        $rfq = RequestForQuotation::findOrFail($id);

        if (! $rfq->isEditable()) {
            return response()->json(['message' => 'Only Draft/Pending can be updated.'], 422);
        }

        try {
            $validated = $request->validate([
                'project_id'           => 'required|exists:projects,id',
                'vendor_id'            => 'required|exists:vendors,id',
                'requisition_id'       => 'nullable|exists:requisitions,id',
                'is_requisition_based' => 'nullable|boolean',
                'required_date'        => 'nullable|date',
                'submitted_date'       => 'nullable|date',
                'notes'                => 'nullable|string',
                'items'                => 'required|array|min:1',
                'items.*.requisition_item_id' => 'nullable|exists:requisition_items,id',
                'items.*.type'         => 'required|in:Material,Equipment',
                'items.*.item_id'      => 'nullable|integer',
                'items.*.description'  => 'required|string|max:500',
                'items.*.unit'         => 'nullable|string|max:50',
                'items.*.quantity'     => 'required|numeric|min:0.01',
                'items.*.unit_price'   => 'nullable|numeric|min:0',
                'items.*.delivery_days'=> 'nullable|integer|min:0',
                'items.*.remarks'      => 'nullable|string',
            ]);

            DB::beginTransaction();

            $rfq->update([
                'project_id'           => $validated['project_id'],
                'requisition_id'       => $validated['requisition_id'] ?? null,
                'is_requisition_based' => (bool) ($validated['is_requisition_based'] ?? false),
                'vendor_id'            => $validated['vendor_id'],
                'required_date'        => $validated['required_date'] ?? null,
                'submitted_date'       => $validated['submitted_date'] ?? null,
                'notes'                => $validated['notes'] ?? null,
            ]);

            $rfq->items()->delete();

            foreach ($validated['items'] as $row) {
                $qty   = (float) $row['quantity'];
                $price = (float) ($row['unit_price'] ?? 0);
                RequestForQuotationItem::create([
                    'request_for_quotation_id' => $rfq->id,
                    'requisition_item_id'      => $row['requisition_item_id'] ?? null,
                    'type'                     => $row['type'],
                    'item_id'                  => $row['item_id'] ?? null,
                    'description'              => $row['description'],
                    'unit'                     => $row['unit'] ?? null,
                    'quantity'                 => $qty,
                    'unit_price'               => $price,
                    'amount'                   => round($qty * $price, 2),
                    'delivery_days'            => $row['delivery_days'] ?? null,
                    'remarks'                  => $row['remarks'] ?? null,
                    'is_selected'              => true,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'RFQ updated',
                'id'      => $rfq->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('RFQ update: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function approve($id)
    {
        $rfq = RequestForQuotation::with('items')->findOrFail($id);

        if (! in_array($rfq->status, ['Draft', 'Pending'], true)) {
            return response()->json(['message' => 'Only Draft/Pending can be approved.'], 422);
        }

        if ($rfq->items->isEmpty()) {
            return response()->json(['message' => 'RFQ has no items.'], 422);
        }

        // optional: require rates
        $missingRate = $rfq->items->contains(fn ($i) => (float) $i->unit_price <= 0);
        if ($missingRate) {
            return response()->json(['message' => 'All items need unit price before approve.'], 422);
        }

        $rfq->update([
            'status'      => 'Approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'RFQ approved. Ready for PO.',
            'status'  => 'Approved',
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $rfq = RequestForQuotation::findOrFail($id);
        $request->validate(['status' => 'required|in:Cancelled,Rejected']);

        if (! in_array($rfq->status, ['Draft', 'Pending'], true)) {
            return response()->json(['message' => 'Only Draft/Pending can be changed.'], 422);
        }

        $rfq->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status updated',
            'status'  => $rfq->status,
        ]);
    }

    public function downloadPdf($id)
    {
        $data = $this->pdfData($id);
        $pdf = PDF::loadView('pages.rfq.pdf', $data);
        return $pdf->download('rfq_' . $data['rfq']->rfq_no . '.pdf');
    }

    public function streamPdf($id)
    {
        $data = $this->pdfData($id);
        $pdf = PDF::loadView('pages.rfq.pdf', $data);
        return $pdf->stream('rfq_' . $data['rfq']->rfq_no . '.pdf');
    }

    protected function pdfData($id): array
    {
        $rfq = RequestForQuotation::with([
            'items',
            'vendor:id,vendor_id,name',
            'project:id,name',
            'createdBy:id,employee_id,name,department_id',
            'createdBy.department:id,name',
            'approvedBy:id,name',
            'requisition:id,requisition_id,project_id,boq_id,is_boq_based',
            'requisition.project:id,name',
            'requisition.boq:id,boq_no,title,revision',
        ])->findOrFail($id);

        return [
            'rfq'            => $rfq,
            'activeCurrency' => Currency::where('is_active', true)->first(),
            'configure'      => Configure::first(),
        ];
    }

    public function destroy($id)
    {
        $rfq = RequestForQuotation::findOrFail($id);

        if (! in_array($rfq->status, ['Draft', 'Pending'], true)) {
            return back()->with('error', 'Only Draft/Pending can be deleted.');
        }

        $rfq->items()->delete();
        $rfq->delete();

        return redirect()->route('rfq.index')->with('success', 'RFQ deleted.');
    }

    /** AJAX: approved req with open Material/Equipment lines */
    public function getApprovedRequisitions(Request $request)
    {
        $q = Requisition::with('project:id,name')
            ->where('status', 'Approved')
            ->whereHas('items', function ($iq) {
                $iq->whereIn('type', ['Material', 'Equipment'])
                   ->where(function ($s) {
                       $s->whereNull('status')
                         ->orWhereNotIn('status', ['Procured', 'Rejected', 'Cancelled']);
                   });
            });

        if ($request->filled('project_id')) {
            $q->where('project_id', $request->project_id);
        }
        if ($request->filled('keyword')) {
            $kw = $request->keyword;
            $q->where(function ($w) use ($kw) {
                $w->where('requisition_id', 'like', "%{$kw}%")
                  ->orWhere('purpose', 'like', "%{$kw}%");
            });
        }

        $list = $q->latest()->limit(30)->get()->map(fn ($r) => [
            'id'             => $r->id,
            'requisition_id' => $r->requisition_id,
            'project_id'     => $r->project_id,
            'project'        => $r->project->name ?? '',
            'purpose'        => $r->purpose,
        ]);

        return response()->json($list);
    }

    public function getRequisitionItems(Request $request)
    {
        $request->validate(['requisition_id' => 'required|exists:requisitions,id']);

        $req = Requisition::with('project:id,name')->findOrFail($request->requisition_id);

        $items = RequisitionItem::where('requisition_id', $req->id)
            ->whereIn('type', ['Material', 'Equipment'])
            ->where(function ($q) {
                $q->whereNull('status')
                  ->orWhereNotIn('status', ['Procured', 'Rejected', 'Cancelled']);
            })
            ->get();

        $matIds = $items->where('type', 'Material')->pluck('item_id')->unique()->filter();
        $eqIds  = $items->where('type', 'Equipment')->pluck('item_id')->unique()->filter();

        $matNames = $matIds->isNotEmpty()
            ? DB::table('materials')->whereIn('id', $matIds)->pluck('name', 'id')
            : collect();
        $eqNames = $eqIds->isNotEmpty()
            ? DB::table('equipment')->whereIn('id', $eqIds)->pluck('name', 'id')
            : collect();

        $mapped = $items->map(function ($item) use ($matNames, $eqNames) {
            $name = $item->type === 'Equipment'
                ? ($eqNames[$item->item_id] ?? null)
                : ($matNames[$item->item_id] ?? null);

            return [
                'requisition_item_id' => $item->id,
                'type'                => $item->type,
                'item_id'             => $item->item_id,
                'description'         => $name ?: ('#' . $item->item_id),
                'unit'                => $item->unit,
                'quantity'            => (float) $item->quantity,
                'unit_price'          => 0,
            ];
        })->values();

        return response()->json([
            'meta' => [
                'project_id' => $req->project_id,
                'project'    => $req->project->name ?? null,
                'count'      => $mapped->count(),
            ],
            'items' => $mapped,
        ]);
    }

    public function searchItems(Request $request)
    {
        $type = $request->get('type', 'Material');
        $kw   = $request->get('keyword', '');

        if ($type === 'Equipment') {
            $q = DB::table('equipment')->select('id', 'name')->where('name', 'like', "%{$kw}%");
        } else {
            $q = DB::table('materials')->select('id', 'name')->where('name', 'like', "%{$kw}%");
        }

        return response()->json($q->orderBy('name')->limit(20)->get());
    }

    // ===================== RFQ COMPARE =====================
    public function compare()
    {
        $projects = Project::select('id', 'name')->orderBy('name')->get();

        return view('pages.rfq.compare', compact('projects'));
    }
    
    // ===================== Shared payload for AJAX / PDF / Excel =====================     
    protected function buildComparePayload(int $requisitionId, bool $onlyApproved = true): array
    {
        $req = Requisition::with('project:id,name')->findOrFail($requisitionId);

        $reqItems = RequisitionItem::where('requisition_id', $req->id)
            ->whereIn('type', ['Material', 'Equipment'])
            ->get();

        $matIds = $reqItems->where('type', 'Material')->pluck('item_id')->unique()->filter();
        $eqIds  = $reqItems->where('type', 'Equipment')->pluck('item_id')->unique()->filter();

        $matNames = $matIds->isNotEmpty()
            ? DB::table('materials')->whereIn('id', $matIds)->pluck('name', 'id')
            : collect();
        $eqNames = $eqIds->isNotEmpty()
            ? DB::table('equipment')->whereIn('id', $eqIds)->pluck('name', 'id')
            : collect();

        $lines = $reqItems->map(function ($item) use ($matNames, $eqNames) {
            $name = $item->type === 'Equipment'
                ? ($eqNames[$item->item_id] ?? null)
                : ($matNames[$item->item_id] ?? null);

            return [
                'requisition_item_id' => $item->id,
                'type'                => $item->type,
                'item_id'             => $item->item_id,
                'name'                => $name ?: ('#' . $item->item_id),
                'unit'                => $item->unit,
                'qty'                 => (float) $item->quantity,
                'status'              => $item->status,
            ];
        })->values();

        $rfqQuery = RequestForQuotation::with(['vendor:id,name', 'items'])
            ->where('requisition_id', $req->id)
            ->where('is_requisition_based', true);

        if ($onlyApproved) {
            $rfqQuery->where('status', 'Approved');
        } else {
            $rfqQuery->whereNotIn('status', ['Cancelled', 'Rejected']);
        }

        $rfqs = $rfqQuery->orderBy('id')->get();

        $columns = $rfqs->map(fn ($rfq) => [
            'rfq_id' => $rfq->id,
            'rfq_no' => $rfq->rfq_no,
            'vendor' => $rfq->vendor->name ?? '—',
            'status' => $rfq->status,
        ])->values();

        $matrix = [];
        foreach ($rfqs as $rfq) {
            foreach ($rfq->items as $qi) {
                $key = $qi->requisition_item_id;
                if (!$key) {
                    $match = $lines->first(fn ($l) =>
                        $l['type'] === $qi->type && (int) $l['item_id'] === (int) $qi->item_id
                    );
                    $key = $match['requisition_item_id'] ?? null;
                }
                if (!$key) {
                    continue;
                }
                $matrix[$key][$rfq->id] = [
                    'rfq_item_id'   => $qi->id,
                    'unit_price'    => (float) $qi->unit_price,
                    'quantity'      => (float) $qi->quantity,
                    'amount'        => (float) ($qi->amount ?? $qi->quantity * $qi->unit_price),
                    'delivery_days' => $qi->delivery_days,
                ];
            }
        }

        $best = [];
        foreach ($lines as $line) {
            $rid = $line['requisition_item_id'];
            $prices = collect($matrix[$rid] ?? [])
                ->filter(fn ($c) => ($c['unit_price'] ?? 0) > 0)
                ->map(fn ($c, $rfqId) => [
                    'rfq_id'     => (int) $rfqId,
                    'unit_price' => $c['unit_price'],
                ]);

            $best[$rid] = $prices->isEmpty()
                ? null
                : $prices->sortBy('unit_price')->first();
        }

        return [
            'meta' => [
                'requisition_id' => $req->id,
                'requisition_no' => $req->requisition_id,
                'project'        => $req->project->name ?? null,
                'rfq_count'      => $columns->count(),
                'line_count'     => $lines->count(),
            ],
            'columns' => $columns,
            'lines'   => $lines,
            'matrix'  => $matrix,
            'best'    => $best,
            'req'     => $req,
        ];
    }

    public function compareData(Request $request)
    {
        $request->validate([
            'requisition_id' => 'required|exists:requisitions,id',
        ]);

        $payload = $this->buildComparePayload(
            (int) $request->requisition_id,
            $request->boolean('only_approved', true)
        );
        unset($payload['req']);

        return response()->json($payload);
    }

    public function compareStreamPdf(Request $request)
    {
        $request->validate([
            'requisition_id' => 'required|exists:requisitions,id',
        ]);

        $payload = $this->buildComparePayload(
            (int) $request->requisition_id,
            $request->boolean('only_approved', true)
        );

        $pdf = PDF::loadView('pages.rfq.compare_pdf', [
            'payload'   => $payload,
            'configure' => Configure::first(),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('rfq_compare_' . $payload['meta']['requisition_no'] . '.pdf');
    }

    public function compareDownloadPdf(Request $request)
    {
        $request->validate([
            'requisition_id' => 'required|exists:requisitions,id',
        ]);

        $payload = $this->buildComparePayload(
            (int) $request->requisition_id,
            $request->boolean('only_approved', true)
        );

        $pdf = PDF::loadView('pages.rfq.compare_pdf', [
            'payload'   => $payload,
            'configure' => Configure::first(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('rfq_compare_' . $payload['meta']['requisition_no'] . '.pdf');
    }

    public function compareExportExcel(Request $request)
    {
        $request->validate([
            'requisition_id' => 'required|exists:requisitions,id',
        ]);

        $payload = $this->buildComparePayload(
            (int) $request->requisition_id,
            $request->boolean('only_approved', true)
        );

        $filename = 'rfq_compare_' . preg_replace('/\W+/', '_', $payload['meta']['requisition_no']) . '.xlsx';

        return Excel::download(
            new RfqCompareExport($payload, Configure::first()),
            $filename
        );
    }
}
