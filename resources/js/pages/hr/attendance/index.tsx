import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    MessageSquare,
    X,
} from 'react-feather';

import { toast } from 'sonner';

import PageTitle from '@/components/page-title';
import AppLayout from '@/layouts/app-layout';

type AttendanceStatus =
    'present' | 'absent' | 'home' | 'leave' | 'dayof' | string | null;

type AttendanceRecord = {
    id?: number;

    user_id?: number;

    attendance_status?: AttendanceStatus;

    attendance_type?: string | null;

    checked_in_at?: string | null;

    checked_out_at?: string | null;

    checked_in_at_note?: string | null;

    checked_out_at_note?: string | null;

    type_of_leave?: string | null;

    created_at?: string | null;

    updated_at?: string | null;
};

type AttendanceSummaryItem = {
    count: number | string;

    color: string;
};

type AttendanceData = Record<string, AttendanceSummaryItem>;

type TimeReport = AttendanceRecord & {
    created_at: string;

    // Resolved by AttendanceReportService.
    late?: boolean;
    late_minutes?: number;
    early?: boolean;
    early_minutes?: number;
    hours_worked?: number;

    // Calendar/report fields.
    date?: string | null;
    status?: string | null;
    holiday?: string | null;
};

type Holiday = {
    id?: number;

    name?: string | null;

    date?: string | null;

    start_date?: string | null;

    end_date?: string | null;

    dates?: string[] | null;
};

type CalendarStatus = {
    is_holiday: boolean;

    holiday_name?: string | null;

    is_weekend: boolean;

    day_name?: string | null;
};

type Shift = {
    start_time?: string | null;

    end_time?: string | null;

    shift_start_time?: string | null;

    shift_end_time?: string | null;

    weekends?: string[] | string | null;

    late_grace_minutes?: number | null;
};

type AttendanceReport = {
    attendanceData?: AttendanceData | null;

    datesInMonth?: string[] | null;

    timeReports?: TimeReport[] | null;

    rows?: TimeReport[] | null;

    allHolidays?: Holiday[] | null;

    weekends?: string[] | null;

    calendarStatus?: Record<string, CalendarStatus> | null;
};

type PageProps = {
    attendance: AttendanceRecord | null;

    currentMonth: string;

    report?: AttendanceReport | null;

    shift?: Shift | null;
};

type AttendanceResponse = {
    success?: boolean | string;

    status?:
        | 'logged'
        | 'checked_out'
        | 'note_required'
        | 'complete'
        | 'attendance_missing'
        | string;

    attendance_type?: 'checkIn' | 'checkOut' | 'complateAttendance' | string;

    message?: string;

    error?: string;

    isLate?: boolean;

    isOnTime?: boolean;

    attendance?: AttendanceRecord | null;

    checked_in_at?: string | null;

    checked_out_at?: string | null;

    data?:
        | AttendanceRecord
        | {
              attendance?: AttendanceRecord | null;

              data?: AttendanceRecord | null;

              status?: string;

              message?: string;
          }
        | null;
};

// Format backend time safely.
function formatTime(value?: string | null): string {
    if (!value) {
        return '';
    }

    /*
    | Backend stores values like:
    |
    | 09:12 AM
    | 06:08 PM
    |
    | So handle those directly first.
    */

    const twelveHourMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    if (twelveHourMatch) {
        return `${String(Number(twelveHourMatch[1])).padStart(
            2,
            '0',
        )}:${twelveHourMatch[2]} ${twelveHourMatch[3].toUpperCase()}`;
    }

    // Handle datetime / 24 hour values.

    const timeMatch = value.match(
        /(?:\d{4}-\d{2}-\d{2}[ T])?(\d{1,2}):(\d{2})(?::(\d{2}))?/,
    );

    if (!timeMatch) {
        return value;
    }

    let hour = Number(timeMatch[1]);

    const minute = Number(timeMatch[2]);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return value;
    }

    const period = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12 || 12;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(
        2,
        '0',
    )} ${period}`;
}

// Format selected month.
function formatMonth(month: string): string {
    const date = new Date(`${month}-01T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return month;
    }

    return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
}

// Get weekday name.
function formatDayName(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
    });
}

// Get day number.
function formatDayNumber(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        day: 'numeric',
    });
}

// Current browser date.
function getCurrentDate(): string {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Live date/time.
function getLiveDateTime() {
    const now = new Date();

    return {
        time: now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }),

        date: now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
    };
}

