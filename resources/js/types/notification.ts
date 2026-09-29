export type NotificationColor =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';

export interface GeneralNotification {
    id: string | number;
    type: string;
    title: string;
    message: string;
    url: string;
    icon: string;
    color: NotificationColor | string;
    created_at: string;
    read_at?: string | null;
}
