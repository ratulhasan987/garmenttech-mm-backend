import {
    Check,
    Clock3,
    Home,
    Plane,
    X,
} from 'lucide-react';

type AttendanceStatus =
    | 'present'
    | 'absent'
    | 'absance'
    | 'leave'
    | 'home'
    | 'holiday'
    | 'weekend'
    | 'dayof'
    | null
    | undefined;

type AttendanceStatusBadgeProps = {
    status: AttendanceStatus;
    compact?: boolean;
};

type StatusConfig = {
    label: string;
    className: string;
    icon: React.ComponentType<{
        size?: number;
        className?: string;
    }>;
};

const STATUS_CONFIG: Record<
    Exclude<AttendanceStatus, null | undefined>,
    StatusConfig
> = {
    present: {
        label: 'Present',
        className:
            'bg-success-subtle text-success border border-success-subtle',
        icon: Check,
    },

    absent: {
        label: 'Absent',
        className:
            'bg-danger-subtle text-danger border border-danger-subtle',
        icon: X,
    },

    absance: {
        label: 'Absent',
        className:
            'bg-danger-subtle text-danger border border-danger-subtle',
        icon: X,
    },

    leave: {
        label: 'Leave',
        className:
            'bg-warning-subtle text-warning border border-warning-subtle',
        icon: Plane,
    },

    home: {
        label: 'Home',
        className:
            'bg-info-subtle text-info border border-info-subtle',
        icon: Home,
    },

    holiday: {
        label: 'Holiday',
        className:
            'bg-secondary-subtle text-secondary border border-secondary-subtle',
        icon: Plane,
    },

    weekend: {
        label: 'Weekend',
        className:
            'bg-light text-muted border border-light',
        icon: Clock3,
    },

    dayof: {
        label: 'Holiday',
        className:
            'bg-secondary-subtle text-secondary border border-secondary-subtle',
        icon: Plane,
    },
};

export default function AttendanceStatusBadge({
    status,
    compact = false,
}: AttendanceStatusBadgeProps) {
    if (!status) {
        return (
            <span
                className="d-inline-flex align-items-center justify-content-center rounded-pill bg-light text-muted border"
                style={{
                    minWidth: compact ? 30 : 72,
                    minHeight: compact ? 26 : 30,
                    padding: compact
                        ? '3px 7px'
                        : '4px 10px',
                    fontSize: compact ? 11 : 12,
                }}
            >
                -
            </span>
        );
    }

    const config =
        STATUS_CONFIG[status];

    const Icon = config.icon;

    return (
        <span
            className={`d-inline-flex align-items-center justify-content-center gap-1 rounded-pill fw-medium ${config.className}`}
            style={{
                minWidth: compact ? 30 : 72,
                minHeight: compact ? 26 : 30,
                padding: compact
                    ? '3px 7px'
                    : '4px 10px',
                fontSize: compact ? 11 : 12,
                whiteSpace: 'nowrap',
            }}
            title={config.label}
        >
            <Icon
                size={compact ? 12 : 13}
                aria-hidden="true"
            />

            {!compact && config.label}
        </span>
    );
}