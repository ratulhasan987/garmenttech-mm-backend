export type * from './auth';
export type * from './navigation';
export type * from './ui';

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    image?: string | null;
    designation?: {
        id: number;
        name: string;
    } | null;
};

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type Notification = {
    message: string;
    type: NotificationType;
    key?: string;
};

export type AppNotification = {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        url?: string;
        icon?: string;
        type: string;
        color?: string;
    };
    read_at: string | null;
    created_at: string;
};

export type SharedNotifications = {
    unread_count: number;
    items: AppNotification[];
};

type LeadFollowupNotification = {
    id: number;
    lead_id: number;
    name: string;
    company_name: string;
    followup_at: string;
    created_at: string;
    read_at: string | null;
};
type LeadFollowupNotifications = {
    unread_count: number;
    items: LeadFollowupNotification[];
};

export type SharedData = {
    name: string;
    configure: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
        logo?: string;
        primary_logo?: string;
        secondary_logo?: string;
    };

    auth: {
        user: AuthUser | null;
        permissions: string[];
        roles: string[];
    };

    flash: {
        notification?: Notification | null;
    };

    notifications: SharedNotifications;

    lead_followup_notifications: LeadFollowupNotifications;

    sidebarOpen: boolean;
};
