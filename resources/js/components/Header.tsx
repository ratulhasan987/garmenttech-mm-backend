import { Link, router, usePage } from '@inertiajs/react';
import { useEchoNotification } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import {
    AlignCenter,
    Archive,
    Bell,
    BellOff,
    Check,
    Clock,
    CreditCard,
    Droplet,
    Edit,
    FileText,
    Home,
    Moon,
    Paperclip,
    User as UserIcon,
    X,
    LogOut,
} from 'react-feather';
import { toast } from 'sonner';

import { usePermission } from '@/hooks/use-permission';
import { useSidebar } from '@/hooks/use-sidebar';
import { asset } from '@/lib/asset';
import { rihoAsset } from '@/lib/riho';
import { AppNotification, SharedData } from '@/types';

type AuthUser = {
    id: number;
    name: string;
    email: string;
    image?: string | null;
    designation?: {
        id: number;
        name: string;
    } | null;
};

export type NotificationItem = {
    id: string;
    type: string;
    title: string;
    message: string;
    url?: string;
    icon?: string;
    color?: string;
    created_at: string;
};

const transformDatabaseNotification = (
    notification: AppNotification,
): NotificationItem => ({
    id: notification.id,
    type: notification.data.type,
    title: notification.data.title,
    message: notification.data.message,
    url: notification.data.url,
    icon: notification.data.icon,
    color: notification.data.color,
    created_at: notification.created_at,
});

