<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
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
        if (is_null($this->user) || !$this->user->can('settings.units')) {
            abort('403', 'Unauthorized access');
        }
        $data = Unit::query()
            ->when(
                $request->filled('unit_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->unit_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('settings/unit/index', [
            "data" => $data,
            'filters' => [
                'unit_id' => $request->unit_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.units')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', 'unique:units,name', 'string', 'max:255']
        ]);

        $unit = new Unit();
        $unit->name = ucfirst($request->name);
        $unit->save();


        return redirect()->back()->with("notification", [
            'message' => 'New unit Save Successfully',
            'type' => 'success'
        ]);
    }

    public function edit(Unit $unit)
    {
        if (is_null($this->user) || !$this->user->can('settings.units')) {
            abort('403', 'Unauthorized access');
        }

        return response()->json($unit);
    }

    public function updateUnit(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.units')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', "unique:units,name, $request->id", 'string', 'max:255']
        ]);

        $unit = Unit::whereId($request->id)->first();
        $unit->name = ucfirst($request->name);
        $unit->save();


        return redirect()->back()->with("notification", [
            'message' => 'Unit Updated Successfully',
            'type' => 'success'
        ]);
    }

    public function destroy(Unit $unit)
    {
        if (is_null($this->user) || !$this->user->can('settings.units')) {
            abort('403', 'Unauthorized access');
        }

        $deleteUnit = $unit->delete();

        if ($deleteUnit) {



            return redirect()->back()->with("notification", [
                'message' => 'Unit Deleted successfully!',
                'type' => 'success'
            ]);
        }
    }

    public function getUnits(Request $request)
    {
        $keyword = $request->keyword;

        $query = Unit::query()
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
                    )
                ;
            });
        }

        $units = $query
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($units);
    }
}