// Add/subtract month.
function addMonth(month: string, amount: number): string {
    const date = new Date(`${month}-01T00:00:00`);

    date.setMonth(date.getMonth() + amount);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
    )}`;
}

// Normalize Laravel collections.
function normalizeList<T>(
    value:
        | T[]
        | {
              data?: T[] | null;
          }
        | null
        | undefined,
): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object' && Array.isArray(value.data)) {
        return value.data;
    }

    return [];
}

// Parse backend clock value into minutes since midnight.
function parseTimeToMinutes(value: string | null | undefined): number | null {
    if (!value) {
        return null;
    }

    const normalized = String(value).trim();

    const twelveHourMatch = normalized.match(
        /(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i,
    );

    if (twelveHourMatch) {
        let hour = Number(twelveHourMatch[1]);

        const minute = Number(twelveHourMatch[2]);

        const period = twelveHourMatch[3].toUpperCase();

        if (period === 'AM') {
            hour = hour === 12 ? 0 : hour;
        } else {
            hour = hour === 12 ? 12 : hour + 12;
        }

        return hour * 60 + minute;
    }

    const twentyFourHourMatch = normalized.match(
        /(?:\d{4}-\d{2}-\d{2}[ T])?(\d{1,2}):(\d{2})(?::\d{2})?/,
    );

    if (!twentyFourHourMatch) {
        return null;
    }

    const hour = Number(twentyFourHourMatch[1]);

    const minute = Number(twentyFourHourMatch[2]);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return null;
    }

    return hour * 60 + minute;
}

function StatusBadge({
    children,
    className = '',
}: {
    children: React.ReactNode;

    className?: string;
}) {
    return (
        <span className={['attendance-status', className].join(' ')}>
            {children}
        </span>
    );
}

function NoteIcon({
    note,
    holiday = false,
}: {
    note?: string | null;

    holiday?: boolean;
}) {
    if (!note) {
        return null;
    }

    return (
        <span className="attendance-info-icon">
            {holiday ? <AlertCircle size={18} /> : <MessageSquare size={18} />}

            <span className="attendance-tooltip">{note}</span>
        </span>
    );
}

// Daily Report Status

function renderStatus(
    report: TimeReport | undefined,
    holiday: Holiday | null,
    isWeekend: boolean,
    direction: 'in' | 'out',
    shift?: Shift | null,
): React.ReactNode {
    const status = String(report?.status ?? report?.attendance_status ?? '')
        .trim()
        .toLowerCase();

    const attendanceStatus = String(report?.attendance_status ?? status)
        .trim()
        .toLowerCase();

    const hasRealAttendance =
        Boolean(report?.checked_in_at) ||
        Boolean(report?.checked_out_at) ||
        ['present', 'home', 'leave'].includes(attendanceStatus);

    //No attendance: Holiday -> Weekend -> Absent
    if (!hasRealAttendance) {
        if (status === 'holiday' || holiday) {
            return (
                <>
                    <StatusBadge className="status-holiday">
                        Holiday
                    </StatusBadge>

                    {direction === 'in' && (
                        <NoteIcon
                            note={report?.holiday ?? holiday?.name ?? 'Holiday'}
                            holiday
                        />
                    )}
                </>
            );
        }

        if (status === 'weekend' || isWeekend) {
            return (
                <StatusBadge className="status-weekend">Weekend</StatusBadge>
            );
        }

        return <StatusBadge className="status-absent">Absent</StatusBadge>;
    }

    if (attendanceStatus === 'leave') {
        return (
            <>
                <StatusBadge className="status-leave">Leave</StatusBadge>

                {direction === 'in' && (
                    <NoteIcon note={report?.type_of_leave} holiday />
                )}
            </>
        );
    }

    if (attendanceStatus === 'home') {
        return <StatusBadge className="status-home">Home</StatusBadge>;
    }

    if (attendanceStatus === 'present') {
        const checkInMinutes = parseTimeToMinutes(report?.checked_in_at);

        const checkOutMinutes = parseTimeToMinutes(report?.checked_out_at);

        const shiftStartMinutes = parseTimeToMinutes(
            shift?.start_time ?? shift?.shift_start_time,
        );

        const shiftEndMinutes = parseTimeToMinutes(
            shift?.end_time ?? shift?.shift_end_time,
        );

        const graceMinutes = Number(shift?.late_grace_minutes ?? 15);

        const calculatedLate =
            checkInMinutes !== null &&
            shiftStartMinutes !== null &&
            checkInMinutes > shiftStartMinutes + graceMinutes;

        const calculatedEarly =
            checkOutMinutes !== null &&
            shiftEndMinutes !== null &&
            checkOutMinutes < shiftEndMinutes;

        const isLate =
            calculatedLate ||
            report?.late === true ||
            Number(report?.late_minutes ?? 0) > 0;

        const isEarly =
            calculatedEarly ||
            report?.early === true ||
            Number(report?.early_minutes ?? 0) > 0;

        if (direction === 'in') {
            return (
                <>
                    <StatusBadge
                        className={isLate ? 'status-late' : 'status-present'}
                    >
                        {formatTime(report?.checked_in_at)}
                    </StatusBadge>

                    <NoteIcon note={report?.checked_in_at_note} />
                </>
            );
        }

        if (!report?.checked_out_at) {
            return (
                <StatusBadge className="status-running">Running</StatusBadge>
            );
        }

        return (
            <>
                <StatusBadge
                    className={isEarly ? 'status-late' : 'status-present'}
                >
                    {formatTime(report.checked_out_at)}
                </StatusBadge>

                <NoteIcon note={report.checked_out_at_note} />
            </>
        );
    }

    return (
        <StatusBadge className="status-absent">
            {report?.status ?? report?.attendance_status ?? 'Absent'}
        </StatusBadge>
    );
}

function AttendancePage({
    attendance,
    currentMonth,
    report,
    shift,
}: PageProps) {
    // The Riho header owns the theme: body.dark-only / body.light.
    // Observe the body class so a header toggle updates this page immediately.
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const syncThemeWithHeader = () => {
            setIsDarkMode(document.body.classList.contains('dark-only'));
        };

        syncThemeWithHeader();

        const observer = new MutationObserver(syncThemeWithHeader);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const backendDates = Array.isArray(report?.datesInMonth)
        ? report.datesInMonth
              .map((date) => {
                  if (!date) {
                      return null;
                  }

                  if (typeof date === 'string') {
                      return date.substring(0, 10);
                  }

                  if (
                      typeof date === 'object' &&
                      date !== null &&
                      'date' in date
                  ) {
                      const value = (
                          date as {
                              date?: string;
                          }
                      ).date;

                      return value ? String(value).substring(0, 10) : null;
                  }

                  return String(date).substring(0, 10);
              })
              .filter((date): date is string => Boolean(date))
        : [];

    const fallbackDates = useMemo(() => {
        const [year, month] = currentMonth.split('-').map(Number);

        if (!year || !month) {
            return [];
        }

        const now = new Date();

        const systemMonth = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
        ).padStart(2, '0')}`;

        let lastDay = new Date(year, month, 0).getDate();

        if (currentMonth === systemMonth) {
            lastDay = now.getDate();
        }

        if (currentMonth > systemMonth) {
            lastDay = 0;
        }

        return Array.from(
            {
                length: lastDay,
            },
            (_, index) =>
                `${year}-${String(month).padStart(2, '0')}-${String(
                    index + 1,
                ).padStart(2, '0')}`,
        );
    }, [currentMonth]);

    const todayDate = getCurrentDate();

    const datesInMonth = useMemo(() => {
        const source = backendDates.length > 0 ? backendDates : fallbackDates;

        return [...source]
            .map((date) => String(date).substring(0, 10))
            .filter((date) => date <= todayDate)
            .sort((a, b) => String(b).localeCompare(String(a)));
    }, [backendDates, fallbackDates, todayDate]);

    // Normalize backend data

    const timeReports = normalizeList(report?.timeReports);

    const allHolidays = normalizeList(report?.allHolidays);

    const reportWeekends = normalizeList(report?.weekends);

    const shiftWeekends = Array.isArray(shift?.weekends)
        ? shift.weekends
        : typeof shift?.weekends === 'string'
          ? shift.weekends
                .split(',')
                .map((day) => day.trim())
                .filter(Boolean)
          : [];

    const weekends = reportWeekends.length > 0 ? reportWeekends : shiftWeekends;

    const calendarStatus =
        report?.calendarStatus && typeof report.calendarStatus === 'object'
            ? report.calendarStatus
            : {};

    const reportRows = normalizeList(report?.rows);

    const getReportForDate = (date: string): TimeReport | undefined => {
        const timeReport = timeReports.find((item) => {
            if (!item?.created_at) {
                return false;
            }

            return String(item.created_at).substring(0, 10) === date;
        });

        const resolvedRow = reportRows.find((item) => {
            const rowDate =
                item?.date ??
                (item?.created_at
                    ? String(item.created_at).substring(0, 10)
                    : null);

            return rowDate === date;
        });

        if (!timeReport && !resolvedRow) {
            return undefined;
        }

        return {
            ...(timeReport ?? {}),
            ...(resolvedRow ?? {}),
        } as TimeReport;
    };

    const getCalendarStatusForDate = (date: string): CalendarStatus => {
        const backendStatus = calendarStatus[date];

        if (backendStatus) {
            return {
                is_holiday: Boolean(backendStatus.is_holiday),

                holiday_name: backendStatus.holiday_name ?? null,

                is_weekend: Boolean(backendStatus.is_weekend),

                day_name: backendStatus.day_name ?? formatDayName(date),
            };
        }

        const weekday = formatDayName(date);

        const normalizedDate = String(date).substring(0, 10);

        const holiday = allHolidays.find((item) => {
            const directDate = item?.date
                ? String(item.date).substring(0, 10)
                : null;

            if (directDate === normalizedDate) {
                return true;
            }

            if (item?.start_date && item?.end_date) {
                const start = String(item.start_date).substring(0, 10);

                const end = String(item.end_date).substring(0, 10);

                return normalizedDate >= start && normalizedDate <= end;
            }

            if (Array.isArray(item?.dates)) {
                return item.dates.some(
                    (holidayDate) =>
                        String(holidayDate).substring(0, 10) === normalizedDate,
                );
            }

            return false;
        });

        const isWeekend = weekends.some((item) => {
            const value = String(item).trim().toLowerCase();

            const dayNumber = new Date(`${normalizedDate}T00:00:00`).getDay();

            const dayName = weekday.toLowerCase();

            const aliases: Record<string, string> = {
                sun: 'sunday',
                mon: 'monday',
                tue: 'tuesday',
                wed: 'wednesday',
                thu: 'thursday',
                fri: 'friday',
                sat: 'saturday',
            };

            const normalizedValue = aliases[value] ?? value;

            return normalizedValue === dayName || value === String(dayNumber);
        });

        return {
            is_holiday: Boolean(holiday),

            holiday_name: holiday?.name ?? null,

            is_weekend: isWeekend,

            day_name: weekday,
        };
    };

    const attendanceData: AttendanceData =
        report?.attendanceData && typeof report.attendanceData === 'object'
            ? report.attendanceData
            : {};

    const [liveTime, setLiveTime] = useState(() => getLiveDateTime());

    const [localAttendance, setLocalAttendance] =
        useState<AttendanceRecord | null>(attendance);

    useEffect(() => {
        setLocalAttendance(attendance);
    }, [attendance]);

    const [isHolding, setIsHolding] = useState(false);

    const [showNoteModal, setShowNoteModal] = useState(false);

    const [explanationNote, setExplanationNote] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const progressCircleRef = useRef<SVGCircleElement | null>(null);

    // The SVG ring is driven exclusively by requestAnimationFrame.
    // Never animate strokeDashoffset through .holding CSS.
    const progressFrameRef = useRef<number | null>(null);
    const progressValueRef = useRef(0);
    const holdStartedAtRef = useRef<number | null>(null);
    const HOLD_DURATION = 3000;
    const RING_LENGTH = 2 * Math.PI * 84;

    const isCheckedIn =
        Boolean(localAttendance?.checked_in_at) &&
        !localAttendance?.checked_out_at;

    const isAttendanceComplete =
        Boolean(localAttendance?.checked_in_at) &&
        Boolean(localAttendance?.checked_out_at);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setLiveTime(getLiveDateTime());
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (holdTimer.current !== null) {
                clearTimeout(holdTimer.current);
            }
            if (progressFrameRef.current !== null) {
                cancelAnimationFrame(progressFrameRef.current);
            }
        };
    }, []);

    const drawRing = (progress: number) => {
        const value = Math.max(0, Math.min(1, progress));
        progressValueRef.current = value;
        if (progressCircleRef.current) {
            progressCircleRef.current.style.strokeDashoffset = String(
                RING_LENGTH * (1 - value),
            );
        }
    };

    const stopRingFrame = () => {
        if (progressFrameRef.current !== null) {
            cancelAnimationFrame(progressFrameRef.current);
            progressFrameRef.current = null;
        }
    };

    const reverseRing = () => {
        stopRingFrame();
        const from = progressValueRef.current;
        if (from <= 0) {
            drawRing(0);
            return;
        }

        const started = performance.now();
        const duration = 1500;
        const tick = (now: number) => {
            const fraction = Math.min(1, (now - started) / duration);
            const eased =
                fraction < 0.5
                    ? 4 * fraction * fraction * fraction
                    : 1 - Math.pow(-2 * fraction + 2, 3) / 2;
            drawRing(from * (1 - eased));

            if (fraction < 1) {
                progressFrameRef.current = requestAnimationFrame(tick);
            } else {
                drawRing(0);
                progressFrameRef.current = null;
            }
        };

        progressFrameRef.current = requestAnimationFrame(tick);
    };

    // Called on pointer/keyboard release, or after an API response.
    // A second call after the hold has already ended must NOT restart
    // an in-flight reverse animation.
    const resetProgress = () => {
        if (holdStartedAtRef.current === null) return;

        const elapsed = performance.now() - holdStartedAtRef.current;
        drawRing(Math.min(1, elapsed / HOLD_DURATION));
        holdStartedAtRef.current = null;

        if (holdTimer.current !== null) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }

        setIsHolding(false);
        reverseRing();
    };

    const startProgress = () => {
        if (
            holdStartedAtRef.current !== null ||
            holdTimer.current !== null ||
            submitting ||
            isAttendanceComplete
        )
            return;

        // If the previous reverse is still running, begin a new hold
        // cleanly at zero rather than mixing two animations.
        stopRingFrame();
        drawRing(0);
        setIsHolding(true);
        const started = performance.now();
        holdStartedAtRef.current = started;

        const tick = (now: number) => {
            if (holdStartedAtRef.current !== started) return;
            const fraction = Math.min(1, (now - started) / HOLD_DURATION);
            drawRing(fraction);
            if (fraction < 1) {
                progressFrameRef.current = requestAnimationFrame(tick);
            } else {
                progressFrameRef.current = null;
            }
        };

        progressFrameRef.current = requestAnimationFrame(tick);

        holdTimer.current = window.setTimeout(() => {
            if (holdStartedAtRef.current !== started) return;
            holdTimer.current = null;
            holdStartedAtRef.current = null;
            stopRingFrame();
            drawRing(1);
            setIsHolding(false);
            reverseRing();
            void submitAttendance();
        }, HOLD_DURATION);
    };

    const submitAttendance = async (note?: string) => {
        if (submitting) {
            return;
        }

        setSubmitting(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            )?.content;

            const response = await fetch('/hr/attendance', {
                method: 'POST',

                credentials: 'same-origin',

                headers: {
                    Accept: 'application/json',

                    'Content-Type': 'application/json',

                    ...(csrfToken
                        ? {
                              'X-CSRF-TOKEN': csrfToken,
                          }
                        : {}),
                },

                body: JSON.stringify(
                    note?.trim()
                        ? {
                              note: note.trim(),

                              attendance: true,
                          }
                        : {
                              attendance: true,
                          },
                ),
            });

            const result = (await response.json()) as AttendanceResponse;

            console.log('[Attendance] Response:', result);

            if (result?.status === 'note_required') {
                setShowNoteModal(true);

                return;
            }

            if (!response.ok) {
                if (response.status === 403) {
                    toast.error(
                        result?.error ??
                            'You are not allowed to perform this action.',
                    );
                } else {
                    toast.error(
                        result?.error ??
                            result?.message ??
                            'An error occurred. Please try again.',
                    );
                }

                return;
            }

            const returnedAttendance =
                result?.attendance ??
                (result?.data && 'attendance' in result.data
                    ? result.data.attendance
                    : null) ??
                (result?.data && 'checked_in_at' in result.data
                    ? result.data
                    : null);

            if (returnedAttendance) {
                setLocalAttendance(returnedAttendance);
            }

            if (result?.attendance_type === 'checkIn') {
                toast.success(
                    result?.message ?? 'Successfully Recorded Attendance!',
                );

                setShowNoteModal(false);

                setExplanationNote('');

                router.reload({
                    only: ['attendance', 'report', 'currentMonth', 'shift'],

                    preserveScroll: true,

                    preserveState: true,
                });

                return;
            }

            // CHECK-OUT

            if (result?.attendance_type === 'checkOut') {
                toast.success(result?.message ?? 'Successfully Checked Out!');

                setShowNoteModal(false);

                setExplanationNote('');

                router.reload({
                    only: ['attendance', 'report', 'currentMonth', 'shift'],

                    preserveScroll: true,

                    preserveState: true,
                });

                return;
            }

            if (
                result?.attendance_type === 'complateAttendance' ||
                result?.status === 'complete'
            ) {
                toast.info(
                    result?.message ??
                        "Today's Attendance is already complete.",
                );

                router.reload({
                    only: ['attendance', 'report', 'currentMonth', 'shift'],

                    preserveScroll: true,

                    preserveState: true,
                });

                return;
            }

            if (result?.success === true || result?.status === 'logged') {
                toast.success(
                    result?.message ?? 'Attendance updated successfully.',
                );

                router.reload({
                    only: ['attendance', 'report', 'currentMonth', 'shift'],

                    preserveScroll: true,

                    preserveState: true,
                });

                return;
            }

            toast.error(
                result?.error ??
                    result?.message ??
                    'Unable to process attendance.',
            );
        } catch (error) {
            console.error('[Attendance] Error:', error);

            toast.error('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);

            resetProgress();
        }
    };

    // Submit explanation note

    const handleSubmitNote = async () => {
        const note = explanationNote.trim();

        if (!note) {
            toast.error('Please provide an explanation.');

            return;
        }

        if (note.length > 255) {
            toast.error('Note cannot exceed 255 characters.');

            return;
        }

        await submitAttendance(note);
    };

    // Compact custom note dialog: keyboard support, focus containment, and
    // scroll locking without AppModal or Bootstrap modal state.
    const noteDialogRef = useRef<HTMLDivElement | null>(null);
    const submittingRef = useRef(submitting);
    submittingRef.current = submitting;

    const closeNoteModal = () => {
        if (submitting) return;
        setShowNoteModal(false);
        setExplanationNote('');
    };

    useEffect(() => {
        if (!showNoteModal) return;

        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement as HTMLElement | null;
        document.body.style.overflow = 'hidden';
        noteDialogRef.current?.querySelector('textarea')?.focus();

        const handleDialogKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submittingRef.current) {
                event.preventDefault();
                setShowNoteModal(false);
                setExplanationNote('');
            }

            if (event.key !== 'Tab') return;
            const focusable = Array.from(
                noteDialogRef.current?.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), textarea:not(:disabled)',
                ) ?? [],
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleDialogKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleDialogKeyDown);
            previousFocus?.focus();
        };
    }, [showNoteModal, submitting]);

    // Month navigation

    const previousMonth = addMonth(currentMonth, -1);

    const nextMonth = addMonth(currentMonth, 1);

    const systemMonth = `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1,
    ).padStart(2, '0')}`;

    const isCurrentMonth = currentMonth === systemMonth;

    // Change month

    const changeMonth = (month: string) => {
        if (month > systemMonth) {
            return;
        }

        router.get(
            '/hr/attendance',
            {
                month,
            },
            {
                preserveScroll: true,

                preserveState: false,

                replace: true,
            },
        );
    };

    return (
        <>
            <div
                className={`attendance-page ${
                    isDarkMode ? 'attendance-dark' : 'attendance-light'
                }`}
            >
                <Head title="Attendance" />

                <PageTitle title="Attendance" />

                <div className="attendance-grid">
                    {/*LEFT CHECK-IN CARD */}

                    <div className="attendance-main-card">
                        <div className="attendance-main-content">
                            {/*Active check-in indicator*/}

                            <div
                                className={[
                                    'attendance-checkin-banner',
                                    isCheckedIn ? 'visible' : '',
                                ].join(' ')}
                            >
                                <ChevronsRight size={18} />

                                <span>Check-in Time -</span>

                                <strong>
                                    {formatTime(localAttendance?.checked_in_at)}
                                </strong>
                            </div>

                            {/*Clock*/}

                            <div className="attendance-clock-area">
                                <div className="attendance-live-date">
                                    {liveTime.date}
                                </div>

                                <div className="attendance-live-time">
                                    {liveTime.time}
                                </div>

                                {/*Complete state*/}
                                {isAttendanceComplete ? (
                                    <div className="attendance-complete-box">
                                        <div className="attendance-complete-title">
                                            Attendance Complete
                                        </div>

                                        <div className="attendance-complete-row">
                                            <span>Check-in</span>

                                            <strong>
                                                {formatTime(
                                                    localAttendance?.checked_in_at,
                                                )}
                                            </strong>
                                        </div>

                                        <div className="attendance-complete-row">
                                            <span>Check-out</span>

                                            <strong>
                                                {formatTime(
                                                    localAttendance?.checked_out_at,
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={[
                                            'attendance-hold-button',
                                            isHolding ? 'holding' : '',
                                        ].join(' ')}
                                        onPointerDown={(event) => {
                                            if (
                                                event.pointerType === 'mouse' &&
                                                event.button !== 0
                                            ) {
                                                return;
                                            }

                                            event.preventDefault();

                                            event.currentTarget.setPointerCapture(
                                                event.pointerId,
                                            );

                                            startProgress();
                                        }}
                                        onPointerUp={(event) => {
                                            event.preventDefault();

                                            if (
                                                event.currentTarget.hasPointerCapture(
                                                    event.pointerId,
                                                )
                                            ) {
                                                event.currentTarget.releasePointerCapture(
                                                    event.pointerId,
                                                );
                                            }

                                            resetProgress();
                                        }}
                                        onPointerCancel={resetProgress}
                                        onLostPointerCapture={resetProgress}
                                        onBlur={resetProgress}
                                        onContextMenu={(event) => {
                                            event.preventDefault();
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.repeat ||
                                                !['Enter', ' '].includes(
                                                    event.key,
                                                )
                                            ) {
                                                return;
                                            }

                                            event.preventDefault();
                                            startProgress();
                                        }}
                                        onKeyUp={(event) => {
                                            if (
                                                !['Enter', ' '].includes(
                                                    event.key,
                                                )
                                            ) {
                                                return;
                                            }

                                            event.preventDefault();
                                            resetProgress();
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        {/* Progress ring */}

                                        <svg
                                            className="attendance-progress-ring"
                                            width="190"
                                            height="190"
                                            viewBox="0 0 190 190"
                                        >
                                            <circle
                                                className="attendance-progress-background"
                                                cx="95"
                                                cy="95"
                                                r="84"
                                            />

                                            <circle
                                                ref={progressCircleRef}
                                                className="attendance-progress-value"
                                                cx="95"
                                                cy="95"
                                                r="84"
                                                strokeDasharray={RING_LENGTH}
                                                strokeDashoffset={RING_LENGTH}
                                            />
                                        </svg>

                                        <div className="attendance-hold-circle">
                                            <span>
                                                {isCheckedIn
                                                    ? 'Check-out'
                                                    : 'Check-in'}
                                            </span>

                                            {isHolding && (
                                                <small>Keep holding...</small>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT REPORT CARD*/}
                    <div className="attendance-report-card">
                        {/* Month Navigation*/}
                        <div className="attendance-month-navigation">
                            <button
                                type="button"
                                className="attendance-month-button"
                                onClick={() => changeMonth(previousMonth)}
                            >
                                <ChevronLeft size={22} />
                            </button>

                            <span>{formatMonth(currentMonth)}</span>

                            <button
                                type="button"
                                className="attendance-month-button"
                                disabled={isCurrentMonth}
                                onClick={() => changeMonth(nextMonth)}
                            >
                                <ChevronRight size={22} />
                            </button>
                        </div>

                        {/* Monthly Summary */}

                        <div className="attendance-summary">
                            {Object.entries(attendanceData).map(
                                ([label, data]) => (
                                    <div
                                        key={label}
                                        className="attendance-summary-row"
                                    >
                                        <div className="attendance-summary-left">
                                            <span
                                                className="attendance-summary-dot"
                                                style={{
                                                    backgroundColor: data.color,
                                                }}
                                            />

                                            <span>{label}</span>
                                        </div>

                                        <span className="attendance-summary-count">
                                            {data.count}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>

                        {/* Daily Reports*/}
                        <div className="attendance-daily-section">
                            <h5>Daily Report</h5>

                            <div className="attendance-daily-list">
                                {datesInMonth.length === 0 ? (
                                    <div className="attendance-empty-message">
                                        No attendance records found.
                                    </div>
                                ) : (
                                    datesInMonth.map((date) => {
                                        const dailyReport =
                                            getReportForDate(date);

                                        const status =
                                            getCalendarStatusForDate(date);

                                        const holiday = status.is_holiday
                                            ? {
                                                  name:
                                                      status.holiday_name ??
                                                      'Holiday',
                                              }
                                            : null;

                                        const isWeekend = status.is_weekend;

                                        const attendanceStatus = String(
                                            dailyReport?.attendance_status ??
                                                dailyReport?.status ??
                                                '',
                                        )
                                            .trim()
                                            .toLowerCase();

                                        const hasRealAttendance =
                                            Boolean(
                                                dailyReport?.checked_in_at,
                                            ) ||
                                            Boolean(
                                                dailyReport?.checked_out_at,
                                            ) ||
                                            [
                                                'present',
                                                'home',
                                                'leave',
                                            ].includes(attendanceStatus);

                                        const rowStateClass = hasRealAttendance
                                            ? 'has-record'
                                            : 'no-record';

                                        return (
                                            <div
                                                key={date}
                                                className="attendance-day-row"
                                                data-date={date}
                                            >
                                                {/* DATE*/}

                                                <div className="attendance-date-column">
                                                    <span>
                                                        {formatDayName(date)}
                                                    </span>

                                                    <strong>
                                                        {formatDayNumber(date)}
                                                    </strong>
                                                </div>

                                                {/*IN / OUT*/}

                                                <div className="attendance-day-details">
                                                    {/*IN*/}

                                                    <div
                                                        className={[
                                                            'attendance-time-row',
                                                            rowStateClass,
                                                        ].join(' ')}
                                                    >
                                                        <span className="attendance-direction">
                                                            IN
                                                        </span>

                                                        <div className="attendance-value">
                                                            {renderStatus(
                                                                dailyReport,
                                                                holiday,
                                                                isWeekend,
                                                                'in',
                                                                shift,
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/*OUT*/}

                                                    <div
                                                        className={[
                                                            'attendance-time-row',
                                                            rowStateClass,
                                                        ].join(' ')}
                                                    >
                                                        <span className="attendance-direction">
                                                            OUT
                                                        </span>

                                                        <div className="attendance-value">
                                                            {renderStatus(
                                                                dailyReport,
                                                                holiday,
                                                                isWeekend,
                                                                'out',
                                                                shift,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom compact explanation modal (no AppModal) */}
            {showNoteModal &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        className="attendance-note-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeNoteModal();
                            }
                        }}
                    >
                        <div
                            ref={noteDialogRef}
                            className={`attendance-note-modal ${
                                isDarkMode
                                    ? 'attendance-dark'
                                    : 'attendance-light'
                            }`}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="attendance-note-title"
                            aria-describedby="attendance-note-description"
                        >
                            <div className="attendance-note-header">
                                <div className="attendance-note-heading">
                                    <span
                                        className="attendance-note-heading-icon"
                                        aria-hidden="true"
                                    >
                                        <MessageSquare size={18} />
                                    </span>
                                    <div>
                                        <h5 id="attendance-note-title">
                                            Submit Explanation
                                        </h5>
                                        <p id="attendance-note-description">
                                            Add a short note to complete your
                                            attendance.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="attendance-note-close"
                                    aria-label="Close explanation"
                                    disabled={submitting}
                                    onClick={closeNoteModal}
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handleSubmitNote();
                                }}
                            >
                                <div className="attendance-note-body">
                                    <label
                                        htmlFor="attendance-explanation"
                                        className="attendance-note-label"
                                    >
                                        Your explanation{' '}
                                        <span aria-hidden="true">*</span>
                                    </label>
                                    <textarea
                                        id="attendance-explanation"
                                        className="attendance-note-textarea"
                                        rows={4}
                                        maxLength={255}
                                        value={explanationNote}
                                        disabled={submitting}
                                        onChange={(event) =>
                                            setExplanationNote(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Write a brief explanation..."
                                        autoFocus
                                        required
                                    />
                                    <div className="attendance-note-counter">
                                        {explanationNote.length}/255
                                    </div>
                                </div>

                                <div className="attendance-note-footer">
                                    <button
                                        type="button"
                                        className="attendance-note-cancel"
                                        disabled={submitting}
                                        onClick={closeNoteModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="attendance-note-submit"
                                        disabled={
                                            submitting ||
                                            !explanationNote.trim()
                                        }
                                    >
                                        {submitting
                                            ? 'Submitting...'
                                            : 'Submit Note'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}

            {/*STYLES*/}

            <style>
                {`

                /*
                |--------------------------------------------------------------------------
                | Page
                |--------------------------------------------------------------------------
                */

                .attendance-page {
                    width: 100%;
                    min-height: calc(100vh - 120px);
                    padding: 0 0 30px;
                }


                /*
                |--------------------------------------------------------------------------
                | Page Header
                |--------------------------------------------------------------------------
                */

                .attendance-page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 18px;
                    padding: 0 4px 12px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .attendance-page-header h3 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 600;
                    color: #111827;
                }

                .attendance-page-header p {
                    margin: 5px 0 0;
                    font-size: 13px;
                    color: #8b95a7;
                }

                .attendance-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #64748b;
                    white-space: nowrap;
                }


                /*
                |--------------------------------------------------------------------------
                | Main Grid
                |--------------------------------------------------------------------------
                */

                .attendance-grid {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1fr)
                        minmax(0, 1fr);
                    gap: 20px;
                    align-items: start;
                }


                /*
                |--------------------------------------------------------------------------
                | Cards
                |--------------------------------------------------------------------------
                */

                .attendance-main-card,
                .attendance-report-card {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow:
                        0 8px 24px
                        rgba(
                            15,
                            23,
                            42,
                            .05
                        );
                }


                /*
                |--------------------------------------------------------------------------
                | Left Card
                |--------------------------------------------------------------------------
                */

                .attendance-main-card {
                    min-height: 790px;
                }

                .attendance-main-content {
                    min-height: 790px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 28px;
                }


                /*
                |--------------------------------------------------------------------------
                | Check-in Banner
                |--------------------------------------------------------------------------
                */

                .attendance-checkin-banner {
                    min-height: 48px;
                    padding: 0 20px;
                    border-radius: 50px;
                    background: #00a94f;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    font-size: 14px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-5px);
                    transition:
                        opacity .2s ease,
                        visibility .2s ease,
                        transform .2s ease;
                }

                .attendance-checkin-banner.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .attendance-checkin-banner strong {
                    font-weight: 600;
                }


                /*
                |--------------------------------------------------------------------------
                | Clock
                |--------------------------------------------------------------------------
                */

                .attendance-clock-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 590px;
                }

                .attendance-live-date {
                    color: #4b6480;
                    font-size: 15px;
                    margin-bottom: 7px;
                }

                .attendance-live-time {
                    color: #0f172a;
                    font-size: 28px;
                    line-height: 1.2;
                    font-weight: 600;
                    margin-bottom: 28px;
                }


                /*
                |--------------------------------------------------------------------------
                | Hold Button
                |--------------------------------------------------------------------------
                */

              .attendance-hold-button {
    position: relative;
    width: 190px;
    height: 190px;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    /* Prevent text selection on desktop and mobile */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;

    /* Prevent iOS long-press Copy/Callout menu */
    -webkit-touch-callout: none;

    /* Prevent touch scrolling and selection gestures */
    touch-action: none;

    /* Remove mobile tap highlight */
    -webkit-tap-highlight-color: transparent;
}

/* Prevent selecting Check-in / Check-out text */

.attendance-hold-button,
.attendance-hold-button * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
}

/* Keep pointer events on the main button only */

.attendance-hold-button .attendance-hold-circle,
.attendance-hold-button .attendance-hold-circle *,
.attendance-hold-button .attendance-progress-ring {
    pointer-events: none;
}

                .attendance-hold-circle {
                    position: absolute;
                    inset: 14.5px;
                    border-radius: 50%;
                    background: #34495e;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition:
                        transform .18s ease,
                        background .18s ease,
                        box-shadow .18s ease;
                    box-shadow:
                        0 10px 24px
                        rgba(
                            15,
                            23,
                            42,
                            .16
                        );
                }

                .attendance-hold-button:hover
                .attendance-hold-circle {
                    /* Keep the circle flush against the inside of the SVG track. */
                    transform: none;
                }

                .attendance-hold-button.holding
                .attendance-hold-circle {
                    background: #293b4d;
                    transform: none;
                    box-shadow:
                        0 5px 14px
                        rgba(
                            15,
                            23,
                            42,
                            .22
                        );
                }

                .attendance-hold-circle span {
                    font-size: 25px;
                    font-weight: 400;
                }

                .attendance-hold-circle small {
                    margin-top: 5px;
                    font-size: 11px;
                    opacity: .8;
                }


                /*
                |--------------------------------------------------------------------------
                | Progress Ring
                |--------------------------------------------------------------------------
                */

                .attendance-progress-ring {
                    position: absolute;
                    inset: 0;
                    width: 190px;
                    height: 190px;
                    transform: rotate(-90deg);
                    overflow: visible;
                    pointer-events: none;
                }

                .attendance-progress-background,
                .attendance-progress-value {
                    fill: none;
                    stroke-width: 7;
                }

                .attendance-progress-background { stroke: var(--att-ring-bg, #ffffff); }

                .attendance-progress-value {
                    stroke: #f1c40f;
                    stroke-linecap: round;
                    /* Values are set by JS, not CSS transitions/keyframes. */
                    animation: none !important;
                    transition: none !important;
                }

                /*
                |--------------------------------------------------------------------------
                | Complete Box
                |--------------------------------------------------------------------------
                */

                .attendance-complete-box {
                    width: min(
                        330px,
                        100%
                    );
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 18px;
                    background: #f8fafc;
                }

                .attendance-complete-title {
                    text-align: center;
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 15px;
                    color: #334155;
                }

                .attendance-complete-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 10px 0;
                    border-top: 1px solid #e2e8f0;
                    font-size: 14px;
                }

                .attendance-complete-row strong {
                    color: #059669;
                }


                /*
                |--------------------------------------------------------------------------
                | Right Card
                |--------------------------------------------------------------------------
                */

                .attendance-report-card {
                    padding: 20px;
                }


                /*
                |--------------------------------------------------------------------------
                | Month Navigation
                |--------------------------------------------------------------------------
                */

                .attendance-month-navigation {
                    display: grid;
                    grid-template-columns: 40px 1fr 40px;
                    align-items: center;
                    margin-bottom: 18px;
                }

                .attendance-month-navigation > span {
                    text-align: center;
                    font-size: 20px;
                    color: #172033;
                }

                .attendance-month-button {
                    width: 36px;
                    height: 36px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 0;
                    background: transparent;
                    color: #111827;
                    border-radius: 5px;
                    cursor: pointer;
                }

                .attendance-month-button:hover:not(:disabled) {
                    background: #f1f5f9;
                }

                .attendance-month-button:disabled {
                    opacity: .3;
                    cursor: not-allowed;
                }


                /*
                |--------------------------------------------------------------------------
                | Summary
                |--------------------------------------------------------------------------
                */

                .attendance-summary {
                    overflow: hidden;
                    border-radius: 6px;
                    background: #3096da11;
                }

                .attendance-summary-row {
                    min-height: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    border-bottom: 1px solid #d7e0e8;
                }

                .attendance-summary-row:last-child {
                    border-bottom: 0;
                }

                .attendance-summary-left {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    color: #1e3550;
                    font-size: 14px;
                }

                .attendance-summary-dot {
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    flex: 0 0 15px;
                }

                .attendance-summary-count {
                    color: #172033;
                    font-size: 14px;
                }


                /*
                |--------------------------------------------------------------------------
                | Daily Report
                |--------------------------------------------------------------------------
                */

                .attendance-daily-section {
                    margin-top: 22px;
                }

                .attendance-daily-section h5 {
                    margin: 0 0 18px;
                    text-align: center;
                    font-size: 17px;
                    font-weight: 600;
                    color: #111827;
                }

                .attendance-daily-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .attendance-day-row {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    width: 100%;
                }

                .attendance-date-column {
                    width: 76px;
                    min-width: 76px;
                    max-width: 76px;
                    flex: 0 0 76px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #173858;
                    font-size: 13.5px;
                    line-height: 1.45;
                }

                .attendance-date-column strong {
                    // font-weight: 650;
                    font-size: 15.5px;
                }


                /*
                |--------------------------------------------------------------------------
                | IN / OUT area
                |--------------------------------------------------------------------------
                */

                .attendance-day-details {
                    min-width: 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .attendance-time-row {
                    min-height: 36px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 8px;
                    border-radius: 3px;
                }

                .attendance-time-row.has-record {
                    background: #3096da11;
                }

                .attendance-time-row.no-record {
                    background: #7f8c8d11;
                }

                .attendance-direction {
                    width: 38px;
                    min-width: 38px;
                    max-width: 38px;
                    flex: 0 0 38px;
                    color: #0f3557;
                    font-size: 13.5px;
                    font-weight: 500;
                }

                .attendance-value {
                    min-width: 0;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                }


                /*
                |--------------------------------------------------------------------------
                | Status Badge
                |--------------------------------------------------------------------------
                */

                .attendance-status {
                    width: 88px;
                    min-width: 88px;
                    height: 27px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 7px;
                    border-radius: 3px;
                    color: #fff;
                    font-size: 13px;
                    line-height: 27px;
                    white-space: nowrap;
                    font-weight: 500;
                }

                .status-present {
                    background: #009b18;
                }

                .status-late {
                    background: #ff1111;
                }

                .status-running {
                    background: #0ea5e9;
                }

                .status-home {
                    background: #009b18;
                }

                .status-holiday {
                    background: #f39c12;
                }

                .status-weekend {
                    background: #2c3e50;
                }

                .status-absent {
                    background: #7f8c8d;
                }

                .status-leave {
                    background: #f1c40f;
                }


                /*
                |--------------------------------------------------------------------------
                | Note icon
                |--------------------------------------------------------------------------
                */

                .attendance-info-icon {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    color: #172C33;
                    cursor: help;
                    flex: 0 0 20px;
                    margin-left: 10px;
                }

                .attendance-tooltip {
                    position: absolute;
                    left: 50%;
                    top: calc(100% + 7px);
                    transform: translateX(-50%);
                    width: 210px;
                    padding: 9px 10px;
                    background: #fff;
                    color: #334155;
                    border: 1px solid #e2e8f0;
                    border-radius: 5px;
                    box-shadow:
                        0 8px 24px
                        rgba(
                            15,
                            23,
                            42,
                            .12
                        );
                    font-size: 12px;
                    line-height: 18px;
                    white-space: normal;
                    word-break: break-word;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    z-index: 100;
                    transition:
                        opacity .15s ease,
                        visibility .15s ease;
                }

                .attendance-info-icon:hover
                .attendance-tooltip {
                    opacity: 1;
                    visibility: visible;
                }


                /*
                |--------------------------------------------------------------------------
                | Empty
                |--------------------------------------------------------------------------
                */

                .attendance-empty-message {
                    padding: 25px 15px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 14px;
                }


                /* --------------------------------------------------------
                   Compact custom explanation modal; portal to document.body.
                   Positioned near the top, independent of Bootstrap.
                -------------------------------------------------------- */
                .attendance-note-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 20000;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: clamp(18px, 7vh, 70px) 14px 20px;
                    overflow-y: auto;
                    background: rgba(12, 24, 41, .53);
                    // backdrop-filter: blur(3px);
                    animation: attendance-note-overlay-in .16s ease-out;
                }

                .attendance-note-modal {
                    --note-bg: #ffffff;
                    --note-text: #172033;
                    --note-muted: #6e7d91;
                    --note-border: #e5ebf2;
                    --note-field: #ffffff;
                    --note-soft: #eaf5f3;
                    width: min(100%, 530px);
                    max-height: calc(100dvh - 44px);
                    overflow-y: auto;
                    flex-shrink: 0;
                    border: 1px solid var(--note-border);
                    border-radius: 14px;
                    background: var(--note-bg);
                    color: var(--note-text);
                    box-shadow: 0 22px 65px rgba(8, 22, 41, .25);
                    animation: attendance-note-panel-in .2s ease-out;
                }

                .attendance-note-modal.attendance-dark {
                    --note-bg: #1b2433;
                    --note-text: #f1f5f9;
                    --note-muted: #afbdd0;
                    --note-border: #354359;
                    --note-field: #253145;
                    --note-soft: #254a4b;
                    color-scheme: dark;
                }

                .attendance-note-header {
                    padding: 18px 20px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                    border-bottom: 1px solid var(--note-border);
                }

                .attendance-note-heading {
                    display: flex;
                    align-items: flex-start;
                    gap: 11px;
                    min-width: 0;
                }

                .attendance-note-heading-icon {
                    width: 34px;
                    height: 34px;
                    flex: 0 0 34px;
                    border-radius: 9px;
                    display: grid;
                    place-items: center;
                    background: var(--note-soft);
                    color: #008b80;
                }

                .attendance-note-modal.attendance-dark .attendance-note-heading-icon {
                    color: #7be3d6;
                }

                .attendance-note-header h5 {
                    margin: 0 0 4px;
                    font-size: 16px;
                    font-weight: 650;
                    line-height: 1.4;
                    color: var(--note-text);
                }

                .attendance-note-header p {
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.5;
                    color: var(--note-muted);
                }

                .attendance-note-close {
                    width: 30px;
                    height: 30px;
                    border: 0;
                    border-radius: 7px;
                    flex: 0 0 30px;
                    display: grid;
                    place-items: center;
                    background: transparent;
                    color: var(--note-muted);
                    cursor: pointer;
                }

                .attendance-note-close:hover:not(:disabled) {
                    background: var(--note-soft);
                    color: var(--note-text);
                }

                .attendance-note-body { padding: 17px 20px 11px; }

                .attendance-note-label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--note-text);
                }

                .attendance-note-label span { color: #e05252; }

                .attendance-note-textarea {
                    display: block;
                    width: 100%;
                    min-height: 112px;
                    max-height: 230px;
                    resize: vertical;
                    padding: 11px 12px;
                    border: 1px solid var(--note-border);
                    border-radius: 8px;
                    outline: none;
                    background: var(--note-field);
                    color: var(--note-text);
                    font: inherit;
                    font-size: 13px;
                    line-height: 1.6;
                    box-sizing: border-box;
                }

                .attendance-note-textarea::placeholder { color: var(--note-muted); }

                .attendance-note-textarea:focus {
                    border-color: #008b80;
                    box-shadow: 0 0 0 3px rgba(0, 139, 128, .13);
                }

                .attendance-note-counter {
                    margin-top: 5px;
                    text-align: right;
                    color: var(--note-muted);
                    font-size: 11px;
                }

                .attendance-note-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 9px;
                    padding: 13px 20px 18px;
                    border-top: 1px solid var(--note-border);
                }

                .attendance-note-cancel,
                .attendance-note-submit {
                    min-height: 35px;
                    padding: 7px 14px;
                    border-radius: 7px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background .15s ease, box-shadow .15s ease;
                }

                .attendance-note-cancel {
                    background: transparent;
                    border: 1px solid var(--note-border);
                    color: var(--note-text);
                }

                .attendance-note-cancel:hover:not(:disabled) {
                    background: var(--note-soft);
                }

                .attendance-note-submit {
                    border: 1px solid #006666;
                    background: #006666;
                    color: #fff;
                }

                .attendance-note-submit:hover:not(:disabled) {
                    background: #008080;
                    border-color: #008080;
                }

                .attendance-note-modal button:disabled {
                    opacity: .55;
                    cursor: not-allowed;
                }

                @keyframes attendance-note-overlay-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes attendance-note-panel-in {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 575px) {
                    .attendance-note-overlay { padding: 14px 10px 20px; }
                    .attendance-note-header { padding: 15px; }
                    .attendance-note-body { padding: 15px 15px 10px; }
                    .attendance-note-footer { padding: 12px 15px 15px; }
                }

                /*
                |--------------------------------------------------------------------------
                | Tablet
                |--------------------------------------------------------------------------
                */

                @media (max-width: 991px) {

                    .attendance-grid {
                        grid-template-columns: 1fr;
                    }

                    .attendance-main-card {
                        min-height: 680px;
                    }

                    .attendance-main-content {
                        min-height: 680px;
                    }

                    .attendance-clock-area {
                        min-height: 490px;
                    }

                    .attendance-report-card {
                        width: 100%;
                    }

                }


                /*
                |--------------------------------------------------------------------------
                | Mobile
                |--------------------------------------------------------------------------
                */

                @media (max-width: 575px) {

                    .attendance-page {
                        padding-bottom: 20px;
                    }

                    .attendance-page-header {
                        align-items: flex-start;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .attendance-breadcrumb {
                        font-size: 12px;
                    }

                    .attendance-main-card {
                        min-height: 590px;
                    }

                    .attendance-main-content {
                        min-height: 590px;
                        padding: 16px;
                    }

                    .attendance-checkin-banner {
                        font-size: 12px;
                        min-height: 42px;
                        padding: 0 10px;
                    }

                    .attendance-clock-area {
                        min-height: 435px;
                    }

                    .attendance-live-date {
                        font-size: 13px;
                    }

                    .attendance-live-time {
                        font-size: 24px;
                        margin-bottom: 20px;
                    }

                    .attendance-hold-button {
                        width: 170px;
                        height: 170px;
                    }

                    .attendance-progress-ring {
                        width: 170px;
                        height: 170px;
                    }

                    .attendance-hold-circle {
                        inset: 13px;
                    }

                    .attendance-hold-circle span {
                        font-size: 21px;
                    }

                    .attendance-report-card {
                        padding: 12px;
                    }

                    .attendance-month-navigation > span {
                        font-size: 17px;
                    }

                    .attendance-summary-row {
                        min-height: 50px;
                        padding: 0 12px;
                    }

                    .attendance-summary-left {
                        gap: 12px;
                        font-size: 13px;
                    }

                    .attendance-summary-dot {
                        width: 13px;
                        height: 13px;
                        flex-basis: 13px;
                    }

                    .attendance-day-row {
                        gap: 8px;
                    }

                    .attendance-date-column {
                        width: 62px;
                        min-width: 62px;
                        max-width: 62px;
                        flex-basis: 62px;
                        font-size: 12.5px;
                    }

                    .attendance-time-row {
                        gap: 6px;
                        padding-left: 6px;
                        padding-right: 6px;
                    }

                    .attendance-direction {
                        width: 34px;
                        min-width: 34px;
                        max-width: 34px;
                        flex-basis: 34px;
                    }

                    .attendance-status {
                        width: 85px;
                        min-width: 85px;
                        font-size: 12px;
                    }

                    .attendance-tooltip {
                        width: 180px;
                    }

                }


                /*
                |--------------------------------------------------------------------------
                | Very Small Screens
                |--------------------------------------------------------------------------
                */

                @media (max-width: 380px) {

                    .attendance-date-column {
                        width: 56px;
                        min-width: 56px;
                        max-width: 56px;
                        flex-basis: 56px;
                    }

                    .attendance-direction {
                        width: 31px;
                        min-width: 31px;
                        max-width: 31px;
                        flex-basis: 31px;
                    }

                    .attendance-status {
                        width: 82px;
                        min-width: 82px;
                        font-size: 11.5px;
                    }

                    .attendance-time-row {
                        gap: 4px;
                    }

                }


                /*
                |--------------------------------------------------------------------------
                | Header-controlled theme: body.dark-only / body.light
                |--------------------------------------------------------------------------
                | The header toggles the body class. React observes that class and applies
                | attendance-dark/attendance-light. There is no second theme control.
                |--------------------------------------------------------------------------
                */

                .attendance-page.attendance-light {
                    --att-card: #ffffff;
                    --att-border: #e5e7eb;
                    --att-title: #172033;
                    --att-text: #26384e;
                    --att-muted: #64748b;
                    --att-subtle: #4b6480;
                    --att-hover: #f1f5f9;
                    --att-summary: #eff7fc;
                    --att-divider: #d7e0e8;
                    --att-present-row: #eff7fc;
                    --att-empty-row: #f4f6f8;
                    --att-note-bg: #ffffff;
                    --att-note-border: #e2e8f0;
                    --att-complete-bg: #f8fafc;
                    --att-complete-border: #e2e8f0;
                    --att-ring-bg: #e8edf2;
                    --att-hold-bg: #34495e;
                    --att-hold-active: #293b4d;
                    --att-shadow: 0 8px 24px rgba(15,23,42,.05);
                    color-scheme: light;
                }

                .attendance-page.attendance-dark {
                    --att-card: #1b2433;
                    --att-border: #354359;
                    --att-title: #f1f5f9;
                    --att-text: #d7e0ed;
                    --att-muted: #a4b3c7;
                    --att-subtle: #bbcadc;
                    --att-hover: #344459;
                    --att-summary: #25354a;
                    --att-divider: #3a4b61;
                    --att-present-row: #283d53;
                    --att-empty-row: #27313f;
                    --att-note-bg: #263448;
                    --att-note-border: #3f5066;
                    --att-complete-bg: #263448;
                    --att-complete-border: #3f5066;
                    --att-ring-bg: #526277;
                    --att-hold-bg: #40566e;
                    --att-hold-active: #34485e;
                    --att-shadow: 0 8px 24px rgba(0,0,0,.18);
                    color-scheme: dark;
                }

                .attendance-page.attendance-light,
                .attendance-page.attendance-dark {
                    color: var(--att-text);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                :is(.attendance-main-card, .attendance-report-card) {
                    background: var(--att-card);
                    color: var(--att-text);
                    border-color: var(--att-border);
                    box-shadow: var(--att-shadow);
                    transition: background-color .2s ease, border-color .2s ease,
                                color .2s ease;
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                :is(.attendance-page-header h3, .attendance-live-time,
                    .attendance-month-navigation > span,
                    .attendance-summary-count, .attendance-daily-section h5) {
                    color: var(--att-title);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                :is(.attendance-page-header p, .attendance-breadcrumb,
                    .attendance-empty-message) {
                    color: var(--att-muted);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                :is(.attendance-live-date, .attendance-summary-left,
                    .attendance-date-column, .attendance-direction,
                    .attendance-info-icon) {
                    color: var(--att-subtle);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-page-header {
                    border-bottom-color: var(--att-border);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-month-button {
                    color: var(--att-title);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-month-button:hover:not(:disabled) {
                    background: var(--att-hover);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-summary {
                    background: var(--att-summary);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-summary-row {
                    border-bottom-color: var(--att-divider);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-time-row.has-record {
                    background: var(--att-present-row);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-time-row.no-record {
                    background: var(--att-empty-row);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                :is(.attendance-complete-box, .attendance-tooltip) {
                    background: var(--att-note-bg);
                    color: var(--att-text);
                    border-color: var(--att-note-border);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-complete-title {
                    color: var(--att-title);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-complete-row {
                    border-top-color: var(--att-complete-border);
                }

                .attendance-page.attendance-dark
                .attendance-complete-row strong {
                    color: #50d39a;
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-progress-background {
                    stroke: var(--att-ring-bg);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-hold-circle {
                    background: var(--att-hold-bg);
                }

                .attendance-page:is(.attendance-light, .attendance-dark)
                .attendance-hold-button.holding .attendance-hold-circle {
                    background: var(--att-hold-active);
                }

                /* Yellow badges need dark text regardless of theme. */
                .attendance-page:is(.attendance-light, .attendance-dark)
                :is(.status-holiday, .status-leave) {
                    color: #FFFFFF;
                }

                `}
            </style>
        </>
    );
}

AttendancePage.layout = (page: React.ReactNode) => (
    <AppLayout>{page}</AppLayout>
);

export default AttendancePage;
