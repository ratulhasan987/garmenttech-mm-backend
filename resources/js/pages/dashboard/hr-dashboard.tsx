
import { Head, Link } from '@inertiajs/react';

import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import { createPortal } from 'react-dom';

import {
    ArrowRight,
    Bell,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clipboard,
    CreditCard,
    FileText,
    Home,
    UserMinus,
    Users,
} from 'react-feather';

import PageTitle from '@/components/page-title';
import AppLayout from '@/layouts/app-layout';


type Stats = {
    activeEmployee: number;
    todayLeaveRequest: number;
    todayNotices: number;
    todayHomeOfficeRequest: number;
    todayTotalPresent: number;
    todayLoanRequest: number;
    todayTotalAbsent: number;
    todayAdvanceCreate: number;
};

type Notice = {
    id: number;
    title: string;
    description: string;
    created_at: string | null;
};

type Leave = {
    id: number;
    employee_name: string;
    employee_id?: string | number | null;
    image?: string | null;
    reason?: string | null;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
};

type HolidayEvent = {
    id: number;
    title: string;
    start: string;
    end: string;
    is_recurring?: boolean;
};

type DashboardLinks = {
    employees?: string | null;
    leaveRequests?: string | null;
    notices?: string | null;
    wfhRequests?: string | null;
    attendance?: string | null;
    loanRequests?: string | null;
    advances?: string | null;
};

type MissingTable = {
    module: string;
    table: string;
};

type Props = {
    stats: Stats;
    notices?: Notice[];
    leaves?: Leave[];
    attendanceData?: number[];
    events?: HolidayEvent[];
    weekends?: number[];
    links?: DashboardLinks;
    missingTables?: MissingTable[];
    currentYear?: number;
};

/* CONSTANTS*/

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const WEEKDAYS = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
];

/* HELPERS*/

function formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
        date.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function addMonths(
    date: Date,
    amount: number,
): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1,
    );
}

function addDays(
    date: Date,
    amount: number,
): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + amount,
    );
}

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase(),
        )
        .join('');
}

function getLeaveStatusClass(
    status: string,
): string {
    const value = status
        .trim()
        .toLowerCase();

    if (value === 'approved') {
        return 'hrd-leave-approved';
    }

    if (
        value === 'rejected' ||
        value === 'cancelled'
    ) {
        return 'hrd-leave-rejected';
    }

    return 'hrd-leave-pending';
}

/*
   HOLIDAY DATE MATCHING

   Recurring:
   Compare month and day regardless of year.

   Non-recurring:
   Compare actual start and end dates.
*/

