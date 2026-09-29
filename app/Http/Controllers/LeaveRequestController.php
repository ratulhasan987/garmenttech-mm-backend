<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\UserLeave;
use App\Notifications\GeneralNotification;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File as FileAction;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class LeaveRequestController extends Controller
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
        if (is_null($this->user) || (!$this->user->can('leave.list') && !$this->user->can('leave.global'))) {
            abort(403, 'Unauthorized access');
        }

        $query = LeaveRequest::with(['user:id,employee_id,name,reporting_officer', 'leave:id,name']);

        if ($request->filled('user')) {
            $query->where('user_id', $request->input('user'));
        }

        if ($request->filled('sorting')) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        } else {
            $query->latest();
        }

        if ($request->filled('start_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $query->where('end_date', '>=', $startDate);
        }

        if ($request->filled('end_date')) {
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->where('start_date', '<=', $endDate);
        }

        $numberOfRequests = $query->count();
        $requests = $query->paginate(30)->withQueryString();

        $leaves = Leave::orderBy('name', 'asc')->get();

        return Inertia::render('hr/leave/hr-leave-request', [
            'leaves' => $leaves,
            'requests' => $requests,
            'numberOfRequests' => $numberOfRequests,
            'filters' => $request->only(['user', 'sorting', 'start_date', 'end_date']),
        ]);
    }


    // Fetch leaves assigned to a specific user (for HR Add Modal)
    public function getUserLeaves($userId)
    {
        if (is_null($this->user) || !$this->user->can('leave.create')) {
            abort(403, 'Unauthorized access');
        }

        $user = User::with([
            'leaves' => function ($q) {
                $q->orderBy('name', 'asc');
            }
        ])->findOrFail($userId);

        return response()->json(
            $user->leaves->map(fn($leave) => [
                'id' => $leave->id,
                'name' => $leave->name,
                'qty' => $leave->pivot->qty ?? 0,
                'remaining_days' => $leave->pivot->remaining_days ?? 0,
            ])
        );
    }



    // User View (Apply form + their requests)
    public function leaveRequest()
    {
        if (is_null($this->user) || !$this->user->can('user.leave')) {
            abort(403, 'Unauthorized access');
        }

        if (!$this->user->shift) {
            return back()->with('notification', [
                'message' => 'Shift is not defined. First, you need to specify a shift for the login user; then, you can access this module.',
                'type' => 'error',
            ]);
        }

        $user = $this->user;

        $leaves = $user->leaves()->get();
        $getRemainingleaves = $user->leaves()->wherePivot('remaining_days', '>', 0)->get();

        $requests = LeaveRequest::where('user_id', $user->id)
            ->with('leave:id,name')
            ->latest()
            ->paginate(10);
        $numberOfRequests = $requests->total();

        $approvedLeaves = LeaveRequest::where('user_id', $user->id)
            ->where('status', 'approved')
            ->get();

        foreach ($leaves as $leave) {
            $leave->total_qty = $leave->qty;
            $leave->used_days = $approvedLeaves
                ->filter(fn($item) => $item->leave_id == $leave->id && Carbon::parse($item->created_at)->year == Carbon::now()->year)
                ->sum('days');
            $leave->remaining_days = $leave->pivot->remaining_days ?? 0;
        }

        $holidays = Holiday::forCalendar();
        $weekends = $user->shift?->weekends ? explode(',', $user->shift->weekends) : [];

        return Inertia::render('leave-request/user-leave-request', [
            'leaves' => $leaves,
            'getRemainingleaves' => $getRemainingleaves,
            'requests' => $requests,
            'numberOfRequests' => $numberOfRequests,
            'weekends' => $weekends,
            'holidays' => $holidays,
            'shift' => $user->shift,
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('user.leave')) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'dates' => 'required|string',
            'leave' => 'required|exists:leaves,id',
            'type' => 'required|in:Full Day,Half Day',
            'sub_type' => 'nullable|in:first_half_day,second_half_day',
            'reason' => 'required|string|max:255',
            'attachment' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:5120',
        ]);

        $dates = explode(' to ', $request->dates);
        if (count($dates) === 2) {
            $start_date = Carbon::parse($dates[0]);
            $end_date = Carbon::parse($dates[1]);
        } else {
            $start_date = Carbon::parse($request->dates);
            $end_date = $start_date;
        }

        $existingRequest = LeaveRequest::where('user_id', auth()->id())
            ->where(function ($query) use ($start_date, $end_date) {
                $query->whereBetween('start_date', [$start_date, $end_date])
                    ->orWhereBetween('end_date', [$start_date, $end_date])
                    ->orWhere(function ($query) use ($start_date, $end_date) {
                        $query->where('start_date', '<=', $start_date)->where('end_date', '>=', $end_date);
                    });
            })->exists();

        if ($existingRequest) {
            return back()->with('notification', [
                'message' => 'You have already applied for leave on the selected date(s).',
                'type' => 'error',
            ]);
        }

        $period = CarbonPeriod::create($start_date, $end_date);
        $totalDays = count($period);
        $days = $request->type == 'Full Day' ? $totalDays * 1 : $totalDays * 0.5;

        $userLeave = auth()->user()->leaves()->wherePivot('leave_id', $request->leave)->first();
        if (!$userLeave || $days > $userLeave->pivot->remaining_days) {
            return back()->with('notification', [
                'message' => 'Oops! You do not have enough leave balance for this request.',
                'type' => 'error',
            ]);
        }

        $imagePath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $destinationPath = public_path('uploads/leave_attachments');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0775, true);
            }
            $file->move($destinationPath, $fileName);
            $imagePath = 'uploads/leave_attachments/' . $fileName;
        }

        $leaveRequest = LeaveRequest::create([
            'user_id' => auth()->id(),
            'reporting_officer' => auth()->user()->reporting_officer,
            'leave_id' => $request->leave,
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'leave_type' => $request->type,
            'sub_type' => $request->type == 'Half Day' ? $request->sub_type : null,
            'days' => $days,
            'status' => 'pending',
            'reason' => $request->reason,
            'attachment' => $imagePath,
        ]);

        $data = [
            'type' => 'leave_request',
            'title' => 'New Leave Request',
            'message' => '"' . $leaveRequest->user->name . '" submitted a leave request.',
            'url' => route('hr.leaveRequest.index'),
            'icon' => 'bi bi-calendar-check',
            'color' => 'warning',
        ];

        $users = User::permission('leave.list')
            ->where('status', 'active')
            ->where('id', '!=', $leaveRequest->user_id)
            ->get();



        Notification::send($users, new GeneralNotification($data));

        return back()->with('notification', [
            'message' => 'Leave request has been created successfully!',
            'type' => 'success',
        ]);
    }

    public function show($id)
    {
        $leaveRequest = LeaveRequest::with('user:id,employee_id,name,image', 'leave:id,name')->findOrFail($id);

        return response()->json([
            'id' => $leaveRequest->id,
            'employee_name' => $leaveRequest->user->name,
            'employee_id' => $leaveRequest->user->employee_id,
            'employee_image' => $leaveRequest->user->image,
            'leave_name' => $leaveRequest->leave->name,
            'leave_type' => $leaveRequest->leave_type,
            'sub_type' => $leaveRequest->sub_type,
            'start_date' => $leaveRequest->start_date,
            'end_date' => $leaveRequest->end_date,
            'quantity' => $leaveRequest->days,
            'status' => $leaveRequest->status,
            'reason' => $leaveRequest->reason,
            'attachment' => $leaveRequest->attachment,
        ]);
    }

    public function edit($id)
    {
        if (is_null($this->user) || !$this->user->can('leave.edit')) {
            abort(403, 'Unauthorized access');
        }

        $leaveRequest = LeaveRequest::with('user:id,name')->findOrFail($id);

        return response()->json([
            'id' => $leaveRequest->id,
            'employee' => $leaveRequest->user->name,
            'leave_id' => $leaveRequest->leave_id,
            'leave_type' => $leaveRequest->leave_type,
            'sub_type' => $leaveRequest->sub_type,
            'start_date' => $leaveRequest->start_date,
            'end_date' => $leaveRequest->end_date,
            'reason' => $leaveRequest->reason,
        ]);
    }

    public function update(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('leave.edit')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'id' => 'required|exists:leave_requests,id',
            'dates' => 'required|string',
            'leave' => 'required|exists:leaves,id',
            'type' => 'required|in:Full Day,Half Day',
            'sub_type' => 'nullable|in:first_half_day,second_half_day',
            'reason' => 'required|string|max:255',
        ]);

        $leaveRequest = LeaveRequest::findOrFail($request->id);

        $dates = explode(' to ', $request->dates);
        if (count($dates) === 2) {
            $start_date = Carbon::parse($dates[0]);
            $end_date = Carbon::parse($dates[1]);
        } else {
            $start_date = Carbon::parse($request->dates);
            $end_date = $start_date;
        }

        $period = CarbonPeriod::create($start_date, $end_date);
        $totalDays = count($period);
        $days = $request->type == 'Full Day' ? $totalDays * 1 : $totalDays * 0.5;

        $leaveRequest->update([
            'leave_id' => $request->leave,
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'leave_type' => $request->type,
            'sub_type' => $request->type == 'Half Day' ? $request->sub_type : null,
            'days' => $days,
            'reason' => $request->reason,
        ]);

        return back()->with('notification', [
            'message' => 'Leave request has been updated successfully!',
            'type' => 'success',
        ]);
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        if (is_null($this->user) || !$this->user->can('leave.delete')) {
            abort(403, 'Unauthorized access');
        }

        if ($leaveRequest->status === 'approved') {
            return back()->with('notification', [
                'message' => "This leave already approved, you can't delete the leave.",
                'type' => 'error',
            ]);
        }

        $leaveRequest->delete();

        return back()->with('notification', [
            'message' => 'Leave Request Deleted successfully!',
            'type' => 'warning',
        ]);
    }



    // Hr or Superadmin Manually Store leave.
    public function manuallyStoreLeave(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('leave.create')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'dates' => 'required|string',
            'leave' => 'required|exists:leaves,id',
            'type' => 'required|in:Full Day,Half Day',
            'sub_type' => 'nullable|in:first_half_day,second_half_day',
            'reason' => 'required|string|max:255',
            'status' => 'required|in:approved,pending,rejected',
            'attachment' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:5120',
        ]);

        $dates = explode(' to ', $request->dates);
        if (count($dates) === 2) {
            $start_date = Carbon::parse($dates[0]);
            $end_date = Carbon::parse($dates[1]);
        } else {
            $start_date = Carbon::parse($request->dates);
            $end_date = $start_date;
        }

        $period = CarbonPeriod::create($start_date, $end_date);
        $totalDays = count($period);
        $days = $request->type == 'Full Day' ? $totalDays * 1 : $totalDays * 0.5;

        // NEW: Balance check for the selected employee
        $targetUser = User::find($request->user_id);
        $userLeave = $targetUser?->leaves()->wherePivot('leave_id', $request->leave)->first();

        if (!$userLeave || $days > $userLeave->pivot->remaining_days) {
            return back()->with('notification', [
                'message' => 'Oops! You do not have enough leave balance for this request.',
                'type' => 'error',
            ]);
        }

        $imagePath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $destinationPath = public_path('uploads/leave_attachments');
            if (!file_exists($destinationPath))
                mkdir($destinationPath, 0775, true);
            $file->move($destinationPath, $fileName);
            $imagePath = 'uploads/leave_attachments/' . $fileName;
        }

        $leaveRequest = LeaveRequest::create([
            'user_id' => $request->user_id,
            'leave_id' => $request->leave,
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'leave_type' => $request->type,
            'sub_type' => $request->type == 'Half Day' ? $request->sub_type : null,
            'days' => $days,
            'status' => $request->status,
            'reason' => $request->reason,
            'attachment' => $imagePath,
        ]);

        // Deduct leave days if status is approved
        if ($leaveRequest->status == 'approved') {
            if ($leaveRequest->leave_type == 'Full Day') {
                $period = CarbonPeriod::create($leaveRequest->start_date, $leaveRequest->end_date);
                foreach ($period as $date) {
                    Attendance::create([
                        'user_id' => $leaveRequest->user_id,
                        'attendance_status' => 'leave',
                        'type_of_leave' => $leaveRequest->leave->name,
                        'created_at' => $date->format('Y-m-d H:i:s'),
                        'updated_at' => $date->format('Y-m-d H:i:s'),
                    ]);
                }
            }

            $user = User::find($leaveRequest->user_id);
            if ($user) {
                $user->leaves()->updateExistingPivot($leaveRequest->leave_id, [
                    'remaining_days' => \DB::raw('remaining_days - ' . $leaveRequest->days),
                ]);
            }
        }

        return back()->with('notification', [
            'message' => 'Leave request has been created successfully!',
            'type' => 'success'
        ]);
    }

    // Update Leave Status (Approve/Reject)
    public function updateLeaveStatus(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('leave.status')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'id' => 'required|exists:leave_requests,id',
            'status' => 'required|in:approved,rejected',
        ]);

        $leaveRequest = LeaveRequest::with('user:id,employee_id,name', 'leave:id,name')->find($request->id);

        // Only block re-approval (approved → approved).
        // Allow approved → rejected.
        if ($leaveRequest->status === 'approved' && $request->status === 'approved') {
            return back()->with('notification', [
                'message' => 'This leave has already been approved.',
                'type' => 'error',
            ]);
        }

        // If the status is rejected, delete attendance records for the leave period
        if ($request->status == 'rejected') {
            Attendance::where('user_id', $leaveRequest->user_id)
                ->whereBetween('created_at', [$leaveRequest->start_date, $leaveRequest->end_date])
                ->delete();

            // If it was previously approved, add the days back
            if ($leaveRequest->status === 'approved') {
                $user = User::find($leaveRequest->user_id);
                if ($user) {
                    $user->leaves()->updateExistingPivot($leaveRequest->leave_id, [
                        'remaining_days' => \DB::raw('remaining_days + ' . $leaveRequest->days),
                    ]);
                }
            }
        }

        // Update the leave request status
        $leaveRequest->status = $request->status;
        $leaveRequest->save();

        // Create attendance records if status is approved and leave type is 'Full Day'
        if ($request->status == 'approved') {
            if ($leaveRequest->leave_type == 'Full Day') {
                $period = CarbonPeriod::create($leaveRequest->start_date, $leaveRequest->end_date);
                foreach ($period as $date) {
                    Attendance::create([
                        'user_id' => $leaveRequest->user_id,
                        'attendance_status' => 'leave',
                        'type_of_leave' => $leaveRequest->leave->name,
                        'created_at' => $date->format('Y-m-d H:i:s'),
                        'updated_at' => $date->format('Y-m-d H:i:s'),
                    ]);
                }
            }

            $user = User::find($leaveRequest->user_id);
            if ($user) {
                // Directly update the pivot table
                $user->leaves()->updateExistingPivot($leaveRequest->leave_id, [
                    'remaining_days' => \DB::raw('remaining_days - ' . $leaveRequest->days),
                ]);
            }
        }

        return back()->with('notification', [
            'message' => 'Leave request has been ' . $request->status . '.',
            'type' => 'success',
        ]);
    }
}
