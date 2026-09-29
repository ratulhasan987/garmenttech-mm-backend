<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();

            return $next($request);
        });
    }

    public function index()
    {
        if (is_null($this->user) || ! $this->user->can('settings.leave')) {
            abort('403', 'Unauthorized access');
        }

        $leaves = Leave::latest()->paginate(20);

        return Inertia::render('settings/leave/index', [
            'data' => $leaves,
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || ! $this->user->can('settings.leave')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', 'unique:leaves,name', 'string', 'max:255'],
            'qty' => ['required'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $leave = new Leave;
        $leave->name = $request->name;
        $leave->qty = $request->qty;
        $leave->is_default = (bool) $request->input('is_default', false);
        $leave->save();

        return redirect()->back()->with('notification', [
            'message' => 'New Leave Save Successfully',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }

    public function edit(Leave $leave)
    {
        if (is_null($this->user) || ! $this->user->can('settings.leave')) {
            abort('403', 'Unauthorized access');
        }

        return response()->json($leave);
    }

    public function update(Request $request)
    {
        if (is_null($this->user) || ! $this->user->can('settings.leave')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', "unique:leaves,name,$request->id", 'string', 'max:255'],
            'qty' => ['required'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $leave = Leave::whereId($request->id)->first();
        $leave->name = $request->name;
        $leave->qty = $request->qty;
        $leave->is_default = (bool) $request->input('is_default', false);
        $leave->save();

        return redirect()->back()->with('notification', [
            'message' => 'Leave Updated Successfully',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }

    public function destroy(Leave $leave)
    {
        if (is_null($this->user) || ! $this->user->can('settings.leave')) {
            abort('403', 'Unauthorized access');
        }

        $deleteLeave = $leave->delete();

        if ($deleteLeave) {
            return redirect()->back()->with('notification', [
                'message' => 'Leave Deleted successfully!',
                'type' => 'success',
                'key' => uniqid(),
            ]);
        }
    }
}