function isHolidayOnDate(
    holiday: HolidayEvent,
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



type StatColor =
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'secondary';

type StatCardProps = {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: StatColor;
    href?: string | null;
};

function StatCard({
    title,
    value,
    icon,
    color,
    href,
}: StatCardProps) {
    const content = (
        <>
            <div
                className={[
                    'hrd-stat-icon',
                    `hrd-stat-${color}`,
                ].join(' ')}
            >
                {icon}
            </div>

            <div className="hrd-stat-content">
                <h3>
                    {Number(
                        value ?? 0,
                    ).toLocaleString()}
                </h3>

                <p>{title}</p>
            </div>

            {href && (
                <ArrowRight
                    size={16}
                    className="hrd-stat-arrow"
                />
            )}
        </>
    );

    if (!href) {
        return (
            <div className="hrd-stat-card">
                {content}
            </div>
        );
    }

    return (
        <Link
            href={href}
            className="hrd-stat-card"
        >
            {content}
        </Link>
    );
}

/* 
   ATTENDANCE CHART

   Reference design:
   - All twelve months
   - Permanent horizontal grid
   - Permanent vertical grid
   - Empty data still displays chart
   - Orange transparent attendance bars
   - Automatic Y-axis scaling
   - No third-party chart dependency
   */

function AttendanceChart({
    data,
    year,
}: {
    data: number[];
    year: number;
}) {
    /*
     * Always create 12 values.
     * Missing months become zero.
     */

    const values = useMemo(() => {
        return Array.from(
            { length: 12 },
            (_, index) => {
                const value = Number(
                    data[index] ?? 0,
                );

                if (!Number.isFinite(value)) {
                    return 0;
                }

                return Math.max(0, value);
            },
        );
    }, [data]);

    /*
     * Chart Y-axis maximum.
     *
     * Empty data => 0 to 1
     * Real records => automatic scale.
     */

    const highest = Math.max(
        ...values,
        1,
    );

    const magnitude = Math.pow(
        10,
        Math.floor(
            Math.log10(highest),
        ),
    );

    const normalized =
        highest / magnitude;

    const nice =
        normalized <= 1
            ? 1
            : normalized <= 2
              ? 2
              : normalized <= 5
                ? 5
                : 10;

    const maximum =
        highest <= 1
            ? 1
            : nice * magnitude;

    /*
     * SVG chart dimensions.
     */

    const chartWidth = 760;
    const chartHeight = 578;

    const left = 53;
    const right = 749;

    const top = 36;
    const bottom = 510;

    const plotHeight =
        bottom - top;

    const plotWidth =
        right - left;

    const columnWidth =
        plotWidth / 12;

    /*
     * 10 horizontal sections.
     * 12 vertical month sections.
     */

    const horizontalLines =
        Array.from(
            { length: 11 },
            (_, index) => index,
        );

    const verticalLines =
        Array.from(
            { length: 13 },
            (_, index) => index,
        );

    const formatTick = (
        value: number,
    ): string => {
        if (value === 0) {
            return '0';
        }

        if (maximum === 1) {
            return value.toFixed(1);
        }

        return Number(
            value.toFixed(2),
        ).toLocaleString('en-US');
    };

    return (
        <div
            className="hrd-chart"
            aria-label={`Monthly attendance chart for ${year}`}
        >
            {/* Chart legend */}

            <div className="hrd-chart-legend">
                <span
                    className="hrd-chart-legend-key"
                    aria-hidden="true"
                />

                <span>
                    Present in month
                </span>
            </div>

            {/* Chart */}

            <div className="hrd-chart-scroll">
                <svg
                    className="hrd-chart-svg"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    role="img"
                    aria-label={`${year} monthly attendance chart`}
                >
                    {/* Horizontal grid lines */}

                    {horizontalLines.map(
                        (index) => {
                            const y =
                                bottom -
                                (index / 10) *
                                    plotHeight;

                            const tick =
                                (index / 10) *
                                maximum;

                            return (
                                <g
                                    key={`row-${index}`}
                                >
                                    <line
                                        x1={left}
                                        y1={y}
                                        x2={right}
                                        y2={y}
                                        className="hrd-chart-gridline"
                                    />

                                    <text
                                        x={left - 11}
                                        y={y + 4}
                                        textAnchor="end"
                                        className="hrd-chart-axis-text"
                                    >
                                        {formatTick(
                                            tick,
                                        )}
                                    </text>
                                </g>
                            );
                        },
                    )}

                    {/* Vertical grid lines */}

                    {verticalLines.map(
                        (index) => {
                            const x =
                                left +
                                index *
                                    columnWidth;

                            return (
                                <line
                                    key={`column-${index}`}
                                    x1={x}
                                    y1={top}
                                    x2={x}
                                    y2={bottom}
                                    className="hrd-chart-gridline"
                                />
                            );
                        },
                    )}

                    {/* Monthly attendance bars */}

                    {values.map(
                        (
                            value,
                            index,
                        ) => {
                            const x =
                                left +
                                (index + 0.5) *
                                    columnWidth;

                            const barHeight =
                                Math.min(
                                    value /
                                        maximum,
                                    1,
                                ) *
                                plotHeight;

                            return (
                                <g
                                    key={
                                        MONTHS[
                                            index
                                        ]
                                    }
                                >
                                    {value >
                                        0 && (
                                        <rect
                                            x={
                                                x -
                                                20
                                            }
                                            y={
                                                bottom -
                                                barHeight
                                            }
                                            width={
                                                40
                                            }
                                            height={
                                                barHeight
                                            }
                                            className="hrd-chart-present-bar"
                                        >
                                            <title>
                                                {`${MONTHS[index]} ${year}: ${value.toLocaleString()} present records`}
                                            </title>
                                        </rect>
                                    )}

                                    {/* Month label */}

                                    <text
                                        x={
                                            x +
                                            10
                                        }
                                        y={
                                            bottom +
                                            22
                                        }
                                        transform={`rotate(-22 ${x + 10} ${bottom + 22})`}
                                        textAnchor="end"
                                        className="hrd-chart-month-text"
                                    >
                                        {
                                            MONTHS[
                                                index
                                            ]
                                        }
                                    </text>
                                </g>
                            );
                        },
                    )}
                </svg>
            </div>
        </div>
    );
}

/* HOLIDAY CALENDAR TOOLTIP*/

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
    events,
    weekends = [],
}: {
    events: HolidayEvent[];
    weekends?: number[];
}) {
    const [
        cursor,
        setCursor,
    ] = useState(
        () => new Date(),
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

    const today = formatDate(
        new Date(),
    );

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
                addDays(
                    cursor,
                    -cursor.getDay(),
                );

            return Array.from(
                { length: 7 },
                (_, index) =>
                    addDays(
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
            addDays(
                firstDay,
                -firstWeekday,
            );

        return Array.from(
            { length: 42 },
            (_, index) =>
                addDays(
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
                addDays(
                    cursor,
                    amount * 7,
                ),
            );

            return;
        }

        setCursor(
            addMonths(
                cursor,
                amount,
            ),
        );
    };



    const showDayTooltip = (
        date: Date,
        holidays: HolidayEvent[],
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
                                    new Date(),
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

                    {WEEKDAYS.map(
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
                                formatDate(
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


function HrDashboard({
    stats,
    notices = [],
    leaves = [],
    attendanceData = [],
    events = [],
    weekends = [],
    links = {},
    missingTables = [],
    currentYear = new Date().getFullYear(),
}: Props) {
    /* =====================================================
       DARK MODE
    ===================================================== */

    const [
        isDarkMode,
        setIsDarkMode,
    ] = useState(false);

    useEffect(() => {
        const syncTheme = () => {
            setIsDarkMode(
                document.body.classList.contains(
                    'dark-only',
                ),
            );
        };

        syncTheme();

        const observer =
            new MutationObserver(
                syncTheme,
            );

        observer.observe(
            document.body,
            {
                attributes:
                    true,

                attributeFilter: [
                    'class',
                ],
            },
        );

        return () => {
            observer.disconnect();
        };
    }, []);

    /* =====================================================
       STATISTIC CARDS
    ===================================================== */

    const statCards: StatCardProps[] = [
        {
            title:
                'Active Employee',

            value:
                stats.activeEmployee,

            icon: (
                <Users size={23} />
            ),

            color:
                'warning',

            href:
                links.employees,
        },

        {
            title:
                'Leave Request',

            value:
                stats.todayLeaveRequest,

            icon: (
                <FileText size={23} />
            ),

            color:
                'success',

            href:
                links.leaveRequests,
        },

        {
            title:
                'Total Notices',

            value:
                stats.todayNotices,

            icon: (
                <Bell size={23} />
            ),

            color:
                'primary',

            href:
                links.notices,
        },

        {
            title:
                'WFH Request',

            value:
                stats.todayHomeOfficeRequest,

            icon: (
                <Home size={23} />
            ),

            color:
                'info',

            href:
                links.wfhRequests,
        },

        {
            title:
                'Today Present',

            value:
                stats.todayTotalPresent,

            icon: (
                <CheckCircle
                    size={23}
                />
            ),

            color:
                'success',

            href:
                links.attendance,
        },

        {
            title:
                'Loan Request',

            value:
                stats.todayLoanRequest,

            icon: (
                <CreditCard
                    size={23}
                />
            ),

            color:
                'secondary',

            href:
                links.loanRequests,
        },

        {
            title:
                'Today Absent',

            value:
                stats.todayTotalAbsent,

            icon: (
                <UserMinus
                    size={23}
                />
            ),

            color:
                'danger',

            href:
                links.attendance,
        },

        {
            title:
                'Advance',

            value:
                stats.todayAdvanceCreate,

            icon: (
                <CreditCard
                    size={23}
                />
            ),

            color:
                'primary',

            href:
                links.advances,
        },
    ];

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>
            <Head title="HR Dashboard" />

            <div
                className={[
                    'hrd-page',

                    isDarkMode
                        ? 'hrd-dark'
                        : 'hrd-light',
                ].join(
                    ' ',
                )}
            >
                <PageTitle
                    title="HR Dashboard"
                />

                {/* Configuration warning */}

                {missingTables.length >
                    0 && (
                    <div className="hrd-config-warning">
                        <strong>
                            Some HR tables were not found:
                        </strong>

                        <span>
                            {missingTables
                                .map(
                                    (
                                        item,
                                    ) =>
                                        `${item.module}: ${item.table}`,
                                )
                                .join(
                                    ', ',
                                )}
                        </span>
                    </div>
                )}

                {/* =========================================
                    STATISTICS
                ========================================= */}

                <div className="hrd-stats-grid">
                    {statCards.map(
                        (
                            card,
                        ) => (
                            <StatCard
                                key={
                                    card.title
                                }
                                {...card}
                            />
                        ),
                    )}
                </div>

                {/* =========================================
                    NOTICE AND LEAVE APPLICATION
                ========================================= */}

                <div className="hrd-content-grid">
                    {/* NOTICE */}

                    <div className="hrd-panel">
                        <div className="hrd-panel-header">
                            <div className="hrd-panel-title">
                                <span className="hrd-panel-icon">
                                    <Clipboard
                                        size={18}
                                    />
                                </span>

                                <h5>
                                    Notice
                                </h5>
                            </div>

                            {links.notices && (
                                <Link
                                    href={
                                        links.notices
                                    }
                                    className="hrd-see-all"
                                >
                                    See All

                                    <ArrowRight
                                        size={15}
                                    />
                                </Link>
                            )}
                        </div>

                        <div className="hrd-panel-body">
                            {notices.length ===
                            0 ? (
                                <div className="hrd-empty">
                                    <Bell
                                        size={26}
                                    />

                                    <span>
                                        No notices available.
                                    </span>
                                </div>
                            ) : (
                                notices.map(
                                    (
                                        notice,
                                    ) => (
                                        <div
                                            key={
                                                notice.id
                                            }
                                            className="hrd-notice-item"
                                        >
                                            <div className="hrd-notice-description">
                                                {
                                                    notice.description
                                                }
                                            </div>

                                            <div className="hrd-notice-meta">
                                                <span>
                                                    {
                                                        notice.title
                                                    }
                                                </span>

                                                <small>
                                                    <Calendar
                                                        size={13}
                                                    />

                                                    {
                                                        notice.created_at
                                                    }
                                                </small>
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </div>

                    {/* LEAVE APPLICATION */}

                    <div className="hrd-panel">
                        <div className="hrd-panel-header">
                            <div className="hrd-panel-title">
                                <span className="hrd-panel-icon">
                                    <FileText
                                        size={18}
                                    />
                                </span>

                                <h5>
                                    Leave Application
                                </h5>
                            </div>

                            {links.leaveRequests && (
                                <Link
                                    href={
                                        links.leaveRequests
                                    }
                                    className="hrd-see-all"
                                >
                                    See All

                                    <ArrowRight
                                        size={15}
                                    />
                                </Link>
                            )}
                        </div>

                        <div className="hrd-leave-list">
                            {leaves.length ===
                            0 ? (
                                <div className="hrd-empty">
                                    <FileText
                                        size={26}
                                    />

                                    <span>
                                        No leave applications found.
                                    </span>
                                </div>
                            ) : (
                                leaves.map(
                                    (
                                        leave,
                                    ) => (
                                        <div
                                            key={
                                                leave.id
                                            }
                                            className="hrd-leave-item"
                                        >
                                            {/* Avatar */}

                                            <div className="hrd-avatar">
                                                {getInitials(
                                                    leave.employee_name,
                                                )}
                                            </div>

                                            {/* Employee */}

                                            <div className="hrd-leave-info">
                                                <strong>
                                                    {
                                                        leave.employee_name
                                                    }
                                                </strong>

                                                {leave.employee_id && (
                                                    <small>
                                                        #
                                                        {
                                                            leave.employee_id
                                                        }
                                                    </small>
                                                )}

                                                <p>
                                                    <b>
                                                        Reason:
                                                    </b>

                                                    {' '}

                                                    {leave.reason ||
                                                        'Not provided'}
                                                </p>

                                                {leave.start_date && (
                                                    <small>
                                                        {
                                                            leave.start_date
                                                        }

                                                        {leave.end_date &&
                                                            leave.end_date !==
                                                                leave.start_date &&
                                                            ` - ${leave.end_date}`}
                                                    </small>
                                                )}
                                            </div>

                                            {/* Status */}

                                            <span
                                                className={[
                                                    'hrd-leave-status',

                                                    getLeaveStatusClass(
                                                        leave.status,
                                                    ),
                                                ].join(
                                                    ' ',
                                                )}
                                            >
                                                {
                                                    leave.status
                                                }
                                            </span>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* =========================================
                    ATTENDANCE CHART AND HOLIDAY CALENDAR
                ========================================= */}

                <div className="hrd-content-grid hrd-dashboard-visuals">
                    {/* ATTENDANCE CHART */}

                    <div className="hrd-panel">
                        <div className="hrd-panel-header">
                            <div className="hrd-panel-title">
                                <span className="hrd-panel-icon">
                                    <CheckCircle
                                        size={18}
                                    />
                                </span>

                                <h5>
                                    Attendance Chart
                                </h5>
                            </div>
                        </div>

                        <div className="hrd-panel-body">
                            <AttendanceChart
                                data={
                                    attendanceData
                                }
                                year={
                                    currentYear
                                }
                            />
                        </div>
                    </div>

                    {/* HOLIDAY CALENDAR */}

                    <div className="hrd-panel">
                        <div className="hrd-panel-header">
                            <div className="hrd-panel-title">
                                <span className="hrd-panel-icon">
                                    <Calendar
                                        size={18}
                                    />
                                </span>

                                <h5>
                                    Holiday Calendar
                                </h5>
                            </div>
                        </div>

                        <div className="hrd-panel-body">
                            <HolidayCalendar
                                events={
                                    events
                                }
                                weekends={
                                    weekends
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =============================================
                STYLES
            ============================================= */}

            <style>
                {`

/* =========================================================
   THEME VARIABLES
========================================================= */

.hrd-page.hrd-light {
    --hrd-card: #ffffff;
    --hrd-surface: #f6f9fc;
    --hrd-text: #29384a;
    --hrd-title: #162438;
    --hrd-muted: #75869a;
    --hrd-border: #e5ebf2;
    --hrd-hover: #f1f6fa;

    --hrd-avatar-bg: #e5f5f4;
    --hrd-avatar-text: #006666;

    --hrd-gridline: rgba(107, 114, 128, 0.2);

    --hrd-shadow:
        0 4px 16px rgba(
            15,
            23,
            42,
            .04
        );

    color-scheme: light;
}

.hrd-page.hrd-dark {
    --hrd-card: #1b2433;
    --hrd-surface: #253145;
    --hrd-text: #d7e0ed;
    --hrd-title: #f1f5f9;
    --hrd-muted: #9cacc0;
    --hrd-border: #354359;
    --hrd-hover: #29374b;

    --hrd-avatar-bg: #244a4b;
    --hrd-avatar-text: #85e1dd;

    --hrd-gridline: rgba(180, 190, 205, 0.2);

    --hrd-shadow:
        0 6px 20px rgba(
            0,
            0,
            0,
            .12
        );

    color-scheme: dark;
}

/* =========================================================
   PAGE
========================================================= */

.hrd-page {
    width: 100%;
    padding-bottom: 30px;
    color: var(--hrd-text);
}

.hrd-page * {
    box-sizing: border-box;
}

/* =========================================================
   CONFIGURATION WARNING
========================================================= */

.hrd-config-warning {
    display: flex;
    flex-direction: column;
    gap: 5px;

    padding: 13px 16px;

    border: 1px solid #f59e0b;
    border-radius: 7px;

    background: rgba(
        245,
        158,
        11,
        .08
    );

    margin-bottom: 18px;
    font-size: 13px;
}

.hrd-config-warning strong {
    color: var(--hrd-title);
}

/* =========================================================
   STATISTICS
========================================================= */

.hrd-stats-grid {
    display: grid;

    grid-template-columns:
        repeat(
            4,
            minmax(0, 1fr)
        );

    gap: 16px;
    margin-bottom: 20px;
}

.hrd-stat-card {
    position: relative;

    display: flex;
    align-items: center;

    gap: 15px;

    min-height: 110px;
    padding: 20px;

    border:
        1px solid
        var(--hrd-border);

    border-radius: 8px;

    background:
        var(--hrd-card);

    color:
        var(--hrd-text);

    text-decoration: none;

    box-shadow:
        var(--hrd-shadow);

    transition:
        transform .2s ease,
        box-shadow .2s ease,
        border-color .2s ease,
        background-color .2s ease;
}

a.hrd-stat-card:hover {
    transform:
        translateY(-3px);

    border-color:
        #008b8b;

    box-shadow:
        0 8px 22px rgba(
            0,
            0,
            0,
            .08
        );

    color:
        var(--hrd-text);

    text-decoration: none;
}

.hrd-stat-icon {
    width: 49px;
    height: 49px;

    flex:
        0 0 49px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;
}

.hrd-stat-primary {
    background:
        rgba(
            0,
            102,
            102,
            .12
        );

    color: #008b8b;
}

.hrd-stat-success {
    background:
        rgba(
            22,
            163,
            74,
            .12
        );

    color: #16a34a;
}

.hrd-stat-warning {
    background:
        rgba(
            245,
            158,
            11,
            .13
        );

    color: #d9940c;
}

.hrd-stat-danger {
    background:
        rgba(
            239,
            68,
            68,
            .12
        );

    color: #ef4444;
}

.hrd-stat-info {
    background:
        rgba(
            14,
            165,
            233,
            .12
        );

    color: #0ea5e9;
}

.hrd-stat-secondary {
    background:
        rgba(
            139,
            92,
            246,
            .12
        );

    color: #8b5cf6;
}

.hrd-stat-content {
    display: flex;
    flex-direction: column;

    min-width: 0;
    gap: 5px;
}

.hrd-stat-content h3 {
    margin: 0;

    font-size: 25px;
    line-height: 1.1;
    font-weight: 700;

    color:
        var(--hrd-title);
}

.hrd-stat-content p {
    margin: 0;

    font-size: 13px;

    color:
        var(--hrd-muted);
}

.hrd-stat-arrow {
    margin-left: auto;

    color:
        var(--hrd-muted);

    opacity: .65;
}

/* =========================================================
   PANELS
========================================================= */

.hrd-content-grid {
    display: grid;

    grid-template-columns:
        minmax(0, 1fr)
        minmax(0, 1fr);

    align-items: stretch;

    gap: 20px;
    margin-bottom: 20px;
}

.hrd-panel {
    min-width: 0;

    border:
        1px solid
        var(--hrd-border);

    border-radius: 8px;

    overflow: hidden;

    background:
        var(--hrd-card);

    box-shadow:
        var(--hrd-shadow);
}

.hrd-panel-header {
    min-height: 66px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 12px;

    padding: 17px 20px;

    border-bottom:
        1px solid
        var(--hrd-border);
}

.hrd-panel-title {
    display: flex;
    align-items: center;

    gap: 10px;
}

.hrd-panel-title h5 {
    margin: 0;

    font-size: 16px;
    font-weight: 600;

    color:
        var(--hrd-title);
}

.hrd-panel-icon {
    color: #008b8b;

    display: flex;
}

.hrd-panel-body {
    padding: 20px;
}

.hrd-see-all {
    display: flex;
    align-items: center;

    gap: 6px;

    color: #008b8b;

    font-size: 13px;
    font-weight: 600;

    text-decoration: none;
    white-space: nowrap;
}

.hrd-see-all:hover {
    color: #00a6a6;
}

/* =========================================================
   NOTICES
========================================================= */

.hrd-notice-item {
    padding: 15px;

    border-radius: 7px;

    background:
        var(--hrd-surface);

    border:
        1px solid
        var(--hrd-border);

    margin-bottom: 12px;
}

.hrd-notice-item:last-child {
    margin-bottom: 0;
}

.hrd-notice-description {
    font-size: 14px;
    font-weight: 500;

    color:
        var(--hrd-title);

    line-height: 1.6;
    margin-bottom: 11px;
}

.hrd-notice-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: wrap;
    gap: 10px;
}

.hrd-notice-meta > span {
    color:
        var(--hrd-muted);

    font-size: 12px;
}

.hrd-notice-meta small {
    display: flex;
    align-items: center;

    gap: 6px;

    color:
        var(--hrd-muted);

    font-size: 12px;
}

/* =========================================================
   LEAVE APPLICATION
========================================================= */

.hrd-leave-item {
    display: flex;
    align-items: flex-start;

    gap: 12px;

    padding: 18px 20px;

    border-bottom:
        1px solid
        var(--hrd-border);
}

.hrd-leave-item:last-child {
    border-bottom: none;
}

.hrd-avatar {
    width: 42px;
    height: 42px;

    flex:
        0 0 42px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 10px;

    background:
        var(--hrd-avatar-bg);

    color:
        var(--hrd-avatar-text);

    font-size: 13px;
    font-weight: 700;
}

.hrd-leave-info {
    min-width: 0;
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 4px;
}

.hrd-leave-info strong {
    color:
        var(--hrd-title);

    font-size: 14px;
}

.hrd-leave-info small {
    color:
        var(--hrd-muted);

    font-size: 11px;
}

.hrd-leave-info p {
    color:
        var(--hrd-text);

    margin: 6px 0 0;

    font-size: 12px;
    line-height: 1.5;

    white-space: normal;
    overflow-wrap: anywhere;
}

.hrd-leave-status {
    flex-shrink: 0;

    padding: 5px 9px;

    border-radius: 5px;

    font-size: 11px;
    font-weight: 600;

    text-transform: capitalize;
}

.hrd-leave-approved {
    background: #dcfce7;
    color: #15803d;
}

.hrd-leave-rejected {
    background: #fee2e2;
    color: #b91c1c;
}

.hrd-leave-pending {
    background: #fef3c7;
    color: #92400e;
}

/* =========================================================
   ATTENDANCE CHART

   REFERENCE STYLE
========================================================= */

.hrd-chart {
    width: 100%;
    min-width: 0;
}

/* Legend */

.hrd-chart-legend {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 6px;

    min-height: 29px;

    color:
        var(--hrd-text);

    font-size: 12px;
    font-weight: 400;
}

.hrd-chart-legend-key {
    display: inline-block;

    width: 40px;
    height: 13px;

    background:
        rgba(
            255,
            159,
            64,
            .12
        );

    border:
        1px solid
        #ff9f40;
}

/* Scroll container */

.hrd-chart-scroll {
    width: 100%;

    overflow-x: auto;
    overflow-y: hidden;

    scrollbar-width: thin;
}

/* SVG */

.hrd-chart-svg {
    display: block;

    width: 100%;
    min-width: 580px;

    height: auto;

    overflow: visible;
}

/* Horizontal and vertical borders */

.hrd-chart-gridline {
    stroke:
        var(--hrd-gridline);

    stroke-width: 0.8;

    fill: none;

    shape-rendering:
        crispEdges;
}

/* Y-axis */

.hrd-chart-axis-text {
    fill:
        var(--hrd-muted);

    font-size: 12px;
    font-weight: 400;
}

/* Month labels */

.hrd-chart-month-text {
    fill:
        var(--hrd-muted);

    font-size: 12px;
    font-weight: 400;
}

/* Attendance columns */

.hrd-chart-present-bar {
    fill:
        rgba(
            255,
            159,
            64,
            .12
        );

    stroke:
        #ff9f40;

    stroke-width: 1;

    transition:
        fill .2s ease,
        stroke .2s ease;
}

.hrd-chart-present-bar:hover {
    fill:
        rgba(
            255,
            159,
            64,
            .3
        );

    stroke:
        #f97316;
}

/* =========================================================
   HOLIDAY CALENDAR
========================================================= */

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

.hrd-dark
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

.hrd-dark
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

.hrd-dark
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

.hrd-dark
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

/* =========================================================
   EMPTY STATE
========================================================= */

.hrd-empty {
    min-height: 150px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 10px;

    color:
        var(--hrd-muted);

    font-size: 13px;
    text-align: center;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (
    max-width: 1199px
) {
    .hrd-stats-grid {
        grid-template-columns:
            repeat(
                2,
                minmax(0, 1fr)
            );
    }

    .hrd-calendar-title {
        font-size: 17px;
    }
}

@media (
    max-width: 991px
) {
    .hrd-content-grid {
        grid-template-columns:
            minmax(
                0,
                1fr
            );
    }

    .hrd-chart-svg {
        min-width: 580px;
    }
}

@media (
    max-width: 575px
) {
    .hrd-stats-grid {
        gap: 10px;
    }

    .hrd-stat-card {
        padding: 13px;

        min-height: 95px;

        gap: 9px;
    }

    .hrd-stat-icon {
        width: 37px;
        height: 37px;

        flex-basis:
            37px;
    }

    .hrd-stat-icon svg {
        width: 19px;
        height: 19px;
    }

    .hrd-stat-content h3 {
        font-size: 21px;
    }

    .hrd-stat-content p {
        font-size: 11px;
    }

    .hrd-stat-arrow {
        display: none;
    }

    .hrd-panel-header {
        padding: 15px;
    }

    .hrd-panel-body {
        padding: 13px;
    }

    .hrd-calendar-toolbar {
        gap: 10px;
    }

    .hrd-calendar-title {
        order: -1;

        width: 100%;

        font-size: 18px;

        text-align: center;
    }

    .hrd-calendar-day {
        min-height: 58px;

        padding: 3px 2px;
    }

    .hrd-calendar-weekday {
        font-size: 10px;
    }

    .hrd-calendar-number {
        width: 20px;
        height: 20px;

        font-size: 10px;
    }

    .hrd-calendar-event,
    .hrd-calendar-weekend-label {
        font-size: 8px;

        padding: 2px;
    }

    .hrd-calendar-arrows button {
        width: 30px;
        height: 31px;
    }

    .hrd-calendar-today-button {
        min-height: 31px;
    }

    .hrd-calendar-views button {
        min-height: 31px;
    }

    .hrd-leave-item {
        padding: 15px;
    }
}

                `}
            </style>
        </>
    );
}


HrDashboard.layout = (
    page: React.ReactNode,
) => (
    <AppLayout>
        {page}
    </AppLayout>
);

export default HrDashboard;