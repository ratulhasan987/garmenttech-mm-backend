import { useResponsive } from '@/hooks/use-responsive';
import { useSidebar } from '@/hooks/use-sidebar';
import { useEffect, useState } from 'react';

export function SidebarOverlay() {
    const { collapsed, setCollapsed } = useSidebar();

    const { isMobile } = useResponsive();

    return (
        <>
            {isMobile && !collapsed && (
                <div
                    className="bg-overlay active"
                    onClick={() => setCollapsed(true)}
                />
            )}
        </>
    );
}
