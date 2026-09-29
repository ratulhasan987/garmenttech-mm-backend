<?php

namespace App\Http\Controllers;

use App\Models\SalesCommissionConfigure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;
use Inertia\Response;

class SalesCommissionConfigureController extends Controller
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
        if (is_null($this->user) || !$this->user->can('settings.commission')) {
            abort('403', 'Unauthorized access');
        }

        // [Biztek] CHANGED - paginate with relations, return Inertia with "data" key
        $commissions = SalesCommissionConfigure::with(['user:id,employee_id,name', 'createdBy:id,employee_id,name'])
            ->latest()
            ->paginate(50);

        return Inertia::render('settings/commission/index', [
            "data" => $commissions,
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.commission')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'employee' => ['required', 'exists:users,id'],
            'type' => ['required', 'in:percentage,fixed'],
            'commission_rate' => ['required', 'numeric'],
            'note' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:active,inactive']
        ]);

        // [Biztek] Check duplicate employee
        $exists = SalesCommissionConfigure::where('user_id', $request->employee)->exists();

        if ($exists) {
            // [Biztek] CHANGED - use notification format with key
            return redirect()->back()->with("notification", [
                'message' => 'This employee already has a commission configured!',
                'type' => 'error',
                'key' => uniqid(),
            ]);
        }

        $commission = new SalesCommissionConfigure();
        $commission->user_id = $request->employee;
        $commission->commission_type = $request->type;
        $commission->commission_rate = $request->commission_rate;
        $commission->status = $request->status;
        $commission->note = $request->note;
        $commission->created_by = Auth::id();
        $commission->save();

        // [Biztek] CHANGED - use notification format with key
        return redirect()->back()->with("notification", [
            'message' => 'Commission Save Successfully',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }

    public function edit($id)
    {
        if (is_null($this->user) || !$this->user->can('settings.commission')) {
            abort('403', 'Unauthorized access');
        }

        $commission = SalesCommissionConfigure::with('user:id,employee_id,name')->findOrFail($id);
        return response()->json($commission);
    }

    public function updateCommission(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.commission')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'type' => ['required', 'in:percentage,fixed'],
            'commission_rate' => ['required', 'numeric'],
            'note' => ['nullable', 'string', 'max:500']
        ]);

        $commission = SalesCommissionConfigure::whereId($request->id)->first();

        $commission->commission_type = $request->type;
        $commission->commission_rate = $request->commission_rate;
        $commission->status = $request->status;
        $commission->note = $request->note;
        $commission->created_by = Auth::id();
        $commission->save();

        // [Biztek] CHANGED - use notification format with key
        return redirect()->back()->with("notification", [
            'message' => 'Commission Updated Successfully',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }

    public function destroy($id)
    {
        if (is_null($this->user) || !$this->user->can('settings.commission')) {
            abort('403', 'Unauthorized access');
        }

        $commission = SalesCommissionConfigure::findOrFail($id);
        $deleteCommission = $commission->delete();

        if ($deleteCommission) {
            // [Biztek] CHANGED - use notification format with key
            return redirect()->back()->with("notification", [
                'message' => 'Commission Deleted successfully!',
                'type' => 'success',
                'key' => uniqid(),
            ]);
        }
    }
}