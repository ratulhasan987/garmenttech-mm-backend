<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Configure;
use App\Models\Currency;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\LoanInstallment;
use App\Models\Salary;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PDF;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SalaryController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user =
                auth()
                    ->guard('web')
                    ->user();

            return $next($request);
        });
    }

    public function userSalaryReport(
        Request $request
    ): InertiaResponse {
        abort_unless(
            $this->user?->can('user.salary_report'),
            403,
            'Unauthorized access.'
        );

        return Inertia::render(
            'hr/payroll/salary-report/index',
            [
                'currentMonth' => now()->format('Y-m'),
            ]
        );
    }

    public function generateUserSalaryReport(
        Request $request
    ): SymfonyResponse {
        abort_unless(
            $this->user?->can('user.salary_report'),
            403,
            'Unauthorized access.'
        );

        // Validate request
        $validated = $request->validate([
            'month' => [
                'required',
                'date_format:Y-m',
            ],

            'absent_deduction' => [
                'nullable',
                'boolean',
            ],

            'consecutive_deduction' => [
                'nullable',
                'boolean',
            ],

            'late_deduction' => [
                'nullable',
                'boolean',
            ],

            'penalty_absent_deduction' => [
                'nullable',
                'boolean',
            ],

            'remaining_time_deduction' => [
                'nullable',
                'boolean',
            ],
        ]);

        // Selected deduction rules
        $applyAbsentDeduction =
            (bool) ($validated['absent_deduction'] ?? false);

        $applyConsecutiveLateDeduction =
            (bool) ($validated['consecutive_deduction'] ?? false);

        $applyLateDeduction =
            (bool) ($validated['late_deduction'] ?? false);

        $applyPenaltyAbsentDeduction =
            (bool) ($validated['penalty_absent_deduction'] ?? false);

        $applyRemainingTimeDeduction =
            (bool) ($validated['remaining_time_deduction'] ?? false);


        // Employee
        $employee = User::query()
            ->with([
                'shift',
            ])
            ->find($this->user->id);

        if (!$employee) {
            return back()->with(
                'error',
                'Employee not found.'
            );
        }

        // Salary
        $salary = Salary::query()
            ->with([
                'user',
            ])
            ->where(
                'user_id',
                $employee->id
            )
            ->where(
                'month',
                $validated['month']
            )
            ->first();

        if (!$salary) {
            return back()->with(
                'error',
                'Salary has not been generated for the selected month.'
            );
        }


      // month
        $startDate = Carbon::createFromFormat(
            'Y-m',
            $validated['month']
        )->startOfMonth();

        $endDate = $startDate
            ->copy()
            ->endOfMonth();


        // Shift
        if (!$employee->shift) {
            return back()->with(
                'error',
                'Employee shift is not configured.'
            );
        }

        $shiftStartTime = Carbon::parse(
            $employee->shift->shift_start_time
        );

        $shiftEndTime = Carbon::parse(
            $employee->shift->shift_end_time
        );

        $firstHalfShiftEndTime = Carbon::parse(
            $employee->shift->first_half_shift_end_time
        );

        $secondHalfShiftStartTime = Carbon::parse(
            $employee->shift->second_half_shift_start_time
        );

        $weekends = $employee->shift->weekends
            ? array_map(
                'trim',
                explode(
                    ',',
                    $employee->shift->weekends
                )
            )
            : [];


       // Holidays
        $holidays = Holiday::query()
            ->get()
            ->flatMap(function ($holiday) {

                if ($holiday->is_recurring) {
                    return [
                        Carbon::parse(
                            $holiday->date
                        )->format('m-d'),
                    ];
                }

                return [
                    Carbon::parse(
                        $holiday->date
                    )->format('Y-m-d'),
                ];
            })
            ->toArray();


        // Attendance
        $attendances = Attendance::query()
            ->where(
                'user_id',
                $employee->id
            )
            ->whereBetween(
                'created_at',
                [
                    $startDate
                        ->copy()
                        ->startOfDay(),

                    $endDate
                        ->copy()
                        ->endOfDay(),
                ]
            )
            ->get()
            ->keyBy(function ($attendance) {
                return Carbon::parse(
                    $attendance->created_at
                )->toDateString();
            });

        // Half-day leave requests
        $leaveRequests = LeaveRequest::query()
            ->where(
                'user_id',
                $employee->id
            )
            ->where(
                'status',
                'Approved'
            )
            ->where(
                'leave_type',
                'Half Day'
            )
            ->whereBetween(
                'start_date',
                [
                    $startDate->toDateString(),
                    $endDate->toDateString(),
                ]
            )
            ->get()
            ->keyBy(function ($leave) {
                return Carbon::parse(
                    $leave->start_date
                )->toDateString();
            });


       // Counters
        $totalAbsent = 0;

        $totalUnpaidLeave = 0;

        $consecutiveLateDays = 0;

        $totalConsecutiveLateDeduction = 0;

        $totalLateMinutes = 0;

        $totalMinutesWorked = 0;

        $totalTargetedMinutes = 0;


       // Calculate attendance
        for (
            $date = $startDate->copy();
            $date->lte($endDate);
            $date->addDay()
        ) {

            $dateString = $date->toDateString();

            $attendance = $attendances->get(
                $dateString
            );

            $leaveRequest = $leaveRequests->get(
                $dateString
            );

            $dayName = $date->format('l');

            $monthDay = $date->format('m-d');


          // Weekend / Holiday
            if (
                !$attendance &&
                (
                    in_array(
                        $dayName,
                        $weekends,
                        true
                    ) ||
                    in_array(
                        $dateString,
                        $holidays,
                        true
                    ) ||
                    in_array(
                        $monthDay,
                        $holidays,
                        true
                    )
                )
            ) {
                continue;
            }


            // Absent
            if (!$attendance) {

                $totalAbsent++;

                $consecutiveLateDays = 0;

                continue;
            }


            // Unpaid leave
            if (
                $attendance->attendance_status === 'leave' &&
                $attendance->type_of_leave === 'Leave Without Pay'
            ) {
                $totalUnpaidLeave++;
            }


           // Attendance times
            $checkedInAt = $attendance->checked_in_at
                ? Carbon::parse(
                    $attendance->checked_in_at
                )
                : null;

            $checkedOutAt = $attendance->checked_out_at
                ? Carbon::parse(
                    $attendance->checked_out_at
                )
                : null;


           // Shift target
            if (
                $leaveRequest &&
                $leaveRequest->sub_type === 'first_half_day'
            ) {

                $lateThreshold =
                    $secondHalfShiftStartTime
                        ->copy()
                        ->addMinutes(15);

                $targetStart =
                    $secondHalfShiftStartTime;

                $targetEnd =
                    $shiftEndTime;

            } elseif (
                $leaveRequest &&
                $leaveRequest->sub_type === 'second_half_day'
            ) {

                $lateThreshold =
                    $shiftStartTime
                        ->copy()
                        ->addMinutes(15);

                $targetStart =
                    $shiftStartTime;

                $targetEnd =
                    $firstHalfShiftEndTime;

            } else {

                $lateThreshold =
                    $shiftStartTime
                        ->copy()
                        ->addMinutes(15);

                $targetStart =
                    $shiftStartTime;

                $targetEnd =
                    $shiftEndTime;
            }


            // Target minutes
            if (
                $attendance->attendance_status !== 'leave'
            ) {

                $targetMinutes =
                    $targetStart->diffInMinutes(
                        $targetEnd
                    );

                $totalTargetedMinutes +=
                    $targetMinutes;
            }


            // Worked minutes
            if (
                $checkedInAt &&
                $checkedOutAt
            ) {

                $workedMinutes =
                    $checkedInAt->diffInMinutes(
                        $checkedOutAt
                    );

                $totalMinutesWorked +=
                    $workedMinutes;
            }


           // Late calculation
            if (
                $checkedInAt &&
                $checkedInAt->gt(
                    $lateThreshold
                )
            ) {

                $minutesLate =
                    $checkedInAt->diffInMinutes(
                        $lateThreshold
                    );

                $totalLateMinutes +=
                    $minutesLate;

                $consecutiveLateDays++;

            } else {

                $consecutiveLateDays = 0;
            }


            // Three consecutive late days
            if (
                $consecutiveLateDays >= 3
            ) {

                $totalConsecutiveLateDeduction++;

                $consecutiveLateDays = 0;
            }
        }


       // Salary calculations
        $daysInMonth =
            $startDate->daysInMonth;

        $basicSalary =
            (float) $salary->basic_salary;

        $grossSalary =
            (float) $salary->gross_salary;

        $perDaySalary =
            $daysInMonth > 0
            ? $basicSalary / $daysInMonth
            : 0;


        $lateDeductionDays =
            floor(
                $totalLateMinutes / 120
            );


       // Remaining time
        $remainingMinutes = max(
            0,
            $totalTargetedMinutes -
            $totalMinutesWorked
        );


       // Per-minute salary
        $shiftMinutes =
            $shiftStartTime->diffInMinutes(
                $shiftEndTime
            );

        $perMinuteSalary =
            (
                $shiftMinutes > 0 &&
                $daysInMonth > 0
            )
            ? $basicSalary /
            (
                $shiftMinutes *
                $daysInMonth
            )
            : 0;


        /*
        | ABSENT DEDUCTION
        | Absent checkbox:
        |
        |   27 absent days = 27 days salary
        */

        $absentDeduction =
            $applyAbsentDeduction
            ? (
                $totalAbsent *
                $perDaySalary
            )
            : 0;


       // ABSENT PENALTY
        $penaltyAbsentDeduction =
            (
                $applyAbsentDeduction &&
                $applyPenaltyAbsentDeduction
            )
            ? (
                $totalAbsent *
                $perDaySalary
            )
            : 0;


        // Consecutive late deduction
        $consecutiveLateDeduction =
            $applyConsecutiveLateDeduction
            ? (
                $totalConsecutiveLateDeduction *
                $perDaySalary
            )
            : 0;


       // Late 120+ minute deduction
        $lateMinutesDeduction =
            $applyLateDeduction
            ? (
                $lateDeductionDays *
                $perDaySalary
            )
            : 0;


      // Remaining time deduction
        $remainingTimeDeduction =
            (
                $applyRemainingTimeDeduction &&
                $remainingMinutes > 0
            )
            ? (
                $remainingMinutes *
                $perMinuteSalary
            )
            : 0;


        // Fixed deductions
        $loanDeduction =
            (float) (
                $salary->loan_deduction ?? 0
            );

        $salaryAdvance =
            (float) (
                $salary->salary_advance ?? 0
            );

        $stateTax =
            (float) (
                $salary->state_tax ?? 0
            );

        $socialSecurity =
            (float) (
                $salary->social_security ?? 0
            );


       // Unpaid leave
        $unpaidLeaveDeduction =
            (float) (
                $salary->unpaid_leave_deduction ?? 0
            );


        // Attendance deduction total
        $attendanceDeductions =
            $absentDeduction +
            $penaltyAbsentDeduction +
            $consecutiveLateDeduction +
            $lateMinutesDeduction +
            $remainingTimeDeduction;


        // Total deductions
        $totalDeductions =
            $loanDeduction +
            $salaryAdvance +
            $stateTax +
            $socialSecurity +
            $unpaidLeaveDeduction +
            $attendanceDeductions;


       // Net salary
        $netSalary =
            $grossSalary -
            $totalDeductions;


        /*
        | Override the in-memory Salary model.
        | This does NOT update the database.
        | It makes your existing PDF Blade display the
        | dynamically selected deduction rules instead
        | of the old stored salary-generation values.
        */

        $salary->total_absent =
            $applyAbsentDeduction
            ? (
                $applyPenaltyAbsentDeduction
                ? '(' .
                $totalAbsent .
                ' days) + (' .
                $totalAbsent .
                ' days penalty)'
                : '(' .
                $totalAbsent .
                ' days)'
            )
            : '(0 days)';


        $salary->absent_deduction =
            $absentDeduction +
            $penaltyAbsentDeduction;


        $salary->total_consecutive_late =
            $applyConsecutiveLateDeduction
            ? $totalConsecutiveLateDeduction
            : 0;


        $salary->consecutive_late_deduction =
            $consecutiveLateDeduction;


        $salary->total_late_minutes =
            $applyLateDeduction
            ? $totalLateMinutes
            : 0;


        $salary->late_minutes_deduction =
            $lateMinutesDeduction;


        $salary->total_remaining_minutes =
            $applyRemainingTimeDeduction
            ? $remainingMinutes
            : 0;


        $salary->remaining_minutes_deduction =
            $remainingTimeDeduction;


        //Keep unpaid leave
        $salary->unpaid_leave =
            $totalUnpaidLeave;

        $salary->unpaid_leave_deduction =
            $unpaidLeaveDeduction;


       // Override final totals for PDF
        $salary->total_deductions =
            $totalDeductions;

        $salary->net_salary =
            $netSalary;


       // Report data
        $report = [

            'salary' =>
                $salary,

            'gross_salary' =>
                $grossSalary,

            'net_salary' =>
                $netSalary,

            'total_deductions' =>
                $totalDeductions,

            'loan_deduction' =>
                $loanDeduction,

            'salary_advance' =>
                $salaryAdvance,

            'state_tax' =>
                $stateTax,

            'social_security' =>
                $socialSecurity,

            'total_absent' =>
                $applyAbsentDeduction
                ? $totalAbsent
                : 0,

            'absent_deduction' =>
                $absentDeduction,

            'penalty_absent_deduction' =>
                $penaltyAbsentDeduction,

            'unpaid_leave' =>
                $totalUnpaidLeave,

            'unpaid_leave_deduction' =>
                $unpaidLeaveDeduction,

            'total_consecutive_late' =>
                $applyConsecutiveLateDeduction
                ? $totalConsecutiveLateDeduction
                : 0,

            'consecutive_late_deduction' =>
                $consecutiveLateDeduction,

            'total_late_minutes' =>
                $applyLateDeduction
                ? $totalLateMinutes
                : 0,

            'late_minutes_deduction' =>
                $lateMinutesDeduction,

            'total_remaining_minutes' =>
                $applyRemainingTimeDeduction
                ? $remainingMinutes
                : 0,

            'remaining_minutes_deduction' =>
                $remainingTimeDeduction,

            'rules' => [

                'absent_deduction' =>
                    $applyAbsentDeduction,

                'consecutive_deduction' =>
                    $applyConsecutiveLateDeduction,

                'late_deduction' =>
                    $applyLateDeduction,

                'penalty_absent_deduction' =>
                    $applyPenaltyAbsentDeduction,

                'remaining_time_deduction' =>
                    $applyRemainingTimeDeduction,
            ],
        ];


        // Configuration
        $configure =
            Configure::query()->first();


     // PDF
        return response()->view(
            'pdf.salary.user-salary-report',
            [
                'salary' =>
                    $salary,

                'configure' =>
                    $configure,

                'month' =>
                    $validated['month'],

                'deductions' =>
                    $report,

                'report' =>
                    $report,
            ]
        );
    }

    // Salary overview
    public function index(
        Request $request
    ): Response {
        return $this->overview(
            $request
        );
    }

    // Salary overview data
    public function overview(
        Request $request
    ): Response {
        abort_unless(
            $this->user?->can(
                'salary.overview'
            ),
            403
        );

        $query = User::query()
            ->where(
                'status',
                'active'
            )
            ->select([
                'id',
                'employee_id',
                'name',
                'basic_salary',
                'transport_allowance',
                'family_allowance',
                'others_allowance',
                'gross_salary',
                'department_id',
                'designation_id',
                'created_at',
            ])
            ->with([
                'department:id,code,name',
                'designation:id,code,name',
            ]);

        // Employee filter
        if (
            $request->filled('user')
        ) {
            $query->where(
                'id',
                $request->integer(
                    'user'
                )
            );
        }

        // Department filter
        if (
            $request->filled('department')
        ) {
            $query->where(
                'department_id',
                $request->integer(
                    'department'
                )
            );
        }

        // Designation filter
        if (
            $request->filled('designation')
        ) {
            $query->where(
                'designation_id',
                $request->integer(
                    'designation'
                )
            );
        }

        // Sorting
        $sorting =
            $request->input(
                'sorting'
            );

        if (
            in_array(
                $sorting,
                [
                    'asc',
                    'desc',
                ],
                true
            )
        ) {
            $query->orderBy(
                'created_at',
                $sorting
            );
        } else {
            $query->latest(
                'created_at'
            );
        }

        // Total
        $numberOfSalaries =
            (clone $query)->count();


        $salaries =
            $query
                ->paginate(30)
                ->withQueryString();


        $departments =
            Department::query()
                ->select([
                    'id',
                    'name',
                ])
                ->orderBy(
                    'name',
                    'asc'
                )
                ->get();

        $designations =
            Designation::query()
                ->select([
                    'id',
                    'name',
                ])
                ->orderBy(
                    'name',
                    'asc'
                )
                ->get();

        $activeCurrency =
            Currency::query()
                ->where(
                    'is_active',
                    true
                )
                ->first();

        // Selected employee
        $selectedEmployee = null;

        if (
            $request->filled('user')
        ) {
            $selectedEmployee =
                User::query()
                    ->select([
                        'id',
                        'employee_id',
                        'name',
                    ])
                    ->find(
                        $request->integer(
                            'user'
                        )
                    );
        }

        return Inertia::render(
            'hr/salary/index',
            [
                'salaries' =>
                    $salaries,

                'numberOfSalaries' =>
                    $numberOfSalaries,

                'departments' =>
                    $departments,

                'designations' =>
                    $designations,

                'activeCurrency' =>
                    $activeCurrency,

                'filters' => [
                    'user' =>
                        $request->input(
                            'user'
                        ),

                    'department' =>
                        $request->input(
                            'department'
                        ),

                    'designation' =>
                        $request->input(
                            'designation'
                        ),

                    'sorting' =>
                        $request->input(
                            'sorting'
                        ),

                    'employee' =>
                        $selectedEmployee,
                ],
            ]
        );
    }

    // Salary generate page
    public function generate(
        Request $request
    ): Response {
        abort_unless(
            $this->user?->can(
                'salary.generate'
            ),
            403
        );

        $departments =
            Department::query()
                ->select([
                    'id',
                    'name',
                ])
                ->orderBy(
                    'name',
                    'asc'
                )
                ->get();

        $employees =
            User::query()
                ->where(
                    'status',
                    'active'
                )
                ->select([
                    'id',
                    'employee_id',
                    'name',
                    'department_id',
                ])
                ->orderBy(
                    'name',
                    'asc'
                )
                ->get();

        $currentMonth =
            $request->input(
                'month',
                now()->format('Y-m')
            );

        $query =
            Salary::query()
                ->with([
                    'user:id,employee_id,name',
                ])
                ->where(
                    'month',
                    $currentMonth
                )
                ->latest('id');

        $numberOfSalaries =
            (clone $query)->count();

        $salaries =
            $query
                ->paginate(30)
                ->withQueryString();

        return Inertia::render(
            'hr/payroll/salary-generate/index',
            [
                'departments' =>
                    $departments,

                'employees' =>
                    $employees,

                'salaries' =>
                    $salaries,

                'currentMonth' =>
                    $currentMonth,

                'numberOfSalaries' =>
                    $numberOfSalaries,
            ]
        );
    }

    // Generate salaries
    public function generateSalaries(
        Request $request
    ) {
        abort_unless(
            $this->user?->can(
                'salary.generate'
            ),
            403
        );

        $request->validate(
            [
                'month' => [
                    'required',
                    'date_format:Y-m',
                ],

                'department' => [
                    'required',

                    function ($attribute, $value, $fail) {
                        if (
                            in_array(
                                $value,
                                [
                                    'all',
                                    'individually',
                                ],
                                true
                            )
                        ) {
                            return;
                        }

                        if (
                            !Department::where(
                                'id',
                                $value
                            )->exists()
                        ) {
                            $fail(
                                'The selected department is invalid.'
                            );
                        }
                    },
                ],

                'employee' => [
                    'nullable',
                    'required_if:department,individually',
                    'integer',
                    'exists:users,id',
                ],
            ],
            [
                'month.required' =>
                    'Please select a salary month.',

                'month.date_format' =>
                    'Invalid month format. Please use YYYY-MM.',

                'department.required' =>
                    'Please select a department option.',

                'employee.required_if' =>
                    'Please select an employee when choosing "Individually".',
            ]
        );

        set_time_limit(0);

        if (
            function_exists('ini_set')
        ) {
            @ini_set(
                'memory_limit',
                '1024M'
            );
        }

        DB::disableQueryLog();

        // Deduction rules
        $applyConsecutiveLateDeduction =
            $request->has(
                'consecutive_deduction'
            );

        $applyTotalLateMinutesDeduction =
            $request->has(
                'late_deduction'
            );

        $applyAbsentDeduction =
            $request->has(
                'absent_deduction'
            );

        $applyPenaltyAbsentDeduction =
            $request->has(
                'penalty_absent_deduction'
            );

        $applyRemainingTimeDeduction =
            $request->has(
                'remaining_time_deduction'
            );

        // Month range
        $startDate =
            Carbon::createFromFormat(
                'Y-m',
                $request->month
            )->startOfMonth();

        $endDate =
            $startDate
                ->copy()
                ->endOfMonth();

        // Employee query
        $userQuery =
            User::with([
                'shift',
                'loans',
                'salaryAdvances',
            ])
                ->where(
                    'status',
                    'active'
                )
                ->whereHas(
                    'shift'
                );

        if (
            $request->department ===
            'all'
        ) {
            // All employees
        } elseif (
            $request->department ===
            'individually'
        ) {
            $userQuery->where(
                'id',
                $request->employee
            );
        } else {
            $userQuery->where(
                'department_id',
                $request->department
            );
        }

        // Employee exists
        if (
            $userQuery->count() === 0
        ) {
            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Employee Not Found! Please Try Again',

                        'type' =>
                            'error',
                    ]
                );
        }

        // Holidays
        $holidays =
            Holiday::all()
                ->flatMap(
                    function ($holiday) {
                        if (
                            $holiday
                                ->is_recurring
                        ) {
                            return [
                                Carbon::parse(
                                    $holiday->date
                                )->format(
                                        'm-d'
                                    ),
                            ];
                        }

                        return [
                            $holiday->date,
                        ];
                    }
                )
                ->toArray();

        // Process employees
        $userQuery->chunkById(
            100,
            function ($employees) use ($startDate, $endDate, $request, $holidays, $applyConsecutiveLateDeduction, $applyTotalLateMinutesDeduction, $applyAbsentDeduction, $applyPenaltyAbsentDeduction, $applyRemainingTimeDeduction) {
                $employeeIds =
                    $employees
                        ->pluck('id')
                        ->toArray();

                // Existing salaries
                $existingSalaryUserIds =
                    Salary::whereIn(
                        'user_id',
                        $employeeIds
                    )
                        ->where(
                            'month',
                            $request->month
                        )
                        ->pluck(
                            'user_id'
                        )
                        ->flip();

                // Attendances
                $attendancesCollection =
                    Attendance::whereIn(
                        'user_id',
                        $employeeIds
                    )
                        ->whereBetween(
                            'created_at',
                            [
                                $startDate
                                    ->copy()
                                    ->startOfDay(),

                                $endDate
                                    ->copy()
                                    ->endOfDay(),
                            ]
                        )
                        ->get()
                        ->groupBy(
                            'user_id'
                        )
                        ->map(
                            function ($group) {
                                return $group
                                    ->keyBy(
                                        function ($item) {
                                            return Carbon::parse(
                                                $item->created_at
                                            )->toDateString();
                                        }
                                    );
                            }
                        );

                // Half day leaves
                $leaveRequestsCollection =
                    LeaveRequest::whereIn(
                        'user_id',
                        $employeeIds
                    )
                        ->where(
                            'status',
                            'Approved'
                        )
                        ->where(
                            'leave_type',
                            'Half Day'
                        )
                        ->whereBetween(
                            'start_date',
                            [
                                $startDate
                                    ->toDateString(),

                                $endDate
                                    ->toDateString(),
                            ]
                        )
                        ->get()
                        ->groupBy(
                            'user_id'
                        )
                        ->map(
                            function ($group) {
                                return $group
                                    ->keyBy(
                                        function ($item) {
                                            return Carbon::parse(
                                                $item->start_date
                                            )->toDateString();
                                        }
                                    );
                            }
                        );

                foreach (
                    $employees as $employee
                ) {
                    // Do not generate twice
                    if (
                        isset(
                        $existingSalaryUserIds[
                            $employee->id
                        ]
                    )
                    ) {
                        continue;
                    }

                    // Shift
                    $shiftStartTime =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->shift_start_time
                        );

                    $shiftEndTime =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->shift_end_time
                        );

                    $firstHalfShiftEndTime =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->first_half_shift_end_time
                        );

                    $secondHalfShiftStartTime =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->second_half_shift_start_time
                        );

                    $weekends =
                        $employee
                            ->shift
                            ->weekends
                        ? explode(
                            ',',
                            $employee
                                ->shift
                                ->weekends
                        )
                        : [];

                    // Counters
                    $totalWorkingDays = 0;
                    $totalPresent = 0;
                    $totalPaidLeave = 0;
                    $totalUnpaidLeave = 0;
                    $totalAbsent = 0;

                    $consecutiveLateDays = 0;
                    $totalConsecutiveLateDeduction = 0;

                    $totalLateMinutes = 0;
                    $totalLateMinutesDeduction = 0;

                    $totalTargetedHours = 0;
                    $totalMinutesWorked = 0;

                    $empAttendances =
                        $attendancesCollection
                            ->get(
                                $employee->id,
                                collect()
                            );

                    $empLeaves =
                        $leaveRequestsCollection
                            ->get(
                                $employee->id,
                                collect()
                            );

                    // Daily attendance
                    for (
                        $date =
                        $startDate->copy();

                        $date->lte(
                            $endDate
                        );

                        $date->addDay()
                    ) {
                        $attendance =
                            $empAttendances
                                ->get(
                                    $date->toDateString()
                                );

                        $leaveRequest =
                            $empLeaves
                                ->get(
                                    $date->toDateString()
                                );

                        $dayName =
                            $date->format(
                                'l'
                            );

                        $monthDay =
                            $date->format(
                                'm-d'
                            );

                        // Weekend or holiday
                        if (
                            (
                                !$attendance &&
                                in_array(
                                    $dayName,
                                    $weekends,
                                    true
                                )
                            ) ||
                            (
                                !$attendance &&
                                (
                                    in_array(
                                        $date->format(
                                            'Y-m-d'
                                        ),
                                        $holidays,
                                        true
                                    ) ||
                                    in_array(
                                        $monthDay,
                                        $holidays,
                                        true
                                    )
                                )
                            )
                        ) {
                            continue;
                        }

                        $totalWorkingDays++;

                        if (
                            !$attendance
                        ) {
                            $totalAbsent++;

                            $consecutiveLateDays =
                                0;

                            continue;
                        }

                        // Attendance status
    
                        if (
                            $attendance
                                ->attendance_status ===
                            'present'
                        ) {
                            $totalPresent++;
                        } elseif (
                            $attendance
                                ->attendance_status ===
                            'leave'
                        ) {
                            if (
                                $attendance
                                    ->type_of_leave ===
                                'Leave Without Pay'
                            ) {
                                $totalUnpaidLeave++;
                            } else {
                                $totalPaidLeave++;
                            }
                        }

                        $checkedInAt =
                            $attendance
                                ->checked_in_at
                            ? Carbon::parse(
                                $attendance
                                    ->checked_in_at
                            )
                            : null;

                        $checkedOutAt =
                            $attendance
                                ->checked_out_at
                            ? Carbon::parse(
                                $attendance
                                    ->checked_out_at
                            )
                            : null;

                        if (
                            !$checkedInAt
                        ) {
                            continue;
                        }

                        // Full day / second half
    
                        $lateThreshold =
                            $shiftStartTime
                                ->copy()
                                ->addMinutes(
                                    15
                                );

                        if (
                            $leaveRequest &&
                            $leaveRequest
                                ->sub_type ===
                            'first_half_day'
                        ) {
                            $lateThreshold =
                                $secondHalfShiftStartTime
                                    ->copy()
                                    ->addMinutes(
                                        15
                                    );

                            $targetStart =
                                $secondHalfShiftStartTime;

                            $targetEnd =
                                $shiftEndTime;
                        } elseif (
                            $leaveRequest &&
                            $leaveRequest
                                ->sub_type ===
                            'second_half_day'
                        ) {
                            $lateThreshold =
                                $shiftStartTime
                                    ->copy()
                                    ->addMinutes(
                                        15
                                    );

                            $targetStart =
                                $shiftStartTime;

                            $targetEnd =
                                $firstHalfShiftEndTime;
                        } else {
                            $targetStart =
                                $shiftStartTime;

                            $targetEnd =
                                $shiftEndTime;
                        }

                        if (
                            $attendance
                                ->attendance_status !==
                            'leave'
                        ) {
                            $totalTargetedHours +=
                                $targetStart
                                    ->diffInHours(
                                        $targetEnd
                                    );
                        }

                        if (
                            $checkedOutAt
                        ) {
                            $totalMinutesWorked +=
                                $checkedInAt
                                    ->diffInMinutes(
                                        $checkedOutAt
                                    );
                        }

                        // Late calculation
    
                        if (
                            $checkedInAt->gt(
                                $lateThreshold
                            )
                        ) {
                            $minutesLate =
                                $checkedInAt
                                    ->diffInMinutes(
                                        $lateThreshold
                                    );

                            $totalLateMinutes +=
                                $minutesLate;

                            $consecutiveLateDays++;
                        } else {
                            $consecutiveLateDays = 0;
                        }

                        if (
                            $consecutiveLateDays >=
                            3
                        ) {
                            $totalConsecutiveLateDeduction++;

                            $consecutiveLateDays =
                                0;
                        }
                    }

                    // Total hours
    
                    $totalHoursWorked =
                        $totalMinutesWorked /
                        60;

                    $totalMinutesWorkedInMonth =
                        $totalHoursWorked *
                        60;

                    $hours =
                        floor(
                            $totalMinutesWorkedInMonth /
                            60
                        );

                    $minutes =
                        $totalMinutesWorkedInMonth %
                        60;

                    $totalWorkHours =
                        $hours .
                        '.' .
                        $minutes;

                    // Per minute salary
    
                    $yearMonth =
                        explode(
                            '-',
                            $request->month
                        );

                    $year =
                        (int) $yearMonth[0];

                    $month =
                        (int) $yearMonth[1];

                    $daysInMonth =
                        cal_days_in_month(
                            CAL_GREGORIAN,
                            $month,
                            $year
                        );

                    $perMinuteSalary = 0;

                    $shiftMinutes =
                        $shiftStartTime
                            ->diffInMinutes(
                                $shiftEndTime
                            );

                    if (
                        $shiftMinutes > 0
                    ) {
                        $perMinuteSalary =
                            $employee
                                ->basic_salary /
                            (
                                $shiftMinutes *
                                $daysInMonth
                            );
                    }

                    // Remaining time
    
                    $remainingMinutes = 0;

                    if (
                        $totalWorkHours <
                        $totalTargetedHours
                    ) {
                        $remainingMinutes =
                            (
                                $totalTargetedHours *
                                60
                            ) -
                            $totalMinutesWorked;
                    }

                    // Gross salary
    
                    $gross_salary =
                        $employee
                            ->basic_salary
                        + (
                            $employee
                                ->transport_allowance ??
                            0
                        )
                        + (
                            $employee
                                ->family_allowance ??
                            0
                        )
                        + (
                            $employee
                                ->others_allowance ??
                            0
                        )
                        + (
                            $employee
                                ->overtime ??
                            0
                        );

                    // Per day salary
    
                    $perdaySalary =
                        $employee
                            ->basic_salary /
                        $daysInMonth;

                    // Day based deductions
    
                    $totalSalaryDeductionDays =
                        (
                            $applyPenaltyAbsentDeduction &&
                            $applyAbsentDeduction
                            ? $totalAbsent * 2
                            : (
                                $applyAbsentDeduction
                                ? $totalAbsent
                                : 0
                            )
                        )
                        + $totalUnpaidLeave
                        + (
                            $applyConsecutiveLateDeduction
                            ? $totalConsecutiveLateDeduction
                            : 0
                        )
                        + (
                            $applyTotalLateMinutesDeduction
                            ? $totalLateMinutesDeduction
                            : 0
                        );

                    // Remaining time deduction
    
                    $totalRemainingSalaryDeductuin =
                        $applyRemainingTimeDeduction &&
                        $totalWorkHours <
                        $totalTargetedHours
                        ? $remainingMinutes *
                        $perMinuteSalary
                        : 0;

                    $totalSalaryDeduction =
                        (
                            $totalSalaryDeductionDays *
                            $perdaySalary
                        )
                        +
                        $totalRemainingSalaryDeductuin;

                    // Loan
    
                    $active_loan =
                        $employee
                            ->loans()
                            ->where(
                                'status',
                                'Approved'
                            )
                            ->first();

                    $loan_installment =
                        $active_loan
                        ? $active_loan
                            ->monthly_installment
                        : 0;

                    // Salary advance
    
                    $salary_advance_check =
                        $employee
                            ->salaryAdvances()
                            ->where(
                                'status',
                                'active'
                            )
                            ->where(
                                'month',
                                $request->month
                            )
                            ->first();

                    $salary_advance =
                        $salary_advance_check
                        ? $salary_advance_check
                            ->amount
                        : 0;

                    // Total deductions
    
                    $totalDeductions =
                        $loan_installment
                        + $salary_advance
                        + (
                            $employee
                                ->state_tax ??
                            0
                        )
                        + (
                            $employee
                                ->social_security ??
                            0
                        )
                        + $totalSalaryDeduction;

                    // Net salary
    
                    $net_salary =
                        $gross_salary -
                        $totalDeductions;

                    // Create salary
    
                    $salary =
                        Salary::create([
                            'user_id' =>
                                $employee->id,

                            'basic_salary' =>
                                $employee
                                    ->basic_salary,

                            'transport_allowance' =>
                                $employee
                                    ->transport_allowance ??
                                0,

                            'family_allowance' =>
                                $employee
                                    ->family_allowance ??
                                0,

                            'others_allowance' =>
                                $employee
                                    ->others_allowance ??
                                0,

                            'overtime' =>
                                $employee
                                    ->overtime ??
                                0,

                            'loan_deduction' =>
                                $loan_installment,

                            'salary_advance' =>
                                $salary_advance,

                            'state_tax' =>
                                $employee
                                    ->state_tax ??
                                0,

                            'social_security' =>
                                $employee
                                    ->social_security ??
                                0,

                            'total_absent' =>
                                $applyPenaltyAbsentDeduction &&
                                $applyAbsentDeduction &&
                                $totalAbsent != 0
                                ? (
                                    '(' .
                                    $totalAbsent .
                                    ' days) - (' .
                                    $totalAbsent * 2 .
                                    ' days penalty)'
                                )
                                : (
                                    $applyAbsentDeduction
                                    ? '(' .
                                    $totalAbsent .
                                    ' days)'
                                    : '(0 days)'
                                ),

                            'absent_deduction' =>
                                $applyPenaltyAbsentDeduction &&
                                $applyAbsentDeduction
                                ? (
                                    $totalAbsent *
                                    $perdaySalary
                                ) * 2
                                : (
                                    $applyAbsentDeduction
                                    ? $totalAbsent *
                                    $perdaySalary
                                    : 0
                                ),

                            'total_consecutive_late' =>
                                $applyConsecutiveLateDeduction
                                ? $totalConsecutiveLateDeduction
                                : 0,

                            'consecutive_late_deduction' =>
                                $applyConsecutiveLateDeduction
                                ? (
                                    $totalConsecutiveLateDeduction *
                                    $perdaySalary
                                )
                                : 0,

                            'total_late_minutes' =>
                                $applyTotalLateMinutesDeduction
                                ? $totalLateMinutes
                                : 0,

                            'late_minutes_deduction' =>
                                $applyTotalLateMinutesDeduction
                                ? (
                                    $totalLateMinutesDeduction *
                                    $perdaySalary
                                )
                                : 0,

                            'total_remaining_minutes' =>
                                $applyRemainingTimeDeduction &&
                                $totalWorkHours <
                                $totalTargetedHours
                                ? $remainingMinutes
                                : 0,

                            'remaining_minutes_deduction' =>
                                $totalRemainingSalaryDeductuin,

                            'unpaid_leave' =>
                                $totalUnpaidLeave,

                            'unpaid_leave_deduction' =>
                                $totalUnpaidLeave *
                                $perdaySalary,

                            'gross_salary' =>
                                $gross_salary,

                            'total_deductions' =>
                                $totalDeductions,

                            'net_salary' =>
                                $net_salary,

                            'status' =>
                                'Approved',

                            'month' =>
                                $request->month,

                            'updated_by' =>
                                auth()->id(),
                        ]);

                    // Complete salary advance
    
                    if (
                        $salary &&
                        $salary_advance_check
                    ) {
                        $salary_advance_check
                            ->status =
                            'Completed';

                        $salary_advance_check
                            ->save();
                    }

                    // Create loan installment
    
                    if (
                        $salary &&
                        $active_loan
                    ) {
                        $installment =
                            new LoanInstallment();

                        $installment->user_id =
                            $salary->user_id;

                        $installment->month =
                            $salary->month;

                        $installment->amount =
                            $salary->loan_deduction;

                        $active_loan
                            ->installments()
                            ->save(
                                $installment
                            );

                        $loanStatus =
                            $active_loan
                                ->installments
                                ->sum(
                                    'amount'
                                );

                        if (
                            $active_loan
                                ->repayment_amount ==
                            $loanStatus
                        ) {
                            $active_loan
                                ->status =
                                'Completed';

                            $active_loan
                                ->save();
                        }
                    }
                }

                unset(
                    $attendancesCollection,
                    $leaveRequestsCollection
                );
            }
        );

        return redirect()
            ->back()
            ->with(
                'notification',
                [
                    'message' =>
                        'Salaries generated successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    // Change salary status
    public function updateStatus(
        Request $request,
        Salary $salary,
    ): RedirectResponse {
        abort_unless(
            $request->user()?->can(
                'salary.overview'
            ),
            403
        );

        $validated =
            $request->validate([
                'status' => [
                    'required',
                    'in:Approved,Hold',
                ],
            ]);

        $salary->update([
            'status' =>
                $validated['status'],
            'updated_by' =>
                $request->user()->id,
        ]);

        return back();
    }

    // Manage payslip

    public function payslipIndex(
        Request $request
    ): Response {
        abort_unless(
            $this->user?->can(
                'salary.overview'
            ),
            403
        );

        $month = $request->input(
            'month',
            now()->format('Y-m')
        );

        $months = Salary::query()
            ->whereNotNull('month')
            ->select('month')
            ->distinct()
            ->orderByDesc('month')
            ->pluck('month')
            ->values()
            ->toArray();

        $salaries = Salary::query()
            ->with([
                'user:id,employee_id,name',
            ])
            ->where(
                'month',
                $month
            )
            ->latest('id')
            ->paginate(30)
            ->withQueryString();

        $numberOfSalaries = Salary::query()
            ->where(
                'month',
                $month
            )
            ->count();

        return Inertia::render(
            'hr/payroll/payslip/index',
            [
                'salaries' =>
                    $salaries,

                'currentMonth' =>
                    $month,

                'months' =>
                    $months,

                'numberOfSalaries' =>
                    $numberOfSalaries,
            ]
        );
    }

    // Payslip view
    public function payslip(
        Salary $salary
    ) {
        abort_unless(
            $this->user?->can(
                'salary.Payslip'
            ),
            403
        );

        $salary->load([
            'user',
        ]);

        $configure =
            Configure::first();

        return view(
            'pdf.salary.payslip',
            [
                'salary' =>
                    $salary,

                'configure' =>
                    $configure,
            ]
        );
    }

    // Download payslip

    public function payslipDownload(
        Salary $salary
    ) {
        abort_unless(
            $this->user?->can('salary.overview'),
            403
        );

        $salary->load([
            'user',
        ]);

        $configure = \App\Models\Configure::first();

        $pdf = Pdf::loadView(
            'pdf.salary.payslip',
            [
                'salary' => $salary,
                'configure' => $configure,
            ]
        );

        $pdf
            ->setPaper(
                'A4',
                'portrait'
            )
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial',
                'dpi' => 96,
            ]);

        $employeeName = $salary->user?->name
            ?? 'Employee';

        $fileName =
            'Payslip-' .
            preg_replace(
                '/[^A-Za-z0-9_-]/',
                '-',
                $employeeName
            ) .
            '-' .
            $salary->month .
            '.pdf';

        return $pdf->download(
            $fileName
        );
    }

    // Salary chart
    public function salaryChart(
        Request $request,
        string $month
    ) {
        abort_unless(
            $this->user?->can(
                'salary.overview'
            ),
            403
        );

        $salaries = Salary::query()
            ->where(
                'month',
                $month
            )
            ->with([
                'user:id,employee_id,name',
            ])
            ->orderBy(
                'id',
                'asc'
            )
            ->get();

        $configure = Configure::query()
            ->first();

        if (
            $request->input('download') === 'pdf'
        ) {

            $pdf = Pdf::loadView(
                'pdf.salary.salary-chart-pdf',
                [
                    'salaries' => $salaries,
                    'month' => $month,
                    'configure' => $configure,
                ]
            );

            $pdf->setPaper(
                'a4',
                'landscape'
            );

            return $pdf->download(
                'Employee Salary Chart ' .
                $month .
                '.pdf'
            );
        }

        return view(
            'pdf.salary.salary-chart',
            [
                'salaries' => $salaries,
                'month' => $month,
                'configure' => $configure,
            ]
        );
    }
}