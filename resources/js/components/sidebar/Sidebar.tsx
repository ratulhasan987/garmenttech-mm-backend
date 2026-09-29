import SidebarItem from './SidebarItem';
import SidebarSectionTitle from './SidebarSectionTitle';
import PinnedSidebarSection from './PinnedSidebarSection';

import { useEffect } from 'react';

import { SIDEBAR_SECTIONS } from '@/constant/sidebar.constant';

import { useSidebar } from '@/hooks/use-sidebar';
import { useResponsive } from '@/hooks/use-responsive';
import { usePermission } from '@/hooks/use-permission';

import { rihoAsset } from '@/lib/riho';

import { Link, usePage } from '@inertiajs/react';

import { Grid } from 'react-feather';

import { Fragment } from 'react';
import { asset } from '@/lib/asset';

const Sidebar = () => {
    const { configure } = usePage().props;

    const shortLogo =
        (configure?.logo ? asset(configure.logo) : null) ??
        rihoAsset('/images/logo/logo-icon.png');

    const lightLogo =
        (configure?.primary_logo ? asset(configure.primary_logo) : null) ??
        rihoAsset('images/logo/logo.png');

    const darkLogo =
        (configure?.secondary_logo ? asset(configure.secondary_logo) : null) ??
        rihoAsset('images/logo/logo.png');

    const {
        pinnedItems,
        collapsed,
        toggleCollapsed,
        setHoverSidebar,
        setCollapsed,
    } = useSidebar();

    const { isMobile, isDesktop } = useResponsive();

    const { can } = usePermission();

    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }

        if (isDesktop) {
            setCollapsed(false);
        }
    }, [isMobile, isDesktop]);

    /*
    |--------------------------------------------------------------------------
    | Permission Filter
    |--------------------------------------------------------------------------
    */

    const hasPermission = (permission?: string) => {
        if (!permission) {
            return true;
        }

        return can(permission as any);
    };

    /*
    |--------------------------------------------------------------------------
    | Filter Sidebar
    |--------------------------------------------------------------------------
    */

    const visibleSections = SIDEBAR_SECTIONS.map((section) => {
        const visibleItems = section.items
            .map((item) => {
                /*
                            |--------------------------------------------------------------------------
                            | Filter sub items
                            |--------------------------------------------------------------------------
                            */

                const visibleSubItems = item.subItems?.filter((subItem) =>
                    hasPermission(subItem.permission),
                );

                /*
                            |--------------------------------------------------------------------------
                            | If item itself has permission
                            |--------------------------------------------------------------------------
                            */

                if (item.permission && !hasPermission(item.permission)) {
                    return null;
                }

                /*
                            |--------------------------------------------------------------------------
                            | Parent with sub-items
                            |
                            | Hide parent if no sub-item is available
                            |--------------------------------------------------------------------------
                            */

                if (item.subItems && visibleSubItems?.length === 0) {
                    return null;
                }

                return {
                    ...item,

                    subItems: visibleSubItems,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        return {
            ...section,

            items: visibleItems,
        };
    }).filter((section) => section.items.length > 0);

    return (
        <div
            className={`sidebar-wrapper ${collapsed ? 'close_icon' : ''}`}

            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}

            data-layout="stroke-svg"

            onMouseEnter={() => setHoverSidebar(true)}

            onMouseLeave={() => setHoverSidebar(false)}
        >
            <div className="logo-wrapper">
                <Link
                    href="/dashboard"
                    className="d-inline-flex align-items-center justify-content-center"
                >
                    <img
                        className="img-fluid for-light"
                        src={lightLogo}
                        alt="Logo"
                        style={{
                            height: '34px',
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />

                    <img
                        className="img-fluid for-dark"
                        src={darkLogo}
                        alt="Logo"
                        style={{
                            height: '34px',
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </Link>

                <div className="back-btn" onClick={toggleCollapsed}>
                    <i className="fa fa-angle-left"></i>
                </div>

                <div className="toggle-sidebar" onClick={toggleCollapsed}>
                    <Grid
                        className="status_toggle middle sidebar-toggle"
                        size={18}
                    />
                </div>
            </div>

            <div className="logo-icon-wrapper">
                <Link href="/dashboard">
                    <img
                        className="img-fluid"
                        src={shortLogo}
                        alt=""
                        width={36}
                        height={36}
                    />
                </Link>
            </div>

            {/* Main Sidebar */}

            <nav
                className="sidebar-body"
                onClick={(event) => {
                    const clickedLink = (event.target as HTMLElement).closest(
                        'a',
                    );

                    if (isMobile && clickedLink) {
                        setCollapsed(true);
                    }
                }}
            >
                <ul className="px-4">
                    <PinnedSidebarSection />

                    {visibleSections.map((section) => (
                        <Fragment key={section.id}>
                            <SidebarSectionTitle title={section.title} />

                            {section.items.map(
                                (item) =>
                                    !pinnedItems.includes(item.id) && (
                                        <SidebarItem
                                            key={item.id}
                                            item={item}
                                        />
                                    ),
                            )}
                        </Fragment>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
