import FullCalendar, {
    type DayCellInfo,
    type EventDisplayInfo,
    type MountInfo,
} from '@fullcalendar/react';

import dayGridPlugin from '@fullcalendar/react/daygrid';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';
import themePlugin from '@fullcalendar/react/themes/classic';

import dayjs from 'dayjs';
import { useMemo, useRef } from 'react';

import { getDayNameByIndex, getWeekendNumbers } from './calendar.utils';

import { mapHolidaysToEvents, type Holiday } from './calendar.events';

import { useCalendarTooltip } from './useCalendarTooltip';

import './calendar.styles.css';

type ERPCalendarProps = {
    weekends: string[];
    holidays: Holiday[];
};

type TooltipListeners = {
    target: HTMLElement;
    onEnter: (event: MouseEvent) => void;
    onMove: (event: MouseEvent) => void;
    onLeave: (event: MouseEvent) => void;
};

export default function ERPCalendar({ weekends, holidays }: ERPCalendarProps) {
    const tooltip = useCalendarTooltip();

    const weekendNumbers = useMemo(
        () => getWeekendNumbers(weekends),
        [weekends],
    );

    const holidayEvents = useMemo(
        () => mapHolidaysToEvents(holidays),
        [holidays],
    );

    const holidayDates = useMemo(
        () => new Set(holidays.map((holiday) => holiday.date)),
        [holidays],
    );

    const dayCellListeners = useRef(
        new WeakMap<HTMLElement, TooltipListeners>(),
    );

    const eventListeners = useRef(new WeakMap<HTMLElement, TooltipListeners>());

    /*
    |--------------------------------------------------------------------------
    | Day Cell Mount
    |--------------------------------------------------------------------------
    |
    | Add weekend / holiday classes and initialize weekend tooltip.
    |
    */

    const handleDayCellMount = (info: MountInfo<DayCellInfo>) => {
        const dateStr = dayjs(info.date).format('YYYY-MM-DD');

        const dayIndex = info.date.getDay();

        const isWeekend = weekendNumbers.includes(dayIndex);
        const isHoliday = holidayDates.has(dateStr);

        /*
         * Dynamic cell classes
         */
        if (isHoliday) {
            info.el.classList.add('fc-holiday-cell');
        } else if (isWeekend) {
            info.el.classList.add('fc-weekend-cell');
        }

        /*
         * Weekend tooltip
         */
        if (!isWeekend) {
            return;
        }

        const dayName = getDayNameByIndex(dayIndex);

        if (!dayName) {
            return;
        }

        const target = info.el.querySelector(
            '.fc-daygrid-day-frame',
        ) as HTMLElement | null;

        if (!target) {
            return;
        }

        const title = `${dayName} (Weekend)`;

        const onEnter = (event: MouseEvent) => {
            tooltip.showTooltip(event, {
                title,
            });
        };

        const onMove = (event: MouseEvent) => {
            tooltip.moveTooltip(event);
        };

        const onLeave = (event: MouseEvent) => {
            tooltip.hideTooltip();
        };

        target.addEventListener('mouseenter', onEnter);

        target.addEventListener('mousemove', onMove);

        target.addEventListener('mouseleave', onLeave);

        dayCellListeners.current.set(info.el, {
            target,
            onEnter,
            onMove,
            onLeave,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Day Cell Unmount
    |--------------------------------------------------------------------------
    |
    | Remove native event listeners.
    |
    */

    const handleDayCellUnmount = (info: MountInfo<DayCellInfo>) => {
        const listeners = dayCellListeners.current.get(info.el);

        if (listeners) {
            listeners.target.removeEventListener(
                'mouseenter',
                listeners.onEnter,
            );

            listeners.target.removeEventListener('mousemove', listeners.onMove);

            listeners.target.removeEventListener(
                'mouseleave',
                listeners.onLeave,
            );

            dayCellListeners.current.delete(info.el);
        }

        info.el.classList.remove('fc-weekend-cell', 'fc-holiday-cell');
    };

    /*
    |--------------------------------------------------------------------------
    | Holiday Event Mount
    |--------------------------------------------------------------------------
    */

    const handleEventMount = (info: MountInfo<EventDisplayInfo>) => {
        const tooltipText = info.event.extendedProps.tooltip as
            string | undefined;

        if (!tooltipText) {
            return;
        }

        const onEnter = (event: MouseEvent) => {
            tooltip.showTooltip(event, {
                title: tooltipText,
            });
        };

        const onMove = (event: MouseEvent) => {
            tooltip.moveTooltip(event);
        };

        const onLeave = (event: MouseEvent) => {
            tooltip.hideTooltip();
        };

        info.el.addEventListener('mouseenter', onEnter);

        info.el.addEventListener('mousemove', onMove);

        info.el.addEventListener('mouseleave', onLeave);

        eventListeners.current.set(info.el, {
            target: info.el,
            onEnter,
            onMove,
            onLeave,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Holiday Event Unmount
    |--------------------------------------------------------------------------
    */

    const handleEventUnmount = (info: MountInfo<EventDisplayInfo>) => {
        const listeners = eventListeners.current.get(info.el);

        if (!listeners) {
            return;
        }

        listeners.target.removeEventListener('mouseenter', listeners.onEnter);

        listeners.target.removeEventListener('mousemove', listeners.onMove);

        listeners.target.removeEventListener('mouseleave', listeners.onLeave);

        eventListeners.current.delete(info.el);
    };

    return (
        <FullCalendar
            height={600}
            plugins={[dayGridPlugin, themePlugin]}
            initialView="dayGridMonth"
            events={holidayEvents}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth',
            }}

            /*
             * Date number + Holiday / Weekend label
             */
            dayCellTopContent={(info: DayCellInfo) => {
                const dateStr = dayjs(info.date).format('YYYY-MM-DD');

                const isHoliday = holidayDates.has(dateStr);

                const isWeekend = weekendNumbers.includes(info.date.getDay());

                return (
                    <>
                        <span>{info.dayNumberText}</span>

                        {isHoliday ? (
                            <div className="fc-holiday-title">Holiday</div>
                        ) : (
                            isWeekend && (
                                <div className="fc-weekend-title">Weekend</div>
                            )
                        )}
                    </>
                );
            }}

            /*
             * Day cell lifecycle
             */
            dayCellDidMount={handleDayCellMount}
            dayCellWillUnmount={handleDayCellUnmount}

            /*
             * Event lifecycle
             */
            eventDidMount={handleEventMount}
            eventWillUnmount={handleEventUnmount}
        />
    );
}
