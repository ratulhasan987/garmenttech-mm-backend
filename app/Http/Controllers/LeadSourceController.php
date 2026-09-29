<?php

namespace App\Http\Controllers;

use App\Models\LeadSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeadSourceController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();

            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $this->authorizePermission('crm.sources');

        $data = LeadSource::query()
            ->when($request->filled('source_id'), function ($query) use ($request) {
                $query->where('id', $request->source_id);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();


        $selectedSource = $request->filled('source_id')
            ? $data->first()
            : null;

        return Inertia::render('crm/settings/lead-source/index', [
            'data' => $data,
            'filters' => [
                'source' => $selectedSource,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('crm.sources');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:lead_sources,name'],
            'cost_per_lead' => ['nullable', 'numeric'],
            'is_active' => ['required', 'boolean'],
            'is_default' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated) {
            if ($validated['is_default']) {
                LeadSource::query()->update([
                    'is_default' => false,
                ]);
            }

            LeadSource::create([
                'name' => ucfirst($validated['name']),
                'cost_per_lead' => $validated['cost_per_lead'] ?? null,
                'is_active' => $validated['is_active'],
                'is_default' => $validated['is_default'],
            ]);
        });

        return redirect()->back()->with('notification', [
            'message' => 'New source saved successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function edit(LeadSource $leadSource)
    {
        $this->authorizePermission('crm.sources');

        return response()->json($leadSource);
    }

    public function updateSource(Request $request)
    {
        $this->authorizePermission('crm.sources');

        $source = LeadSource::findOrFail($request->id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:lead_sources,name,' . $source->id,
            ],
            'cost_per_lead' => ['nullable', 'numeric'],
            'is_active' => ['required', 'boolean'],
            'is_default' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($source, $validated) {
            if ($validated['is_default']) {
                LeadSource::query()
                    ->where('id', '!=', $source->id)
                    ->update([
                        'is_default' => false,
                    ]);
            }

            $source->update([
                'name' => ucfirst($validated['name']),
                'cost_per_lead' => $validated['cost_per_lead'] ?? null,
                'is_active' => $validated['is_active'],
                'is_default' => $validated['is_default'],
            ]);
        });

        return redirect()->back()->with('notification', [
            'message' => 'Source updated successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function destroy(LeadSource $leadSource)
    {
        $this->authorizePermission('crm.sources');

        $leadSource->delete();

        return redirect()->back()->with('notification', [
            'message' => 'Source deleted successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function getLeadSources(Request $request)
    {
        $this->authorizePermission('crm.sources');

        $keyword = $request->keyword;

        $sources = LeadSource::query()
            ->select('id', 'name', 'is_default')
            ->when($keyword, function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%");
            })
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($sources);
    }
}
