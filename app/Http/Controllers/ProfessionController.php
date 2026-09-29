<?php

namespace App\Http\Controllers;

use App\Models\Profession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfessionController extends Controller
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
        $this->authorizePermission("crm.professions");

        $data = Profession::query()
            ->when(
                $request->filled('profession_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->profession_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('crm/settings/lead-profession/index', [
            "data" => $data,
            'filters' => [
                'profession_id' => $request->profession_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission("crm.professions");

        $request->validate([
            'name' => ['required', 'unique:professions,name', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $profession = new Profession();
        $profession->name = ucfirst($request->name);
        $profession->is_active = $request->boolean('is_active');
        $profession->save();

        return redirect()->back()->with("notification", [
            'message' => 'New profession save successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function edit(Profession $profession)
    {
        $this->authorizePermission("crm.professions");

        if (is_null($this->user) || !$this->user->can('cmr.professions')) {
            abort('403', 'Unauthorized access');
        }

        return response()->json($profession);
    }

    public function updateProfession(Request $request)
    {
        $this->authorizePermission("crm.professions");

        $request->validate([
            'name' => ['required', "unique:professions,name,{$request->id}", 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $profession = Profession::whereId($request->id)->first();
        $profession->name = ucfirst($request->name);
        $profession->is_active = $request->boolean('is_active');
        $profession->save();

        return redirect()->back()->with("notification", [
            'message' => 'Profession updated successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function destroy(Profession $profession)
    {
        $this->authorizePermission("crm.professions");

        $delete = $profession->delete();

        if ($delete) {
            return redirect()->back()->with("notification", [
                'message' => 'Profession deleted successfully!',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
        }
    }

    public function getLeadProfessions(Request $request)
    {
        $keyword = $request->keyword;

        $query = Profession::query()
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
