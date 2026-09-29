import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowUpRight,
    Bell,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    FileText,
    Home,
} from 'react-feather';

import PageTitle from '@/components/page-title';

type Employee = {
    id: number;
    name: string;
    employee_id: string | null;
    image: string | null;
    department: string | null;
    designation: string | null;
};

type Stats = {
    monthlyTotalPresent: number;
    totalHomeOfficeRequest: number;
    totalLoanRequests: number;
    totalLeaveRequest: number;
};

type Holiday = {
    id: number;
    name: string;
    date: string;
    is_recurring: boolean;
    end_date?: string | null;
};

type Notice = {
    id: number;
    title: string;
    description: string;
    created_at: string | null;
};

type LeaveRequest = {
    id: number;
    reason: string | null;
    status: string;
    created_at: string;
    leave?: {
        id: number;
        name: string;
    } | null;
};

type LoanRequest = {
    id: number;
    loan_details: string | null;
    amount: number | string;
    duration: number | string;
    status: string;
    created_at: string;
};

type Props = {
    employee: Employee;
    currentDate: string;
    currentMonth: string;
    weekendDays: number[];
    holidays: Holiday[];
    stats: Stats;
    notices: Notice[];
    leaves: LeaveRequest[];
    loanRequests: LoanRequest[];
};

const formatDate = (
    value?: string | null,
    options?: Intl.DateTimeFormatOptions,
) => {
    if (!value) {
        return '-';
    }

    const normalized = value.includes('T') ? value : `${value}T12:00:00`;
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...options,
    });
};

const money = (value: number | string) => {
    return `৳${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0)}`;
};

function StatusBadge({ status }: { status?: string | null }) {
    const value = status || 'Unknown';
    const normalized = value.toLowerCase();

    let className = 'bg-secondary';

    if (['approved', 'completed', 'active', 'present'].includes(normalized)) {
        className = 'bg-success';
    } else if (
        ['pending', 'hold', 'draft', 'in progress'].includes(normalized)
    ) {
        className = 'bg-warning text-dark';
    } else if (
        ['rejected', 'cancelled', 'canceled', 'closed'].includes(normalized)
    ) {
        className = 'bg-danger';
    } else if (normalized === 'open') {
        className = 'bg-primary';
    }

    return <span className={`badge rounded-pill ${className}`}>{value}</span>;
}

function EmptyState({ message = 'No records found.' }: { message?: string }) {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 px-3">
            <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3"
                style={{ width: 54, height: 54 }}
            >
                <FileText size={24} className="text-muted" />
            </div>
            <p className="text-muted mb-0">{message}</p>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    ringColor,
    subtitle,
}: {
    title: string;
    value: string | number;
    icon: ComponentType<{ size?: number; className?: string }>;
    ringColor: string;
    subtitle?: string;
}) {
    const Icon = icon;

    return (
        <div className="card border-0 shadow-sm h-100 dashboard-summary-card">
            <div className="card-body px-3 py-3">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="dashboard-summary-icon rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: 50,
                            height: 50,
                            minWidth: 50,
                            border: `1.5px solid ${ringColor}`,
                            boxShadow:
                                'inset 0 0 0 5px var(--ed-summary-ring, #f6f7fb)',
                            color: ringColor,
                            background: 'var(--ed-summary-icon, #fff)',
                        }}
                    >
                        <Icon size={20} />
                    </div>

                    <div>
                        <h3 className="mb-1 fw-bold ed-summary-value">
                            {value}
                        </h3>
                        <p className="mb-0 text-muted ed-summary-title">
                            {title}
                        </p>
                        {subtitle ? (
                            <small className="text-muted">{subtitle}</small>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

const CALENDAR_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalendarHolidayEvent = {
    id: number;
    title: string;
    start: string;
    end: string;
    is_recurring?: boolean;
};

function calendarDateKey(date: Date): string {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
        date.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function calendarAddMonths(
    date: Date,
    amount: number,
): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1,
    );
}

function calendarAddDays(
    date: Date,
    amount: number,
): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + amount,
    );
}


function isHolidayOnDate(
    holiday: CalendarHolidayEvent,
    dateString: string,
): boolean {
    const start = holiday.start.slice(0, 10);

    const end = (
        holiday.end || holiday.start
    ).slice(0, 10);

    if (holiday.is_recurring) {
        const currentMonthDay =
            dateString.slice(5);

        const startMonthDay =
            start.slice(5);

        const endMonthDay =
            end.slice(5);

        if (startMonthDay <= endMonthDay) {
            return (
                currentMonthDay >= startMonthDay &&
                currentMonthDay <= endMonthDay
            );
        }

        return (
            currentMonthDay >= startMonthDay ||
            currentMonthDay <= endMonthDay
        );
    }

    return (
        dateString >= start &&
        dateString <= end
    );
}

type CalendarTooltip = {
    dateLabel: string;
    holidayTitles: string[];
    isWeekend: boolean;
    x: number;
    y: number;
    above: boolean;
    isDark: boolean;
};

/* 
   HOLIDAY CALENDAR

   - Month / week
   - Previous / next
   - Today
   - Weekend highlighting
   - Holiday highlighting
   - Hover tooltip
   - Keyboard focus tooltip
   - Recurring holidays
   - Multiple holidays
   - Six-row month grid
*/

