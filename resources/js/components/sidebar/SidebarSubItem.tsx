import { useState } from 'react';
import { type SidebarSubItem as SidebarSubItemType } from '../../types/sidebar';
import { Link } from '@inertiajs/react';

interface SidebarSubItemProps {
    subItem: SidebarSubItemType;
}

const SidebarSubItem = ({ subItem }: SidebarSubItemProps) => {
    const [hover, setHover] = useState(false);

    const isActive = subItem.path === location.pathname;

    return (
        <li
            className="position-relative w-100"
           onMouseEnter={() => setHover(true)}
onMouseLeave={() => setHover(false)}
        >
            <Link
                href={subItem.path}
                className={`d-flex align-items-center ps-5 py-2 text-decoration-none position-relative fw-medium`}
                style={{
                    color:
                        hover || isActive
                            ? 'rgba(255,255,255, 1)'
                            : 'rgba(255, 255, 255, 0.7)',
                }}
            >
                <span
                    className="position-absolute rounded-circle bg-white opacity-50"
                    style={{ width: 5, height: 5, left: 35 }}
                />
                <span
                    className="position-absolute border-start border-bottom opacity-50"
                    style={{
                        left: 26,
                        top: '12%',
                        width: 13,
                        height: 15,
                        borderBottomLeftRadius: 8,
                    }}
                />
                {subItem.title}
            </Link>
        </li>
    );
};

export default SidebarSubItem;
