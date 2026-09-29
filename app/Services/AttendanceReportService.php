<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Holiday;
use App\Models\User;
use Carbon\Carbon;

class AttendanceReportService
{
    // Individual Attendance
    public function individual(
        int $userId,
        string $startDate,
        string $endDate
    ): array {
        // Start of requested period.
        $start = Carbon::parse(
            $startDate
        )->startOfDay();

        // End of requested period.
        $end = Carbon::parse(
            $endDate
        )->endOfDay();


        $employee = User::query()
            ->with([
                'shift',
                'department',
            ])
            ->findOrFail(
                $userId
            );

        // Attendance Records
        $attendanceRecords =
            Attendance::query()
                ->where(
                    'user_id',
                    $userId
                )
                ->whereBetween(
                    'created_at',
                    [
                        $start,
                        $end,
                    ]
                )
                ->orderBy(
                    'created_at',
                    'asc'
                )
                ->get();

        // Approved Full-Day Leave Requests
        $approvedLeaveRequests =
            LeaveRequest::query()
                ->where(
                    'user_id',
                    $userId
                )
                ->where(
                    'status',
                    'approved'
                )
                ->whereDate(
                    'start_date',
                    '<=',
                    $end->toDateString()
                )
                ->whereDate(
                    'end_date',
                    '>=',
                    $start->toDateString()
                )
                ->get();



        $holidayRecords =
            Holiday::query()
                ->get();


        $weekends =
            $this->getWeekends(
                $employee
            );


        $holidayMap =
            $this->buildHolidayMap(
                $holidayRecords,
                $start,
                $end
            );


        $datesInMonth = [];

        $cursor =
            $start->copy();

        while (
            $cursor->lte($end)
        ) {
            $datesInMonth[] =
                $cursor->toDateString();

            $cursor->addDay();
        }

        // Time Reports
        $timeReports =
            $attendanceRecords
                ->map(
                    function (Attendance $attendance) {
                        return [
                            'id' =>
                                $attendance->id,

                            'user_id' =>
                                $attendance->user_id,

                            'created_at' =>
                                optional(
                                    $attendance->created_at
                                )->toIso8601String(),

                            'attendance_status' =>
                                $attendance
                                    ->attendance_status,

                            'checked_in_at' =>
                                $attendance
                                    ->checked_in_at,

                            'checked_out_at' =>
                                $attendance
                                    ->checked_out_at,

                            'type_of_leave' =>
                                $attendance
                                    ->type_of_leave,

                            'checked_in_at_note' =>
                                $attendance
                                    ->checked_in_at_note,

                            'checked_out_at_note' =>
                                $attendance
                                    ->checked_out_at_note,

                            'attendance_type' =>
                                $attendance
                                    ->attendance_type,
                        ];
                    }
                )
                ->values()
                ->all();

        // Daily Rows
        $rows = [];

        //Summary
        $workingDays = 0;

        $present = 0;

        $home = 0;

        $leave = 0;

        $absent = 0;

        $holidayCount = 0;

        $weekendCount = 0;

        $totalLate = 0;

        $totalEarly = 0;

        $totalLateMinutes = 0;

        $totalEarlyMinutes = 0;

        $totalMinutesWorked = 0;

        $totalTargetedMinutes = 0;

        //Daily Loop
        foreach (
            $datesInMonth as $dateKey
        ) {
            $date =
                Carbon::parse(
                    $dateKey
                );

            // Find Attendance For Date
            $attendance =
                $attendanceRecords
                    ->first(
                        function (Attendance $record) use ($date) {
                            return $record->created_at &&
                                $record
                                    ->created_at
                                    ->isSameDay(
                                        $date
                                    );
                        }
                    );


            $isWeekend =
                $this->isWeekend(
                    $date,
                    $weekends
                );


            $holidayName =
                $holidayMap[$dateKey]
                ?? null;

            $isHoliday =
                !is_null(
                    $holidayName
                );

            /*
            | Approved Full-Day Leave For This Date
            | Half Day is intentionally not treated as a complete leave day here.
            | Half-day attendance rules are handled by the check-in/check-out flow.
            |
            */
            $approvedFullDayLeave =
                $approvedLeaveRequests
                    ->first(
                        function (LeaveRequest $leaveRequest) use ($date) {
                            $leaveType =
                                strtolower(
                                    trim(
                                        (string) 
                                        $leaveRequest
                                            ->leave_type
                                    )
                                );

                            if (
                                $leaveType !==
                                'full day'
                            ) {
                                return false;
                            }

                            $leaveStart =
                                Carbon::parse(
                                    $leaveRequest
                                        ->start_date
                                )->startOfDay();

                            $leaveEnd =
                                Carbon::parse(
                                    $leaveRequest
                                        ->end_date
                                )->endOfDay();

                            return $date
                                ->copy()
                                ->startOfDay()
                                ->betweenIncluded(
                                    $leaveStart,
                                    $leaveEnd
                                );
                        }
                    );

            /*
            | Attendance record always wins.
            | Example:
            | If an employee actually worked on a holiday,
            | show Present instead of Holiday.
            |
            */

            if (
                !$attendance &&
                $isWeekend
            ) {
                $weekendCount++;

                $rows[] = [
                    'date' =>
                        $dateKey,

                    'status' =>
                        'Weekend',

                    'attendance_status' =>
                        'weekend',

                    'check_in' =>
                        null,

                    'check_out' =>
                        null,

                    'checked_in_at' =>
                        null,

                    'checked_out_at' =>
                        null,

                    'late' =>
                        false,

                    'late_minutes' =>
                        0,

                    'early' =>
                        false,

                    'early_minutes' =>
                        0,

                    'holiday' =>
                        null,

                    'type_of_leave' =>
                        null,

                    'check_in_note' =>
                        null,

                    'check_out_note' =>
                        null,

                    'hours_worked' =>
                        0,
                ];

                continue;
            }

            // Holiday
            if (
                !$attendance &&
                $isHoliday
            ) {
                $holidayCount++;

                $rows[] = [
                    'date' =>
                        $dateKey,

                    'status' =>
                        'Holiday',

                    'attendance_status' =>
                        'holiday',

                    'check_in' =>
                        null,

                    'check_out' =>
                        null,

                    'checked_in_at' =>
                        null,

                    'checked_out_at' =>
                        null,

                    'late' =>
                        false,

                    'late_minutes' =>
                        0,

                    'early' =>
                        false,

                    'early_minutes' =>
                        0,

                    'holiday' =>
                        $holidayName,

                    'type_of_leave' =>
                        null,

                    'check_in_note' =>
                        null,

                    'check_out_note' =>
                        null,

                    'hours_worked' =>
                        0,
                ];

                continue;
            }

            // Working Day
            $workingDays++;

            /*
            / Approved Full-Day Leave
            | Priority for a date without attendance is:
            | Weekend -> Holiday -> Approved Full-Day Leave -> Absent.
            |
            | If an attendance record exists, actual attendance still wins.
            |
            */

            if (
                !$attendance &&
                $approvedFullDayLeave
            ) {
                $leave++;

                $rows[] = [
                    'date' =>
                        $dateKey,

                    'status' =>
                        'Leave',

                    'attendance_status' =>
                        'leave',

                    'check_in' =>
                        null,

                    'check_out' =>
                        null,

                    'checked_in_at' =>
                        null,

                    'checked_out_at' =>
                        null,

                    'late' =>
                        false,

                    'late_minutes' =>
                        0,

                    'early' =>
                        false,

                    'early_minutes' =>
                        0,

                    'holiday' =>
                        null,

                    'type_of_leave' =>
                        $approvedFullDayLeave
                            ->leave_type
                        ?? 'Full Day',

                    'check_in_note' =>
                        null,

                    'check_out_note' =>
                        null,

                    'hours_worked' =>
                        0,
                ];

                continue;
            }

            // Absent
            if (!$attendance) {
                $absent++;

                $rows[] = [
                    'date' =>
                        $dateKey,

                    'status' =>
                        'Absent',

                    'attendance_status' =>
                        'absent',

                    'check_in' =>
                        null,

                    'check_out' =>
                        null,

                    'checked_in_at' =>
                        null,

                    'checked_out_at' =>
                        null,

                    'late' =>
                        false,

                    'late_minutes' =>
                        0,

                    'early' =>
                        false,

                    'early_minutes' =>
                        0,

                    'holiday' =>
                        null,

                    'type_of_leave' =>
                        null,

                    'check_in_note' =>
                        null,

                    'check_out_note' =>
                        null,

                    'hours_worked' =>
                        0,
                ];

                continue;
            }

            // Attendance Status
            $status =
                strtolower(
                    trim(
                        (string) 
                        $attendance
                            ->attendance_status
                    )
                );

            // Present
            if (
                $status === 'present'
            ) {
                $present++;

                $checkIn =
                    $this->parseTime(
                        $attendance
                            ->checked_in_at
                    );

                $checkOut =
                    $this->parseTime(
                        $attendance
                            ->checked_out_at
                    );

                $workedMinutes = 0;

                // Worked Time
                if (
                    $checkIn &&
                    $checkOut
                ) {
                    $workedMinutes =
                        $checkIn->diffInMinutes(
                            $checkOut
                        );

                    $totalMinutesWorked +=
                        $workedMinutes;
                }

                // Late: Shift start + 15 minutes grace.
                $lateMinutes =
                    $this->calculateLateMinutes(
                        $date,
                        $attendance
                            ->checked_in_at,
                        $employee
                            ->shift
                                ?->shift_start_time,
                        15
                    );

                if (
                    $lateMinutes > 0
                ) {
                    $totalLate++;

                    $totalLateMinutes +=
                        $lateMinutes;
                }


                // Early Checkout
                $earlyMinutes = 0;

                if (
                    $checkOut &&
                    $employee->shift
                ) {
                    $shiftEnd =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->shift_end_time
                        );

                    $checkOutTime =
                        Carbon::create(
                            $date->year,
                            $date->month,
                            $date->day,
                            $checkOut->hour,
                            $checkOut->minute,
                            $checkOut->second
                        );

                    $shiftEndDateTime =
                        Carbon::create(
                            $date->year,
                            $date->month,
                            $date->day,
                            $shiftEnd->hour,
                            $shiftEnd->minute,
                            $shiftEnd->second
                        );

                    if (
                        $checkOutTime->lt(
                            $shiftEndDateTime
                        )
                    ) {
                        $earlyMinutes =
                            $checkOutTime
                                ->diffInMinutes(
                                    $shiftEndDateTime
                                );

                        $totalEarly++;

                        $totalEarlyMinutes +=
                            $earlyMinutes;
                    }
                }

                // Target Working Minutes
                if (
                    $employee->shift
                ) {
                    $shiftStart =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->shift_start_time
                        );

                    $shiftEnd =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->shift_end_time
                        );

                    $targetedMinutes =
                        $shiftStart
                            ->diffInMinutes(
                                $shiftEnd
                            );

                    $totalTargetedMinutes +=
                        $targetedMinutes;
                }

