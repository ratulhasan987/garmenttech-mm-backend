<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Boq;
use App\Models\BoqItem;
use App\Models\Project;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequisitionReportController extends Controller
{
    public function index()
    {
        return view('pages.reports.requisitions.index');
    }

    // 1. Register — all types
    public function register(Request $request)
    {
        $query = Requisition::with([
            'project:id,name',
            'requestedBy:id,name',
        ])->withCount('items');

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        // type filter via items
        if ($request->filled('type')) {
            $type = $request->type;
            $query->whereHas('items', function ($q) use ($type) {
                $q->whereRaw('LOWER(type) = ?', [strtolower($type)]);
            });
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('keyword')) {
            $kw = $request->keyword;
            $query->where(function ($q) use ($kw) {
                $q->where('requisition_id', 'like', "%{$kw}%")
                  ->orWhere('purpose', 'like', "%{$kw}%");
            });
        }

        $rows = $query->latest()->paginate(50)->withQueryString();
        $projects = Project::select('id', 'name')->orderBy('name')->get();

        return view('pages.reports.requisitions.register', compact('rows', 'projects'));
    }

    // 2. Requisition vs BOQ
    public function vsBoq(Request $request)
    {
        $projects = Project::select('id', 'name')->orderBy('name')->get();
        $boqs = collect();
        $rows = collect();

        if ($request->filled('project_id')) {
            $boqs = Boq::where('project_id', $request->project_id)
                ->select('id', 'title', 'boq_no')
                ->orderBy('id', 'desc')
                ->get();
        }

        if ($request->filled('project_id')) {
            // BOQ lines (optional filter by boq_id)
            $boqItemsQuery = BoqItem::query()
                ->whereHas('boq', fn ($q) => $q->where('project_id', $request->project_id));

            if ($request->filled('boq_id')) {
                $boqItemsQuery->where('boq_id', $request->boq_id);
            }
            if ($request->filled('type')) {
                $boqItemsQuery->whereRaw('LOWER(type) = ?', [strtolower($request->type)]);
            }

            $boqItems = $boqItemsQuery->get();

            // Sum requisition qty by item (same project, optional type)
            $reqAgg = RequisitionItem::query()
                ->select('item_id', 'type', DB::raw('SUM(quantity) as req_qty'))
                ->whereHas('requisition', function ($q) use ($request) {
                    $q->where('project_id', $request->project_id)
                      ->whereNotIn('status', ['Cancelled', 'Rejected']);
                })
                ->when($request->filled('type'), function ($q) use ($request) {
                    $q->whereRaw('LOWER(type) = ?', [strtolower($request->type)]);
                })
                ->whereNotNull('item_id')
                ->groupBy('item_id', 'type')
                ->get()
                ->keyBy(fn ($r) => strtolower($r->type) . '_' . $r->item_id);

            $rows = $boqItems->map(function ($bi) use ($reqAgg) {
                $key = strtolower((string) $bi->type) . '_' . $bi->item_id;
                $reqQty = (float) ($reqAgg[$key]->req_qty ?? 0);
                $boqQty = (float) $bi->quantity;
                $variance = $reqQty - $boqQty;

                return (object) [
                    'type'        => $bi->type,
                    'item_id'     => $bi->item_id,
                    'description' => $bi->description ?? $bi->name ?? ('#' . $bi->item_id),
                    'unit'        => $bi->unit,
                    'boq_qty'     => $boqQty,
                    'req_qty'     => $reqQty,
                    'variance'    => $variance,
                    'pct'         => $boqQty > 0 ? round(($reqQty / $boqQty) * 100, 1) : null,
                ];
            });

            // Only over/under filter
            if ($request->filter === 'over') {
                $rows = $rows->filter(fn ($r) => $r->variance > 0)->values();
            } elseif ($request->filter === 'under') {
                $rows = $rows->filter(fn ($r) => $r->variance < 0)->values();
            }
        }

        return view('pages.reports.requisitions.vs_boq', compact('projects', 'boqs', 'rows'));
    }

    // 3. Pending — header not final OR lines not procured
    public function pending(Request $request)
    {
        // A) Headers still open
        $headers = Requisition::with('project:id,name')
            ->withCount('items')
            ->whereIn('status', ['Draft', 'Pending', 'Submitted']) // adjust to your statuses
            ->when($request->project_id, fn ($q) => $q->where('project_id', $request->project_id))
            ->latest()
            ->get();

        // B) Approved headers but open lines (not Procured)
        $openLines = RequisitionItem::with(['requisition.project'])
            ->where(function ($q) {
                $q->whereNull('status')
                  ->orWhereNotIn('status', ['Procured', 'Rejected', 'Cancelled']);
            })
            ->whereHas('requisition', function ($q) use ($request) {
                $q->where('status', 'Approved');
                if ($request->filled('project_id')) {
                    $q->where('project_id', $request->project_id);
                }
            })
            ->when($request->filled('type'), function ($q) use ($request) {
                $q->whereRaw('LOWER(type) = ?', [strtolower($request->type)]);
            })
            ->orderBy('requisition_id')
            ->limit(500)
            ->get();

        $projects = Project::select('id', 'name')->orderBy('name')->get();

        return view('pages.reports.requisitions.pending', compact('headers', 'openLines', 'projects'));
    }

    // 4. Fulfillment — line status overview
    public function fulfillment(Request $request)
    {
        $query = RequisitionItem::with(['requisition.project'])
            ->whereHas('requisition', function ($q) use ($request) {
                if ($request->filled('project_id')) {
                    $q->where('project_id', $request->project_id);
                }
                $q->whereNotIn('status', ['Cancelled', 'Rejected']);
            });

        if ($request->filled('type')) {
            $query->whereRaw('LOWER(type) = ?', [strtolower($request->type)]);
        }

        if ($request->filled('line_status')) {
            if ($request->line_status === 'Open') {
                $query->where(function ($q) {
                    $q->whereNull('status')
                    ->orWhereNotIn('status', ['Procured', 'Rejected', 'Cancelled']);
                });
            } else {
                $query->where('status', $request->line_status);
            }
        }

        $rows = $query->latest('id')->paginate(50)->withQueryString();

        // Resolve names by type from master tables
        $grouped = $rows->getCollection()->groupBy(fn ($i) => strtolower((string) $i->type));

        $materialIds    = ($grouped->get('material') ?? collect())->pluck('item_id')->unique()->filter();
        $equipmentIds   = ($grouped->get('equipment') ?? collect())->pluck('item_id')->unique()->filter();
        $laborIds       = ($grouped->get('labor') ?? collect())->pluck('item_id')->unique()->filter();
        $subcontractIds = ($grouped->get('subcontract') ?? collect())->pluck('item_id')->unique()->filter();

        $materialNames    = $materialIds->isNotEmpty()
            ? DB::table('materials')->whereIn('id', $materialIds)->pluck('name', 'id')
            : collect();
        $equipmentNames   = $equipmentIds->isNotEmpty()
            ? DB::table('equipment')->whereIn('id', $equipmentIds)->pluck('name', 'id')
            : collect();
        $laborNames       = $laborIds->isNotEmpty()
            ? DB::table('labors')->whereIn('id', $laborIds)->pluck('name', 'id')
            : collect();
        $subcontractNames = $subcontractIds->isNotEmpty()
            ? DB::table('subcontracts')->whereIn('id', $subcontractIds)->pluck('name', 'id')
            : collect();

        $rows->setCollection(
            $rows->getCollection()->map(function ($line) use (
                $materialNames, $equipmentNames, $laborNames, $subcontractNames
            ) {
                $type = strtolower((string) $line->type);
                $name = match ($type) {
                    'material'    => $materialNames[$line->item_id] ?? null,
                    'equipment'   => $equipmentNames[$line->item_id] ?? null,
                    'labor'       => $laborNames[$line->item_id] ?? null,
                    'subcontract' => $subcontractNames[$line->item_id] ?? null,
                    default       => null,
                };
                $line->display_name = $name ?: ('#' . $line->item_id);
                return $line;
            })
        );

        // Summary counts
        $base = RequisitionItem::whereHas('requisition', function ($q) use ($request) {
            if ($request->filled('project_id')) {
                $q->where('project_id', $request->project_id);
            }
            $q->whereNotIn('status', ['Cancelled', 'Rejected']);
        });
        if ($request->filled('type')) {
            $base->whereRaw('LOWER(type) = ?', [strtolower($request->type)]);
        }

        $summary = [
            'total'    => (clone $base)->count(),
            'procured' => (clone $base)->where('status', 'Procured')->count(),
            'open'     => (clone $base)->where(function ($q) {
                $q->whereNull('status')
                ->orWhereNotIn('status', ['Procured', 'Rejected', 'Cancelled']);
            })->count(),
        ];
        $summary['pct'] = $summary['total'] > 0
            ? round(($summary['procured'] / $summary['total']) * 100, 1)
            : 0;

        $projects = Project::select('id', 'name')->orderBy('name')->get();

        return view('pages.reports.requisitions.fulfillment', compact('rows', 'summary', 'projects'));
    }

    // 5. By type summary — advanced
    public function byType(Request $request)
    {
        $types = ['Material', 'Equipment', 'Labor', 'Subcontract'];

        $reqScope = function ($q) use ($request) {
            if ($request->filled('project_id')) {
                $q->where('project_id', $request->project_id);
            }
            if ($request->filled('date_from')) {
                $q->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $q->whereDate('created_at', '<=', $request->date_to);
            }
            $q->whereNotIn('status', ['Cancelled', 'Rejected']);
        };

        // Line aggregates by type + status
        $raw = RequisitionItem::query()
            ->select(
                'type',
                'status',
                DB::raw('COUNT(*) as cnt'),
                DB::raw('SUM(quantity) as qty')
            )
            ->whereHas('requisition', $reqScope)
            ->groupBy('type', 'status')
            ->get();

        $byType = [];
        foreach ($types as $type) {
            $subset = $raw->filter(fn ($r) => strcasecmp((string) $r->type, $type) === 0);
            $lineCount = (int) $subset->sum('cnt');
            $procured  = (int) $subset->where('status', 'Procured')->sum('cnt');
            $pending   = (int) $subset->where('status', 'Pending')->sum('cnt');
            $approved  = (int) $subset->where('status', 'Approved')->sum('cnt');
            $rejected  = (int) $subset->where('status', 'Rejected')->sum('cnt');
            $open      = max(0, $lineCount - $procured - $rejected);
            $totalQty  = (float) $subset->sum('qty');

            $byType[] = (object) [
                'type'            => $type,
                'line_count'      => $lineCount,
                'procured_lines'  => $procured,
                'pending_lines'   => $pending,
                'approved_lines'  => $approved,
                'rejected_lines'  => $rejected,
                'open_lines'      => $open,
                'total_qty'       => $totalQty,
                'pct'             => $lineCount > 0 ? round(($procured / $lineCount) * 100, 1) : 0,
            ];
        }

        $rows = collect($byType);

        // Header stats — fixed order
        $headerOrder = ['Draft', 'Pending', 'Approved', 'Cancelled', 'Rejected'];
        $headerRaw = Requisition::query()
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->when($request->project_id, fn ($q) => $q->where('project_id', $request->project_id))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->groupBy('status')
            ->pluck('cnt', 'status');

        $headerStats = collect($headerOrder)
            ->mapWithKeys(fn ($s) => [$s => (int) ($headerRaw[$s] ?? 0)])
            ->filter(fn ($cnt) => $cnt > 0)
            ->merge($headerRaw->except($headerOrder)); // any extra statuses

        // Overall KPI
        $overall = [
            'headers'  => (int) $headerRaw->sum(),
            'lines'    => (int) $rows->sum('line_count'),
            'procured' => (int) $rows->sum('procured_lines'),
            'open'     => (int) $rows->sum('open_lines'),
            'qty'      => (float) $rows->sum('total_qty'),
        ];
        $overall['pct'] = $overall['lines'] > 0
            ? round(($overall['procured'] / $overall['lines']) * 100, 1)
            : 0;

        // Optional: requisitions that contain each type (distinct headers per type)
        $typeHeaderCounts = RequisitionItem::query()
            ->select('type', DB::raw('COUNT(DISTINCT requisition_id) as req_count'))
            ->whereHas('requisition', $reqScope)
            ->groupBy('type')
            ->pluck('req_count', 'type');

        $rows = $rows->map(function ($r) use ($typeHeaderCounts) {
            $r->req_count = (int) ($typeHeaderCounts[$r->type] ?? 0);
            return $r;
        });

        $projects = Project::select('id', 'name')->orderBy('name')->get();

        return view('pages.reports.requisitions.by_type', compact(
            'rows', 'headerStats', 'overall', 'projects'
        ));
    }
}