<?php

namespace App\Http\Controllers;

use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SectorController extends Controller
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
        $this->authorizePermission("crm.sectors");

        $data = Sector::query()
            ->when(
                $request->filled('sector_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->sector_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('crm/settings/lead-sector/index', [
            "data" => $data,
            'filters' => [
                'sector_id' => $request->sector_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission("crm.sectors");

        $request->validate([
            'name' => ['required', 'unique:sectors,name', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $source = new Sector();
        $source->name = ucfirst($request->name);
        $source->is_active = $request->boolean('is_active');
        $source->save();


        return redirect()->back()->with("notification", [
            'message' => 'New sector save successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function edit(Sector $sector)
    {
        $this->authorizePermission("crm.sectors");

        return response()->json($sector);
    }

    public function updateSector(Request $request)
    {
        $this->authorizePermission("crm.sectors");

        $request->validate([
            'name' => ['required', "unique:sectors,name,{$request->id}", 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $source = Sector::whereId($request->id)->first();
        $source->name = ucfirst($request->name);
        $source->is_active = $request->boolean('is_active');
        $source->save();

        return redirect()->back()->with('notification', [
            'message' => 'Sector updated successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function destroy(Sector $sector)
    {
        $this->authorizePermission("crm.sectors");

        $delete = $sector->delete();

        if ($delete) {
            return redirect()->back()->with('notification', [
                'message' => 'Sector deleted successfully!',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
        }
    }

    public function getLeadSectors(Request $request)
    {
        $keyword = $request->keyword;

        $query = Sector::query()
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

