import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Bell, Calendar, X, User } from 'react-feather';
import { Link } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
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

export default function SidebarDrawer() {
    const { auth, lead_followup_notifications } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);

    const [notifications, setNotifications] = useState(
        lead_followup_notifications?.items ?? [],
    );

    const unreadCount = notifications?.length ?? 0;

    const markAllAsRead = () => {
        router.post(
            '/lead-followup-notifications/mark-as-read',
            {},
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    setNotifications([]);
                    setIsOpen(false);
                },

                onError: (errors) => {
                    console.error(
                        'Failed to mark notifications as read:',
                        errors,
                    );
                },
            },
        );
    };

    const markAsRead = (notification: LeadFollowupNotification) => {
        router.post(
            `/lead-followup-notifications/${notification.id}/mark-as-read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    setNotifications((current) =>
                        current.filter((item) => item.id !== notification.id),
                    );

                    if (notification?.lead_id) {
                        setIsOpen(false);
                        router.visit(
                            `/lead-conversation/${notification.lead_id}`,
                        );
                    }
                },

                onError: (errors) => {
                    console.error(
                        'Failed to mark notification as read:',
                        errors,
                    );
                },
            },
        );
    };

    useEcho(`user.${auth?.user?.id}`, '.LeadFollowup', (event: any) => {
        const notification: LeadFollowupNotification = {
            id: event.notification.id,
            lead_id: event.notification.lead.id,
            name: event.notification.lead.name,
            company_name: event.notification.lead.company_name ?? '',
            followup_at: event.notification.notify_at,
            created_at: event.notification.created_at,
            read_at: event.notification.read_at,
        };

        setNotifications((current) => {
            const alreadyExists = current.some(
                (item) => item.id === notification.id,
            );

            if (alreadyExists) {
                return current;
            }

            return [notification, ...current];
        });
    });

    return (
        <>
            {unreadCount > 0 && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="lead-followup-tab"
                    aria-label="Open lead follow-ups"
                >
                    <span className="lead-followup-icon">
                        <Bell size={16} />

                        <span className="lead-followup-tab-badge">
                            {unreadCount}
                        </span>
                    </span>

                    <span className="lead-followup-tab-text">
                        Lead Follow-ups
                    </span>
                </button>
            )}
            {isOpen && (
                <div
                    className="sidebar-drawer-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside
                className={`sidebar-drawer ${isOpen ? 'sidebar-drawer-open' : ''}`}
            >
                <div className="sidebar-drawer-header">
                    <div>
                        <h5 className="mb-1">Lead Follow-ups</h5>
                        <small className="text-muted">
                            {unreadCount}{' '}
                            {unreadCount === 1
                                ? 'unread follow-up'
                                : 'unread follow-ups'}
                        </small>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="sidebar-drawer-close"
                        aria-label="Close drawer"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="sidebar-drawer-body">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="followup-item"
                                onClick={() => markAsRead(notification)}
                            >
                                <div className="followup-item-top">
                                    <div className="followup-lead">
                                        <div>
                                            <h6>{notification.name}</h6>
                                            <small>
                                                {notification?.company_name}
                                            </small>
                                        </div>
                                    </div>
                                    <span className="followup-urgent">
                                        Unread
                                    </span>
                                </div>
                                <div className="followup-message mb-0">
                                    <div className="d-flex align-items-center gap-2">
                                        <Calendar size={14} />
                                        <span>
                                            Follow-up:
                                            {formatDateTime(
                                                notification.followup_at,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-notification">
                            <Bell size={32} className="text-muted mb-2" />
                            <h6>No Follow-ups</h6>{' '}
                            <small className="text-muted">
                                You're all caught up.
                            </small>
                        </div>
                    )}
                </div>
                <div className="sidebar-drawer-footer d-flex justify-content-between gap-2 align-items-center">
                    <Link
                        href={'/lead/lead-follow-up'}
                        className="btn btn-primary"
                        style={{
                            fontSize: '11px',
                        }}
                        onClick={() => {
                            setIsOpen(false);
                        }}
                    >
                        View All Follow-ups
                    </Link>

                    <button
                        className="btn btn-secondary"
                        style={{
                            fontSize: '11px',
                        }}
                        onClick={() => {
                            markAllAsRead();
                        }}
                    >
                        Mark as all read
                    </button>
                </div>
            </aside>
        </>
    );
}
function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat('en-BD', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}
