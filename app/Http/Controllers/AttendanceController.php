<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Configure;
use App\Models\Department;
use App\Models\LeaveRequest;
use App\Models\Shift;
use App\Models\User;
use App\Models\WifiIp;
use App\Services\AttendanceReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public $user;

    public function __construct(
        private AttendanceReportService $attendanceReportService
    ) {
        $this->middleware(function ($request, $next) {
            $this->user = auth()
                ->guard('web')
                ->user();

            return $next($request);
        });
    }

    // My Attendance
    public function index(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('user.attendace')
        ) {
            abort(403, 'Unauthorized access');
        }

        $this->user->load([
            'shift',
        ]);

        $shift = $this->user->shift;

        if (!$shift) {
            abort(422, 'Shift is not defined.');
        }

        // Requested month

        $currentMonth = $request->input(
            'month',
            now()->format('Y-m')
        );

        try {
            $month = Carbon::createFromFormat(
                'Y-m',
                $currentMonth
            )->startOfMonth();
        } catch (\Throwable $exception) {
            $currentMonth = now()->format('Y-m');
            $month = now()->copy()->startOfMonth();
        }

        $monthStart = $month->copy()->startOfMonth();
        $monthEnd = $month->copy()->endOfMonth();

        // IMPORTANT: do not mark future dates of current month Absent
        if (
            $currentMonth ===
            now()->format('Y-m')
        ) {
            $monthEnd = now()->copy()->endOfDay();
        }

        // Today's real attendance
        $attendance = Attendance::query()
            ->where(
                'user_id',
                $this->user->id
            )
            ->whereDate(
                'created_at',
                now()->toDateString()
            )
            ->first();

        // Monthly report from service
        $report =
            $this->attendanceReportService->individual(
                $this->user->id,
                $monthStart->toDateString(),
                $monthEnd->toDateString()
            );

        // Weekends
        $weekends =
            $this->normalizeWeekendDays(
                $shift->weekends
            );

        if (
            empty($weekends)
        ) {
            $weekends =
                $this->normalizeWeekendDays(
                    $report['weekends'] ?? []
                );
        }

        // Calendar map
        $holidayList = collect(
            $report['allHolidays'] ?? []
        );

        $dates = collect(
            $report['datesInMonth'] ?? []
        )
            ->map(
                fn($date) =>
                    Carbon::parse($date)
                        ->toDateString()
            )
            ->filter(
                fn($date) =>
                    $date <=
                    $monthEnd->toDateString()
            )
            ->values();

        $calendarStatus = [];

        foreach (
            $dates as $dateKey
        ) {
            $dayName =
                Carbon::parse($dateKey)
                    ->format('l');

            $holiday =
                $holidayList->first(
                    function ($item) use ($dateKey) {
                        if (!is_array($item)) {
                            return false;
                        }

                        $holidayDate =
                            $item['date'] ?? null;

                        return $holidayDate &&
                            Carbon::parse(
                                $holidayDate
                            )->toDateString() ===
                            $dateKey;
                    }
                );

            $calendarStatus[$dateKey] = [
                'is_holiday' =>
                    !is_null($holiday),

                'holiday_name' =>
                    is_array($holiday)
                    ? ($holiday['name'] ?? 'Holiday')
                    : null,

                'is_weekend' =>
                    in_array(
                        strtolower($dayName),
                        $weekends,
                        true
                    ),

                'day_name' =>
                    $dayName,
            ];
        }


        $reportRows = collect(
            $report['rows'] ?? []
        );

        $resolvedRows =
            $reportRows
                ->map(
                    function (array $row) use ($calendarStatus, $shift) {
                        $dateKey = !empty(
                            $row['date'] ?? null
                        )
                            ? Carbon::parse(
                                $row['date']
                            )->toDateString()
                            : null;

                        if (!$dateKey) {
                            return $row;
                        }

                        $calendar =
                            $calendarStatus[
                                $dateKey
                            ] ?? [
                                'is_holiday' => false,
                                'holiday_name' => null,
                                'is_weekend' => false,
                            ];

                        $attendanceStatus =
                            strtolower(
                                trim(
                                    (string) (
                                        $row['attendance_status'] ??
                                        $row['status'] ??
                                        ''
                                    )
                                )
                            );

                        $hasRealAttendance =
                            !empty(
                            $row['checked_in_at'] ??
                            $row['check_in'] ??
                            null
                        ) ||
                            !empty(
                            $row['checked_out_at'] ??
                            $row['check_out'] ??
                            null
                        ) ||
                            in_array(
                                $attendanceStatus,
                                [
                                    'present',
                                    'home',
                                    'leave',
                                ],
                                true
                            );

                        // Holiday / Weekend / Absent
                        if (!$hasRealAttendance) {
                            if (
                                !empty(
                                $calendar['is_holiday']
                            )
                            ) {
                                $row['status'] =
                                    'Holiday';

                                $row['attendance_status'] =
                                    'holiday';

                                $row['holiday'] =
                                    $calendar['holiday_name'] ??
                                    'Holiday';
                            } elseif (
                                !empty(
                                $calendar['is_weekend']
                            )
                            ) {
                                $row['status'] =
                                    'Weekend';

                                $row['attendance_status'] =
                                    'weekend';

                                $row['holiday'] =
                                    null;
                            } else {
                                $row['status'] =
                                    'Absent';

                                $row['attendance_status'] =
                                    'absent';
                            }

                            $row['late'] = false;
                            $row['late_minutes'] = 0;
                            $row['early'] = false;
                            $row['early_minutes'] = 0;

                            return $row;
                        }

                        // Present: calculate Late/Early from SHIFT
                        if (
                            $attendanceStatus ===
                            'present'
                        ) {
                            $checkIn =
                                $row['checked_in_at'] ??
                                $row['check_in'] ??
                                null;

                            $checkOut =
                                $row['checked_out_at'] ??
                                $row['check_out'] ??
                                null;

                            $lateMinutes =
                                $this->calculateLateMinutesForDate(
                                    $dateKey,
                                    $checkIn,
                                    $shift->shift_start_time,
                                    15
                                );

                            $earlyMinutes =
                                $this->calculateEarlyMinutesForDate(
                                    $dateKey,
                                    $checkOut,
                                    $shift->shift_end_time
                                );

                            $row['status'] =
                                'Present';

                            $row['attendance_status'] =
                                'present';

                            $row['late'] =
                                $lateMinutes > 0;

                            $row['late_minutes'] =
                                $lateMinutes;

                            $row['early'] =
                                $earlyMinutes > 0;

                            $row['early_minutes'] =
                                $earlyMinutes;
                        } else {
                            $row['late'] =
                                (bool) (
                                    $row['late'] ?? false
                                );

                            $row['late_minutes'] =
                                (int) (
                                    $row['late_minutes'] ?? 0
                                );

                            $row['early'] =
                                (bool) (
                                    $row['early'] ?? false
                                );

                            $row['early_minutes'] =
                                (int) (
                                    $row['early_minutes'] ?? 0
                                );
                        }

                        return $row;
                    }
                )
                ->values();

        $report['rows'] =
            $resolvedRows->all();


        $workingDays = 0;
        $present = 0;
        $home = 0;
        $leave = 0;
        $absent = 0;
        $holidays = 0;
        $weekendsCount = 0;
        $late = 0;
        $early = 0;
        $lateMinutes = 0;
        $earlyMinutes = 0;
        $hoursWorked = 0;

        foreach (
            $resolvedRows as $row
        ) {
            $status =
                strtolower(
                    trim(
                        (string) (
                            $row['status'] ??
                            $row['attendance_status'] ??
                            ''
                        )
                    )
                );

            if (
                $status ===
                'weekend'
            ) {
                $weekendsCount++;
                continue;
            }

            if (
                $status ===
                'holiday'
            ) {
                $holidays++;
                continue;
            }

            $workingDays++;

            if (
                $status ===
                'absent'
            ) {
                $absent++;
                continue;
            }

            if (
                $status ===
                'leave'
            ) {
                $leave++;
                continue;
            }

            if (
                $status ===
                'home'
            ) {
                $home++;
                continue;
            }

            if (
                $status ===
                'present'
            ) {
                $present++;

                if (
                    !empty($row['late'])
                ) {
                    $late++;
                }

                if (
                    !empty($row['early'])
                ) {
                    $early++;
                }

                $lateMinutes +=
                    (int) (
                        $row['late_minutes'] ?? 0
                    );

                $earlyMinutes +=
                    (int) (
                        $row['early_minutes'] ?? 0
                    );

                $hoursWorked +=
                    (float) (
                        $row['hours_worked'] ?? 0
                    );
            }
        }

        $targetedHours =
            (float) (
                $report['summary']['targeted_hours'] ??
                0
            );

        $remainingHours =
            max(
                0,
                $targetedHours -
                $hoursWorked
            );

        $report['summary'] = [
            'working_days' =>
                $workingDays,

            'present' =>
                $present,

            'home' =>
                $home,

            'absent' =>
                $absent,

            'leave' =>
                $leave,

            'holidays' =>
                $holidays,

            'weekends' =>
                $weekendsCount,

            'late' =>
                $late,

            'early' =>
                $early,

            'late_minutes' =>
                $lateMinutes,

            'early_minutes' =>
                $earlyMinutes,

            'targeted_hours' =>
                round(
                    $targetedHours,
                    2
                ),

            'hours_worked' =>
                round(
                    $hoursWorked,
                    2
                ),

            'remaining_hours' =>
                round(
                    $remainingHours,
                    2
                ),
        ];

        $report['attendanceData'] = [
            'Working Days' => [
                'count' =>
                    $workingDays,
                'color' =>
                    '#3096da',
            ],

            'On Time' => [
                'count' =>
                    max(
                        $present - $late,
                        0
                    ),
                'color' =>
                    '#2ecc71',
            ],

            'Late' => [
                'count' =>
                    $late,
                'color' =>
                    '#d35400',
            ],

            'Left Timely' => [
                'count' =>
                    max(
                        $present - $early,
                        0
                    ),
                'color' =>
                    '#2ecc71',
            ],

            'Left Early' => [
                'count' =>
                    $early,
                'color' =>
                    '#d35400',
            ],

            'On Leave' => [
                'count' =>
                    $leave,
                'color' =>
                    '#1abc9c',
            ],

            'Absent' => [
                'count' =>
                    $absent,
                'color' =>
                    '#34495e',
            ],
        ];


        $rowsByDate =
            $resolvedRows
                ->keyBy(
                    fn($row) =>
                        $row['date'] ?? null
                );

        $report['timeReports'] =
            collect(
                $report['timeReports'] ?? []
            )
                ->map(
                    function (array $timeReport) use ($rowsByDate) {
                        $dateKey = !empty(
                            $timeReport['created_at'] ?? null
                        )
                            ? Carbon::parse(
                                $timeReport['created_at']
                            )->toDateString()
                            : null;

                        if (!$dateKey) {
                            return $timeReport;
                        }

                        $resolvedRow =
                            $rowsByDate->get(
                                $dateKey
                            );

                        if (!$resolvedRow) {
                            return $timeReport;
                        }

                        return array_merge(
                            $timeReport,
                            $resolvedRow
                        );
                    }
                )
                ->values()
                ->all();

        $report['datesInMonth'] =
            $dates->all();

        $report['calendarStatus'] =
            $calendarStatus;

        $report['weekends'] =
            $weekends;


        if (
            $request->boolean(
                'debug'
            )
        ) {
            return response()->json([
                'current_month' =>
                    $currentMonth,

                'range' => [
                    'start' =>
                        $monthStart->toDateString(),

                    'end' =>
                        $monthEnd->toDateString(),
                ],

                'shift' => [
                    'id' =>
                        $shift->id ?? null,

                    'name' =>
                        $shift->name ?? null,

                    'start_time' =>
                        $shift->shift_start_time,

                    'end_time' =>
                        $shift->shift_end_time,

                    'raw_weekends' =>
                        $shift->weekends,

                    'weekends' =>
                        $weekends,

                    'late_grace_minutes' =>
                        15,
                ],

                'attendance_data' =>
                    $report['attendanceData'],

                'summary' =>
                    $report['summary'],

                'calendar_status' =>
                    $calendarStatus,

                'rows' =>
                    $report['rows'],

                'time_reports' =>
                    $report['timeReports'],
            ]);
        }

        return Inertia::render(
            'hr/attendance/index',
            [
                'attendance' =>
                    $attendance,

                'currentMonth' =>
                    $currentMonth,

                'report' =>
                    $report,

                'shift' => [
                    'start_time' =>
                        $shift->shift_start_time,

                    'end_time' =>
                        $shift->shift_end_time,

                    'weekends' =>
                        $weekends,

                    'late_grace_minutes' =>
                        15,
                ],
            ]
        );
    }

    // Normalize Weekend Days
    private function normalizeWeekendDays(
        mixed $value
    ): array {
        if ($value instanceof \Illuminate\Support\Collection) {
            $value = $value->all();
        }

        if (is_string($value)) {
            $trimmed = trim($value);

            if ($trimmed === '') {
                return [];
            }

            // JSON array
            if (
                str_starts_with($trimmed, '[') &&
                str_ends_with($trimmed, ']')
            ) {
                $decoded = json_decode(
                    $trimmed,
                    true
                );

                if (is_array($decoded)) {
                    $value = $decoded;
                } else {
                    $value = explode(
                        ',',
                        $trimmed
                    );
                }
            } else {
                $value = explode(
                    ',',
                    $trimmed
                );
            }
        }

        if (!is_array($value)) {
            return [];
        }

        return collect($value)
            ->map(
                function ($day) {
                    $day = strtolower(
                        trim(
                            (string) $day
                        )
                    );

                    return match ($day) {
                        'sun', 'sunday' =>
                            'sunday',

                        'mon', 'monday' =>
                            'monday',

                        'tue', 'tues', 'tuesday' =>
                            'tuesday',

                        'wed', 'wednesday' =>
                            'wednesday',

                        'thu', 'thur', 'thurs', 'thursday' =>
                            'thursday',

                        'fri', 'friday' =>
                            'friday',

                        'sat', 'saturday' =>
                            'saturday',

                        default =>
                            $day,
                    };
                }
            )
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    // Clock helpers used by the report page
    private function clockForDate(
        string $date,
        ?string $time
    ): ?Carbon {
        if (!$time) {
            return null;
        }

        try {
            $clock =
                Carbon::parse(
                    $time
                );

            return Carbon::parse(
                $date
            )->setTime(
                    $clock->hour,
                    $clock->minute,
                    $clock->second
                );
        } catch (\Throwable $exception) {
            return null;
        }
    }

    private function calculateLateMinutesForDate(
        string $date,
        ?string $checkIn,
        ?string $shiftStart,
        int $graceMinutes = 15
    ): int {
        $checkInTime =
            $this->clockForDate(
                $date,
                $checkIn
            );

        $shiftStartTime =
            $this->clockForDate(
                $date,
                $shiftStart
            );

        if (
            !$checkInTime ||
            !$shiftStartTime
        ) {
            return 0;
        }

        $lateAfter =
            $shiftStartTime
                ->copy()
                ->addMinutes(
                    $graceMinutes
                );

        if (
            !$checkInTime->gt(
                $lateAfter
            )
        ) {
            return 0;
        }

        return (int) 
            $lateAfter
                ->diffInMinutes(
                    $checkInTime
                );
    }

    private function calculateEarlyMinutesForDate(
        string $date,
        ?string $checkOut,
        ?string $shiftEnd
    ): int {
        $checkOutTime =
            $this->clockForDate(
                $date,
                $checkOut
            );

        $shiftEndTime =
            $this->clockForDate(
                $date,
                $shiftEnd
            );

        if (
            !$checkOutTime ||
            !$shiftEndTime
        ) {
            return 0;
        }

        if (
            !$checkOutTime->lt(
                $shiftEndTime
            )
        ) {
            return 0;
        }

        return (int) 
            $checkOutTime
                ->diffInMinutes(
                    $shiftEndTime
                );
    }

    // Check In / Check Out
    public function store(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('user.attendace')
        ) {
            abort(403, 'Unauthorized access');
        }

        // $this->authorizePermission('user.attendace');

        // Validate IP
        $ip = WifiIp::query()
            ->where(
                'ip_address',
                $request->ip()
            )
            ->first();

        if (!$ip) {
            return response()->json(
                [
                    'success' => false,
                    'status' => 'forbidden',
                    'error' => 'Sorry! Your IP is not valid.',
                ],
                403
            );
        }

        $user = $this->user;

        //Shift
        if (!$user->shift) {
            return response()->json(
                [
                    'success' => false,
                    'status' => 'shift_missing',
                    'error' => 'Shift is not defined.',
                ],
                422
            );
        }

        $shiftStart =
            $user->shift->shift_start_time;

        $shiftClose =
            $user->shift->shift_end_time;

        $firstHalfShiftClose =
            $user->shift->first_half_shift_end_time;

        $secondHalfShiftStart =
            $user->shift->second_half_shift_start_time;

        $bufferingTime = 15;

        $currentTime = now()->format('H:i');

        //Half Day Leave
        $leaveRequest = LeaveRequest::query()
            ->where(
                'start_date',
                now()->toDateString()
            )
            ->where(
                'user_id',
                $user->id
            )
            ->where(
                'leave_type',
                'Half Day'
            )
            ->where(
                'status',
                'approved'
            )
            ->first();

        if ($leaveRequest) {

            if (
                $leaveRequest->sub_type ===
                'first_half_day'
            ) {
                $latestCheckInTime = date(
                    'H:i',
                    strtotime(
                        $secondHalfShiftStart
                    ) +
                    (
                        $bufferingTime * 60
                    )
                );

                $latestCheckOutTime = date(
                    'H:i',
                    strtotime(
                        $shiftClose
                    )
                );
            } else {
                $latestCheckInTime = date(
                    'H:i',
                    strtotime(
                        $shiftStart
                    ) +
                    (
                        $bufferingTime * 60
                    )
                );

                $latestCheckOutTime = date(
                    'H:i',
                    strtotime(
                        $firstHalfShiftClose
                    )
                );
            }
        } else {
            $latestCheckInTime = date(
                'H:i',
                strtotime(
                    $shiftStart
                ) +
                (
                    $bufferingTime * 60
                )
            );

            $latestCheckOutTime = date(
                'H:i',
                strtotime(
                    $shiftClose
                )
            );
        }

        //Today's Attendance
        $attendance = Attendance::query()
            ->where(
                'user_id',
                $user->id
            )
            ->whereDate(
                'created_at',
                now()->toDateString()
            )
            ->first();

        //Already Complete
        if (
            $attendance &&
            $attendance->checked_in_at &&
            $attendance->checked_out_at
        ) {
            return response()->json([
                'success' => true,
                'status' => 'complete',
                'attendance_type' => 'completeAttendance',

                'message' =>
                    "Today's attendance is already complete.",

                'data' => $attendance,

                'attendance' => $attendance,
            ]);
        }

        //CHECK IN
        if (!$attendance) {

            //On Time Check In
            if (
                $currentTime <=
                $latestCheckInTime
            ) {
                $attendance = Attendance::create([
                    'user_id' =>
                        $user->id,

                    'attendance_status' =>
                        'present',

                    'checked_in_at' =>
                        now()->format('h:i A'),

                    'attendance_type' =>
                        'ip',
                ]);

                return response()->json([
                    'success' => true,


                    'status' => 'logged',

                    'attendance_type' =>
                        'checkIn',

                    'message' =>
                        'Check-in recorded successfully.',

                    'isLate' =>
                        false,

                    'data' =>
                        $attendance,

                    'attendance' =>
                        $attendance,

                    'checked_in_at' =>
                        $attendance->checked_in_at,

                    'checked_out_at' =>
                        $attendance->checked_out_at,
                ]);
            }

            // Late Check In
            if (
                $currentTime >
                $latestCheckInTime
            ) {

                //Note Required
                if (!$request->filled('note')) {
                    return response()->json(
                        [
                            'success' => false,

                            'status' =>
                                'note_required',

                            'error' =>
                                'Please provide an explanatory note.',
                        ],
                        422
                    );
                }

                $request->validate([
                    'note' => [
                        'required',
                        'string',
                        'max:255',
                    ],
                ]);

                $attendance = Attendance::create([
                    'user_id' =>
                        $user->id,

                    'attendance_status' =>
                        'present',

                    'checked_in_at' =>
                        now()->format('h:i A'),

                    'checked_in_at_note' =>
                        $request->note,

                    'attendance_type' =>
                        'ip',
                ]);

                return response()->json([
                    'success' => true,

                    'status' =>
                        'logged',

                    'attendance_type' =>
                        'checkIn',

                    'message' =>
                        'Late check-in recorded successfully.',

                    'isLate' =>
                        true,

                    'data' =>
                        $attendance,

                    'attendance' =>
                        $attendance,

                    'checked_in_at' =>
                        $attendance->checked_in_at,

                    'checked_out_at' =>
                        $attendance->checked_out_at,
                ]);
            }
        }

        // Safety Check
        if (!$attendance) {
            return response()->json(
                [
                    'success' => false,

                    'status' =>
                        'attendance_missing',

                    'error' =>
                        'Attendance record could not be created.',
                ],
                422
            );
        }

        // CHECK OUT - ON TIME
        if (
            $currentTime >=
            $latestCheckOutTime
        ) {
            $attendance->checked_out_at =
                now()->format('h:i A');

            $attendance->save();

            return response()->json([
                'success' => true,

                'status' =>
                    'checked_out',

                'attendance_type' =>
                    'checkOut',

                'message' =>
                    'Check-out recorded successfully.',

                'isOnTime' =>
                    true,

                'data' =>
                    $attendance,

                'attendance' =>
                    $attendance,

                'checked_in_at' =>
                    $attendance->checked_in_at,

                'checked_out_at' =>
                    $attendance->checked_out_at,
            ]);
        }

        // EARLY CHECK OUT
        if (!$request->filled('note')) {
            return response()->json(
                [
                    'success' => false,

                    'status' =>
                        'note_required',

                    'error' =>
                        'Please provide an explanatory note.',
                ],
                422
            );
        }

        $request->validate([
            'note' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $attendance->checked_out_at =
            now()->format('h:i A');

        $attendance->checked_out_at_note =
            $request->note;

        $attendance->save();

        return response()->json([
            'success' => true,

            'status' =>
                'checked_out',

            'attendance_type' =>
                'checkOut',

            'message' =>
                'Early check-out recorded successfully.',

            'isOnTime' =>
                false,

            'data' =>
                $attendance,

            'attendance' =>
                $attendance,

            'checked_in_at' =>
                $attendance->checked_in_at,

            'checked_out_at' =>
                $attendance->checked_out_at,
        ]);
    }

    // HR - All Employee Attendance
    public function employeeAttendance(
        Request $request
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('attendance.list')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        $month = $request->input(
            'month',
            now()->format('Y-m')
        );

        $departmentId =
            $request->filled('department')
            ? (int) $request->input(
                'department'
            )
            : null;

        $shiftId =
            $request->filled('shift')
            ? (int) $request->input(
                'shift'
            )
            : null;

        $result =
            $this->attendanceReportService
                ->employeeMatrix(
                    $month,
                    $departmentId,
                    $shiftId
                );

        return Inertia::render(
            'hr/attendance/employee-attendance',
            [
                'report' =>
                    $result['report'] ?? [],

                'month' =>
                    $month,

                'departments' =>
                    Department::query()
                        ->select([
                            'id',
                            'name',
                        ])
                        ->orderBy(
                            'name',
                            'asc'
                        )
                        ->get(),

                'shifts' =>
                    Shift::query()
                        ->select([
                            'id',
                            'name',
                        ])
                        ->orderBy(
                            'name',
                            'asc'
                        )
                        ->get(),

                'filters' => [
                    'department' =>
                        $departmentId,

                    'shift' =>
                        $shiftId,

                    'month' =>
                        $month,
                ],
            ]
        );
    }

    // Manual Attendance
    public function manualAttendance(
        Request $request
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can(
                'attendance.manual'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        $month = $request->input(
            'month',
            now()->format('Y-m')
        );

        // Validate Month

        try {
            $startDate = Carbon::createFromFormat(
                'Y-m',
                $month
            )->startOfMonth();

            $endDate = Carbon::createFromFormat(
                'Y-m',
                $month
            )->endOfMonth();
        } catch (\Throwable $exception) {
            $month = now()->format('Y-m');

            $startDate = Carbon::createFromFormat(
                'Y-m',
                $month
            )->startOfMonth();

            $endDate = Carbon::createFromFormat(
                'Y-m',
                $month
            )->endOfMonth();
        }

        // Attendance Query: Only attendance records modified by HR are shown here.
        $query = Attendance::query()
            ->with([
                'user:id,name,employee_id',
                'modifyBy:id,name,employee_id',
            ])
            ->whereNotNull(
                'modification_by'
            )
            ->whereBetween(
                'created_at',
                [
                    $startDate,
                    $endDate,
                ]
            )
            ->latest('created_at');

        // Department Filter
        if (
            $request->filled('department')
        ) {
            $departmentId =
                (int) $request->input(
                    'department'
                );

            $query->whereHas(
                'user',
                function ($q) use ($departmentId) {
                    $q->where(
                        'department_id',
                        $departmentId
                    );
                }
            );
        }

        // Shift Filter
        if (
            $request->filled('shift')
        ) {
            $shiftId =
                (int) $request->input(
                    'shift'
                );

            $query->whereHas(
                'user',
                function ($q) use ($shiftId) {
                    $q->where(
                        'shift_id',
                        $shiftId
                    );
                }
            );
        }

        //Pagination
        $attendances = $query
            ->paginate(50)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Preserve Original Attendance Date
        |--------------------------------------------------------------------------
        |
        | created_at is a datetime and may serialize to UTC.
        | Send a separate YYYY-MM-DD field for the attendance date.
        |
        */

        $attendances->getCollection()->each(
            function (Attendance $attendance): void {

                $attendance->setAttribute(
                    'attendance_date',
                    $attendance->created_at
                            ?->format('Y-m-d')
                );
            }
        );

        // Departments
        $departments = Department::query()
            ->select([
                'id',
                'name',
            ])
            ->orderBy(
                'name',
                'asc'
            )
            ->get();

        //Shifts
        $shifts = Shift::query()
            ->select([
                'id',
                'name',
            ])
            ->orderBy(
                'name',
                'asc'
            )
            ->get();

        return Inertia::render(
            'hr/attendance/manual',
            [
                'attendances' =>
                    $attendances,

                'departments' =>
                    $departments,

                'shifts' =>
                    $shifts,

                'filters' => [
                    'department' =>
                        $request->input(
                            'department'
                        ),

                    'shift' =>
                        $request->input(
                            'shift'
                        ),

                    'month' =>
                        $month,
                ],
            ]
        );
    }

    // Check Existing Attendance
    public function attendanceCheck(
        int $userId,
        string $date
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can(
                'attendance.manual'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        //Validate Date
        try {
            $parsedDate = Carbon::parse(
                $date
            )->toDateString();
        } catch (\Throwable $exception) {
            return response()->json(
                [
                    'message' =>
                        'Invalid attendance date.',
                ],
                422
            );
        }

        // Find Attendance
        $attendance =
            Attendance::query()
                ->with([
                    'user:id,name,employee_id',
                    'modifyBy:id,name,employee_id',
                ])
                ->where(
                    'user_id',
                    $userId
                )
                ->whereDate(
                    'created_at',
                    $parsedDate
                )
                ->first();

        // Return Empty Result
        if (!$attendance) {
            return response()->json([
                'exists' => false,
                'data' => null,
            ]);
        }

        // Return Attendance
        return response()->json([
            'exists' => true,
            'data' => [
                'id' =>
                    $attendance->id,

                'user_id' =>
                    $attendance->user_id,

                'checked_in_at' =>
                    $attendance->checked_in_at,

                'checked_out_at' =>
                    $attendance->checked_out_at,

                'checked_in_at_note' =>
                    $attendance->checked_in_at_note,

                'checked_out_at_note' =>
                    $attendance->checked_out_at_note,

                'attendance_status' =>
                    $attendance->attendance_status,

                'attendance_type' =>
                    $attendance->attendance_type,

                'modification_by' =>
                    $attendance->modification_by,

                // 'created_at' =>
                //     $attendance->created_at,
                'attendance_date' => $attendance->created_at
                        ?->format('Y-m-d'),
            ],
        ]);
    }

    // Store Manual Attendance
    public function manualAttendanceStore(
        Request $request
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can(
                'attendance.manual'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        $validated = $request->validate([
            'date' => [
                'required',
                'date',
            ],

            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],

            'checked_in_at' => [
                'nullable',
                'date_format:H:i',
            ],

            'checked_out_at' => [
                'nullable',
                'date_format:H:i',
            ],

            'checked_in_at_note' => [
                'nullable',
                'string',
                'max:255',
            ],

            'checked_out_at_note' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        // Normalize Date
        $attendanceDate = Carbon::parse(
            $validated['date']
        )->startOfDay();

        // Format Check In
        $checkIn = null;

        if (
            !empty(
            $validated['checked_in_at']
        )
        ) {
            $checkIn = Carbon::createFromFormat(
                'H:i',
                $validated['checked_in_at']
            )->format('h:i A');
        }

        // Format Check Out
        $checkOut = null;

        if (
            !empty(
            $validated['checked_out_at']
        )
        ) {
            $checkOut = Carbon::createFromFormat(
                'H:i',
                $validated['checked_out_at']
            )->format('h:i A');
        }

        // Find Existing Attendance
        $attendance =
            Attendance::query()
                ->where(
                    'user_id',
                    $validated['user_id']
                )
                ->whereDate(
                    'created_at',
                    $attendanceDate
                )
                ->first();

        // Create Attendance
        if (!$attendance) {
            $attendance =
                new Attendance();

            $attendance->user_id =
                $validated['user_id'];

            $attendance->attendance_status =
                'present';

            $attendance->attendance_type =
                'ip';


            $attendance->created_at =
                $attendanceDate->copy();

            $attendance->updated_at =
                now();
        }

        //Update Attendance
        $attendance->checked_in_at =
            $checkIn;

        $attendance->checked_out_at =
            $checkOut;

        $attendance->checked_in_at_note =
            $validated[
                'checked_in_at_note'
            ] ?? null;

        $attendance->checked_out_at_note =
            $validated[
                'checked_out_at_note'
            ] ?? null;

        // Mark As Manually Modified
        $attendance->modification_by =
            $this->user->id;

        $attendance->updated_at =
            now();

        $attendance->save();

        return redirect()
            ->back()
            ->with([
                'message' =>
                    'Attendance modified successfully.',

                'type' =>
                    'success',
            ]);
    }

    //Attendance Reports
    public function reports(
        Request $request
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('attendance.list')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        $currentMonth = $request->input(
            'month',
            now()->format('Y-m')
        );

        // Employees
        $employees = User::query()
            ->whereNotNull('employee_id')
            ->where('employee_id', '!=', '')
            ->select([
                'id',
                'employee_id',
                'name',
            ])
            ->orderBy(
                'name',
                'asc'
            )
            ->get();

        return Inertia::render(
            'hr/attendance/reports',
            [
                'currentMonth' =>
                    $currentMonth,

                'employees' =>
                    $employees,
            ]
        );
    }


    // All Employee Attendance Report
    public function allAttendanceReport(
        Request $request
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('attendance.list')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        $validated =
            $request->validate([
                'start_date' => [
                    'required',
                    'date',
                ],

                'end_date' => [
                    'required',
                    'date',
                    'after_or_equal:start_date',
                ],
            ]);

        $result =
            $this->attendanceReportService
                ->allEmployees(
                    $validated['start_date'],
                    $validated['end_date']
                );

        $employeeAttendances =
            $result['employeeAttendances']
            ?? [];

        $startDate =
            $result['start_date']
            ?? $validated['start_date'];

        $endDate =
            $result['end_date']
            ?? $validated['end_date'];

        $configure =
            Configure::query()->first();

        // PDF
        if (
            $request->input('download') === 'pdf'
        ) {
            $pdf =
                Pdf::loadView(
                    'pdf.attendance.all',
                    [
                        'configure' =>
                            $configure,

                        'employeeAttendances' =>
                            $employeeAttendances,

                        'start_date' =>
                            $startDate,

                        'end_date' =>
                            $endDate,
                    ]
                )->setPaper(
                        'a4',
                        'landscape'
                    );

            return $pdf->stream(
                'All Employee Attendance Report ' .
                Carbon::now()->format('d-m-Y') .
                '.pdf'
            );
        }

        // HTML Report
        return view(
            'pdf.attendance.all',
            [
                'configure' =>
                    $configure,

                'employeeAttendances' =>
                    $employeeAttendances,

                'start_date' =>
                    $startDate,

                'end_date' =>
                    $endDate,
            ]
        );
    }


    // Individual Attendance Report
    public function individualAttendanceReport(
        Request $request
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('attendance.list')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        $validated =
            $request->validate([
                'person' => [
                    'required',
                    'integer',
                    'exists:users,id',
                ],

                'start_date' => [
                    'required',
                    'date',
                ],

                'end_date' => [
                    'required',
                    'date',
                    'after_or_equal:start_date',
                ],
            ]);

        // Service already has individual()
        $report =
            $this->attendanceReportService
                ->individual(
                    (int) $validated['person'],
                    $validated['start_date'],
                    $validated['end_date']
                );

        $configure =
            Configure::query()->first();

        // PDF
        if (
            $request->input('download') === 'pdf'
        ) {
            $pdf =
                Pdf::loadView(
                    'pdf.attendance.individual',
                    [
                        'configure' =>
                            $configure,

                        'employee' =>
                            $report['employee'],

                        'rows' =>
                            $report['rows'],

                        'summary' =>
                            $report['summary'],

                        'start_date' =>
                            $report['start_date'],

                        'end_date' =>
                            $report['end_date'],
                    ]
                )->setPaper(
                        'a4',
                        'landscape'
                    );

            $employeeName =
                $report['employee']['name']
                ?? 'Employee';

            $fileName =
                'Attendance Report - ' .
                preg_replace(
                    '/[^A-Za-z0-9_-]/',
                    '-',
                    $employeeName
                ) .
                ' - ' .
                Carbon::now()->format('d-m-Y') .
                '.pdf';

            return $pdf->stream(
                $fileName
            );
        }

        //HTML Report
        return view(
            'pdf.attendance.individual',
            [
                'configure' =>
                    $configure,

                'employee' =>
                    $report['employee'],

                'rows' =>
                    $report['rows'],

                'summary' =>
                    $report['summary'],

                'start_date' =>
                    $report['start_date'],

                'end_date' =>
                    $report['end_date'],
            ]
        );
    }


    // Monthly Attendance Report
    public function monthlyAttendanceReport(
        Request $request
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('attendance.list')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }

        $validated =
            $request->validate([
                'month' => [
                    'required',
                    'date_format:Y-m',
                ],
            ]);

        $result =
            $this->attendanceReportService
                ->employeeMatrix(
                    $validated['month']
                );

        $employeeAttendances =
            collect(
                $result['report'] ?? []
            )
                ->map(
                    function (array $employee) {
                        return [
                            'employee_id' =>
                                $employee['employee_id'],

                            'employee_name' =>
                                $employee['name'],

                            'total_working_days' =>
                                $employee[
                                    'total_working_days'
                                ],

                            'total_present' =>
                                $employee[
                                    'total_present'
                                ],

                            'total_home' =>
                                $employee[
                                    'total_home'
                                ],

                            'total_absent' =>
                                $employee[
                                    'total_absent'
                                ],

                            'total_leave' =>
                                $employee[
                                    'total_leave'
                                ],

                            'total_late' =>
                                $employee[
                                    'total_late'
                                ],

                            'total_early' =>
                                $employee[
                                    'total_early'
                                ],

                            'total_minutes_late' =>
                                $employee[
                                    'total_minutes_late'
                                ],

                            'total_minutes_early' =>
                                $employee[
                                    'total_minutes_early'
                                ],

                            'total_targeted_hours' =>
                                $employee[
                                    'total_targeted_hours'
                                ],

                            'total_hours_worked' =>
                                $employee[
                                    'total_hours_worked'
                                ],

                            'remaining_hours' =>
                                $employee[
                                    'remaining_hours'
                                ],
                        ];
                    }
                )
                ->values()
                ->all();

        $configure =
            Configure::query()->first();

        // PDF
        if (
            $request->input('download') === 'pdf'
        ) {
            $pdf =
                Pdf::loadView(
                    'pdf.attendance.monthly',
                    [
                        'configure' =>
                            $configure,

                        'employeeAttendances' =>
                            $employeeAttendances,

                        'month' =>
                            $validated['month'],
                    ]
                )->setPaper(
                        'a4',
                        'landscape'
                    );

            return $pdf->stream(
                'Monthly Attendance Report ' .
                Carbon::now()->format('d-m-Y') .
                '.pdf'
            );
        }

        // HTML Report
        return view(
            'pdf.attendance.monthly',
            [
                'configure' =>
                    $configure,

                'employeeAttendances' =>
                    $employeeAttendances,

                'month' =>
                    $validated['month'],
            ]
        );
    }
}
