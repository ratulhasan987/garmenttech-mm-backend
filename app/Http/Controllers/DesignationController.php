<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DesignationController extends Controller
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
        if (is_null($this->user) || !$this->user->can('settings.designation')) {
            abort('403', 'Unauthorized access');
        }

        $data = Designation::query()
            ->when(
                $request->filled('designation_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->department_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('settings/designation/index', [
            "data" => $data,
            'filters' => [
                'designation_id' => $request->designation_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.designation')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'code' => ['required', 'unique:designations,code', 'string', 'max:255'],
            'name' => ['required', 'unique:designations,name', 'string', 'max:255']
        ]);

        $designation = new Designation();
        $designation->code = $request->code;
        $designation->name = ucfirst($request->name);
        $designation->save();

        return redirect()->back()->with("notification", [
            'message' => 'New designation Save Successfully',
            'type' => 'success'
        ]);
    }

    public function edit(Designation $designation)
    {
        if (is_null($this->user) || !$this->user->can('settings.designation')) {
            abort('403', 'Unauthorized access');
        }

        return response()->json($designation);
    }

    public function updateDesignation(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.designation')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'code' => ['required', "unique:designations,code, $request->id", 'string', 'max:255'],
            'name' => ['required', "unique:designations,name, $request->id", 'string', 'max:255']
        ]);

        $designation = Designation::whereId($request->id)->first();
        $designation->code = $request->code;
        $designation->name = ucfirst($request->name);
        $designation->save();


        return redirect()->back()->with("notification", [
            'message' => 'Designation Updated Successfully',
            'type' => 'success'
        ]);
    }

    public function destroy(Designation $designation)
    {
        if (is_null($this->user) || !$this->user->can('settings.designation')) {
            abort('403', 'Unauthorized access');
        }

        $deleteDesignation = $designation->delete();

        if ($deleteDesignation) {



            return redirect()->back()->with("notification", [
                'message' => 'Designation Deleted successfully!',
                'type' => 'success'
            ]);
        }
    }

    public function getDesignations(Request $request)
    {
        $keyword = $request->keyword;

        $query = DB::table('designations')->select('id', 'name', 'code');

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('code', 'like', "%{$keyword}%");
            });
        }

        // Always return max 20 desi$designations
        $designations = $query->orderBy('name')->limit(20)->get();

        return response()->json($designations);
    }


}