function HolidayCalendar({
    currentDate,
    weekendDays,
    holidays,
}: {
    currentDate: string;
    weekendDays: number[];
    holidays: Holiday[];
}) {
    // Keep the existing employee dashboard / Laravel prop contract.
    // Single-date holidays work as before; end_date optionally enables ranges.
    const events: CalendarHolidayEvent[] = holidays.map((holiday) => ({
        id: holiday.id,
        title: holiday.name,
        start: holiday.date,
        end: holiday.end_date || holiday.date,
        is_recurring: holiday.is_recurring,
    }));
    const weekends = weekendDays.map(Number);
    const initialDate = new Date(`${currentDate.slice(0, 10)}T12:00:00`);
    const safeInitialDate = Number.isNaN(initialDate.getTime())
        ? new Date()
        : initialDate;
    const [
        cursor,
        setCursor,
    ] = useState(
        () => safeInitialDate,
    );

    const [
        calendarView,
        setCalendarView,
    ] = useState<
        'month' | 'week'
    >('month');

    const [
        tooltip,
        setTooltip,
    ] = useState<
        CalendarTooltip | null
    >(null);

    const today = calendarDateKey(safeInitialDate);

    const year =
        cursor.getFullYear();

    const month =
        cursor.getMonth();


    const calendarDates = useMemo(() => {
        /*
         * Week view:
         * Sunday through Saturday.
         */

        if (
            calendarView ===
            'week'
        ) {
            const firstDay =
                calendarAddDays(
                    cursor,
                    -cursor.getDay(),
                );

            return Array.from(
                { length: 7 },
                (_, index) =>
                    calendarAddDays(
                        firstDay,
                        index,
                    ),
            );
        }

        /*
         * Month view:
         *
         * Always 42 cells.
         * Six complete rows.
         */

        const firstDay =
            new Date(
                year,
                month,
                1,
            );

        const firstWeekday =
            firstDay.getDay();

        const gridStart =
            calendarAddDays(
                firstDay,
                -firstWeekday,
            );

        return Array.from(
            { length: 42 },
            (_, index) =>
                calendarAddDays(
                    gridStart,
                    index,
                ),
        );
    }, [
        cursor,
        calendarView,
        year,
        month,
    ]);



    const changePeriod = (
        amount: number,
    ) => {
        setTooltip(null);

        if (
            calendarView ===
            'week'
        ) {
            setCursor(
                calendarAddDays(
                    cursor,
                    amount * 7,
                ),
            );

            return;
        }

        setCursor(
            calendarAddMonths(
                cursor,
                amount,
            ),
        );
    };



    const showDayTooltip = (
        date: Date,
        holidays: CalendarHolidayEvent[],
        isWeekend: boolean,
        element: HTMLDivElement,
    ) => {
        /*
         * Only show for weekends
         * and holidays.
         */

        if (
            !isWeekend &&
            holidays.length === 0
        ) {
            setTooltip(null);

            return;
        }

        const bounds =
            element.getBoundingClientRect();

        const estimatedHeight =
            62 +
            holidays.length * 24 +
            (isWeekend ? 24 : 0);

        /*
         * If insufficient space above,
         * show tooltip below.
         */

        const above =
            bounds.top >
            estimatedHeight + 14;

        const tooltipWidth = 272;

        const centerX =
            bounds.left +
            bounds.width / 2;

        const x = Math.max(
            tooltipWidth / 2,
            Math.min(
                window.innerWidth -
                    tooltipWidth / 2,
                centerX,
            ),
        );

        const y = above
            ? bounds.top - 9
            : bounds.bottom + 9;

        const isDark =
            document.body.classList.contains(
                'dark-only',
            );

        setTooltip({
            dateLabel:
                date.toLocaleDateString(
                    'en-US',
                    {
                        weekday:
                            'long',
                        month:
                            'long',
                        day:
                            'numeric',
                        year:
                            'numeric',
                    },
                ),

            holidayTitles:
                holidays.map(
                    (holiday) =>
                        holiday.title,
                ),

            isWeekend,
            x,
            y,
            above,
            isDark,
        });
    };

    /* =====================================================
       CALENDAR VIEW
    ===================================================== */

    return (
        <>
            <div className="card dashboard-panel ed-calendar-panel border-0 shadow-sm h-100">
                <div className="card-header bg-transparent border-0 d-flex align-items-center">
                    <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                        <Calendar size={18} className="text-success" />
                        Holiday Calendar
                    </h5>
                </div>
                <div className="card-body ed-calendar-body">
                <div className="hrd-calendar">
                {/* Toolbar */}

                <div className="hrd-calendar-toolbar">
                    {/* Navigation */}

                    <div className="hrd-calendar-navigation">
                        <div className="hrd-calendar-arrows">
                            <button
                                type="button"
                                aria-label="Previous period"
                                onClick={() =>
                                    changePeriod(
                                        -1,
                                    )
                                }
                            >
                                <ChevronLeft
                                    size={17}
                                />
                            </button>

                            <button
                                type="button"
                                aria-label="Next period"
                                onClick={() =>
                                    changePeriod(
                                        1,
                                    )
                                }
                            >
                                <ChevronRight
                                    size={17}
                                />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="hrd-calendar-today-button"
                            onClick={() => {
                                setCursor(
                                    safeInitialDate,
                                );

                                setTooltip(
                                    null,
                                );
                            }}
                        >
                            Today
                        </button>
                    </div>

                    {/* Current month */}

                    <strong className="hrd-calendar-title">
                        {cursor.toLocaleDateString(
                            'en-US',
                            {
                                month:
                                    'long',
                                year:
                                    'numeric',
                            },
                        )}
                    </strong>

                    {/* Month / week switch */}

                    <div className="hrd-calendar-views">
                        <button
                            type="button"
                            className={
                                calendarView ===
                                'month'
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => {
                                setCalendarView(
                                    'month',
                                );

                                setTooltip(
                                    null,
                                );
                            }}
                        >
                            Month
                        </button>

                        <button
                            type="button"
                            className={
                                calendarView ===
                                'week'
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => {
                                setCalendarView(
                                    'week',
                                );

                                setTooltip(
                                    null,
                                );
                            }}
                        >
                            Week
                        </button>
                    </div>
                </div>


                <div className="hrd-calendar-grid">
                    {/* Weekday headers */}

                    {CALENDAR_WEEKDAYS.map(
                        (day) => (
                            <div
                                key={
                                    day
                                }
                                className="hrd-calendar-weekday"
                            >
                                {
                                    day
                                }
                            </div>
                        ),
                    )}

                    {/* Calendar dates */}

                    {calendarDates.map(
                        (date) => {
                            const dateString =
                                calendarDateKey(
                                    date,
                                );

                            /*
                             * Find matching holidays.
                             */

                            const holidays =
                                events.filter(
                                    (
                                        holiday,
                                    ) =>
                                        isHolidayOnDate(
                                            holiday,
                                            dateString,
                                        ),
                                );

                            /*
                             * Weekend from backend.
                             *
                             * Sunday = 0
                             * Monday = 1
                             * ...
                             * Saturday = 6
                             */

                            const isWeekend =
                                weekends.includes(
                                    date.getDay(),
                                );

                            const isToday =
                                dateString ===
                                today;

                            const outsideMonth =
                                date.getMonth() !==
                                month;

                            const hasHoliday =
                                holidays.length >
                                0;

                            const isInteractive =
                                isWeekend ||
                                hasHoliday;

                            /*
                             * CSS classes.
                             */

                            const className = [
                                'hrd-calendar-day',

                                isToday
                                    ? 'hrd-calendar-today'
                                    : '',

                                outsideMonth &&
                                calendarView ===
                                    'month'
                                    ? 'hrd-calendar-outside'
                                    : '',

                                isWeekend
                                    ? 'hrd-calendar-weekend'
                                    : '',

                                hasHoliday
                                    ? 'hrd-calendar-holiday'
                                    : '',

                                isInteractive
                                    ? 'hrd-calendar-interactive'
                                    : '',
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(
                                    ' ',
                                );

                            const ariaLabel = [
                                date.toDateString(),

                                ...(isWeekend
                                    ? [
                                          'Weekend',
                                      ]
                                    : []),

                                ...holidays.map(
                                    (
                                        holiday,
                                    ) =>
                                        holiday.title,
                                ),
                            ].join(
                                ', ',
                            );

                            return (
                                <div
                                    key={
                                        dateString
                                    }
                                    className={
                                        className
                                    }
                                    tabIndex={
                                        isInteractive
                                            ? 0
                                            : undefined
                                    }
                                    aria-label={
                                        isInteractive
                                            ? ariaLabel
                                            : undefined
                                    }
                                    onMouseEnter={(
                                        event,
                                    ) =>
                                        showDayTooltip(
                                            date,
                                            holidays,
                                            isWeekend,
                                            event.currentTarget,
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setTooltip(
                                            null,
                                        )
                                    }
                                    onFocus={(
                                        event,
                                    ) =>
                                        showDayTooltip(
                                            date,
                                            holidays,
                                            isWeekend,
                                            event.currentTarget,
                                        )
                                    }
                                    onBlur={() =>
                                        setTooltip(
                                            null,
                                        )
                                    }
                                    onKeyDown={(
                                        event,
                                    ) => {
                                        if (
                                            event.key ===
                                            'Escape'
                                        ) {
                                            setTooltip(
                                                null,
                                            );
                                        }
                                    }}
                                >
                                    {/* Date number */}

                                    <span className="hrd-calendar-number">
                                        {date.getDate()}
                                    </span>

                                    {/* Holiday titles */}

                                    {holidays
                                        .slice(
                                            0,
                                            2,
                                        )
                                        .map(
                                            (
                                                holiday,
                                            ) => (
                                                <span
                                                    key={
                                                        holiday.id
                                                    }
                                                    className="hrd-calendar-event"
                                                >
                                                    {
                                                        holiday.title
                                                    }
                                                </span>
                                            ),
                                        )}

                                    {/* Additional holidays */}

                                    {holidays.length >
                                        2 && (
                                        <small className="hrd-calendar-more">
                                            +
                                            {holidays.length -
                                                2}
                                            {' '}
                                            more
                                        </small>
                                    )}

                                    {/* Weekend label */}

                                    {isWeekend &&
                                        !hasHoliday && (
                                            <span className="hrd-calendar-weekend-label">
                                                Weekend
                                            </span>
                                        )}
                                </div>
                            );
                        },
                    )}
                </div>
                </div>
                </div>
            </div>

            {tooltip &&
                typeof document !==
                    'undefined' &&
                createPortal(
                    <div
                        className={[
                            'hrd-calendar-hover-tip',

                            tooltip.isDark
                                ? 'hrd-tooltip-dark'
                                : '',
                        ].join(
                            ' ',
                        )}
                        role="tooltip"
                        style={{
                            left:
                                tooltip.x,

                            top:
                                tooltip.y,

                            transform:
                                tooltip.above
                                    ? 'translate(-50%, -100%)'
                                    : 'translate(-50%, 0)',
                        }}
                    >
                        {/* Date */}

                        <strong className="hrd-calendar-hover-date">
                            {
                                tooltip.dateLabel
                            }
                        </strong>

                        {/* Weekend */}

                        {tooltip.isWeekend && (
                            <span className="hrd-calendar-hover-weekend">
                                Weekend
                            </span>
                        )}

                        {/* Holidays */}

                        {tooltip.holidayTitles.map(
                            (
                                title,
                                index,
                            ) => (
                                <span
                                    key={`${title}-${index}`}
                                    className="hrd-calendar-hover-holiday"
                                >
                                    {
                                        title
                                    }
                                </span>
                            ),
                        )}
                    </div>,

                    document.body,
                )}
        </>
    );
}

function WelcomeIllustration() {
    return (
        <svg
            className="ed-hero-illustration"
            viewBox="0 0 300 260"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Professional male admin employee working on a laptop"
        >
            <defs>
                <linearGradient id="admin-suit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#344F70" />
                    <stop offset="100%" stopColor="#192C46" />
                </linearGradient>

                <linearGradient id="admin-shirt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E6EFF8" />
                </linearGradient>

                <linearGradient id="admin-skin" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F3BC94" />
                    <stop offset="100%" stopColor="#D98F68" />
                </linearGradient>

                <linearGradient id="admin-laptop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F2F6FC" />
                    <stop offset="100%" stopColor="#A8BED4" />
                </linearGradient>

                <linearGradient id="admin-tie" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#28B5A6" />
                    <stop offset="100%" stopColor="#087A77" />
                </linearGradient>

                <filter
                    id="admin-shadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                >
                    <feGaussianBlur stdDeviation="5" />
                </filter>
            </defs>

            {/* Background glow */}
            <circle cx="193" cy="137" r="112" fill="#FFFFFF" opacity=".055" />

            <circle
                cx="193"
                cy="137"
                r="91"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                opacity=".13"
            />

            {/* Floating analytics card */}
            <g opacity=".96">
                <rect
                    x="21"
                    y="76"
                    width="77"
                    height="65"
                    rx="11"
                    fill="#FFFFFF"
                />

                <rect
                    x="31"
                    y="87"
                    width="28"
                    height="4"
                    rx="2"
                    fill="#A4B4C8"
                />

                <rect
                    x="31"
                    y="97"
                    width="39"
                    height="5"
                    rx="2.5"
                    fill="#354D67"
                />

                <rect
                    x="32"
                    y="119"
                    width="8"
                    height="12"
                    rx="2"
                    fill="#AFE8DA"
                />

                <rect
                    x="45"
                    y="112"
                    width="8"
                    height="19"
                    rx="2"
                    fill="#71CEB6"
                />

                <rect
                    x="58"
                    y="105"
                    width="8"
                    height="26"
                    rx="2"
                    fill="#34AE9B"
                />

                <rect
                    x="71"
                    y="115"
                    width="8"
                    height="16"
                    rx="2"
                    fill="#9DB6E7"
                />
            </g>

            {/* Small decorative sparkle */}
            <path
                d="M113 54 V68 M106 61 H120"
                stroke="#D0FFF1"
                strokeWidth="2"
                strokeLinecap="round"
                opacity=".75"
            />

            <circle cx="115" cy="161" r="3" fill="#B7F3DE" opacity=".85" />

            {/* Floor shadow */}
            <ellipse
                cx="197"
                cy="252"
                rx="96"
                ry="7"
                fill="#062A29"
                opacity=".25"
                filter="url(#admin-shadow)"
            />

            {/* Office chair */}
            <rect
                x="156"
                y="135"
                width="110"
                height="102"
                rx="24"
                fill="#18334A"
            />

            <rect
                x="164"
                y="143"
                width="94"
                height="87"
                rx="19"
                fill="#284B62"
            />

            <path
                d="M209 227 V250"
                stroke="#172D42"
                strokeWidth="8"
                strokeLinecap="round"
            />

            {/* Employee shoulders and suit */}
            <path
                d="
                    M169 113
                    C143 116 128 132 124 160
                    L117 233
                    Q150 250 205 250
                    Q260 250 280 231
                    L267 157
                    C263 132 245 116 220 113
                    Z
                "
                fill="url(#admin-suit)"
            />

            {/* Left sleeve */}
            <path
                d="
                    M150 125
                    C129 133 124 153 120 178
                    L111 214
                    Q110 224 125 228
                    L152 231
                    L163 212
                    L143 201
                    L151 163
                    Z
                "
                fill="#294563"
            />

            {/* Right sleeve */}
            <path
                d="
                    M246 127
                    C265 138 271 154 274 177
                    L284 211
                    Q287 222 273 228
                    L248 231
                    L236 212
                    L257 198
                    L248 163
                    Z
                "
                fill="#203952"
            />

            {/* Shirt */}
            <path
                d="
                    M177 113
                    L205 126
                    L221 113
                    L231 246
                    L164 246
                    Z
                "
                fill="url(#admin-shirt)"
            />

            {/* Neck */}
            <path
                d="
                    M181 96
                    L181 122
                    Q195 136 212 121
                    L210 95
                    Z
                "
                fill="url(#admin-skin)"
            />

            {/* Back collar */}
            <path
                d="M180 113 L197 129 L213 112"
                fill="none"
                stroke="#D6E4F0"
                strokeWidth="3"
            />

            {/* Shirt collar */}
            <path d="M181 112 L197 129 L184 143 L170 116 Z" fill="#FFFFFF" />

            <path d="M212 112 L197 129 L210 143 L226 117 Z" fill="#FFFFFF" />

            {/* Tie */}
            <path
                d="M193 131 L201 131 L205 139 L197 146 L189 139 Z"
                fill="#087A77"
            />

            <path
                d="
                    M197 144
                    L205 151
                    L210 195
                    L198 208
                    L186 195
                    L190 151
                    Z
                "
                fill="url(#admin-tie)"
            />

            {/* Blazer lapels */}
            <path
                d="
                    M177 113
                    L197 155
                    L178 183
                    L155 137
                    L166 130
                    L160 121
                    Z
                "
                fill="#3C5B7D"
            />

            <path
                d="
                    M216 113
                    L197 155
                    L218 183
                    L239 137
                    L228 130
                    L235 121
                    Z
                "
                fill="#345373"
            />

            <path
                d="M197 155 L177 113"
                fill="none"
                stroke="#6D89A5"
                strokeWidth="1.3"
            />

            <path
                d="M197 155 L216 113"
                fill="none"
                stroke="#6D89A5"
                strokeWidth="1.3"
            />

            {/* Blazer buttons */}
            <circle cx="201" cy="220" r="2.5" fill="#AEC2D3" />

            <circle cx="201" cy="239" r="2.5" fill="#AEC2D3" />

            {/* Pocket square */}
            <path
                d="M234 153 L242 145 L250 153 L250 159 L234 159 Z"
                fill="#C4F0E5"
            />

            <path
                d="M231 160 H253"
                stroke="#152A40"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Employee ears */}
            <ellipse cx="161" cy="78" rx="6" ry="10" fill="#D78F6A" />

            <ellipse cx="228" cy="78" rx="6" ry="10" fill="#D78F6A" />

            {/* Face */}
            <path
                d="
                    M160 60
                    C160 37 176 27 195 27
                    C215 27 230 42 228 65
                    L225 88
                    C222 109 211 120 195 121
                    C180 120 166 109 163 89
                    Z
                "
                fill="url(#admin-skin)"
            />

            {/* Hair silhouette */}
            <path
                d="
                    M158 71
                    C152 53 159 32 175 25
                    C189 18 207 21 218 29
                    C231 38 234 54 229 73
                    L224 81
                    L221 61
                    C212 62 203 57 196 50
                    C187 60 176 64 164 63
                    L163 83
                    Z
                "
                fill="#253041"
            />

            {/* Side-part hairstyle */}
            <path
                d="
                    M163 52
                    C174 29 197 26 215 39
                    C207 37 201 39 196 45
                    C183 57 172 58 163 57
                "
                fill="#35455B"
            />

            <path
                d="M179 30 C193 24 210 30 218 42"
                fill="none"
                stroke="#52647B"
                strokeWidth="3"
                strokeLinecap="round"
                opacity=".6"
            />

            {/* Eyebrows */}
            <path
                d="M175 73 Q182 69 189 72"
                fill="none"
                stroke="#373746"
                strokeWidth="2.6"
                strokeLinecap="round"
            />

            <path
                d="M202 72 Q209 69 216 73"
                fill="none"
                stroke="#373746"
                strokeWidth="2.6"
                strokeLinecap="round"
            />

            {/* Eyes */}
            <ellipse cx="183" cy="80" rx="2.2" ry="2.8" fill="#263342" />

            <ellipse cx="210" cy="80" rx="2.2" ry="2.8" fill="#263342" />

            {/* Nose */}
            <path
                d="M196 83 L194 94 Q197 97 201 94"
                fill="none"
                stroke="#BD7655"
                strokeWidth="1.6"
                strokeLinecap="round"
            />

            {/* Neat beard */}
            <path
                d="
                    M165 90
                    C170 110 181 119 195 120
                    C210 119 221 108 225 90
                    C219 105 207 113 195 114
                    C181 113 172 105 165 90
                    Z
                "
                fill="#55463F"
                opacity=".6"
            />

            {/* Professional smile */}
            <path
                d="M187 103 Q196 109 205 102"
                fill="none"
                stroke="#8F4F42"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Subtle cheeks */}
            <ellipse
                cx="173"
                cy="94"
                rx="5"
                ry="3"
                fill="#CE815F"
                opacity=".22"
            />

            <ellipse
                cx="217"
                cy="94"
                rx="5"
                ry="3"
                fill="#CE815F"
                opacity=".22"
            />

            {/* Laptop shadow */}
            <ellipse
                cx="206"
                cy="225"
                rx="78"
                ry="8"
                fill="#122C38"
                opacity=".15"
            />

            {/* Laptop screen body */}
            <path
                d="
                    M145 161
                    Q144 156 150 156
                    H262
                    Q268 156 267 162
                    L257 218
                    H154
                    Z
                "
                fill="url(#admin-laptop)"
                stroke="#92A9C0"
                strokeWidth="1"
            />

            {/* Laptop inner panel */}
            <path
                d="
                    M153 163
                    H259
                    L251 210
                    H160
                    Z
                "
                fill="#C6D5E5"
                opacity=".55"
            />

            {/* Laptop logo */}
            <circle cx="206" cy="186" r="11" fill="#FFFFFF" opacity=".52" />

            <path
                d="M201 189 L205 182 L209 186 L213 180"
                fill="none"
                stroke="#4B8E8D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Laptop base */}
            <path
                d="
                    M154 217
                    H257
                    L270 226
                    Q272 229 265 229
                    H145
                    Q139 229 142 225
                    Z
                "
                fill="#849EB7"
            />

            <path
                d="M146 226 H266"
                stroke="#E1EAF5"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Left hand */}
            <path
                d="
                    M121 207
                    C136 208 148 212 158 218
                    L177 220
                    Q183 220 184 225
                    Q182 230 174 230
                    L147 228
                    Q129 229 116 221
                    Z
                "
                fill="url(#admin-skin)"
            />

            {/* Right hand */}
            <path
                d="
                    M280 206
                    C265 210 255 215 243 219
                    L229 220
                    Q222 220 222 225
                    Q224 230 231 230
                    L255 228
                    Q272 227 284 218
                    Z
                "
                fill="url(#admin-skin)"
            />

            {/* Sleeve cuffs */}
            <path d="M116 205 L132 210 L127 224 L111 219 Z" fill="#F4F8FC" />

            <path d="M271 207 L285 203 L290 218 L276 223 Z" fill="#F4F8FC" />

            {/* Decorative office plant */}
            <path d="M42 220 L49 244 H77 L84 220 Z" fill="#DBE8E9" />

            <path
                d="M63 222 V179"
                stroke="#6FC8A6"
                strokeWidth="3"
                strokeLinecap="round"
            />

            <path
                d="M63 207 C43 207 39 192 44 184 C59 188 64 197 63 207 Z"
                fill="#78D5AF"
            />

            <path
                d="M63 197 C81 197 89 183 84 174 C68 180 62 190 63 197 Z"
                fill="#A0E2BE"
            />

            <path
                d="M63 187 C49 181 49 169 54 162 C65 170 68 180 63 187 Z"
                fill="#4CBF99"
            />
        </svg>
    );
}

