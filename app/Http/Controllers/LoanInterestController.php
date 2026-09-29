<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\Designation;
use App\Models\LoanInterest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;
use Inertia\Response;

class LoanInterestController extends Controller
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
        if (is_null($this->user) || !$this->user->can('settings.interest')) {
            abort('403', 'Unauthorized access');
        }

        $query = LoanInterest::with(['designation:id,name,code', 'createdBy:id,employee_id,name']);

        // Paginate with 200 records per page
        $interests = $query->latest()->paginate(50);


        return Inertia::render('settings/interest/index', [
            "data" => $interests,
            'filters' => [
                'interest_id' => $request->interest_id,
            ],
        ]);

    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.interest')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'designation' => ['required', 'exists:designations,id'],
            'rate' => ['required', 'numeric'],
            'status' => ['required', 'in:active,inactive']
        ]);

        // Check if the employee already has a commission record
        $exists = LoanInterest::where('designation_id', $request->designation)->exists();

        if ($exists) {
            // return with error message if duplicate found

            return redirect()->back()->with("notification", [
                'message' => 'This designation already has a interest rate!',
                'type' => 'error'
            ]);
        }

        $interest = new LoanInterest();
        $interest->designation_id = $request->designation;
        $interest->rate = $request->rate;
        $interest->status = $request->status;
        $interest->created_by = Auth::id();
        $interest->save();


        return redirect()->back()->with("notification", [
            'message' => 'Interest Save Successfully',
            'type' => 'success'
        ]);
    }

    public function edit($id)
    {
        if (is_null($this->user) || !$this->user->can('settings.interest')) {
            abort('403', 'Unauthorized access');
        }

        $interest = LoanInterest::with('designation:id,code,name')->findOrFail($id);
        return response()->json($interest);
    }

    public function updateInterest(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.interest')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'rate' => ['required', 'numeric']
        ]);

        $interest = LoanInterest::whereId($request->id)->first();

        $interest->rate = $request->rate;
        $interest->status = $request->status;
        $interest->created_by = Auth::id();
        $interest->save();



        return redirect()->back()->with("notification", [
            'message' => 'Interest Updated Successfully',
            'type' => 'success'
        ]);
    }

    public function destroy($id)
    {
        if (is_null($this->user) || !$this->user->can('settings.interest')) {
            abort('403', 'Unauthorized access');
        }

        $interest = LoanInterest::findOrFail($id);
        $deleteInterest = $interest->delete();

        if ($deleteInterest) {

            return redirect()->back()->with("notification", [
                'message' => 'Interest Deleted successfully!',
                'type' => 'success'
            ]);
        }
    }
}

