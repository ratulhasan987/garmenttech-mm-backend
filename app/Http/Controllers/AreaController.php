<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AreaController extends Controller
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
        $this->authorizePermission("crm.areas");

        $data = Area::query()
            ->when(
                $request->filled('area_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->area_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('crm/settings/lead-area/index', [
            "data" => $data,
            'filters' => [
                'sector_id' => $request->sector_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission("crm.areas");

        $request->validate([
            'name' => ['required', 'unique:areas,name', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $source = new Area();
        $source->name = ucfirst($request->name);
        $source->is_active = $request->boolean('is_active');
        $source->save();

        return redirect()->back()->with("notification", [
            'message' => 'New area save successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function edit(Area $area)
    {
        $this->authorizePermission("crm.areas");

        return response()->json($area);
    }

    public function updateArea(Request $request)
    {
        $this->authorizePermission("crm.areas");

        $request->validate([
            'name' => ['required', "unique:areas,name,{$request->id}", 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $source = Area::whereId($request->id)->first();
        $source->name = ucfirst($request->name);
        $source->is_active = $request->boolean('is_active');
        $source->save();

        return redirect()->back()->with('notification', [
            'message' => 'Area updated successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function destroy(Area $area)
    {
        $this->authorizePermission("crm.areas");

        $delete = $area->delete();

        if ($delete) {

            return redirect()->back()->with("notification", [
                'message' => 'Area deleted successfully!',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
        }
    }


    public function getLeadArea(Request $request)
    {
        $keyword = $request->keyword;

        $query = Area::query()
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