export default function EmployeeDashboard({
    employee,
    currentDate,
    currentMonth,
    weekendDays,
    holidays,
    stats,
    notices,
    leaves,
    loanRequests,
}: Props) {
    const [clock, setClock] = useState('');

    useEffect(() => {
        const syncClock = () => {
            setClock(
                new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                }),
            );
        };

        syncClock();
        const interval = window.setInterval(syncClock, 30_000);
        return () => window.clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Dashboard" />
            <PageTitle title="Dashboard" />

            <div className="container-fluid ed-dashboard">
                <style>{`
                    /* Dashboard theme tokens. Header toggles body.dark-only. */
                    .ed-dashboard {
                        --ed-surface: #ffffff;
                        --ed-surface-2: #f6f8fd;
                        --ed-line: #e8edf5;
                        --ed-ink: #1b2941;
                        --ed-muted: #71819a;
                        --ed-summary-ring: #f4f7fc;
                        --ed-summary-icon: #fff;

                        /* Holiday Calendar: original HR calendar theme + grid borders */
                        --hrd-card: #ffffff;
                        --hrd-title: #162438;
                        --hrd-text: #29384a;
                        --hrd-muted: #75869a;
                        --hrd-border: #dfe7f3;
                    }
                    body.dark-only .ed-dashboard {
                        --ed-surface: #1b2433;
                        --ed-surface-2: #253145;
                        --ed-line: #354359;
                        --ed-ink: #edf3ff;
                        --ed-muted: #acbad0;
                        --ed-summary-ring: #29384e;
                        --ed-summary-icon: #1b2433;

                        /* Keep calendar grid visible in Riho dark mode */
                        --hrd-card: #1b2433;
                        --hrd-title: #f1f5f9;
                        --hrd-text: #d7e0ed;
                        --hrd-muted: #9cacc0;
                        --hrd-border: #354359;
                    }
                    .ed-dashboard .dashboard-summary-card,
                    .ed-dashboard .dashboard-panel {
                        border-radius: 16px;
                        background: var(--ed-surface);
                        border: 1px solid var(--ed-line) !important;
                        color: var(--ed-ink);
                        box-shadow: 0 8px 30px rgba(17, 36, 74, .045) !important;
                        transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease;
                    }
                    .ed-dashboard .dashboard-summary-card:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 12px 32px rgba(17, 36, 74, .1) !important;
                    }
                    .ed-dashboard .dashboard-summary-card h3,
                    .ed-dashboard .dashboard-panel h5 { color: var(--ed-ink); }
                    .ed-dashboard .dashboard-summary-card { min-height: 99px; }
                    .ed-dashboard .ed-summary-value { font-size: 22px; line-height: 1.2; }
                    .ed-dashboard .ed-summary-title { font-size: 12px; line-height: 1.35; }
                    .ed-dashboard .dashboard-summary-card .card-body { display: flex; align-items: center; }
                    .ed-dashboard .dashboard-summary-card p,
                    .ed-dashboard .dashboard-summary-card small { color: var(--ed-muted) !important; }
                    .ed-dashboard .dashboard-panel .card-header {
                        min-height: 66px;
                        border-bottom: 1px solid var(--ed-line) !important;
                    }
                    .ed-dashboard .dashboard-panel .bg-light,
                    .ed-dashboard .dashboard-panel .ed-soft {
                        background: var(--ed-surface-2) !important;
                    }
                    .ed-dashboard .dashboard-panel .text-muted { color: var(--ed-muted) !important; }

                    /* Welcome: illustration-led, inspired by the supplied reference. */
                    .ed-hero {
                        position: relative;
                        isolation: isolate;
                        min-height: 214px;
                        height: 100%;
                        overflow: hidden;
                        padding: 19px 21px;
                        border: 1px solid rgba(255,255,255,.12);
                        border-radius: 16px;
                        color: #fff;
                        background: #246b64;
                        box-shadow: 0 12px 32px rgba(36,107,100,.20);
                    }
                    .ed-hero::before {
                        content: '';
                        position: absolute;
                        right: -90px;
                        top: -168px;
                        width: 360px;
                        height: 360px;
                        border: 1px solid rgba(255,255,255,.12);
                        border-radius: 50%;
                        pointer-events: none;
                    }
                    .ed-hero::after {
                        content: '';
                        position: absolute;
                        right: 10px;
                        top: -105px;
                        width: 260px;
                        height: 260px;
                        border: 1px solid rgba(255,255,255,.08);
                        border-radius: 50%;
                        pointer-events: none;
                    }
                    .ed-hero-text {
                        position: relative;
                        z-index: 2;
                        max-width: 71%;
                        height: 100%;
                        min-height: 174px;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .ed-hero-eyebrow {
                        display: inline-flex;
                        align-items: center;
                        gap: 7px;
                        margin-bottom: 9px;
                        color: #c7f1e8;
                        font-size: 11px;
                        font-weight: 600;
                        letter-spacing: .11em;
                        text-transform: uppercase;
                    }
                    .ed-hero-eyebrow i {
                        width: 7px;
                        height: 7px;
                        border-radius: 50%;
                        background: #73e3c5;
                        box-shadow: 0 0 0 4px rgba(115,227,197,.12);
                    }
                    .ed-hero-heading {
                        color: #fff !important;
                        font-size: clamp(20px, 1.75vw, 25px);
                        line-height: 1.18;
                        font-weight: 700;
                        letter-spacing: -.035em;
                        margin: 0 0 6px;
                        overflow-wrap: anywhere;
                    }
                    .ed-hero-description {
                        margin: 0;
                        max-width: 280px;
                        color: #edfdf8;
                        line-height: 1.35;
                        font-size: 12px;
                    }
                    .ed-hero-role {
                        color: #c7e9e2;
                        font-size: 11px;
                        margin: 0 0 6px;
                        line-height: 1.45;
                    }
                    .ed-hero-profile {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 7px;
                        margin-top: auto;
                        padding: 7px 12px;
                        min-height: 34px;
                        color: #fff !important;
                        border: 1px solid rgba(255,255,255,.77);
                        border-radius: 7px;
                        text-decoration: none !important;
                        font-size: 12px;
                        font-weight: 600;
                        background: rgba(255,255,255,.04);
                        backdrop-filter: blur(8px);
                        transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
                    }
                    .ed-hero-profile:hover {
                        color: #fff;
                        background: rgba(255,255,255,.16);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 18px rgba(9,52,46,.18);
                    }
                    .ed-hero-profile svg { transition: transform .2s ease; }
                    .ed-hero-profile:hover svg { transform: translate(2px,-2px); }
                    .ed-hero-clock {
                        position: absolute;
                        top: 14px;
                        right: 16px;
                        display: flex;
                        align-items: center;
                        flex-direction: column;
                        gap: 6px;
                        z-index: 4;
                        color: #fff;
                    }
                    .ed-hero-clock-face {
                        width: 35px;
                        height: 35px;
                        display: grid;
                        place-items: center;
                        border-radius: 50%;
                        border: 3px solid rgba(215,229,255,.85);
                        background: #fff;
                        color: #e99557;
                        box-shadow: 0 7px 16px rgba(0,0,0,.10);
                    }
                    .ed-hero-clock strong {
                        font-size: 11px;
                        font-weight: 700;
                        white-space: nowrap;
                        letter-spacing: .01em;
                    }
                
.ed-hero-illustration {
    position: absolute;
    width: min(57%, 245px);
    height: auto;
    right: 4px;
    bottom: -8px;
    z-index: 1;
    pointer-events: none;
    filter: drop-shadow(
        0 8px 12px rgba(5, 42, 38, 0.12)
    );
}
                    .ed-hero:hover .ed-hero-illustration { transform: translateY(-4px); }
                    .ed-hero-mini {
                        position: absolute;
                        right: 43%;
                        top: 41%;
                        width: 12px;
                        height: 22px;
                        background: #ffd65c;
                        clip-path: polygon(0 0,100% 50%,35% 45%,60% 100%);
                        transform: rotate(-21deg);
                        opacity: .88;
                    }

                    @media (max-width: 420px) {
                    .ed-hero-illustration {
                      width: 60%;
                         right: -12px;
                     bottom: -5px;
    }
}

                    @media(max-width: 1399px) {
                        .ed-hero { min-height: 214px; }
                        .ed-hero-illustration { width: min(54%,205px); }
                        .ed-hero-text { max-width: 73%; }
                    }
                    @media(max-width: 767px) {

                        .ed-hero-illustration { width: min(51%,205px); }
                        .ed-hero-text { max-width: 75%; }
                        .ed-hero { min-height: 215px; }
                    }
                    @media(max-width: 420px) {
                        .ed-hero { padding: 17px; min-height: 221px; }
                        .ed-hero-text { max-width: 76%; min-height: 186px; }
                        .ed-hero-heading { font-size: 21px; }
                        .ed-hero-description { font-size: 11px; max-width: 175px; }
                        .ed-hero-illustration { width: 57%; right: -21px; bottom: -8px; opacity: .92; }
                        .ed-hero-clock { top: 10px; right: 11px; }


                    }

/* Employee dashboard calendar reference integration */
.ed-dashboard .ed-calendar-panel .card-header {
    padding: 17px 20px;
}
.ed-dashboard .ed-calendar-body {
    padding: 20px;
}
.ed-dashboard .hrd-calendar-hover-tip { pointer-events: none; }
.ed-dashboard .hrd-calendar-title { line-height: 1.3; }
@media (max-width: 575px) {
    .ed-dashboard .ed-calendar-body { padding: 13px; }
}
.hrd-calendar {
    width: 100%;
    min-width: 0;
}

/* =========================================================
   CALENDAR TOOLBAR
========================================================= */

.hrd-calendar-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: wrap;

    gap: 10px;

    margin-bottom: 17px;

    min-height: 39px;
}

/* Left navigation */

.hrd-calendar-navigation {
    display: flex;
    align-items: center;

    gap: 10px;
}

.hrd-calendar-arrows {
    display: flex;
    align-items: center;

    overflow: hidden;

    border-radius: 4px;

    background:
        #293b4e;
}

.hrd-calendar-arrows button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 35px;

    border: none;
    border-radius: 0;

    background:
        transparent;

    color: #ffffff;

    cursor: pointer;

    transition:
        background .2s ease;
}

.hrd-calendar-arrows button:hover {
    background:
        rgba(
            255,
            255,
            255,
            .15
        );
}

/* Today button */

.hrd-calendar-today-button {
    min-height: 35px;

    padding: 5px 11px;

    border: none;
    border-radius: 4px;

    background:
        #738091;

    color: #ffffff;

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;

    transition:
        background .2s ease;
}

.hrd-calendar-today-button:hover {
    background:
        #5c697a;
}

/* Calendar title */

.hrd-calendar-title {
    color:
        var(--hrd-title);

    font-size: 21px;
    font-weight: 600;

    text-align: center;
}

/* Month / week */

.hrd-calendar-views {
    display: flex;
    align-items: center;

    overflow: hidden;

    border-radius: 4px;

    background:
        #293b4e;
}

.hrd-calendar-views button {
    min-height: 35px;

    padding: 6px 11px;

    border: none;

    background:
        transparent;

    color: #ffffff;

    font-size: 12px;
    font-weight: 500;

    text-transform: lowercase;

    cursor: pointer;
}

.hrd-calendar-views button.active {
    background:
        #17212c;

    color: #ffffff;
}

.hrd-calendar-views button:hover {
    background:
        #17212c;
}

/* =========================================================
   CALENDAR GRID
========================================================= */

.hrd-calendar-grid {
    display: grid;

    grid-template-columns:
        repeat(
            7,
            minmax(0, 1fr)
        );

    border-top:
        1px solid
        var(--hrd-border);

    border-left:
        1px solid
        var(--hrd-border);
}

/* Weekday headings */

.hrd-calendar-weekday {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 27px;

    padding: 4px 3px;

    background:
        var(--hrd-card);

    color:
        var(--hrd-title);

    text-align: center;

    font-size: 12px;
    font-weight: 700;

    letter-spacing: .3px;

    border-right:
        1px solid
        var(--hrd-border);

    border-bottom:
        1px solid
        var(--hrd-border);
}

/* =========================================================
   CALENDAR DAY
========================================================= */

.hrd-calendar-day {
    position: relative;

    min-width: 0;
    min-height: 80px;

    padding: 6px 5px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    gap: 4px;

    border-right:
        1px solid
        var(--hrd-border);

    border-bottom:
        1px solid
        var(--hrd-border);

    background:
        var(--hrd-card);

    color:
        var(--hrd-text);

    transition:
        background-color .2s ease;
}

.hrd-calendar-interactive {
    cursor: help;
}

.hrd-calendar-interactive:hover {
    filter:
        brightness(.98);
}

.hrd-calendar-interactive:focus-visible {
    outline:
        2px solid #008b8b;

    outline-offset:
        -2px;

    z-index: 2;
}

/* Outside current month */

.hrd-calendar-outside
.hrd-calendar-number {
    opacity: .4;
}

/* Date number */

.hrd-calendar-number {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 23px;
    height: 23px;

    border-radius: 50%;

    color:
        var(--hrd-text);

    font-size: 12px;
    font-weight: 400;

    align-self: flex-end;
}

/* Today */

.hrd-calendar-today:not(
    .hrd-calendar-weekend,
    .hrd-calendar-holiday
) {
    background:
        rgba(
            255,
            215,
            0,
            .09
        );
}

.hrd-calendar-today
.hrd-calendar-number {
    background:
        #006666;

    color:
        #ffffff;

    font-weight: 700;
}

/* =========================================================
   WEEKEND
========================================================= */

.hrd-calendar-weekend {
    background:
        #ffe7b8;
}

body.dark-only .ed-dashboard
.hrd-calendar-weekend {
    background:
        rgba(
            245,
            158,
            11,
            .2
        );
}

.hrd-calendar-weekend-label {
    display: block;

    max-width: 100%;

    color:
        #b7791f;

    font-size: 10px;
    font-style: italic;

    line-height: 1.3;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* =========================================================
   HOLIDAY
========================================================= */

.hrd-calendar-holiday {
    background:
        #e4f7e9;
}

body.dark-only .ed-dashboard
.hrd-calendar-holiday {
    background:
        rgba(
            22,
            163,
            74,
            .16
        );
}

/* Holiday + weekend */

.hrd-calendar-weekend.hrd-calendar-holiday {
    background:
        linear-gradient(
            135deg,
            #ffe7b8 50%,
            #e4f7e9 50%
        );
}

body.dark-only .ed-dashboard
.hrd-calendar-weekend.hrd-calendar-holiday {
    background:
        linear-gradient(
            135deg,
            rgba(
                245,
                158,
                11,
                .2
            ) 50%,
            rgba(
                22,
                163,
                74,
                .16
            ) 50%
        );
}

/* Holiday title */

.hrd-calendar-event {
    display: block;

    max-width: 100%;

    padding: 3px 4px;

    border-radius: 3px;

    background:
        rgba(
            0,
            176,
            116,
            .16
        );

    color:
        #008b62;

    font-size: 10px;
    font-weight: 500;

    line-height: 1.4;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

body.dark-only .ed-dashboard
.hrd-calendar-event {
    color:
        #66dfb4;
}

.hrd-calendar-more {
    font-size: 10px;

    color:
        var(--hrd-muted);
}

/* =========================================================
   HOVER TOOLTIP

   Global selectors because tooltip
   is rendered through createPortal.
========================================================= */

.hrd-calendar-hover-tip {
    position: fixed;

    z-index: 999999;

    display: flex;
    flex-direction: column;

    gap: 7px;

    width: max-content;
    min-width: 165px;
    max-width: min(
        272px,
        calc(100vw - 20px)
    );

    padding: 13px 15px;

    border:
        1px solid
        #e5ebf2;

    border-radius: 9px;

    background:
        #ffffff;

    color:
        #29384a;

    box-shadow:
        0 10px 32px rgba(
            15,
            23,
            42,
            .18
        );

    pointer-events: none;

    animation:
        hrdTooltipFade .15s ease;
}

@keyframes hrdTooltipFade {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* Tooltip dark mode */

.hrd-calendar-hover-tip.hrd-tooltip-dark {
    background:
        #253145;

    border-color:
        #354359;

    color:
        #f1f5f9;

    box-shadow:
        0 10px 32px rgba(
            0,
            0,
            0,
            .3
        );
}

/* Tooltip date */

.hrd-calendar-hover-date {
    display: block;

    padding-bottom: 8px;

    border-bottom:
        1px solid
        #e5ebf2;

    color:
        #162438;

    font-size: 12px;
    font-weight: 700;

    line-height: 1.5;
}

.hrd-tooltip-dark
.hrd-calendar-hover-date {
    color:
        #f1f5f9;

    border-color:
        #354359;
}

/* Tooltip weekend */

.hrd-calendar-hover-weekend {
    display: inline-flex;
    align-items: center;

    width: fit-content;

    padding: 5px 9px;

    border-radius: 5px;

    background:
        #fff3d6;

    color:
        #aa650c;

    font-size: 11px;
    font-weight: 600;
}

/* Tooltip holiday */

.hrd-calendar-hover-holiday {
    display: block;

    padding: 6px 9px;

    border-radius: 5px;

    background:
        #e6f7ed;

    color:
        #087c54;

    font-size: 11px;
    font-weight: 600;

    line-height: 1.5;

    white-space: normal;
    overflow-wrap: anywhere;
}


                    @media(prefers-reduced-motion: reduce) {
                        .ed-dashboard *, .ed-dashboard *::before, .ed-dashboard *::after { transition: none !important; }
                    }
                `}</style>

                {/* TOP SECTION */}
                <div className="row g-3 mb-4">
                    {/* WELCOME — illustrated card inspired by the supplied reference */}
                    <div className="col-12 col-xl-5">
                        <section
                            className="ed-hero"
                            aria-label="Welcome and profile"
                        >
                            <div className="ed-hero-text">
                                <span className="ed-hero-eyebrow">
                                    <i /> Your workspace
                                </span>
                                <h2 className="ed-hero-heading">
                                    Welcome, {employee.name}!
                                </h2>
                                <p className="ed-hero-role">
                                    {employee.designation || 'Employee'}
                                    {employee.department
                                        ? ` · ${employee.department}`
                                        : ''}
                                </p>
                                <p className="ed-hero-description">
                                    Here’s what’s happening in your workspace
                                    today.
                                </p>
                                <Link
                                    href="/profile"
                                    className="ed-hero-profile"
                                >
                                    View Profile <ArrowUpRight size={16} />
                                </Link>
                            </div>
                            <div
                                className="ed-hero-clock"
                                aria-label={`Current time: ${clock || 'loading'}`}
                            >
                                <span className="ed-hero-clock-face">
                                    <Clock size={18} strokeWidth={1.8} />
                                </span>
                                <strong>{clock || '--:--'}</strong>
                            </div>
                            <span className="ed-hero-mini" aria-hidden="true" />
                            <WelcomeIllustration />
                        </section>
                    </div>

                    {/* STATS 2X2 */}
                    <div className="col-12 col-xl-7">
                        <div className="row g-3 h-100">
                            <div className="col-12 col-md-6">
                                <SummaryCard
                                    title="Present This Month"
                                    value={`${stats.monthlyTotalPresent} Days`}
                                    icon={Calendar}
                                    ringColor="#ef7d73"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <SummaryCard
                                    title="WFH Request"
                                    value={stats.totalHomeOfficeRequest}
                                    icon={Home}
                                    ringColor="#f0ab2e"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <SummaryCard
                                    title="Total Loan Request"
                                    value={stats.totalLoanRequests}
                                    icon={CreditCard}
                                    ringColor="#22c55e"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <SummaryCard
                                    title="Leave Request"
                                    value={stats.totalLeaveRequest}
                                    icon={FileText}
                                    ringColor="#4e73b9"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* NOTICE + LEAVE */}
                <div className="row g-4 mb-4">
                    <div className="col-12 col-xl-6">
                        <div className="card dashboard-panel border-0 shadow-sm h-100">
                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-semibold">
                                    <Bell
                                        size={18}
                                        className="me-2 text-success"
                                    />
                                    Notice
                                </h5>

                                <Link
                                    href="/hr/notice"
                                    className="text-decoration-none fw-semibold"
                                >
                                    See All →
                                </Link>
                            </div>

                            <div className="card-body pt-2">
                                {notices.length === 0 ? (
                                    <EmptyState message="No notices available." />
                                ) : (
                                    notices.map((notice) => (
                                        <div
                                            key={notice.id}
                                            className="bg-light rounded-3 p-3 mb-3"
                                        >
                                            <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                                                <h6 className="mb-0 fw-semibold">
                                                    {notice.title}
                                                </h6>

                                                <small className="text-muted">
                                                    {formatDate(
                                                        notice.created_at,
                                                    )}
                                                </small>
                                            </div>

                                            <p className="mb-0 text-muted small">
                                                {notice.description}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-6">
                        <div className="card dashboard-panel border-0 shadow-sm h-100">
                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-semibold">
                                    Leave Application
                                </h5>

                                <Link
                                    href="/hr/leave-request"
                                    className="text-decoration-none fw-semibold"
                                >
                                    See All →
                                </Link>
                            </div>

                            <div className="card-body pt-0">
                                {leaves.length === 0 ? (
                                    <EmptyState message="No leave applications." />
                                ) : (
                                    leaves.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="d-flex justify-content-between align-items-start py-3 border-bottom"
                                        >
                                            <div>
                                                <h6 className="fw-semibold mb-1">
                                                    {leave.leave?.name ||
                                                        'Leave Request'}
                                                </h6>
                                                <div className="small text-muted mb-1">
                                                    {leave.reason ||
                                                        'No reason provided'}
                                                </div>
                                                <small className="text-muted">
                                                    {formatDate(
                                                        leave.created_at,
                                                    )}
                                                </small>
                                            </div>

                                            <StatusBadge
                                                status={leave.status}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CALENDAR + LOAN */}
                <div className="row g-4 mb-4">
                    <div className="col-12 col-xl-6">
                        <HolidayCalendar
                            currentDate={currentDate}
                            weekendDays={weekendDays}
                            holidays={holidays}
                        />
                    </div>

                    <div className="col-12 col-xl-6">
                        <div className="card dashboard-panel border-0 shadow-sm h-100">
                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-semibold">
                                    Loan Request
                                </h5>

                                <Link
                                    href="/hr/loan-request"
                                    className="text-decoration-none fw-semibold"
                                >
                                    See All →
                                </Link>
                            </div>

                            <div className="card-body pt-0">
                                {loanRequests.length === 0 ? (
                                    <EmptyState message="No loan requests." />
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Details</th>
                                                    <th>Amount</th>
                                                    <th>Duration</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loanRequests.map((loan) => (
                                                    <tr key={loan.id}>
                                                        <td>
                                                            <div className="fw-semibold">
                                                                {formatDate(
                                                                    loan.created_at,
                                                                    {
                                                                        weekday:
                                                                            'long',
                                                                    },
                                                                )}
                                                            </div>
                                                            <small className="text-muted">
                                                                {loan.loan_details ||
                                                                    '-'}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            {money(loan.amount)}
                                                        </td>
                                                        <td>
                                                            {loan.duration}{' '}
                                                            Month
                                                        </td>
                                                        <td>
                                                            <StatusBadge
                                                                status={
                                                                    loan.status
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
