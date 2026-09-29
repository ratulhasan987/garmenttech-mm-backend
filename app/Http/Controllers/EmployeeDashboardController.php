<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Lead;
use App\Models\LeaveRequest;
use App\Models\Loan;
use App\Models\Notice;
use App\Models\User;
use App\Models\WorkFromHome;

use Carbon\Carbon;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use Inertia\Inertia;
use Inertia\Response;

class EmployeeDashboardController extends Controller
{
    public ?User $user = null;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {

            $this->user = Auth::guard('web')->user();

            return $next($request);
        });
    }

    public function dashboard(Request $request): Response
    {
        // AUTHENTICATED USER & PERMISSION
        $user = $this->user;

        abort_unless(
            $user && $user->can('default.dashboard'),
            403,
            'Unauthorized access.'
        );

        // LOAD USER RELATIONSHIPS
        $user->loadMissing([
            'shift',
            'department',
            'designation',
        ]);

        $userId = $user->id;

        // CURRENT MONTH
        $now = now();

        $startOfMonth = $now->copy()
            ->startOfMonth()
            ->startOfDay();

        $endOfMonth = $now->copy()
            ->endOfMonth()
            ->endOfDay();

        // EMPLOYEE WEEKENDS
        $weekendDays = [];

        $dayNameToNumber = [
            'Sunday' => 0,
            'Monday' => 1,
            'Tuesday' => 2,
            'Wednesday' => 3,
            'Thursday' => 4,
            'Friday' => 5,
            'Saturday' => 6,
        ];

        if (
            $user->shift &&
            $user->shift->weekends
        ) {

            $weekends = explode(
                ',',
                $user->shift->weekends
            );

            foreach ($weekends as $day) {

                $dayName = ucfirst(
                    strtolower(trim($day))
                );

                if (
                    array_key_exists(
                        $dayName,
                        $dayNameToNumber
                    )
                ) {

                    $weekendDays[] =
                        $dayNameToNumber[$dayName];
                }
            }
        }

        $weekendDays = array_values(
            array_unique($weekendDays)
        );

        // HOLIDAYS
        $holidays = Holiday::query()
            ->get()
            ->map(function ($holiday) {

                return [
                    'id' => $holiday->id,

                    'name' => $holiday->name,

                    'date' => Carbon::parse(
                        $holiday->date
                    )->format('Y-m-d'),

                    'is_recurring' =>
                        (bool) $holiday->is_recurring,
                ];

            })
            ->values();

        // ATTENDANCE STATISTICS
        $monthlyTotalPresent = Attendance::query()
            ->where('user_id', $userId)
            ->where(
                'attendance_status',
                'present'
            )
            ->whereBetween(
                'created_at',
                [
                    $startOfMonth,
                    $endOfMonth,
                ]
            )
            ->distinct()
            ->count(
                DB::raw('DATE(created_at)')
            );


        $totalHomeOfficeRequest =
            WorkFromHome::query()
                ->where('user_id', $userId)
                ->count();


        $totalLoanRequests =
            Loan::query()
                ->where('user_id', $userId)
                ->count();


        $totalLeaveRequest =
            LeaveRequest::query()
                ->where('user_id', $userId)
                ->count();


        $notices = Notice::query()
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($notice) {

                return [
                    'id' => $notice->id,

                    'title' => $notice->title,

                    'description' => Str::limit(
                        strip_tags(
                            (string) $notice->description
                        ),
                        150
                    ),

                    'created_at' =>
                        $notice->created_at
                                ?->toISOString(),
                ];

            })
            ->values();

        // LATEST LEAVE REQUESTS
        $leaves = LeaveRequest::query()
            ->with([
                'leave',
            ])
            ->where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get();

        // LATEST LOAN REQUESTS
        $loanRequests = Loan::query()
            ->where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get();

        // CRM PERMISSIONS
        $canViewLeads =
            $user->can('lead.list') ||
            $user->can('lead.global');

        $canViewGlobalLeads =
            $user->can('lead.global');

        /*
         CRM LEADS
        |
        | Load leads only when the employee has
        | permission to view them.
        |
        */
        $untouchLeads = collect();

        $upcomingFollowUps = collect();

        if ($canViewLeads) {

            $leadQuery = Lead::query()
                ->select([
                    'id',
                    'name',
                    'phone',
                    'priority',
                    'interest_level',
                    'assigned_to',
                    'next_follow_up_at',
                    'created_at',
                ])
                ->with([
                    'assignedUser:id,name,employee_id',
                ]);

            // Employee-specific leads
            if (!$canViewGlobalLeads) {

                $leadQuery->where(
                    'assigned_to',
                    $userId
                );
            }

            // Leads without conversations
            $untouchLeads = (clone $leadQuery)
                ->whereDoesntHave(
                    'leadConversations'
                )
                ->latest('created_at')
                ->take(10)
                ->get();

            // Today and future follow-ups
            $upcomingFollowUps = (clone $leadQuery)
                ->whereNotNull(
                    'next_follow_up_at'
                )
                ->where(
                    'next_follow_up_at',
                    '>=',
                    today()->startOfDay()
                )
                ->orderBy(
                    'next_follow_up_at',
                    'asc'
                )
                ->take(10)
                ->get();
        }

        // INERTIA RESPONSE
        return Inertia::render(
            'dashboard/employee-dashboard',
            [

                // Employee information
                'employee' => [
                    'id' => $user->id,

                    'name' => $user->name,

                    'employee_id' =>
                        $user->employee_id,

                    'image' =>
                        $user->image_url,

                    'department' =>
                        $user->department?->name,

                    'designation' =>
                        $user->designation?->name,
                ],

                // Current date and month
                'currentDate' =>
                    $now->toDateString(),

                'currentMonth' =>
                    $now->format('Y-m'),

                // Calendar
                'weekendDays' =>
                    $weekendDays,

                'holidays' =>
                    $holidays,

                // Dashboard statistics
                'stats' => [

                    'monthlyTotalPresent' =>
                        $monthlyTotalPresent,

                    'totalHomeOfficeRequest' =>
                        $totalHomeOfficeRequest,

                    'totalLoanRequests' =>
                        $totalLoanRequests,

                    'totalLeaveRequest' =>
                        $totalLeaveRequest,
                ],

                // Notices
                'notices' =>
                    $notices,

                // Leave requests
                'leaves' =>
                    $leaves,

                // Loan requests
                'loanRequests' =>
                    $loanRequests,

                //CRM
                'untouchLeads' =>
                    $untouchLeads,

                'upcomingFollowUps' =>
                    $upcomingFollowUps,



                // 'candidates' => [],

                // 'candidateCases' => [],



                /*
                | Frontend permissions
                */
                'permissions' => [

                    'lead' =>
                        $canViewLeads,

                    'candidate' =>
                        false,

                    'case' =>
                        false,
                ],
            ]
        );
    }
}