                // Present Row
                $rows[] = [
                    'date' =>
                        $dateKey,

                    'status' =>
                        'Present',

                    'attendance_status' =>
                        'present',

                    'check_in' =>
                        $attendance
                            ->checked_in_at,

                    'check_out' =>
                        $attendance
                            ->checked_out_at,

                    'checked_in_at' =>
                        $attendance
                            ->checked_in_at,

                    'checked_out_at' =>
                        $attendance
                            ->checked_out_at,

                    'late' =>
                        $lateMinutes > 0,

                    'late_minutes' =>
                        $lateMinutes,

                    'early' =>
                        $earlyMinutes > 0,

                    'early_minutes' =>
                        $earlyMinutes,

                    'holiday' =>
                        null,

                    'type_of_leave' =>
                        null,

                    'check_in_note' =>
                        $attendance
                            ->checked_in_at_note,

                    'check_out_note' =>
                        $attendance
                            ->checked_out_at_note,

                    'hours_worked' =>
                        round(
                            $workedMinutes / 60,
                            2
                        ),
                ];

                continue;
            }

            // WFH
            if (
                $status === 'home'
            ) {
                $home++;

                $workedMinutes =
                    $this->workedMinutes(
                        $attendance
                    );

                $totalMinutesWorked +=
                    $workedMinutes;

                if (
                    $employee->shift
                ) {
                    $shiftStart =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->shift_start_time
                        );

                    $shiftEnd =
                        Carbon::parse(
                            $employee
                                ->shift
                                ->shift_end_time
                        );

                    $totalTargetedMinutes +=
                        $shiftStart
                            ->diffInMinutes(
                                $shiftEnd
                            );
                }

                $rows[] = [
                    'date' =>
                        $dateKey,

                    'status' =>
                        'Home',

                    'attendance_status' =>
                        'home',

                    'check_in' =>
                        $attendance
                            ->checked_in_at,

                    'check_out' =>
                        $attendance
                            ->checked_out_at,

                    'checked_in_at' =>
                        $attendance
                            ->checked_in_at,

                    'checked_out_at' =>
                        $attendance
                            ->checked_out_at,

                    'late' =>
                        false,

                    'late_minutes' =>
                        0,

                    'early' =>
                        false,

                    'early_minutes' =>
                        0,

                    'holiday' =>
                        null,

                    'type_of_leave' =>
                        null,

                    'check_in_note' =>
                        $attendance
                            ->checked_in_at_note,

                    'check_out_note' =>
                        $attendance
                            ->checked_out_at_note,

                    'hours_worked' =>
                        round(
                            $workedMinutes / 60,
                            2
                        ),
                ];

                continue;
            }

            // Leave
            if (
                $status === 'leave'
            ) {
                $leave++;

                $rows[] = [
                    'date' =>
                        $dateKey,

                    'status' =>
                        'Leave',

                    'attendance_status' =>
                        'leave',

                    'check_in' =>
                        $attendance
                            ->checked_in_at,

                    'check_out' =>
                        $attendance
                            ->checked_out_at,

                    'checked_in_at' =>
                        $attendance
                            ->checked_in_at,

                    'checked_out_at' =>
                        $attendance
                            ->checked_out_at,

                    'late' =>
                        false,

                    'late_minutes' =>
                        0,

                    'early' =>
                        false,

                    'early_minutes' =>
                        0,

                    'holiday' =>
                        null,

                    'type_of_leave' =>
                        $attendance
                            ->type_of_leave,

                    'check_in_note' =>
                        $attendance
                            ->checked_in_at_note,

                    'check_out_note' =>
                        $attendance
                            ->checked_out_at_note,

                    'hours_worked' =>
                        0,
                ];

                continue;
            }

            // Other Status
            $rows[] = [
                'date' =>
                    $dateKey,

                'status' =>
                    ucfirst(
                        $status
                    ),

                'attendance_status' =>
                    $status,

                'check_in' =>
                    $attendance
                        ->checked_in_at,

                'check_out' =>
                    $attendance
                        ->checked_out_at,

                'checked_in_at' =>
                    $attendance
                        ->checked_in_at,

                'checked_out_at' =>
                    $attendance
                        ->checked_out_at,

                'late' =>
                    false,

                'late_minutes' =>
                    0,

                'early' =>
                    false,

                'early_minutes' =>
                    0,

                'holiday' =>
                    null,

                'type_of_leave' =>
                    $attendance
                        ->type_of_leave,

                'check_in_note' =>
                    $attendance
                        ->checked_in_at_note,

                'check_out_note' =>
                    $attendance
                        ->checked_out_at_note,

                'hours_worked' =>
                    0,
            ];
        }

        // Attendance Summary
        $attendanceData = [
            'Working Days' => [
                'count' =>
                    $workingDays,

                'color' =>
                    '#3096da',
            ],

            'On Time' => [
                'count' =>
                    max(
                        $present -
                        $totalLate,
                        0
                    ),

                'color' =>
                    '#2ecc71',
            ],

            'Late' => [
                'count' =>
                    $totalLate,

                'color' =>
                    '#d35400',
            ],

            'Left Timely' => [
                'count' =>
                    max(
                        $present -
                        $totalEarly,
                        0
                    ),

                'color' =>
                    '#2ecc71',
            ],

            'Left Early' => [
                'count' =>
                    $totalEarly,

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

        // Remaining Hours
        $remainingMinutes =
            max(
                0,
                $totalTargetedMinutes -
                $totalMinutesWorked
            );

        return [

            // Existing Report
            'employee' => [
                'id' =>
                    $employee->id,

                'name' =>
                    $employee->name,

                'employee_id' =>
                    $employee->employee_id,

                'department' =>
                    $employee
                        ->department
                            ?->name,

                'shift' =>
                    $employee
                        ->shift
                            ?->name,
            ],

            'rows' =>
                $rows,

            'summary' => [
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
                    $holidayCount,

                'weekends' =>
                    $weekendCount,

                'late' =>
                    $totalLate,

                'early' =>
                    $totalEarly,

                'late_minutes' =>
                    $totalLateMinutes,

                'early_minutes' =>
                    $totalEarlyMinutes,

                'targeted_hours' =>
                    round(
                        $totalTargetedMinutes / 60,
                        2
                    ),

                'hours_worked' =>
                    round(
                        $totalMinutesWorked / 60,
                        2
                    ),

                'remaining_hours' =>
                    round(
                        $remainingMinutes / 60,
                        2
                    ),
            ],

            'start_date' =>
                $start->toDateString(),

            'end_date' =>
                $end->toDateString(),

            // React Attendance Page Data
            'attendanceData' =>
                $attendanceData,

            'datesInMonth' =>
                $datesInMonth,

            'timeReports' =>
                $timeReports,

            'allHolidays' =>
                $this->formatHolidayList(
                    $holidayMap
                ),

            'weekends' =>
                $weekends,
        ];
    }

    // Get Weekends
    private function getWeekends(
        User $employee
    ): array {
        $value =
            $employee
                ->shift
                    ?->weekends;

        if (
            $value instanceof
            \Illuminate\Support\Collection
        ) {
            $value =
                $value->all();
        }

        if (
            is_string(
                $value
            )
        ) {
            $value =
                trim(
                    $value
                );

            if (
                $value === ''
            ) {
                return [];
            }

            $decoded =
                json_decode(
                    $value,
                    true
                );

            if (
                json_last_error() ===
                JSON_ERROR_NONE &&
                is_array(
                    $decoded
                )
            ) {
                $value =
                    $decoded;
            } else {
                $value =
                    preg_split(
                        '/\s*,\s*/',
                        $value
                    ) ?: [];
            }
        }

        if (
            !is_array(
                $value
            )
        ) {
            return [];
        }

        return collect(
            $value
        )
            ->map(
                function ($day) {
                    $day =
                        strtolower(
                            trim(
                                (string) $day
                            )
                        );

                    return match ($day) {
                        '0',
                        'sun',
                        'sunday' =>
                            'sunday',

                        '1',
                        'mon',
                        'monday' =>
                            'monday',

                        '2',
                        'tue',
                        'tues',
                        'tuesday' =>
                            'tuesday',

                        '3',
                        'wed',
                        'wednesday' =>
                            'wednesday',

                        '4',
                        'thu',
                        'thur',
                        'thurs',
                        'thursday' =>
                            'thursday',

                        '5',
                        'fri',
                        'friday' =>
                            'friday',

                        '6',
                        'sat',
                        'saturday' =>
                            'saturday',

                        default =>
                            $day,
                    };
                }
            )
            ->filter(
                fn($day) =>
                    in_array(
                        $day,
                        [
                            'sunday',
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                        ],
                        true
                    )
            )
            ->unique()
            ->values()
            ->all();
    }


    // Check Weekend
    private function isWeekend(
        Carbon $date,
        array $weekends
    ): bool {
        return in_array(
            strtolower(
                $date->format('l')
            ),
            $weekends,
            true
        );
    }

    // Build Holiday Map
    private function buildHolidayMap(
        $holidays,
        Carbon $start,
        Carbon $end
    ): array {
        $map = [];

        foreach (
            $holidays as $holiday
        ) {
            // Use Holiday::occursOn() if available
            if (
                method_exists(
                    $holiday,
                    'occursOn'
                )
            ) {
                $cursor =
                    $start->copy();

                while (
                    $cursor->lte($end)
                ) {
                    if (
                        $holiday->occursOn(
                            $cursor->toDateString()
                        )
                    ) {
                        $map[
                            $cursor->toDateString()
                        ] =
                            $holiday->name;
                    }

                    $cursor->addDay();
                }

                continue;
            }

            // Recurring Holiday
            if (
                (bool) 
                $holiday->is_recurring
            ) {
                if (
                    !$holiday->date
                ) {
                    continue;
                }

                $holidayDate =
                    Carbon::parse(
                        $holiday->date
                    );

                $cursor =
                    $start->copy();

                while (
                    $cursor->lte($end)
                ) {
                    if (
                        $cursor->format('m-d') ===
                        $holidayDate->format('m-d')
                    ) {
                        $map[
                            $cursor->toDateString()
                        ] =
                            $holiday->name;
                    }

                    $cursor->addDay();
                }

                continue;
            }

            // Normal Holiday
            if (
                !$holiday->date
            ) {
                continue;
            }

            $holidayDate =
                Carbon::parse(
                    $holiday->date
                );

            if (
                $holidayDate->betweenIncluded(
                    $start,
                    $end
                )
            ) {
                $map[
                    $holidayDate->toDateString()
                ] =
                    $holiday->name;
            }
        }

        return $map;
    }

    // Format Holiday List For React
    private function formatHolidayList(
        array $holidayMap
    ): array {
        return collect(
            $holidayMap
        )
            ->map(
                function ($name, $date) {
                    return [
                        'date' =>
                            $date,

                        'name' =>
                            $name,
                    ];
                }
            )
            ->values()
            ->all();
    }

    // Calculate Late Minutes
    private function calculateLateMinutes(
        Carbon $date,
        ?string $checkInValue,
        ?string $shiftStartValue,
        int $graceMinutes = 15
    ): int {
        if (
            !$checkInValue ||
            !$shiftStartValue
        ) {
            return 0;
        }

        $checkIn =
            $this->parseTime(
                $checkInValue
            );

        $shiftStart =
            $this->parseTime(
                $shiftStartValue
            );

        if (
            !$checkIn ||
            !$shiftStart
        ) {
            return 0;
        }

        $checkInDateTime =
            $date
                ->copy()
                ->setTime(
                    $checkIn->hour,
                    $checkIn->minute,
                    $checkIn->second
                );

        $lateAfter =
            $date
                ->copy()
                ->setTime(
                    $shiftStart->hour,
                    $shiftStart->minute,
                    $shiftStart->second
                )
                ->addMinutes(
                    $graceMinutes
                );

        if (
            !$checkInDateTime->gt(
                $lateAfter
            )
        ) {
            return 0;
        }

        return (int) 
            $lateAfter
                ->diffInMinutes(
                    $checkInDateTime
                );
    }


    private function parseTime(
        ?string $time
    ): ?Carbon {
        if (
            !$time
        ) {
            return null;
        }

        try {
            return Carbon::parse(
                $time
            );
        } catch (
            \Throwable
        ) {
            return null;
        }
    }

    private function workedMinutes(
        Attendance $attendance
    ): int {
        $checkIn =
            $this->parseTime(
                $attendance
                    ->checked_in_at
            );

        $checkOut =
            $this->parseTime(
                $attendance
                    ->checked_out_at
            );

        if (
            !$checkIn ||
            !$checkOut
        ) {
            return 0;
        }

        return $checkIn->diffInMinutes(
            $checkOut
        );
    }

    // Employee Matrix
    public function employeeMatrix(
        string $month,
        ?int $departmentId = null,
        ?int $shiftId = null
    ): array {
        $startDate =
            Carbon::createFromFormat(
                'Y-m',
                $month
            )->startOfMonth();

        $endDate =
            $startDate
                ->copy()
                ->endOfMonth();

        // Current month stops at today.
        if (
            $month ===
            now()->format('Y-m')
        ) {
            $endDate =
                now()->endOfDay();
        }

        // Employees
        $query =
            User::query()
                ->where(
                    'status',
                    'active'
                )
                ->whereNotNull(
                    'employee_id'
                )
                ->whereHas(
                    'shift'
                )
                ->with([
                    'shift',
                    'department:id,name',
                ])
                ->orderBy(
                    'name',
                    'asc'
                );

        if (
            $departmentId
        ) {
            $query->where(
                'department_id',
                $departmentId
            );
        }

        if (
            $shiftId
        ) {
            $query->where(
                'shift_id',
                $shiftId
            );
        }

        $employees =
            $query->get();

        // Build individual report for every employee.
        $report = [];

        foreach (
            $employees as $employee
        ) {
            $individual =
                $this->individual(
                    $employee->id,
                    $startDate->toDateString(),
                    $endDate->toDateString()
                );

            $summary =
                $individual['summary'];

            $report[] = [
                'id' =>
                    $employee->id,

                'employee_id' =>
                    $employee->employee_id,

                'name' =>
                    $employee->name,

                'department' =>
                    $employee
                        ->department
                            ?->name,

                'department_id' =>
                    $employee->department_id,

                'shift' =>
                    $employee
                        ->shift
                            ?->name,

                'shift_id' =>
                    $employee->shift_id,

                'daily' =>
                    collect(
                        $individual['rows']
                    )
                        ->keyBy(
                            'date'
                        )
                        ->all(),

                'total_working_days' =>
                    $summary[
                        'working_days'
                    ],

                'total_present' =>
                    $summary[
                        'present'
                    ],

                'total_home' =>
                    $summary[
                        'home'
                    ],

                'total_absent' =>
                    $summary[
                        'absent'
                    ],

                'total_leave' =>
                    $summary[
                        'leave'
                    ],

                'total_holidays' =>
                    $summary[
                        'holidays'
                    ],

                'total_weekends' =>
                    $summary[
                        'weekends'
                    ],

                'total_late' =>
                    $summary[
                        'late'
                    ],

                'total_early' =>
                    $summary[
                        'early'
                    ],

                'total_minutes_late' =>
                    $summary[
                        'late_minutes'
                    ],

                'total_minutes_early' =>
                    $summary[
                        'early_minutes'
                    ],

                'total_targeted_hours' =>
                    $summary[
                        'targeted_hours'
                    ],

                'total_hours_worked' =>
                    $summary[
                        'hours_worked'
                    ],

                'remaining_hours' =>
                    $summary[
                        'remaining_hours'
                    ],
            ];
        }

        return [
            'report' =>
                $report,

            'month' =>
                $month,

            'start_date' =>
                $startDate
                    ->toDateString(),

            'end_date' =>
                $endDate
                    ->toDateString(),
        ];
    }

    // All Employees
    public function allEmployees(
        string $startDate,
        string $endDate
    ): array {
        $start = Carbon::parse(
            $startDate
        )->startOfDay();

        $end = Carbon::parse(
            $endDate
        )->endOfDay();

        // Employees     
        $employees = User::query()
            ->where(
                'status',
                'active'
            )
            ->whereNotNull(
                'employee_id'
            )
            ->where(
                'employee_id',
                '!=',
                ''
            )
            ->whereHas(
                'shift'
            )
            ->select([
                'id',
                'employee_id',
                'name',
                'shift_id',
                'department_id',
            ])
            ->with([
                'shift',
            ])
            ->orderBy(
                'name',
                'asc'
            )
            ->get();

        $employeeAttendances = [];

        foreach (
            $employees as $employee
        ) {
            $report =
                $this->individual(
                    $employee->id,
                    $start->toDateString(),
                    $end->toDateString()
                );

            $summary =
                $report['summary'];

            $employeeAttendances[] = [
                'employee_id' =>
                    $report['employee']['employee_id'],

                'employee_name' =>
                    $report['employee']['name'],

                'total_working_days' =>
                    $summary['working_days'],

                'total_present' =>
                    $summary['present'],

                'total_home' =>
                    $summary['home'],

                'total_absent' =>
                    $summary['absent'],

                'total_leave' =>
                    $summary['leave'],

                'total_late' =>
                    $summary['late'],

                'total_early' =>
                    $summary['early'],

                'total_minutes_late' =>
                    $summary['late_minutes'],

                'total_minutes_early' =>
                    $summary['early_minutes'],

                'total_targeted_hours' =>
                    $summary['targeted_hours'],

                'total_hours_worked' =>
                    $summary['hours_worked'],

                'remaining_hours' =>
                    $summary['remaining_hours'],
            ];
        }

        return [
            'employeeAttendances' =>
                $employeeAttendances,

            'start_date' =>
                $start->toDateString(),

            'end_date' =>
                $end->toDateString(),
        ];
    }
}