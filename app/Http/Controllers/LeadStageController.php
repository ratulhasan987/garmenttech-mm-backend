<?php

namespace App\Http\Controllers;

use App\Models\LeadStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeadStageController extends Controller
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
        $this->authorizePermission("crm.stages");

        $data = LeadStage::query()
            ->when(
                $request->filled('stage_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->stage_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('crm/settings/lead-stage/index', [
            "data" => $data,
            'filters' => [
                'stage_id' => $request->stage_id,
            ],
        ]);

    }

    public function store(Request $request)
    {
        $this->authorizePermission('crm.stages');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:lead_stages,name'],
            'probability_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'order' => ['required', 'integer', 'min:1'],
            'color' => ['required', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
            'is_convert_to_customer' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $validated) {
            if ($request->boolean('is_default')) {
                LeadStage::query()->update([
                    'is_default' => false,
                ]);
            }

            LeadStage::create([
                'name' => ucfirst($validated['name']),
                'probability_percent' => $validated['probability_percent'],
                'order' => $validated['order'],
                'color' => $validated['color'],
                'is_active' => $request->boolean('is_active'),
                'is_default' => $request->boolean('is_default'),
                'is_convert_to_customer' => $request->boolean(
                    'is_convert_to_customer'
                ),
            ]);
        });

        return redirect()->back()->with('notification', [
            'message' => 'New stage saved successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function edit(LeadStage $leadStage)
    {
        $this->authorizePermission("crm.stages");

        return response()->json($leadStage);
    }

    public function updateStage(Request $request)
    {
        $this->authorizePermission('crm.stages');

        $validated = $request->validate([
            'id' => ['required', 'exists:lead_stages,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:lead_stages,name,' . $request->id,
            ],
            'probability_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'order' => ['required', 'integer', 'min:1'],
            'color' => ['required', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
            'is_convert_to_customer' => ['nullable', 'boolean'],
        ]);

        $stage = LeadStage::findOrFail($validated['id']);

        DB::transaction(function () use ($request, $validated, $stage) {
            if ($request->boolean('is_default')) {
                LeadStage::query()
                    ->where('id', '!=', $stage->id)
                    ->update([
                        'is_default' => false,
                    ]);
            }

            // Only one stage can enable automatic customer conversion.
            if ($request->boolean('is_convert_to_customer')) {
                LeadStage::query()
                    ->where('id', '!=', $stage->id)
                    ->update([
                        'is_convert_to_customer' => false,
                    ]);
            }

            $stage->update([
                'name' => ucfirst($validated['name']),
                'probability_percent' => $validated['probability_percent'],
                'order' => $validated['order'],
                'color' => $validated['color'],
                'is_active' => $request->boolean('is_active'),
                'is_default' => $request->boolean('is_default'),
                'is_convert_to_customer' => $request->boolean(
                    'is_convert_to_customer'
                ),
            ]);
        });

        return redirect()->back()->with('notification', [
            'message' => 'Stage updated successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function destroy(LeadStage $leadStage)
    {
        $this->authorizePermission("crm.stages");

        if ($leadStage->leads()->exists()) {
            return back()->with('notification', [
                'message' => 'This lead stage cannot be deleted because it is assigned to existing leads.',
                'type' => 'error',
                'key' => (string) str()->uuid(),
            ]);
        }

        $delete = $leadStage->delete();

        if ($delete) {
            return redirect()->back()->with("notification", [
                'message' => 'Stage deleted successfully!',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
        }
    }

    public function getLeadStages(Request $request)
    {
        $this->authorizePermission("crm.stages");

        $keyword = $request->keyword;

        $query = LeadStage::query()
            ->select(
                'id',
                'name'
            );

        if (!empty($keyword)) {
            $query->where(function ($query) use ($keyword) {
                $query
                    ->where(
                        'name',
                        'like',
                        "%{$keyword}%"
                    );
            });
        }

        $departments = $query
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($departments);
    }
}
