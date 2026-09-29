<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\Loan;
use App\Models\Notice;
use App\Models\SalaryAdvance;
use App\Models\User;
use App\Models\WorkFromHome;

use Carbon\Carbon;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

use Inertia\Inertia;
use Inertia\Response;

class HrDashboardController extends Controller
{
    public ?User $user = null;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();

            return $next($request);
        });
    }

    // HR Dashboard

    public function dashboard(): Response
    {
        // Permission

        if (
            is_null($this->user) ||
            ! $this->user->can('hr.dashboard')
        ) {
            abort(403, 'Unauthorized access');
        }

        $user = $this->user;

        $user->loadMissing('shift');

        $today = Carbon::today();

        $currentYear = (int) $today->year;

        /*
             Shift weekends
        |
        | FullCalendar previously received recurring weekend events.
        |
        | React will instead receive an array of weekday numbers:
        |
        | Sunday    = 0
        | Monday    = 1
        | Tuesday   = 2
        | Wednesday = 3
        | Thursday  = 4
        | Friday    = 5
        | Saturday  = 6
        |
        */

        $weekends = [];

        $dayNameToNumber = [
            'sunday' => 0,
            'monday' => 1,
            'tuesday' => 2,
            'wednesday' => 3,
            'thursday' => 4,
            'friday' => 5,
            'saturday' => 6,
        ];

        $shiftWeekends = $user->shift?->weekends;

        if ($shiftWeekends) {
            $weekendNames = is_array($shiftWeekends)
                ? $shiftWeekends
                : explode(',', (string) $shiftWeekends);

            foreach ($weekendNames as $day) {
                $dayName = strtolower(
                    trim((string) $day)
                );

                if (
                    isset(
                        $dayNameToNumber[$dayName]
                    )
                ) {
                    $weekends[] = (
                        $dayNameToNumber[$dayName]
                    );
                }
            }
        }

        $weekends = array_values(
            array_unique($weekends)
        );

        /*
        |  Holiday calendar
        |
        | React HolidayCalendar expects:
        |
        | id
        | title
        | start
        | end
        | is_recurring
        |
        | Recurring holidays are matched using month and day,
        | so the calendar will display them in other years too.
        |
        */

        $events = Holiday::all()
            ->map(function ($holiday) use ($currentYear) {
                if (
                    empty($holiday->date)
                ) {
                    return null;
                }

                $date = Carbon::parse(
                    $holiday->date
                );

                $isRecurring = (bool) (
                    $holiday->is_recurring
                );

                if ($isRecurring) {
                    $date = $date->copy()
                        ->year($currentYear);
                }

                $dateString = $date->format(
                    'Y-m-d'
                );

                return [
                    'id' => $holiday->id,

                    'title' => $holiday->name
                        ?: 'Holiday',

                    'start' => $dateString,

                    'end' => $dateString,

                    'is_recurring' => $isRecurring,
                ];
            })
            ->filter()
            ->values()
            ->all();

        /*
        |  Active employees
        |
        | Preserve your original condition:
        | users.status = active
        |
        */

        $activeEmployee = User::where(
            'status',
            'active'
        )->count();

        /*
        | Today present
        |
        | Count distinct employees instead of duplicate
        | attendance punches.
        |
        */

        $todayTotalPresent = Attendance::query()
            ->whereDate(
                'created_at',
                $today->toDateString()
            )
            ->where(
                'attendance_status',
                'present'
            )
            ->distinct()
            ->count('user_id');

        /*
        | Today absent
        |
        | Preserve the original controller's definition:
        |
        | Active employees minus employees having any
        | attendance record today.
        |
        | Note: this is a no-attendance count, not a
        | shift/holiday/approved-leave-adjusted absence count.
        |
        */

        $allEmployeeIds = User::query()
            ->where(
                'status',
                'active'
            )
            ->pluck('id')
            ->all();

        $attendedTodayIds = Attendance::query()
            ->whereDate(
                'created_at',
                $today->toDateString()
            )
            ->distinct()
            ->pluck('user_id')
            ->all();

        $absentEmployeeIds = array_diff(
            $allEmployeeIds,
            $attendedTodayIds
        );

        $todayTotalAbsent = count(
            $absentEmployeeIds
        );


        $todayLeaveRequest = LeaveRequest::query()
            ->whereDate(
                'created_at',
                $today->toDateString()
            )
            ->count();

     
        $todayNotices = Notice::count();

    
        $todayHomeOfficeRequest = WorkFromHome::query()
            ->whereDate(
                'created_at',
                $today->toDateString()
            )
            ->count();


        $todayLoanRequest = Loan::query()
            ->whereDate(
                'created_at',
                $today->toDateString()
            )
            ->count();

        $todayAdvanceCreate = SalaryAdvance::query()
            ->whereDate(
                'created_at',
                $today->toDateString()
            )
            ->count();


        $notices = Notice::query()
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($notice) {
                return [
                    'id' => $notice->id,

                    'title' => (
                        $notice->title
                        ?? ''
                    ),

                    'description' => Str::limit(
                        strip_tags(
                            (string) (
                                $notice->description
                                ?? ''
                            )
                        ),
                        160,
                        '...'
                    ),

                    'created_at' => $notice->created_at
                        ? Carbon::parse(
                            $notice->created_at
                        )->format('d M Y')
                        : null,
                ];
            })
            ->values()
            ->all();


        $leaves = LeaveRequest::query()
            ->with([
                'user:id,name,employee_id,image',
            ])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,

                    'employee_name' => (
                        $leave->user?->name
                        ?? 'Unknown Employee'
                    ),

                    'employee_id' => (
                        $leave->user?->employee_id
                    ),

                    'image' => (
                        $leave->user?->image
                    ),

                    'reason' => Str::limit(
                        (string) (
                            $leave->reason
                            ?? ''
                        ),
                        120,
                        '...'
                    ),

                    'status' => (
                        $leave->status
                        ?? 'Pending'
                    ),

                    'start_date' => $leave->start_date
                        ? Carbon::parse(
                            $leave->start_date
                        )->format('d M Y')
                        : null,

                    'end_date' => $leave->end_date
                        ? Carbon::parse(
                            $leave->end_date
                        )->format('d M Y')
                        : null,
                ];
            })
            ->values()
            ->all();

        /*
        | Monthly attendance chart
        |
        | January - December of the current calendar year.
        |
        | The original query used the previous 12 months
        | but placed the results into Jan-Dec buckets.
        |
        | Using the current year makes the chart's displayed
        | year and monthly totals consistent.
        |
        */

        $monthlyAttendances = Attendance::query()
            ->selectRaw(
                'MONTH(created_at) as month_number'
            )
            ->selectRaw(
                'COUNT(*) as total'
            )
            ->where(
                'attendance_status',
                'present'
            )
            ->whereYear(
                'created_at',
                $currentYear
            )
            ->groupByRaw(
                'MONTH(created_at)'
            )
            ->orderByRaw(
                'MONTH(created_at)'
            )
            ->get();

        $attendanceData = array_fill(
            0,
            12,
            0
        );

        foreach (
            $monthlyAttendances
            as $attendance
        ) {
            $monthIndex = (
                (int) $attendance->month_number
            ) - 1;

            if (
                $monthIndex >= 0 &&
                $monthIndex < 12
            ) {
                $attendanceData[$monthIndex] = (
                    (int) $attendance->total
                );
            }
        }

        /*
        | Dashboard links
        |
        | Use existing named routes.
        |
        | No errors if an optional module route
        | is not registered.
        |
        */

        $links = [
            'employees' => $this->routeIfExists(
                'user.index'
            ),

            'leaveRequests' => $this->routeIfExists(
                'hr.leaveRequest.index'
            ),

            'notices' => $this->routeIfExists(
                'notice.index',
                'hr.notice'
            ),

            'wfhRequests' => $this->routeIfExists(
                'hr.workFromHomeRequest.index'
            ),

            'attendance' => $this->routeIfExists(
                'hr.employee-attendance',
                'hr.EmployeeAttendance'
            ) ?? url('/hr/attendance/employees'),

            'loanRequests' => $this->routeIfExists(
                'hr.loanRequest.index'
            ),

            'advances' => $this->routeIfExists(
                'hr.salary.advance.index'
            ),
        ];

        /*
        | Inertia response
        |
        | resources/js/pages/dashboard/hr-dashboard.tsx
        |
        */

        return Inertia::render(
            'dashboard/hr-dashboard',
            [
                'stats' => [
                    'activeEmployee' => (
                        $activeEmployee
                    ),

                    'todayLeaveRequest' => (
                        $todayLeaveRequest
                    ),

                    'todayNotices' => (
                        $todayNotices
                    ),

                    'todayHomeOfficeRequest' => (
                        $todayHomeOfficeRequest
                    ),

                    'todayTotalPresent' => (
                        $todayTotalPresent
                    ),

                    'todayLoanRequest' => (
                        $todayLoanRequest
                    ),

                    'todayTotalAbsent' => (
                        $todayTotalAbsent
                    ),

                    'todayAdvanceCreate' => (
                        $todayAdvanceCreate
                    ),
                ],

                'notices' => $notices,

                'leaves' => $leaves,

                'attendanceData' => (
                    $attendanceData
                ),

                'events' => $events,

                'weekends' => $weekends,

                'links' => $links,

                'missingTables' => [],

                'currentYear' => (
                    $currentYear
                ),
            ]
        );
    }

    /*
    | Safely resolve named routes
    */

    private function routeIfExists(
        string ...$names
    ): ?string {
        foreach ($names as $name) {
            if (Route::has($name)) {
                return route($name);
            }
        }

        return null;
    }
}