const Header = () => {
    const { can } = usePermission();

    const {
        auth,
        configure,
        notifications: notificationData,
    } = usePage<SharedData>().props;

    const user = auth?.user;

    const { collapsed, toggleCollapsed } = useSidebar();

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [darkMode, setDarkMode] = useState(false);

    const [notifications, setNotifications] = useState<NotificationItem[]>(
        (notificationData?.items ?? []).map(transformDatabaseNotification),
    );
    /*
    |--------------------------------------------------------------------------
    | Notification
    |--------------------------------------------------------------------------
    |
    | New notifications are pushed through Laravel Reverb/Echo.
    |
    */

    useEchoNotification<NotificationItem>(
        `App.Models.User.${user?.id}`,
        (notification) => {
            setNotifications((current) => {
                const alreadyExists = current.some(
                    (item) => item.id === notification.id,
                );

                if (alreadyExists) {
                    return current;
                }

                const newNotification: NotificationItem = {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    url: notification.url,
                    icon: notification.icon,
                    color: notification.color,
                    created_at: notification.created_at ?? 'Just now',
                };

                return [newNotification, ...current];
            });

            // toast.success(notification.message);
        },
    );

    /*
    |--------------------------------------------------------------------------
    | Notification count
    |--------------------------------------------------------------------------
    */

    const unreadCount = notifications.length;

    /*
    |--------------------------------------------------------------------------
    | Mark individual notification as read
    |--------------------------------------------------------------------------
    */

    const markAsRead = (notification: NotificationItem) => {
        router.post(
            `/notifications/${notification.id}/mark-as-read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    setNotifications((current) =>
                        current.filter((item) => item.id !== notification.id),
                    );

                    if (notification?.url) {
                        router.visit(notification?.url);
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

    /*
    |--------------------------------------------------------------------------
    | Mark all notifications as read
    |--------------------------------------------------------------------------
    */

    const markAllAsRead = () => {
        router.post(
            '/notifications/mark-as-read',
            {},
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    setNotifications([]);
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

    /*
    |--------------------------------------------------------------------------
    | Dark mode
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const savedMode = localStorage.getItem('riho-mode');

        const dark = savedMode === 'dark';

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDarkMode(dark);

        document.body.classList.toggle('dark-only', dark);
        document.body.classList.toggle('light', !dark);
    }, []);

    const toggleDarkMode = () => {
        const nextMode = !darkMode;

        setDarkMode(nextMode);

        document.body.classList.toggle('dark-only', nextMode);
        document.body.classList.toggle('light', !nextMode);

        localStorage.setItem('riho-mode', nextMode ? 'dark' : 'light');
    };

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const logout = () => {
        router.post('/logout');
    };

    /*
    |--------------------------------------------------------------------------
    | User image
    |--------------------------------------------------------------------------
    */

    const userImgSrc =
        asset(user?.image) ?? rihoAsset('/images/dashboard/profile.png');

    return (
        <>
            <div className={`page-header ${collapsed ? 'close_icon' : ''}`}>
                <div className="header-wrapper row m-0">
                    {/* =======================================================
                        Full Search
                    ======================================================== */}

                    <form
                        className="form-inline search-full col"
                        action="#"
                        method="get"
                    >
                        <div className="form-group w-100">
                            <div className="Typeahead Typeahead--twitterUsers">
                                <div className="u-posRelative">
                                    <input
                                        className="demo-input Typeahead-input form-control-plaintext w-100"
                                        type="text"
                                        placeholder="Search Riho .."
                                        name="q"
                                        autoFocus
                                    />

                                    <div
                                        className="spinner-border Typeahead-spinner"
                                        role="status"
                                    >
                                        <span className="sr-only">
                                            Loading...
                                        </span>
                                    </div>

                                    <X size={18} />
                                </div>

                                <div className="Typeahead-menu" />
                            </div>
                        </div>
                    </form>

                    {/* =======================================================
                        Logo
                    ======================================================== */}

                    <div className="header-logo-wrapper col-auto p-0">
                        <div className="logo-wrapper">
                            <Link href="/">
                                <img
                                    className="img-fluid for-light"
                                    src={rihoAsset(
                                        '/images/logo/logo_dark.png',
                                    )}
                                    alt="logo-light"
                                />

                                <img
                                    className="img-fluid for-dark"
                                    src={rihoAsset('/images/logo/logo.png')}
                                    alt="logo-dark"
                                />
                            </Link>
                        </div>

                        <div
                            className="toggle-sidebar"
                            onClick={toggleCollapsed}
                        >
                            <AlignCenter
                                className="status_toggle middle sidebar-toggle"
                                size={18}
                            />
                        </div>
                    </div>

                    {/* =======================================================
                        Welcome
                    ======================================================== */}

                    <div className="left-header col-xxl-5 col-xl-6 col-lg-5 col-md-4 col-sm-3 p-0">
                        <div>
                            <a className="toggle-sidebar" href="#">
                                <i className="iconly-Category icli" />
                            </a>

                            <div className="d-flex align-items-center gap-2">
                                <h4 className="f-w-600">
                                    Welcome to{' '}
                                    {configure?.name
                                        ? configure.name
                                        : 'the company.'}
                                </h4>

                                <img
                                    className="mt-0"
                                    src={rihoAsset('/images/hand.gif')}
                                    alt="hand-gif"
                                />
                            </div>
                        </div>

                        <div className="welcome-content d-xl-block d-none">
                            <span className="text-truncate col-12">
                                Here’s what’s happening with your store today.
                            </span>
                        </div>
                    </div>

                    {/* =======================================================
                        Right Header
                    ======================================================== */}

                    <div className="nav-right col-xxl-7 col-xl-6 col-md-7 col-8 pull-right right-header p-0 ms-auto">
                        <ul className="nav-menus">
                            {/* =================================================
                                Desktop Search
                            ================================================== */}

                            <li className="d-md-block d-none">
                                <div className="form search-form mb-0">
                                    {/* <div className="input-group">
                                        <span className="input-icon">
                                            <svg>
                                                <use
                                                    href={rihoAsset(
                                                        '/svg/icon-sprite.svg#search-header',
                                                    )}
                                                />
                                            </svg>

                                            <input
                                                className="w-100"
                                                type="search"
                                                placeholder="Search"
                                            />
                                        </span>
                                    </div> */}
                                </div>
                            </li>

                            {/* =================================================
                                Mobile Search
                            ================================================== */}

                            <li className="d-md-none d-block">
                                <div className="form search-form mb-0">
                                    <div className="input-group">
                                        <span className="input-show">
                                            <svg id="searchIcon">
                                                <use
                                                    href={rihoAsset(
                                                        '/svg/icon-sprite.svg#search-header',
                                                    )}
                                                />
                                            </svg>

                                            <div id="searchInput">
                                                <input
                                                    type="search"
                                                    placeholder="Search"
                                                />
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </li>

                            {/* =================================================
                                Dark Mode
                            ================================================== */}

                            <li>
                                <div
                                    className="mode"
                                    onClick={toggleDarkMode}
                                    role="button"
                                >
                                    <Moon size={18} />
                                </div>
                            </li>

                            {/* =================================================
                                Notifications
                            ================================================== */}

                            <li className="onhover-dropdown notification-down">
                                <div className="notification-box position-relative">
                                    <Bell size={18} />

                                    {unreadCount > 0 && (
                                        <span className="badge rounded-pill bg-danger notification-count">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>

                                <div
                                    className="onhover-show-div notification-dropdown"
                                    style={{
                                        width: '380px',
                                        right: '-20px',
                                        left: 'auto',
                                    }}
                                >
                                    <div
                                        className="card shadow-lg border-0 mb-0"
                                        style={{
                                            height:
                                                unreadCount > 0
                                                    ? '520px'
                                                    : '300px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        {/* ---------------------------------
            Notification Header
        ---------------------------------- */}

                                        <div className="card-header bg-white flex-shrink-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                                        style={{
                                                            width: '42px',
                                                            height: '42px',
                                                        }}
                                                    >
                                                        <Bell size={18} />
                                                    </div>

                                                    <div>
                                                        <h5 className="mb-0 fw-bold">
                                                            Notifications
                                                        </h5>

                                                        <small className="text-muted">
                                                            You have{' '}
                                                            <span className="fw-semibold text-dark">
                                                                {unreadCount}
                                                            </span>{' '}
                                                            unread{' '}
                                                            {unreadCount === 1
                                                                ? 'notification'
                                                                : 'notifications'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ---------------------------------
            Notification List
        ---------------------------------- */}

                                        <div
                                            className="card-body p-0"
                                            style={{
                                                flex: 1,
                                                minHeight: 0,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                className="notification-list"
                                                style={{
                                                    height: '100%',
                                                    overflowY: 'auto',
                                                }}
                                            >
                                                {notifications.length > 0 ? (
                                                    notifications.map(
                                                        (notification) => (
                                                            <button
                                                                key={
                                                                    notification.id
                                                                }
                                                                type="button"
                                                                className="notification-item"
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification,
                                                                    )
                                                                }
                                                            >
                                                                <div className="notification-icon">
                                                                    <Bell
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="notification-content text-start">
                                                                    <h6>
                                                                        {
                                                                            notification?.title
                                                                        }
                                                                    </h6>

                                                                    <p className="mb-0">
                                                                        {
                                                                            notification?.message
                                                                        }
                                                                    </p>

                                                                    <small>
                                                                        {notification.created_at ??
                                                                            'Just now'}
                                                                    </small>
                                                                </div>
                                                            </button>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="empty-notification">
                                                        <BellOff
                                                            size={32}
                                                            className="text-muted mb-2"
                                                        />

                                                        <h6>
                                                            No Notifications
                                                        </h6>

                                                        <small className="text-muted">
                                                            You're all caught
                                                            up.
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ---------------------------------
            Notification Footer
        ---------------------------------- */}

                                        <div className="card-footer bg-white flex-shrink-0">
                                            <div className="d-flex justify-content-between">
                                                {/* <Link
                                                    href="/notifications"
                                                    className="btn btn-light btn-sm"
                                                >
                                                    View All
                                                </Link> */}

                                                {unreadCount > 0 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        onClick={markAllAsRead}
                                                    >
                                                        <Check
                                                            size={14}
                                                            className="me-1"
                                                        />
                                                        Mark All Read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>

                            {/* =================================================
                                Profile
                            ================================================== */}

                            <li className="profile-nav onhover-dropdown">
                                <div className="media profile-media">
                                    <img
                                        className="b-r-10"
                                        src={userImgSrc}
                                        alt="current_user"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                        }}
                                    />

                                    <div className="media-body d-xxl-block d-none box-col-none">
                                        <div className="d-flex align-items-center gap-2">
                                            <span>{user?.name ?? 'User'}</span>

                                            <i className="middle fa fa-angle-down" />
                                        </div>

                                        <p
                                            className="mb-0 font-roboto text-truncate"
                                            style={{ maxWidth: '150px' }}
                                            title={
                                                user?.designation?.name ??
                                                'Not defined'
                                            }
                                        >
                                            {user?.designation?.name ??
                                                'Not defined'}
                                        </p>
                                    </div>
                                </div>

                                <ul
                                    className="profile-dropdown onhover-show-div active"
                                    style={{
                                        width: '220px',
                                    }}
                                >
                                    {can('user.my_profile') && (
                                        <li>
                                            <Link href="/profile">
                                                <UserIcon />
                                                <span>My Profile</span>
                                            </Link>
                                        </li>
                                    )}

                                    {can('user.edit_profile') && (
                                        <li>
                                            <Link href="/profile/edit">
                                                <Edit />
                                                <span>Edit Profile</span>
                                            </Link>
                                        </li>
                                    )}

                                    {can('user.attendace') && (
                                        <li>
                                            <Link href="/hr/attendance">
                                                <Clock />
                                                <span>Attendance</span>
                                            </Link>
                                        </li>
                                    )}

                                    {can('user.salary_report') && (
                                        <li>
                                            <Link href="/hr/salary-report">
                                                <FileText />
                                                <span>Salary Report</span>
                                            </Link>
                                        </li>
                                    )}

                                    {can('user.leave') && (
                                        <li>
                                            <Link href="/hr/leave-request">
                                                <Droplet />
                                                <span>Leave Request</span>
                                            </Link>
                                        </li>
                                    )}

                                    {can('user.loan') && (
                                        <li>
                                            <Link href="/hr/loan-request">
                                                <CreditCard />
                                                <span>Loan Request</span>
                                            </Link>
                                        </li>
                                    )}

                                    {can('user.notice') && (
                                        <li>
                                            <Link href="/hr/notice">
                                                <Archive />
                                                <span>Notice Board</span>
                                            </Link>
                                        </li>
                                    )}

                                    {can('user.WFH') && (
                                        <li>
                                            <Link href="/hr/wfh">
                                                <Home />
                                                <span>WFH Request</span>
                                            </Link>
                                        </li>
                                    )}

                                    <li>
                                        <Link href="/document/edit">
                                            <Paperclip />
                                            <span>Documents</span>
                                        </Link>
                                    </li>

                                    <li>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                logout();
                                            }}
                                        >
                                            <LogOut />
                                            <span>Log Out</span>
                                        </a>
                                    </li>
                                    <li
                                        style={
                                            {
                                                cssText:
                                                    'padding-top: 0px !important',
                                            } as any
                                        }
                                    ></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;

// import { Link, router, usePage } from '@inertiajs/react';
// import { useEchoNotification } from '@laravel/echo-react';
// import { useEffect, useState } from 'react';
// import {
//     AlignCenter,
//     Edit,
//     FileText,
//     Moon,
//     User,
//     Droplet,
//     Archive,
//     Paperclip,
//     Home,
//     X,
//     Clock,
//     CreditCard,
//     Bell,
// } from 'react-feather';
// import { toast } from 'sonner';
// import { usePermission } from '@/hooks/use-permission';
// import { useSidebar } from '@/hooks/use-sidebar';
// import { asset } from '@/lib/asset';
// import { rihoAsset } from '@/lib/riho';
// import type { GeneralNotification } from '@/types/notification';
// import { Button } from './ui/button';

// type User = {
//     id: number;
//     name: string;
//     email: string;
// };

// const Header = () => {
//     const { can } = usePermission();

//     const { auth, configure } = usePage().props;

//     const user = auth?.user;

//     const userImgSrc =
//         asset(user?.image) ?? rihoAsset('/images/dashboard/profile.png');

//     const [darkMode, setDarkMode] = useState(false);

//     useEchoNotification<GeneralNotification>(
//         `App.Models.User.${user?.id}`,
//         (notification) => {
//             console.log(notification);

//             toast.success(() => (
//                 <p className="text-sm font-normal">
//                     {notification.message}{' '}
//                     <Button type="button" size="sm">
//                         <Link href={notification.url}>View Details</Link>
//                     </Button>
//                 </p>
//             ));
//         },
//     );

//     useEffect(() => {
//         const savedMode = localStorage.getItem('riho-mode');

//         const dark = savedMode === 'dark';

//         // eslint-disable-next-line react-hooks/set-state-in-effect
//         setDarkMode(dark);

//         document.body.classList.toggle('dark-only', dark);
//         document.body.classList.toggle('light', !dark);
//     }, []);

//     const toggleDarkMode = () => {
//         const nextMode = !darkMode;

//         setDarkMode(nextMode);

//         document.body.classList.toggle('dark-only', nextMode);
//         document.body.classList.toggle('light', !nextMode);

//         localStorage.setItem('riho-mode', nextMode ? 'dark' : 'light');
//     };

//     const logout = () => {
//         router.post('/logout');
//     };

//     const { collapsed, toggleCollapsed } = useSidebar();

//     return (
//         <div className={`page-header ${collapsed ? 'close_icon' : ''}`}>
//             <div className="header-wrapper row m-0">
//                 <form
//                     className="form-inline search-full col"
//                     action="#"
//                     method="get"
//                 >
//                     <div className="form-group w-100">
//                         <div className="Typeahead Typeahead--twitterUsers">
//                             <div className="u-posRelative">
//                                 <input
//                                     className="demo-input Typeahead-input form-control-plaintext w-100"
//                                     type="text"
//                                     placeholder="Search Riho .."
//                                     name="q"
//                                     autoFocus
//                                 />
//                                 <div
//                                     className="spinner-border Typeahead-spinner"
//                                     role="status"
//                                 >
//                                     <span className="sr-only">Loading...</span>
//                                 </div>
//                                 <X size={18} />
//                             </div>
//                             <div className="Typeahead-menu"></div>
//                         </div>
//                     </div>
//                 </form>

//                 <div className="header-logo-wrapper col-auto p-0">
//                     <div className="logo-wrapper">
//                         <a href="index.html">
//                             <img
//                                 className="img-fluid for-light"
//                                 src={rihoAsset(`/images/logo/logo_dark.png`)}
//                                 alt="logo-light"
//                             />
//                             <img
//                                 className="img-fluid for-dark"
//                                 src={rihoAsset('/images/logo/logo.png')}
//                                 alt="logo-dark"
//                             />
//                         </a>
//                     </div>
//                     <div className="toggle-sidebar" onClick={toggleCollapsed}>
//                         <AlignCenter
//                             className="status_toggle middle sidebar-toggle"
//                             size={18}
//                         />
//                     </div>
//                 </div>

//                 <div className="left-header col-xxl-5 col-xl-6 col-lg-5 col-md-4 col-sm-3 p-0">
//                     <div>
//                         <a className="toggle-sidebar" href="#">
//                             <i className="iconly-Category icli"></i>
//                         </a>
//                         <div className="d-flex align-items-center gap-2">
//                             <h4 className="f-w-600">
//                                 Welcome to{' '}
//                                 {configure?.name
//                                     ? configure.name
//                                     : 'the company.'}
//                             </h4>
//                             <img
//                                 className="mt-0"
//                                 src={rihoAsset('/images/hand.gif')}
//                                 alt="hand-gif"
//                             />
//                         </div>
//                     </div>
//                     <div className="welcome-content d-xl-block d-none">
//                         <span className="text-truncate col-12">
//                             Here’s what’s happening with your store today.
//                         </span>
//                     </div>
//                 </div>

//                 <div className="nav-right col-xxl-7 col-xl-6 col-md-7 col-8 pull-right right-header p-0 ms-auto">
//                     <ul className="nav-menus">
//                         <li className="d-md-block d-none">
//                             <div className="form search-form mb-0">
//                                 <div className="input-group">
//                                     <span className="input-icon">
//                                         <svg>
//                                             <use
//                                                 href={rihoAsset(
//                                                     `/svg/icon-sprite.svg#search-header`,
//                                                 )}
//                                             />
//                                         </svg>
//                                         <input
//                                             className="w-100"
//                                             type="search"
//                                             placeholder="Search"
//                                         />
//                                     </span>
//                                 </div>
//                             </div>
//                         </li>

//                         <li className="d-md-none d-block">
//                             <div className="form search-form mb-0">
//                                 <div className="input-group">
//                                     <span className="input-show">
//                                         <svg id="searchIcon">
//                                             <use
//                                                 href={rihoAsset(
//                                                     '/svg/icon-sprite.svg#search-header',
//                                                 )}
//                                             />
//                                         </svg>
//                                         <div id="searchInput">
//                                             <input
//                                                 type="search"
//                                                 placeholder="Search"
//                                             />
//                                         </div>
//                                     </span>
//                                 </div>
//                             </div>
//                         </li>

//                         <li>
//                             <div className="mode" onClick={toggleDarkMode}>
//                                 <Moon size={18} />
//                             </div>
//                         </li>
//                         <li>
//                             <div className="mode" onClick={() => {}}>
//                                 <Bell size={18} />
//                             </div>
//                         </li>

//                         <li className="profile-nav onhover-dropdown">
//                             <div className="media profile-media">
//                                 <img
//                                     className="b-r-10"
//                                     src={userImgSrc}
//                                     alt="current_user"
//                                     style={{
//                                         width: '40px',
//                                         height: '40px',
//                                     }}
//                                 />

//                                 <div className="media-body d-xxl-block d-none box-col-none">
//                                     <div className="d-flex align-items-center gap-2">
//                                         <span>{user?.name ?? 'User'}</span>
//                                         <i className="middle fa fa-angle-down"></i>
//                                     </div>
//                                     <p className="mb-0 font-roboto">
//                                         Chief Executive Officer
//                                     </p>
//                                 </div>
//                             </div>

//                             <ul
//                                 className="profile-dropdown onhover-show-div active"
//                                 style={{ width: '220px' }}
//                             >
//                                 {can('user.my_profile') && (
//                                     <li>
//                                         <Link href={'/profile'}>
//                                             <User />
//                                             <span>My Profile</span>
//                                         </Link>
//                                     </li>
//                                 )}
//                                 {can('user.edit_profile') && (
//                                     <li>
//                                         <Link href={'/profile/edit'}>
//                                             <Edit />
//                                             <span>Edit Profile</span>
//                                         </Link>
//                                     </li>
//                                 )}
//                                 {can('attendance.list') && (
//                                     <li>
//                                         <Link href="/hr/attendance">
//                                             <Clock />
//                                             <span>Attendance</span>
//                                         </Link>
//                                     </li>
//                                 )}
//                                 {can('user.salary_report') && (
//                                     <li>
//                                         <Link href="/hr/salary-report">
//                                             <FileText />
//                                             <span>Salary Report</span>
//                                         </Link>
//                                     </li>
//                                 )}

//                                 {can('user.leave') && (
//                                     <li>
//                                         <Link href={'/hr/leave-request'}>
//                                             <Droplet />
//                                             <span>Leave Request</span>
//                                         </Link>
//                                     </li>
//                                 )}

//                                 {can('user.loan') && (
//                                     <li>
//                                         <Link href={'/hr/loan-request'}>
//                                             <CreditCard />
//                                             <span>Loan Request</span>
//                                         </Link>
//                                     </li>
//                                 )}

//                                 {can('user.notice') && (
//                                     <li>
//                                         <Link href={'/hr/notice'}>
//                                             <Archive />
//                                             <span>Notice Board</span>
//                                         </Link>
//                                     </li>
//                                 )}

//                                 {can('user.WFH') && (
//                                     <li>
//                                         <Link href={'/hr/wfh'}>
//                                             <Home />
//                                             <span>WFH Request</span>
//                                         </Link>
//                                     </li>
//                                 )}

//                                 <li>
//                                     <Link href={'/document/edit'}>
//                                         <Paperclip />
//                                         <span>Documents</span>
//                                     </Link>
//                                 </li>

//                                 <li>
//                                     <a
//                                         onClick={logout}
//                                         className="btn btn-pill btn-outline-primary btn-sm"
//                                         href="#"
//                                     >
//                                         Log Out
//                                     </a>
//                                 </li>
//                             </ul>
//                         </li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Header;
