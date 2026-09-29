<?php

namespace App\Http\Controllers;

use App\Models\LeadDesignation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeadDesignationController extends Controller
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
        $this->authorizePermission("crm.designations");


        $data = LeadDesignation::query()
            ->when(
                $request->filled('designation_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->designation_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('crm/settings/lead-designation/index', [
            "data" => $data,
            'filters' => [
                'designation_id' => $request->designation_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission("crm.designations");

        $request->validate([
            'code' => ['required', 'unique:lead_designations,code', 'string', 'max:255'],
            'name' => ['required', 'unique:lead_designations,name', 'string', 'max:255']
        ]);

        $designation = new LeadDesignation();
        $designation->code = $request->code;
        $designation->name = ucfirst($request->name);
        $designation->save();

        return redirect()->back()->with("notification", [
            'message' => 'New designation Save Successfully',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function edit(LeadDesignation $leadDesignation)
    {
        $this->authorizePermission("crm.designations");

        return response()->json($leadDesignation);
    }

    public function updateDesignation(Request $request)
    {
        $this->authorizePermission("crm.designations");

        $request->validate([
            'code' => ['required', "unique:lead_designations,code, $request->id", 'string', 'max:255'],
            'name' => ['required', "unique:lead_designations,name, $request->id", 'string', 'max:255']
        ]);

        $designation = LeadDesignation::whereId($request->id)->first();
        $designation->code = $request->code;
        $designation->name = ucfirst($request->name);
        $designation->save();

        return redirect()->back()->with("notification", [
            'message' => 'Designation Updated Successfully',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function destroy(LeadDesignation $leadDesignation)
    {
        $this->authorizePermission("crm.designations");


        $deleteDesignation = $leadDesignation->delete();

        if ($deleteDesignation) {

            $notification = [

            ];

            return redirect()->back()->with("notification", [
                'message' => 'Designation Deleted successfully!',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
        }
    }

    public function getLeadDesignations(Request $request)
    {
        $keyword = $request->keyword;

        $query = LeadDesignation::query()
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
