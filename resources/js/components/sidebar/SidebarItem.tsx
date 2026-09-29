import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { useSidebar } from '@/hooks/use-sidebar';
import { rihoAsset } from '@/lib/riho';

import SidebarItemPin from './SidebarItemPin';
import SidebarSubItem from './SidebarSubItem';

import { type SidebarItem as SidebarItemType } from '../../types/sidebar';

interface SidebarItemProps {
    item: SidebarItemType;
}

const SidebarItem = ({ item }: SidebarItemProps) => {
    const { collapsed, hoverSidebar } = useSidebar();

    const { url } = usePage();

    const [open, setOpen] = useState(item.isOpen ?? false);
    const [hovered, setHovered] = useState(false);

    const hasSubItems = Boolean(item.subItems?.length);

    const isLink = Boolean(item.path) && !hasSubItems;

    const showSubItems =
        open && (!collapsed || hoverSidebar);

    const currentPath = url.split('?')[0];

    const isActive =
        item.path === currentPath ||
        item.subItems?.some(
            (subItem) =>
                subItem.path === currentPath,
        );

    const itemContent = (
        <>
            <div className="d-flex align-items-center gap-2">
                {item.icon?.id && (
                    <svg
                        width={18}
                        height={18}
                        stroke="#fff"
                    >
                        <use
                            href={rihoAsset(
                                `/svg/icon-sprite.svg#${item.icon.id}`,
                            )}
                        />
                    </svg>
                )}

                <span
                    className={`fw-medium ${
                        !collapsed || hoverSidebar
                            ? 'd-inline'
                            : 'd-none'
                    }`}
                >
                    {item.title}
                </span>
            </div>

            {hasSubItems &&
                (!collapsed || hoverSidebar) && (
                    <i
                        className={`fa fa-angle-${
                            open
                                ? 'down'
                                : 'right'
                        }`}
                    />
                )}
        </>
    );

    return (
        <li
            className={`position-relative ${
                open ? 'open' : ''
            }`}
        >
            {isLink ? (
                <Link
                    href={item.path!}
                    className="d-flex align-items-center justify-content-between text-white text-decoration-none w-100"
                    onMouseEnter={() =>
                        setHovered(true)
                    }
                    onMouseLeave={() =>
                        setHovered(false)
                    }
                    style={{
                        backgroundColor:
                            hovered || isActive
                                ? '#fff3'
                                : 'transparent',

                        borderRadius: '12px',

                        zIndex: 10,

                        padding: collapsed
                            ? '15px 13px'
                            : '11px 13px',
                    }}
                >
                    {itemContent}
                </Link>
            ) : (
                <button
                    type="button"
                    className="d-flex align-items-center justify-content-between text-white w-100 border-0"
                    onClick={() => {
                        setOpen(
                            (previous) =>
                                !previous,
                        );
                    }}
                    onMouseEnter={() =>
                        setHovered(true)
                    }
                    onMouseLeave={() =>
                        setHovered(false)
                    }
                    style={{
                        backgroundColor:
                            hovered ||
                            isActive ||
                            open
                                ? '#fff3'
                                : 'transparent',

                        borderRadius: '12px',

                        zIndex: 10,

                        padding: collapsed
                            ? '15px 13px'
                            : '11px 13px',

                        cursor: 'pointer',
                    }}
                >
                    {itemContent}
                </button>
            )}

            <SidebarItemPin
                hovered={hovered}
                id={item.id}
            />

            {hasSubItems && (
                <ul
                    className="d-flex flex-column align-items-center position-relative"
                    style={{
                        maxHeight:
                            showSubItems
                                ? '500px'
                                : '0px',

                        width:
                            showSubItems
                                ? 'auto'
                                : '0',

                        overflow: 'hidden',

                        transition:
                            'max-height 500ms ease',
                    }}
                >
                    <span
                        style={{
                            position:
                                'absolute',

                            left: '25px',

                            top: '-10px',

                            width: '2px',

                            height:
                                showSubItems
                                    ? 'calc(100% - 8px)'
                                    : '0',

                            background:
                                'rgba(255,255,255,0.4)',

                            transition:
                                'height 500ms ease',

                            zIndex: 1,
                        }}
                    />

                    {item.subItems?.map(
                        (subItem) => (
                            <SidebarSubItem
                                key={
                                    subItem.id
                                }
                                subItem={
                                    subItem
                                }
                            />
                        ),
                    )}
                </ul>
            )}
        </li>
    );
};

export default SidebarItem;