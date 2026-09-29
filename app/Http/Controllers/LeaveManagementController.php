<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveManagementController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('leave.assign')) {
            abort(403, 'Unauthorized access');
        }

        $query = User::select(['id', 'employee_id', 'name', 'department_id', 'probation_period_end_date'])
            ->where('status', 'active')
            ->whereHas('leaves')
            ->with(['leaves', 'department:id,name', 'userLeave']);

        if ($request->filled('user')) {
            $query->where('id', $request->input('user'));
        }

        if ($request->filled('department')) {
            $query->where('department_id', $request->input('department'));
        }

        if ($request->filled('sorting')) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        } else {
            $query->latest();
        }

        $numberOfAssignLeaves = $query->count();
        $userWiseLeaves = $query->paginate(50)->withQueryString();

        $leaves = Leave::orderBy('name', 'asc')->get();
        $departments = Department::select(['id', 'name'])->orderBy('name', 'asc')->get();

        // Updated path here:
        return Inertia::render('hr/leave/leave-management/index', [
            'leaves' => $leaves,
            'userWiseLeaves' => $userWiseLeaves,
            'numberOfAssignLeaves' => $numberOfAssignLeaves,
            'departments' => $departments,
            'filters' => $request->only(['user', 'department', 'sorting'])
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('leave.assign')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'leaves' => ['required', 'array'],
            'leaves.*' => ['required', 'integer', 'exists:leaves,id'],
            'user' => ['required', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user);

        if (!$user->probation_period_end_date) {
            return back()->with('notification', [
                'message' => 'Probation period end date is missing for the user.',
                'type' => 'error'
            ]);
        }

        $leaveStartDate = Carbon::parse($user->probation_period_end_date);
        $currentYear = Carbon::now()->year;

        $start_date = Carbon::create($currentYear, $leaveStartDate->month, $leaveStartDate->day);
        $end_date = $start_date->copy()->addYear()->subDay();

        $leaveData = [];

        foreach ($request->leaves as $leaveId) {
            $leave = Leave::findOrFail($leaveId);
            $leaveData[$leaveId] = [
                'start_date' => $start_date->format('Y-m-d'),
                'end_date' => $end_date->format('Y-m-d'),
                'remaining_days' => $leave->qty,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $user->leaves()->sync($leaveData);

        return back()->with('notification', [
            'message' => 'Assigned Leaves Successfully',
            'type' => 'success'
        ]);
    }

    public function edit($user)
    {
        if (is_null($this->user) || !$this->user->can('leave.assign')) {
            abort(403, 'Unauthorized access');
        }

        $user = User::findOrFail($user);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'leaves' => $user->leaves->pluck('id')->toArray(),
        ]);
    }

    public function update(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('leave.assign')) {
            abort(403, 'Unauthorized access');
        }

        $user = User::find($request->user);

        $request->validate([
            'leaves' => ['required', 'array'],
            'leaves.*' => ['required', 'integer', 'exists:leaves,id'],
        ]);

        $user->load('userLeave');

        $start_date = now()->startOfDay();
        $end_date = $start_date->copy()->addYear()->subDay();

        $existingLeaveIds = $user->userLeave->pluck('leave_id')->toArray();
        $requestedLeaveIds = $request->leaves;

        // 1. Detach removed leaves
        $leavesToRemove = array_diff($existingLeaveIds, $requestedLeaveIds);
        if (!empty($leavesToRemove)) {
            $user->leaves()->detach($leavesToRemove);
        }

        // 2. Attach new leaves only
        $leavesToAdd = array_diff($requestedLeaveIds, $existingLeaveIds);
        $newLeaveData = [];

        foreach ($leavesToAdd as $leaveId) {
            $leave = Leave::findOrFail($leaveId);
            $newLeaveData[$leaveId] = [
                'start_date' => $start_date->format('Y-m-d'),
                'end_date' => $end_date->format('Y-m-d'),
                'remaining_days' => $leave->qty,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($newLeaveData)) {
            $user->leaves()->attach($newLeaveData);
        }

        return back()->with('notification', [
            'message' => 'Leaves Update Successfully',
            'type' => 'success'
        ]);
    }

    public function destroy($user)
    {
        if (is_null($this->user) || !$this->user->can('leave.assign')) {
            abort(403, 'Unauthorized access');
        }

        User::findOrFail($user)->leaves()->detach();

        return back()->with('notification', [
            'message' => 'Leaves Deleted Successfully',
            'type' => 'success'
        ]);
    }

    public function getEmployees(Request $request)
    {
        $keyword = $request->keyword;
        $query = User::select('id', 'employee_id', 'name')->whereDoesntHave('leaves');

        if (!empty($keyword)) {
            $query->where(function($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('employee_id', 'like', "%{$keyword}%");
            });
        }

        $employees = $query->orderBy('name')->limit(20)->get();

        return response()->json($employees);
    }
}