<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use App\Models\WorkFromHome;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkFromHomeController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    // Admin Index (List all WFH requests)
    public function index(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('WFH.list')) {
            abort(403, 'Unauthorized access');
        }

        $query = WorkFromHome::with(['user:id,employee_id,name,image']);

        if ($request->filled('employee')) {
            $query->where('user_id', $request->input('employee'));
        }

        if ($request->filled('sorting')) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        } else {
            $query->latest();
        }

        // Filter by the actual requested WFH dates, not the submission date
        if ($request->filled('start_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            // The WFH request must end on or after the filter's start date
            $query->where('end_date', '>=', $startDate);
        }

        if ($request->filled('end_date')) {
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            // The WFH request must start on or before the filter's end date
            $query->where('start_date', '<=', $endDate);
        }

        $numberOfRequests = $query->count();

        // Use withQueryString() so pagination links keep the filters
        $requests = $query->paginate(30)->withQueryString();

        return Inertia::render('wfh/index', [
            'requests' => $requests,
            'numberOfRequests' => $numberOfRequests,
            'filters' => $request->only(['employee', 'sorting', 'start_date', 'end_date'])
        ]);
    }
    // JSON endpoint for View Modal
    public function show($id)
    {

        if (is_null($this->user) || !$this->user->can('WFH.list')) {
            abort(403, 'Unauthorized access');
        }


        $workFromHome = WorkFromHome::with('user:id,employee_id,name,image')->findOrFail($id);

        return response()->json([
            'id' => $workFromHome->id,
            'employee_name' => $workFromHome->user->name,
            'employee_id' => $workFromHome->user->employee_id,
            'employee_image' => $workFromHome->user->image,
            'start_date' => $workFromHome->start_date,
            'end_date' => $workFromHome->end_date,
            'quantity' => $workFromHome->days,
            'status' => $workFromHome->status,
            'reason' => $workFromHome->reason,
        ]);
    }

    // JSON endpoint for Edit Modal
    public function edit($id)
    {
        if (is_null($this->user) || !$this->user->can('WFH.edit')) {
            abort(403, 'Unauthorized access');
        }

        $workFromHome = WorkFromHome::with('user:id,name')->findOrFail($id);

        return response()->json([
            'id' => $workFromHome->id,
            'employee_name' => $workFromHome->user->name,
            'start_date' => $workFromHome->start_date,
            'end_date' => $workFromHome->end_date,
            'reason' => $workFromHome->reason,
        ]);
    }

    // User View (Apply form + their requests)
    public function workFromHomeRequest()
    {
        if (is_null($this->user) || !$this->user->can('user.WFH')) {
            abort(403, 'Unauthorized access');
        }

        $user = auth()->user();
        $requests = WorkFromHome::where('user_id', $user->id)->latest()->get();

        return Inertia::render('wfh/userWorkFromHome', [
            'requests' => $requests
        ]);
    }

    // Store User Request
    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('user.WFH')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'dates' => 'required|string',
            'reason' => 'required|string|max:255',
        ]);

        $dates = explode(' to ', $request->dates);

        if (count($dates) === 2) {
            $start_date = Carbon::parse($dates[0]);
            $end_date = Carbon::parse($dates[1]);
        } else {
            $start_date = Carbon::parse($request->dates);
            $end_date = $start_date;
        }

        $existingRequest = WorkFromHome::where('user_id', auth()->id())
            ->where(function ($query) use ($start_date, $end_date) {
                $query->whereBetween('start_date', [$start_date, $end_date])
                    ->orWhereBetween('end_date', [$start_date, $end_date])
                    ->orWhere(function ($query) use ($start_date, $end_date) {
                        $query->where('start_date', '<=', $start_date)
                            ->where('end_date', '>=', $end_date);
                    });
            })
            ->exists();

        if ($existingRequest) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => 'You have already applied for work from home on the selected date(s).',
                'key' => uniqid(),
            ]);
        }

        $period = CarbonPeriod::create($start_date, $end_date);
        $totalDays = count($period);

        WorkFromHome::create([
            'user_id' => auth()->id(),
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'days' => $totalDays,
            'status' => 'pending',
            'reason' => $request->reason,
        ]);

        return back()->with('notification', [
            'type' => 'success',
            'message' => 'Work From Home request has been created successfully!',
            'key' => uniqid(),
        ]);
    }

    public function manualStore(Request $request)
    {
        // HR permission: this action creates an approved WFH.
        if (is_null($this->user) || !$this->user->can('WFH.status')) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'dates' => [
                'required',
                'string',
                'max:30',
            ],
            'reason' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $rawDates = trim($validated['dates']);

        if (
            !preg_match(
                '/^\d{4}-\d{2}-\d{2}(?: to \d{4}-\d{2}-\d{2})?$/',
                $rawDates,
            )
        ) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'dates' => 'Please select a valid date or date range.',
            ]);
        }

        $dateParts = explode(' to ', $rawDates, 2);

        try {
            $startDate = Carbon::createFromFormat(
                '!Y-m-d',
                $dateParts[0]
            );

            $endDate = Carbon::createFromFormat(
                '!Y-m-d',
                $dateParts[1] ?? $dateParts[0]
            );

            if (
                !$startDate ||
                !$endDate ||
                $startDate->format('Y-m-d') !== $dateParts[0] ||
                $endDate->format('Y-m-d') !== ($dateParts[1] ?? $dateParts[0])
            ) {
                throw new \InvalidArgumentException('Invalid date.');
            }

        } catch (\Throwable) {

            throw \Illuminate\Validation\ValidationException::withMessages([
                'dates' => 'Please select a valid date or date range.',
            ]);
        }

        if ($startDate->greaterThan($endDate)) {

            throw \Illuminate\Validation\ValidationException::withMessages([
                'dates' => 'The end date must be on or after the start date.',
            ]);
        }

        DB::transaction(function () use ($validated, $startDate, $endDate): void {



            $employee = User::query()
                ->with('shift')
                ->lockForUpdate()
                ->findOrFail($validated['user_id']);

            // Check Existing WFH Requests
            $overlappingRequest = WorkFromHome::query()

                ->where('user_id', $employee->id)

                ->where(
                    'start_date',
                    '<=',
                    $endDate->toDateString()
                )

                ->where(
                    'end_date',
                    '>=',
                    $startDate->toDateString()
                )

                ->whereIn('status', [
                    'pending',
                    'approved',
                ])

                ->exists();

            if ($overlappingRequest) {

                throw \Illuminate\Validation\ValidationException::withMessages([
                    'dates' =>
                        'This employee already has a pending or approved WFH request overlapping the selected date(s).',
                ]);
            }

            /*
            | Check Existing Attendance
            |
            | Never overwrite actual check-in/out or
            | another attendance record.
            |
            */

            $hasAttendance = Attendance::query()

                ->where('user_id', $employee->id)

                ->whereBetween('created_at', [

                    $startDate->copy()->startOfDay(),

                    $endDate->copy()->endOfDay(),

                ])

                ->exists();

            if ($hasAttendance) {

                throw \Illuminate\Validation\ValidationException::withMessages([
                    'dates' =>
                        'Attendance already exists on one or more selected dates. No records were changed.',
                ]);
            }

            /*
            | Create Approved WFH
            */

            $days = CarbonPeriod::create(
                $startDate,
                $endDate
            );

            WorkFromHome::create([

                'user_id' => $employee->id,

                'start_date' => $startDate->toDateString(),

                'end_date' => $endDate->toDateString(),

                'days' => count($days),

                'reason' => trim($validated['reason']),

                'status' => 'approved',

            ]);

            /*
            | Create Home Attendance
            */

            foreach ($days as $date) {

                Attendance::create([

                    'user_id' => $employee->id,

                    'attendance_status' => 'home',

                    'checked_in_at' =>
                        $employee->shift?->shift_start_time,

                    'checked_out_at' =>
                        $employee->shift?->shift_end_time,

                    'created_at' =>
                        $date->copy()->startOfDay(),

                    'updated_at' => now(),

                ]);
            }

        }, 3);

        return back()->with('notification', [

            'type' => 'success',

            'message' =>
                'Work From Home recorded and approved successfully.',

            'key' => uniqid(),

        ]);
    }

    // Admin Update (via Edit Modal)
    public function update(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('WFH.edit')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'id' => 'required|exists:work_from_homes,id',
            'dates' => 'required|string',
            'reason' => 'required|string|max:255',
        ]);

        $workFromHomeRequest = WorkFromHome::findOrFail($request->id);

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

        $workFromHomeRequest->update([
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'days' => $totalDays,
            'reason' => $request->reason,
        ]);

        return back()->with('notification', [
            'message' => 'Work From Home request has been updated successfully!',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }

    // Admin Delete
    public function destroy(WorkFromHome $workFromHome)
    {
        if (is_null($this->user) || !$this->user->can('WFH.delete')) {
            abort(403, 'Unauthorized access');
        }

        $workFromHome->delete();

        return back()->with('notification', [
            'message' => 'Work From Home Request Deleted successfully!',
            'type' => 'warning',
            'key' => uniqid(),
        ]);
    }

    // Admin Status Update (Approve/Reject via View Modal)
    public function updateRequestStatus(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('WFH.status')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'id' => 'required|exists:work_from_homes,id',
            'status' => 'required|in:approved,rejected',
        ]);

        $workFromHome = WorkFromHome::find($request->id);

        if ($request->status === 'rejected') {

            Attendance::query()

                ->where('user_id', $workFromHome->user_id)

                ->where('attendance_status', 'home')

                ->whereBetween('created_at', [

                    Carbon::parse(
                        $workFromHome->start_date
                    )->startOfDay(),

                    Carbon::parse(
                        $workFromHome->end_date
                    )->endOfDay(),

                ])

                ->delete();
        }

        $workFromHome->status = $request->status;
        $workFromHome->save();

        if ($request->status == 'approved') {
            $period = CarbonPeriod::create($workFromHome->start_date, $workFromHome->end_date);
            $conflictDates = [];

            foreach ($period as $date) {
                $formattedDate = $date->format('Y-m-d');

                $existing = Attendance::where('user_id', $workFromHome->user_id)
                    ->whereDate('created_at', $formattedDate)
                    ->where('attendance_status', 'home')
                    ->exists();

                if ($existing) {
                    $conflictDates[] = $formattedDate;
                }
            }

            if (count($conflictDates)) {
                return back()->with('notification', [
                    'message' => 'Home office already approved for the following date(s): ' . implode(', ', $conflictDates),
                    'type' => 'error',
                    'key' => uniqid(),
                ]);
            }

            // Safely fetch shift times if the shift exists
            $shift = $workFromHome->user->shift;
            $startTime = $shift ? $shift->shift_start_time : null;
            $endTime = $shift ? $shift->shift_end_time : null;

            foreach ($period as $date) {
                Attendance::create([
                    'user_id' => $workFromHome->user_id,
                    'attendance_status' => 'home',
                    'checked_in_at' => $startTime,
                    'checked_out_at' => $endTime,
                    'created_at' => $date->format('Y-m-d H:i:s'),
                    'updated_at' => $date->format('Y-m-d H:i:s'),
                ]);
            }
        }

        return back()->with('notification', [
            'message' => 'Work From Home request has been ' . $request->status . '.',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }
}